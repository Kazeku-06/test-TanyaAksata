<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Tag;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PostController extends Controller
{
    /**
     * Daftar semua postingan (hanya yang belum dihapus)
     */
    public function index()
    {
        $posts = Post::with(['user', 'category', 'tags'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $posts
        ]);
    }

    /**
     * Detail satu postingan (termasuk komentar, tags, category, user)
     */
    public function show($id)
    {
        $post = Post::with(['user', 'category', 'tags', 'comments.user' => function($q) {
            $q->orderBy('created_at', 'asc');
        }])->find($id);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Postingan tidak ditemukan'
            ], 404);
        }

        // Increment views
        $post->increment('views_count');

        return response()->json([
            'success' => true,
            'data' => $post
        ]);
    }

    /**
     * Buat postingan baru
     */
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
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
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
        ]);

        // Handle tags (menerima array nama tag)
        if ($request->has('tags')) {
            $tagIds = [];
            foreach ($request->tags as $tagName) {
                $tagName = trim($tagName);
                $tag = Tag::firstOrCreate(
                    ['name' => $tagName],
                    ['slug' => Str::slug($tagName)]
                );
                $tagIds[] = $tag->id;
            }
            $post->tags()->sync($tagIds);
        }

        return response()->json([
            'success' => true,
            'message' => 'Postingan berhasil dibuat',
            'data' => $post->load(['user', 'category', 'tags'])
        ], 201);
    }

    /**
     * Update postingan
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $post = Post::find($id);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Postingan tidak ditemukan'
            ], 404);
        }

        // Cek permission: pemilik, admin, atau moderator
        if ($post->user_id !== $user->id && !$user->hasRole('admin') && !$user->hasRole('moderator')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk mengedit postingan ini'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'body' => 'sometimes|required|string',
            'category_id' => 'sometimes|required|string|exists:categories,id',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        if ($request->has('title')) {
            $post->title = $request->title;
        }
        if ($request->has('body')) {
            $post->body = $request->body;
        }
        if ($request->has('category_id')) {
            $post->category_id = $request->category_id;
        }
        $post->save();

        if ($request->has('tags')) {
            $tagIds = [];
            foreach ($request->tags as $tagName) {
                $tagName = trim($tagName);
                $tag = Tag::firstOrCreate(
                    ['name' => $tagName],
                    ['slug' => Str::slug($tagName)]
                );
                $tagIds[] = $tag->id;
            }
            $post->tags()->sync($tagIds);
        }

        return response()->json([
            'success' => true,
            'message' => 'Postingan berhasil diperbarui',
            'data' => $post->load(['user', 'category', 'tags'])
        ]);
    }

    /**
     * Soft delete postingan
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $post = Post::find($id);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Postingan tidak ditemukan'
            ], 404);
        }

        // Cek permission
        if ($post->user_id !== $user->id && !$user->hasRole('admin') && !$user->hasRole('moderator')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk menghapus postingan ini'
            ], 403);
        }

        $post->delete(); // soft delete

        return response()->json([
            'success' => true,
            'message' => 'Postingan berhasil dihapus'
        ], 200);
    }

    /**
     * Postingan milik user tertentu
     */
    public function userPosts($userId)
    {
        $posts = Post::where('user_id', $userId)
            ->with(['category', 'tags'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $posts
        ]);
    }

     /**
     * Daftar postingan yang sudah dihapus (soft delete) - khusus admin
     * GET /api/v1/admin/posts/trashed
     */
    public function trashed()
    {
        $posts = Post::onlyTrashed() // hanya yang sudah dihapus
            ->with(['user', 'category', 'tags'])
            ->orderBy('deleted_at', 'desc')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $posts
        ]);
    }

     /**
     * Detail postingan yang sudah dihapus (khusus admin)
     * GET /api/v1/admin/posts/{id}/trashed
     */
    public function showTrashed($id)
    {
        $post = Post::withTrashed()
            ->with(['user', 'category', 'tags', 'comments.user'])
            ->find($id);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Postingan tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $post
        ]);
    }
}
