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
                // Hapus vote: rollback reputasi
                if ($existing->vote == 1) {
                    $post->user->addReputation(-5, 'vote_removed_upvote_post', Post::class, $post->id);
                    // Tidak perlu notifikasi penghapusan
                } else {
                    $post->user->addReputation(2, 'vote_removed_downvote_post', Post::class, $post->id);
                    $user->addReputation(1, 'vote_removed_downvote_giver', Post::class, $post->id);
                }
                $existing->delete();
                $post->votes_count -= $voteValue;
                $message = 'Vote removed';
                $userVote = null;
            } else {
                // Ubah vote
                // rollback reputasi lama
                if ($existing->vote == 1) {
                    $post->user->addReputation(-5, 'vote_changed_from_upvote', Post::class, $post->id);
                } else {
                    $post->user->addReputation(2, 'vote_changed_from_downvote', Post::class, $post->id);
                    $user->addReputation(1, 'vote_changed_from_downvote_giver', Post::class, $post->id);
                }
                // beri reputasi baru
                if ($voteValue == 1) {
                    $post->user->addReputation(5, 'vote_upvote_post', Post::class, $post->id);
                    // Notifikasi upvote
                    \App\Models\Notification::send($post->user_id, $user->id, 'vote', Post::class, $post->id, "User {$user->name} memberi upvote pada postingan Anda '{$post->title}'");
                } else {
                    $post->user->addReputation(-2, 'vote_downvote_post', Post::class, $post->id);
                    $user->addReputation(-1, 'vote_downvote_giver', Post::class, $post->id);
                }
                // update votes_count
                $post->votes_count -= $existing->vote;
                $existing->vote = $voteValue;
                $existing->save();
                $post->votes_count += $voteValue;
                $message = 'Vote changed';
                $userVote = $voteValue;
            }
        } else {
            // Vote baru
            if ($voteValue == 1) {
                $post->user->addReputation(5, 'vote_upvote_post', Post::class, $post->id);
                \App\Models\Notification::send($post->user_id, $user->id, 'vote', Post::class, $post->id, "User {$user->name} memberi upvote pada postingan Anda '{$post->title}'");
            } else {
                $post->user->addReputation(-2, 'vote_downvote_post', Post::class, $post->id);
                $user->addReputation(-1, 'vote_downvote_giver', Post::class, $post->id);
            }
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
                // Hapus vote: rollback reputasi
                if ($existing->vote == 1) {
                    $comment->user->addReputation(-3, 'vote_removed_upvote_comment', Comment::class, $comment->id);
                } else {
                    $comment->user->addReputation(1, 'vote_removed_downvote_comment', Comment::class, $comment->id);
                    $user->addReputation(1, 'vote_removed_downvote_comment_giver', Comment::class, $comment->id);
                }
                $existing->delete();
                $comment->votes_count -= $voteValue;
                $message = 'Vote removed';
                $userVote = null;
            } else {
                // Ubah vote: rollback lama, beri baru
                if ($existing->vote == 1) {
                    $comment->user->addReputation(-3, 'vote_changed_from_upvote_comment', Comment::class, $comment->id);
                } else {
                    $comment->user->addReputation(1, 'vote_changed_from_downvote_comment', Comment::class, $comment->id);
                    $user->addReputation(1, 'vote_changed_from_downvote_comment_giver', Comment::class, $comment->id);
                }
                if ($voteValue == 1) {
                    $comment->user->addReputation(3, 'vote_upvote_comment', Comment::class, $comment->id);
                } else {
                    $comment->user->addReputation(-1, 'vote_downvote_comment', Comment::class, $comment->id);
                    $user->addReputation(-1, 'vote_downvote_comment_giver', Comment::class, $comment->id);
                }
                $comment->votes_count -= $existing->vote;
                $existing->vote = $voteValue;
                $existing->save();
                $comment->votes_count += $voteValue;
                $message = 'Vote changed';
                $userVote = $voteValue;
            }
        } else {
            // Vote baru
            if ($voteValue == 1) {
                $comment->user->addReputation(3, 'vote_upvote_comment', Comment::class, $comment->id);
            } else {
                $comment->user->addReputation(-1, 'vote_downvote_comment', Comment::class, $comment->id);
                $user->addReputation(-1, 'vote_downvote_comment_giver', Comment::class, $comment->id);
            }
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
