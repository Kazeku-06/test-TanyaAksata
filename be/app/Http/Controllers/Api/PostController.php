<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Tag;
use App\Models\PostEditHistory;
use App\Services\CacheService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Models\Bookmark;

class PostController extends Controller
{
    // Daftar postingan (publik) — cached 1 menit
    public function index(Request $request)
    {
        $page = (int) $request->get('page', 1);
        $key  = CacheService::postsKey($page);

        $posts = Cache::remember($key, CacheService::TTL_SHORT, function () {
            return Post::with(['user', 'category', 'tags'])
                ->orderBy('created_at', 'desc')
                ->paginate(10)
                ->toArray();
        });

        return response()->json(['success' => true, 'data' => $posts]);
    }

    // Detail postingan (publik) — views_count selalu diincrement, tidak di-cache
    public function show(Request $request, $id)
    {
        $post = Post::with(['user', 'category', 'tags', 'comments.user'])->find($id);
        if (!$post) {
            return response()->json(['success' => false, 'message' => 'Post not found'], 404);
        }

        $post->increment('views_count');
        Cache::forget(CacheService::postDetailKey($id));

        $user = auth('sanctum')->user();
        $data = $post->toArray();
        $data['is_edited']     = $post->is_edited;
        $data['is_bookmarked'] = false;
        $data['bookmark_id']   = null;

        if ($user) {
            $bookmark = Bookmark::where('user_id', $user->id)
                ->where('post_id', $post->id)
                ->first();
            $data['is_bookmarked'] = (bool) $bookmark;
            $data['bookmark_id']   = $bookmark ? $bookmark->id : null;
            $vote = \App\Models\Vote::where('user_id', $user->id)
                ->where('target_type', Post::class)
                ->where('target_id', $post->id)
                ->first();
            $data['user_vote'] = $vote ? (int) $vote->vote : null;
        } else {
            $data['user_vote'] = null;
        }

        return response()->json(['success' => true, 'data' => $data]);
    }

    // Membuat postingan baru
    public function store(Request $request)
    {
        $user      = $request->user();
        $validator = Validator::make($request->all(), [
            'title'       => 'required|string|max:255',
            'body'        => 'required|string',
            'category_id' => 'required|string|exists:categories,id',
            'tags'        => 'nullable|array',
            'tags.*'      => 'string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $post = Post::create([
            'title'          => $request->title,
            'body'           => $request->body,
            'user_id'        => $user->id,
            'category_id'    => $request->category_id,
            'votes_count'    => 0,
            'likes_count'    => 0,
            'comments_count' => 0,
            'views_count'    => 0,
            'is_solved'      => false,
            'edit_count'     => 0,
        ]);

        if ($request->has('tags')) {
            $tagIds = [];
            foreach ($request->tags as $tagName) {
                $tag      = Tag::firstOrCreate(
                    ['name' => trim($tagName)],
                    ['slug' => Str::slug(trim($tagName))]
                );
                $tagIds[] = $tag->id;
            }
            $post->tags()->sync($tagIds);
        }

        $user->addReputation(10, 'create_post', Post::class, $post->id);
        $user->checkAndAwardBadges();

        CacheService::invalidatePostLists();

        return response()->json([
            'success' => true,
            'message' => 'Post created',
            'data'    => $post->load(['user', 'category', 'tags']),
        ], 201);
    }

    // Update postingan (pemilik, maks 3x edit)
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $post = Post::find($id);

