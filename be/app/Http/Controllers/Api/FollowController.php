<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Validator;

class FollowController extends Controller
{
    /**
     * Follow user lain
     * POST /api/v1/users/{userId}/follow
     */
    public function follow(Request $request, $userId)
    {
        $follower = $request->user();
        $following = User::find($userId); // buat user yang mau di follow

        if (!$following) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan'
            ], 404);
        }

        //validattor biar gak follow diri sendiri
        if ($follower->id === $following->id) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak bisa follow diri sendiri'
            ], 400);
        }

        //cheker udah follow apa belum
        if ($follower->following()->where('following_id', $following->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Anda sudah mengikuti user ini'
            ], 400);
        }

        // kalo belum follow bakalan di lakuin pake logic ini
        $follower->following()->attach($following->id);

        return response()->json([
            'success' => true,
            'message' => 'Berhasil mengikuti ' . $following->name
        ], 200);


    }

    /**
     * Unfollow user lain
     * DELETE /api/v1/users/{userId}/unfollow
     */
    public function unfolow (Request $request, $userId)
    {
         $follower = $request->user();
        $following = User::find($userId);

        if (!$following) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan'
            ], 404);
        }

        // cek udah folow ap belum
        if (!$follower->following()->where('following_id', $following->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak mengikuti user ini'
            ], 400);
        }

        // kalo udah follow bakalan di unfoll pake logic ini
        $follower->following()->detach($following->id);

        return response()->json([
            'success' => true,
            'message' => 'Berhenti mengikuti ' . $following->name
        ], 200);
    }
    /**
     * Daftar followers (pengikut user tertentu)
     * GET /api/v1/users/{userId}/followers
     */
    public function followersList($userId)
    {
         $user = User::find($userId);
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan'
            ], 404);
        }

        $followers = $user->followers()->get(['users.id', 'users.name', 'users.email', 'users.avatar', 'users.reputation']);

        return response()->json([
            'success' => true,
            'data' => $followers
        ], 200);
    }

    /**
     * Cek apakah user login sedang mengikuti user tertentu
     * GET /api/v1/users/{userId}/is-following
     */
    public function isFollowing(Request $request, $userId)
    {
        $follower = $request->user();
        $target = User::find($userId);

        if (!$target) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan'
            ], 404);
        }

        $isFollowing = $follower->following()->where('following_id', $target->id)->exists();

        return response()->json([
            'success' => true,
            'data' => [
                'is_following' => $isFollowing
            ]
        ], 200);
    }

}
