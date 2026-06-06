<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Tag;
use App\Models\PostEditHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PostController extends Controller
{
    // Daftar postingan (publik)
    public function index()
    {
        $posts = Post::with(['user', 'category', 'tags'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);
        return response()->json(['success' => true, 'data' => $posts]);
    }

    // Detail postingan (publik) + flag is_edited
    public function show($id)
    {
        $post = Post::with(['user', 'category', 'tags', 'comments.user'])->find($id);
        if (!$post) {
            return response()->json(['success' => false, 'message' => 'Post not found'], 404);
        }
        $post->increment('views_count');
        $data = $post->toArray();
        $data['is_edited'] = $post->is_edited;
        return response()->json(['success' => true, 'data' => $data]);
    }

    // Membuat postingan baru
    public function store(Request $request)
{
    $user = $request->user();
    $validator = Validator::make($request->all(), [
        'title' => 'required|string|max:255',
        'body' => 'required|string',
        'category_id' => 'required|string|exists:categories,id',
        'tags' => 'nullable|array',
        'tags.*' => 'string|max:50'
    ]);
    if ($validator->fails()) {
        return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
    }

    $post = Post::create([
        'title' => $request->title,
        'body' => $request->body,
        'user_id' => $user->id,
        'category_id' => $request->category_id,
        'votes_count' => 0,
        'likes_count' => 0,
        'comments_count' => 0,
        'views_count' => 0,
        'is_solved' => false,
        'edit_count' => 0,
    ]);

    if ($request->has('tags')) {
        $tagIds = [];
        foreach ($request->tags as $tagName) {
            $tag = Tag::firstOrCreate(
                ['name' => trim($tagName)],
                ['slug' => Str::slug(trim($tagName))]
            );
            $tagIds[] = $tag->id;
        }
        $post->tags()->sync($tagIds);
    }

    // Tambah reputasi +10 untuk user karena membuat postingan
    $user->addReputation(10, 'create_post', Post::class, $post->id);

    return response()->json([
        'success' => true,
        'message' => 'Post created',
        'data' => $post->load(['user', 'category', 'tags'])
    ], 201);
}

    // Update postingan (hanya pemilik, maksimal 3 kali edit)
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $post = Post::find($id);
        if (!$post) {
            return response()->json(['success' => false, 'message' => 'Post not found'], 404);
        }

        // Hanya pemilik yang boleh edit
        if ($post->user_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Forbidden: Anda tidak memiliki izin edit'], 403);
        }

        // Batasan maksimal edit = 3 kali
        if ($post->edit_count >= 3) {
            return response()->json(['success' => false, 'message' => 'Batas maksimal edit (3 kali) sudah tercapai'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'body' => 'sometimes|required|string',
            'category_id' => 'sometimes|required|string|exists:categories,id',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'edit_summary' => 'nullable|string|max:255'
        ]);
        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $oldTitle = $post->title;
        $oldBody = $post->body;
        $changes = false;

        if ($request->has('title') && $request->title != $post->title) {
            $post->title = $request->title;
            $changes = true;
        }
        if ($request->has('body') && $request->body != $post->body) {
            $post->body = $request->body;
            $changes = true;
        }
        if ($request->has('category_id') && $request->category_id != $post->category_id) {
            $post->category_id = $request->category_id;
            $changes = true;
        }

        if ($changes) {
            $post->edited_at = now();
            $post->edit_count = $post->edit_count + 1;
            $post->save();

            PostEditHistory::create([
                'post_id' => $post->id,
                'edited_by' => $user->id,
                'title_before' => $oldTitle,
                'body_before' => $oldBody,
                'title_after' => $post->title,
                'body_after' => $post->body,
                'edit_summary' => $request->edit_summary,
            ]);
        } else {
            $post->save(); // jika tidak ada perubahan, tetap simpan (misal hanya update tags)
        }

        // Update tags (tidak mempengaruhi edit count)
        if ($request->has('tags')) {
            $tagIds = [];
            foreach ($request->tags as $tagName) {
                $tag = Tag::firstOrCreate(
                    ['name' => trim($tagName)],
                    ['slug' => Str::slug(trim($tagName))]
                );
                $tagIds[] = $tag->id;
            }
            $post->tags()->sync($tagIds);
        }

        return response()->json([
            'success' => true,
            'message' => 'Post updated',
            'data' => $post->load(['user', 'category', 'tags'])
        ]);
    }

    // Soft delete (pemilik, admin, moderator boleh)
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
        return response()->json(['success' => true, 'message' => 'Post deleted']);
    }

    // Postingan milik user tertentu (publik)
    public function userPosts($userId)
    {
        $posts = Post::where('user_id', $userId)
            ->with(['category', 'tags'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);
        return response()->json(['success' => true, 'data' => $posts]);
    }

    // ========== ADMIN ONLY ==========
    // Lihat daftar post yang dihapus (soft delete)
    public function trashed()
    {
        $posts = Post::onlyTrashed()->with(['user', 'category'])->paginate(15);
        return response()->json(['success' => true, 'data' => $posts]);
    }

    // Lihat detail post yang dihapus
    public function showTrashed($id)
    {
        $post = Post::withTrashed()->with(['user', 'category', 'tags'])->find($id);
        if (!$post) {
            return response()->json(['success' => false, 'message' => 'Post not found'], 404);
        }
        return response()->json(['success' => true, 'data' => $post]);
    }

    // Lihat seluruh history edit (hanya admin)
    public function history($id)
    {
        $post = Post::withTrashed()->find($id);
        if (!$post) {
            return response()->json(['success' => false, 'message' => 'Post not found'], 404);
        }
        $histories = $post->editHistories()->with('editor')->orderBy('created_at', 'desc')->get();
        return response()->json(['success' => true, 'data' => $histories]);
    }

        /**
     * Search posts by title, body, or tags
     * GET /api/v1/posts/search?q=keyword
     */
    public function search(Request $request)
    {
        $queryParam = $request->query('q');
        if (!$queryParam) {
            return response()->json(['success' => false, 'message' => 'Keyword is required'], 400);
        }

        // Split keyword by spaces to handle multi-word search
        $keywords = array_filter(explode(' ', $queryParam));

        $posts = Post::with(['user', 'category', 'tags'])
            ->where(function ($query) use ($keywords) {
                foreach ($keywords as $word) {
                    $query->where(function ($subQuery) use ($word) {
                        $subQuery->where('title', 'LIKE', "%{$word}%")
                            ->orWhere('body', 'LIKE', "%{$word}%")
                            ->orWhereHas('tags', function ($tagQuery) use ($word) {
                                $tagQuery->where('name', 'LIKE', "%{$word}%");
                            });
                    });
                }
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json(['success' => true, 'data' => $posts]);
    }
}