        if (!$post) {
            return response()->json(['success' => false, 'message' => 'Post not found'], 404);
        }
        if ($post->user_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Forbidden: Anda tidak memiliki izin edit'], 403);
        }
        if ($post->edit_count >= 3) {
            return response()->json(['success' => false, 'message' => 'Batas maksimal edit (3 kali) sudah tercapai'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title'        => 'sometimes|required|string|max:255',
            'body'         => 'sometimes|required|string',
            'category_id'  => 'sometimes|required|string|exists:categories,id',
            'tags'         => 'nullable|array',
            'tags.*'       => 'string|max:50',
            'edit_summary' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $oldTitle = $post->title;
        $oldBody  = $post->body;
        $changes  = false;

        if ($request->has('title') && $request->title != $post->title) {
            $post->title = $request->title;
            $changes     = true;
        }
        if ($request->has('body') && $request->body != $post->body) {
            $post->body = $request->body;
            $changes    = true;
        }
        if ($request->has('category_id') && $request->category_id != $post->category_id) {
            $post->category_id = $request->category_id;
            $changes           = true;
        }

        if ($changes) {
            $post->edited_at  = now();
            $post->edit_count = $post->edit_count + 1;
            $post->save();

            PostEditHistory::create([
                'post_id'      => $post->id,
                'edited_by'    => $user->id,
                'title_before' => $oldTitle,
                'body_before'  => $oldBody,
                'title_after'  => $post->title,
                'body_after'   => $post->body,
                'edit_summary' => $request->edit_summary,
            ]);
        } else {
            $post->save();
        }

        if ($request->has('tags')) {
            $tagIds = [];
            foreach ($request->tags as $tagName) {
                $tag      = Tag::firstOrCreate(
                    ['name' => trim($tagName)],
                    ['slug' => Str::slug(trim($tagName))]
                );
                $tagIds[] = $tag->id;
            }
            $post->tags()->sync($tagIds);
        }

        CacheService::invalidatePost($post->id);

        return response()->json([
            'success' => true,
            'message' => 'Post updated',
            'data'    => $post->load(['user', 'category', 'tags']),
        ]);
    }

    // Soft delete (pemilik / admin / moderator)
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $post = Post::find($id);

        if (!$post) {
            return response()->json(['success' => false, 'message' => 'Post not found'], 404);
        }
        if ($post->user_id !== $user->id && !$user->hasRole('admin') && !$user->hasRole('moderator')) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        $post->delete();
        CacheService::invalidatePost($id);

        return response()->json(['success' => true, 'message' => 'Post deleted']);
    }

    // Post milik user tertentu — cached 1 menit
    public function userPosts(Request $request, $userId)
    {
        $page = (int) $request->get('page', 1);
        $key  = CacheService::userPostsKey($userId, $page);

        $posts = Cache::remember($key, CacheService::TTL_SHORT, function () use ($userId) {
            return Post::where('user_id', $userId)
                ->with(['user', 'category', 'tags'])
                ->orderBy('created_at', 'desc')
                ->paginate(10)
                ->toArray();
        });

        return response()->json(['success' => true, 'data' => $posts]);
    }

    // Trashed posts (moderator/admin)
    public function trashed()
    {
        $posts = Post::onlyTrashed()->with(['user', 'category'])->paginate(15);
        return response()->json(['success' => true, 'data' => $posts]);
    }

    public function showTrashed($id)
    {
        $post = Post::withTrashed()->with(['user', 'category', 'tags'])->find($id);
        if (!$post) {
            return response()->json(['success' => false, 'message' => 'Post not found'], 404);
        }
        return response()->json(['success' => true, 'data' => $post]);
    }

    public function history($id)
    {
        $post = Post::withTrashed()->find($id);
        if (!$post) {
            return response()->json(['success' => false, 'message' => 'Post not found'], 404);
        }
        $histories = $post->editHistories()->with('editor')->orderBy('created_at', 'desc')->get();
        return response()->json(['success' => true, 'data' => $histories]);
    }

    // Search posts — tidak di-cache (param bisa sangat bervariasi)
    public function search(Request $request)
    {
        $query = Post::with(['user', 'category', 'tags']);

        if ($request->filled('q')) {
            $keyword = '%' . $request->q . '%';
            $query->where(function ($q) use ($keyword) {
                $q->where('title', 'like', $keyword)
                  ->orWhere('body', 'like', $keyword);
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('tag')) {
            $query->whereHas('tags', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->tag . '%');
            });
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        } elseif ($request->filled('username')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->username . '%');
            });
        }

        if ($request->filled('created_from')) {
            $query->whereDate('created_at', '>=', $request->created_from);
        }
        if ($request->filled('created_to')) {
            $query->whereDate('created_at', '<=', $request->created_to);
        }

        $sort = $request->get('sort', 'latest');
        match ($sort) {
            'oldest'         => $query->orderBy('created_at', 'asc'),
            'most_voted'     => $query->orderBy('votes_count', 'desc'),
            'most_commented' => $query->orderBy('comments_count', 'desc'),
            default          => $query->orderBy('created_at', 'desc'),
        };

        return response()->json(['success' => true, 'data' => $query->paginate(15)]);
    }

    // Trending posts — cached 5 menit
    public function trending(Request $request)
    {
        $limit = (int) $request->get('limit', 10);
        $key   = CacheService::trendingKey($limit);

        $posts = Cache::remember($key, CacheService::TTL_MEDIUM, function () use ($limit) {
            return Post::with(['user', 'category', 'tags'])
                ->where('created_at', '>=', now()->subDays(7))
                ->orderByRaw('(votes_count * 2 + comments_count * 1.5 + likes_count * 1 + views_count * 0.5) DESC')
                ->limit($limit)
                ->get()
                ->toArray();
        });

        return response()->json(['success' => true, 'data' => $posts]);
    }
}
