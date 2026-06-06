<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Follow;
use Illuminate\Http\Request;
use App\Models\Notification;

class FollowController extends Controller
{
    /**
     * Follow user lain
     * POST /api/v1/users/{userId}/follow
     */
    public function follow(Request $request, $userId)
    {
        $follower = $request->user();
        $following = User::find($userId);

        if (!$following) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan'
            ], 404);
        }

        if ($follower->id === $following->id) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak bisa follow diri sendiri'
            ], 400);
        }

        // Cek apakah sudah follow
        $exists = Follow::where('follower_id', $follower->id)
                        ->where('following_id', $following->id)
                        ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Anda sudah mengikuti user ini'
            ], 409);
        }

        // Create follow record (UUID akan auto generate oleh model)
        Follow::create([
            'follower_id' => $follower->id,
            'following_id' => $following->id,
        ]);

        // Kirim notifikasi ke user yang diikuti
        Notification::send(
            $following->id,
            $follower->id,
            'follow',
            User::class,
            $follower->id,
            "User {$follower->name} mulai mengikuti Anda"
        );

        return response()->json([
            'success' => true,
            'message' => "Berhasil mengikuti {$following->name}"
        ], 201);
    }

    /**
     * Unfollow user lain
     * DELETE /api/v1/users/{userId}/unfollow
     */
    public function unfollow(Request $request, $userId)
    {
        $follower = $request->user();
        $following = User::find($userId);

        if (!$following) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan'
            ], 404);
        }

        // Hapus record follow
        $deleted = Follow::where('follower_id', $follower->id)
                         ->where('following_id', $following->id)
                         ->delete();

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak sedang mengikuti user ini'
            ], 409);
        }

        return response()->json([
            'success' => true,
            'message' => "Berhasil berhenti mengikuti {$following->name}"
        ], 200);
    }

    /**
     * Cek apakah user login mengikuti user tertentu
     * GET /api/v1/users/{userId}/is-following
     */
    public function isFollowing(Request $request, $userId)
    {
        $follower = $request->user();
        $following = User::find($userId);

        if (!$following) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan'
            ], 404);
        }

        $isFollowing = Follow::where('follower_id', $follower->id)
                             ->where('following_id', $following->id)
                             ->exists();

        return response()->json([
            'success' => true,
            'data' => ['is_following' => $isFollowing]
        ]);
    }

    /**
     * Daftar user yang diikuti oleh user login
     * GET /api/v1/users/me/following
     */
    public function myFollowing(Request $request)
    {
        $user = $request->user();
        $following = $user->following()->get(['id', 'name', 'email', 'avatar']);

        return response()->json([
            'success' => true,
            'data' => $following
        ]);
    }

    /**
     * Daftar pengikut user login
     * GET /api/v1/users/me/followers
     */
    public function myFollowers(Request $request)
    {
        $user = $request->user();
        $followers = $user->followers()->get(['id', 'name', 'email', 'avatar']);

        return response()->json([
            'success' => true,
            'data' => $followers
        ]);
    }
}
