<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Like;
use App\Models\Comment;
use Illuminate\Http\Request;
use App\Models\Notification;

class LikeController extends Controller
{
    // Like atau unlike postingan
    public function toggleLike(Request $request, $postId)
    {
        $user = $request->user();
        $post = Post::find($postId);
        if (!$post) {
            return response()->json(['success' => false, 'message' => 'Post not found'], 404);
        }

        // Cek apakah user adalah pemilik postingan
        if ($post->user_id === $user->id) {
            return response()->json(['success' => false, 'message' => 'Anda tidak bisa like postingan sendiri'], 403);
        }

        // Cek apakah sudah like
        $existingLike = Like::where('user_id', $user->id)
            ->where('target_type', Post::class)
            ->where('target_id', $post->id)
            ->first();

        if ($existingLike) {
            // Unlike: hapus like
            $existingLike->delete();
            $post->likes_count -= 1;
            $post->save();
            $isLiked = false;
            $message = 'Like removed';
        } else {
            // Like: tambah like
            Like::create([
                'user_id' => $user->id,
                'target_type' => Post::class,
                'target_id' => $post->id
            ]);
            $post->likes_count += 1;
            $post->save();
            $isLiked = true;
            $message = 'Post liked';
            if ($isLiked) {
            Notification::send($post->user_id, $user->id, 'like', Post::class, $post->id, "User {$user->name} menyukai postingan Anda '{$post->title}'");}
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => [
                'likes_count' => $post->likes_count,
                'is_liked' => $isLiked
            ]
        ]);
    }

    // Cek status like user untuk suatu post
    public function getUserLike(Request $request, $postId)
    {
        $user = $request->user();
        $like = Like::where('user_id', $user->id)
            ->where('target_type', Post::class)
            ->where('target_id', $postId)
            ->first();
        return response()->json([
            'success' => true,
            'data' => ['is_liked' => !is_null($like)]
        ]);
    }

    // Di dalam LikeController, tambahkan:

    public function toggleLikeComment(Request $request, $commentId)
    {
        $user = $request->user();
        $comment = Comment::find($commentId);
        if (!$comment) {
            return response()->json(['success' => false, 'message' => 'Comment not found'], 404);
        }

        // Tidak bisa like komentar sendiri
        if ($comment->user_id === $user->id) {
            return response()->json(['success' => false, 'message' => 'Anda tidak bisa like komentar Anda sendiri'], 403);
        }

        $existingLike = Like::where('user_id', $user->id)
            ->where('target_type', Comment::class)
            ->where('target_id', $comment->id)
            ->first();

        if ($existingLike) {
            $existingLike->delete();
            $comment->likes_count -= 1;
            $comment->save();
            $isLiked = false;
            $message = 'Like removed from comment';
        } else {
            Like::create([
                'user_id' => $user->id,
                'target_type' => Comment::class,
                'target_id' => $comment->id
            ]);
            $comment->likes_count += 1;
            $comment->save();
            $isLiked = true;
            $message = 'Comment liked';
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => [
                'likes_count' => $comment->likes_count,
                'is_liked' => $isLiked
            ]
        ]);
    }

    public function getUserCommentLike(Request $request, $commentId)
    {
        $user = $request->user();
        $like = Like::where('user_id', $user->id)
            ->where('target_type', Comment::class)
            ->where('target_id', $commentId)
            ->first();
        return response()->json([
            'success' => true,
            'data' => ['is_liked' => !is_null($like)]
        ]);
    }
}
