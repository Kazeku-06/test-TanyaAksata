<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\CommentEditHistory;
use App\Models\Post;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CommentController extends Controller
{
    // Daftar komentar per post (public)
    public function index($postId)
    {
        $post = Post::find($postId);
        if (!$post) {
            return response()->json(['success' => false, 'message' => 'Post not found'], 404);
        }
        $comments = Comment::with(['user', 'replies.user'])
            ->where('post_id', $postId)
            ->whereNull('parent_id')
            ->orderBy('created_at', 'asc')
            ->get();
        return response()->json(['success' => true, 'data' => $comments]);
    }

    // Membuat komentar baru (reply jika ada parent_id)
    public function store(Request $request)
    {
        $user = $request->user();
        $validator = Validator::make($request->all(), [
            'post_id' => 'required|string|exists:posts,id',
            'parent_id' => 'nullable|string|exists:comments,id',
            'body' => 'required|string|min:1'
        ]);
        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $post = Post::find($request->post_id);
        if (!$post) {
            return response()->json(['success' => false, 'message' => 'Post not found'], 404);
        }

        // Batasi komentar untuk pemilik postingan (maksimal 4)
        if ($user->id == $post->user_id) {
            $commentCount = Comment::where('post_id', $request->post_id)
                ->where('user_id', $user->id)
                ->whereNull('deleted_at')
                ->count();
            if ($commentCount >= 4) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda sebagai pemilik postingan hanya bisa memberikan maksimal 4 komentar pada postingan Anda sendiri.'
                ], 403);
            }
        }

        $comment = Comment::create([
            'post_id' => $request->post_id,
            'user_id' => $user->id,
            'parent_id' => $request->parent_id,
            'body' => $request->body,
            'votes_count' => 0,
            'likes_count' => 0,
            'is_accepted' => false,
            'edit_count' => 0,
        ]);

        $post->increment('comments_count');
        $user->addReputation(2, 'create_comment', Comment::class, $comment->id);

        // ================= NOTIFIKASI =================
        if ($post->user_id !== $user->id) {
            Notification::send(
                $post->user_id,
                $user->id,
                'comment',
                Post::class,
                $post->id,
                "User {$user->name} berkomentar pada postingan Anda '{$post->title}'"
            );
        }

        if ($request->filled('parent_id')) {
            $parentComment = Comment::find($request->parent_id);
            if ($parentComment && $parentComment->user_id !== $user->id) {
                Notification::send(
                    $parentComment->user_id,
                    $user->id,
                    'reply',
                    Comment::class,
                    $parentComment->id,
                    "User {$user->name} membalas komentar Anda"
                );
            }
        }

        // Cek badge setelah membuat komentar
        $user->checkAndAwardBadges();

        return response()->json([
            'success' => true,
            'message' => 'Komentar ditambahkan',
            'data' => $comment->load('user')
        ], 201);
    }

    // Update komentar (hanya pemilik, maksimal 1 kali edit)
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $comment = Comment::find($id);
        if (!$comment) {
            return response()->json(['success' => false, 'message' => 'Komentar tidak ditemukan'], 404);
        }

        if ($comment->user_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Forbidden: Anda tidak memiliki izin'], 403);
        }

        if ($comment->edit_count >= 1) {
            return response()->json(['success' => false, 'message' => 'Batas maksimal edit (1 kali) sudah tercapai'], 403);
        }

        $validator = Validator::make($request->all(), [
            'body' => 'required|string|min:1',
            'edit_summary' => 'nullable|string|max:255'
        ]);
        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $oldBody = $comment->body;
        $comment->body = $request->body;
        $comment->edited_at = now();
        $comment->edit_count = 1;
        $comment->save();

        CommentEditHistory::create([
            'comment_id' => $comment->id,
            'edited_by' => $user->id,
            'body_before' => $oldBody,
            'body_after' => $comment->body,
            'edit_summary' => $request->edit_summary,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Komentar diperbarui',
            'data' => $comment->load('user')
        ]);
    }

    // Soft delete komentar (hanya pemilik, admin, moderator)
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $comment = Comment::find($id);
        if (!$comment) {
            return response()->json(['success' => false, 'message' => 'Komentar tidak ditemukan'], 404);
        }
        if ($comment->user_id !== $user->id && !$user->hasRole('admin') && !$user->hasRole('moderator')) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }
        $comment->delete();
        $post = Post::find($comment->post_id);
        if ($post) $post->decrement('comments_count');
        return response()->json(['success' => true, 'message' => 'Komentar dihapus']);
    }

    // ========== ADMIN ONLY ==========
    public function trashed()
    {
        $comments = Comment::onlyTrashed()->with(['user', 'post'])->paginate(15);
        return response()->json(['success' => true, 'data' => $comments]);
    }

    public function showTrashed($id)
    {
        $comment = Comment::withTrashed()->with(['user', 'post'])->find($id);
        if (!$comment) {
            return response()->json(['success' => false, 'message' => 'Komentar tidak ditemukan'], 404);
        }
        return response()->json(['success' => true, 'data' => $comment]);
    }

    public function history($id)
    {
        $comment = Comment::withTrashed()->find($id);
        if (!$comment) {
            return response()->json(['success' => false, 'message' => 'Komentar tidak ditemukan'], 404);
        }
        $histories = $comment->editHistories()->with('editor')->orderBy('created_at', 'desc')->get();
        return response()->json(['success' => true, 'data' => $histories]);
    }

    /**
     * Mark or unmark comment as accepted answer.
     */
    public function accept(Request $request, $id)
    {
        $user = $request->user();
        $comment = Comment::find($id);
        if (!$comment) {
            return response()->json(['success' => false, 'message' => 'Comment not found'], 404);
        }

        $post = $comment->post;
        if (!$post) {
            return response()->json(['success' => false, 'message' => 'Post not found'], 404);
        }

        if ($post->user_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Only post owner can accept answer'], 403);
        }

        // Unmark if already accepted
        if ($comment->is_accepted) {
            $comment->is_accepted = false;
            $comment->save();
            $post->accepted_answer_id = null;
            $post->is_solved = false;
            $post->save();
            return response()->json([
                'success' => true,
                'message' => 'Answer unmarked as accepted. Post is open again.'
            ]);
        }

        // Remove previous accepted answer if any
        if ($post->accepted_answer_id) {
            $oldAccepted = Comment::find($post->accepted_answer_id);
            if ($oldAccepted) {
                $oldAccepted->is_accepted = false;
                $oldAccepted->save();
            }
        }

        $comment->is_accepted = true;
        $comment->save();
        $post->accepted_answer_id = $comment->id;
        $post->is_solved = true;
        $post->save();

        // Beri reputasi
        $comment->user->addReputation(15, 'answer_accepted', Comment::class, $comment->id);
        // Cek badge untuk penulis komentar
        $comment->user->checkAndAwardBadges();

        // Notifikasi
        Notification::send(
            $comment->user_id,
            $user->id,
            'accepted_answer',
            Comment::class,
            $comment->id,
            "Jawaban Anda pada postingan '{$post->title}' telah diterima sebagai solusi"
        );

        return response()->json([
            'success' => true,
            'message' => 'Answer accepted.',
            'data' => [
                'post_id' => $post->id,
                'accepted_comment_id' => $comment->id,
                'is_solved' => true
            ]
        ]);
    }
}
