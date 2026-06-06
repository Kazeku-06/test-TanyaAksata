<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Comment;
use App\Models\Vote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VoteController extends Controller
{
    // Vote untuk Postingan
    public function votePost(Request $request, $postId)
    {
        $user = $request->user();
        $post = Post::find($postId);
        if (!$post) {
            return response()->json(['success' => false, 'message' => 'Post not found'], 404);
        }

        // Cegah vote pada postingan sendiri
        if ($post->user_id === $user->id) {
            return response()->json(['success' => false, 'message' => 'Anda tidak bisa vote pada postingan Anda sendiri'], 403);
        }

        $validator = Validator::make($request->all(), ['vote' => 'required|in:1,-1']);
        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $voteValue = (int) $request->vote;
        $existing = Vote::where('user_id', $user->id)
            ->where('target_type', Post::class)
            ->where('target_id', $post->id)
            ->first();

        if ($existing) {
            if ($existing->vote == $voteValue) {
                // Hapus vote
                $existing->delete();
                $post->votes_count -= $voteValue;
                $message = 'Vote removed';
                $userVote = null;
            } else {
                // Ubah vote (upvote ke downvote atau sebaliknya)
                $post->votes_count -= $existing->vote;
                $existing->vote = $voteValue;
                $existing->save();
                $post->votes_count += $voteValue;
                $message = 'Vote changed';
                $userVote = $voteValue;
            }
        } else {
            // Buat vote baru
            Vote::create([
                'user_id' => $user->id,
                'target_type' => Post::class,
                'target_id' => $post->id,
                'vote' => $voteValue
            ]);
            $post->votes_count += $voteValue;
            $message = 'Vote added';
            $userVote = $voteValue;
        }

        $post->save();

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => [
                'votes_count' => $post->votes_count,
                'user_vote' => $userVote
            ]
        ]);
    }

    // Vote untuk Komentar
    public function voteComment(Request $request, $commentId)
    {
        $user = $request->user();
        $comment = Comment::find($commentId);
        if (!$comment) {
            return response()->json(['success' => false, 'message' => 'Comment not found'], 404);
        }

        // Cegah vote pada komentar sendiri
        if ($comment->user_id === $user->id) {
            return response()->json(['success' => false, 'message' => 'Anda tidak bisa vote pada komentar Anda sendiri'], 403);
        }

        $validator = Validator::make($request->all(), ['vote' => 'required|in:1,-1']);
        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $voteValue = (int) $request->vote;
        $existing = Vote::where('user_id', $user->id)
            ->where('target_type', Comment::class)
            ->where('target_id', $comment->id)
            ->first();

        if ($existing) {
            if ($existing->vote == $voteValue) {
                $existing->delete();
                $comment->votes_count -= $voteValue;
                $message = 'Vote removed';
                $userVote = null;
            } else {
                $comment->votes_count -= $existing->vote;
                $existing->vote = $voteValue;
                $existing->save();
                $comment->votes_count += $voteValue;
                $message = 'Vote changed';
                $userVote = $voteValue;
            }
        } else {
            Vote::create([
                'user_id' => $user->id,
                'target_type' => Comment::class,
                'target_id' => $comment->id,
                'vote' => $voteValue
            ]);
            $comment->votes_count += $voteValue;
            $message = 'Vote added';
            $userVote = $voteValue;
        }

        $comment->save();

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => [
                'votes_count' => $comment->votes_count,
                'user_vote' => $userVote
            ]
        ]);
    }

    // Cek vote user pada postingan
    public function getUserPostVote(Request $request, $postId)
    {
        $user = $request->user();
        $vote = Vote::where('user_id', $user->id)
            ->where('target_type', Post::class)
            ->where('target_id', $postId)
            ->first();
        return response()->json(['success' => true, 'data' => ['user_vote' => $vote ? $vote->vote : null]]);
    }

    // Cek vote user pada komentar
    public function getUserCommentVote(Request $request, $commentId)
    {
        $user = $request->user();
        $vote = Vote::where('user_id', $user->id)
            ->where('target_type', Comment::class)
            ->where('target_id', $commentId)
            ->first();
        return response()->json(['success' => true, 'data' => ['user_vote' => $vote ? $vote->vote : null]]);
    }
}
