<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ProfileController extends Controller
{
    /**
     * Get user profile
     * GET /api/v1/profile
     */
    public function show(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data' => $user
        ], 200);
    }

    /**
     * Update user profile
     * PUT/PATCH /api/v1/profile
     */
    public function update(Request $request)
    {
        $user = $request->user();

        // Validasi input
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'bio' => 'nullable|string|max:1000',
            'location' => 'nullable|string|max:255',
            'website' => 'nullable|url|max:255',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // 2MB
            'current_password' => 'required_with:new_password|string|min:6',
            'new_password' => 'nullable|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            $errors = $validator->errors();
            $debugMsg = "";
            if ($errors->has('avatar')) {
                if ($request->hasFile('avatar')) {
                    $file = $request->file('avatar');
                    $debugMsg = " Avatar info: Valid=" . ($file->isValid() ? 'true' : 'false') . ", ErrorCode=" . $file->getError() . ", ErrorMsg=" . $file->getErrorMessage() . ", Mime=" . $file->getMimeType();
                } else {
                    $debugMsg = " Avatar is NOT a file. It is type: " . gettype($request->input('avatar'));
                }
            }

            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal.' . $debugMsg,
                'errors' => $errors
            ], 422);
        }

        // Jika ada perubahan password
        if ($request->filled('new_password')) {
            // Cek current password
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Current password salah'
                ], 401);
            }

            // Update password
            $user->password = Hash::make($request->new_password);
        }

        // Update field lain
        if ($request->has('name')) {
            $user->name = $request->name;
        }

        if ($request->has('bio')) {
            $user->bio = $request->bio;
        }

        if ($request->has('location')) {
            $user->location = $request->location;
        }

        if ($request->has('website')) {
            $user->website = $request->website;
        }

        // Proses upload avatar jika ada
        if ($request->hasFile('avatar')) {
            // Hapus avatar lama jika ada
            if ($user->avatar && file_exists(public_path('storage/' . $user->avatar))) {
                unlink(public_path('storage/' . $user->avatar));
            }

            // Simpan avatar baru
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = $avatarPath;
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diupdate',
            'data' => $user
        ], 200);
    }

        // Menampilkan badge user yang login
    public function badges(Request $request)
    {
        $user = $request->user();
        $badges = $user->badges()->get();
        return response()->json(['success' => true, 'data' => $badges]);
    }

    /**
     * Get public profile of any user
     * GET /api/v1/users/{id}
     */
    public function showPublic(Request $request, $id)
    {
        $user = \App\Models\User::with('badges')->find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id'               => $user->id,
                'name'             => $user->name,
                'avatar'           => $user->avatar,
                'bio'              => $user->bio,
                'location'         => $user->location,
                'website'          => $user->website,
                'reputation'       => $user->reputation,
                'reputation_level' => $user->reputation_level,
                'posts_count'      => $user->posts()->count(),
                'followers_count'  => $user->followers()->count(),
                'following_count'  => $user->following()->count(),
                'badges'           => $user->badges,
                'created_at'       => $user->created_at,
            ]
        ]);
    }

    /**
     * Get paginated list of users with search by name
     * GET /api/v1/users
     */
    public function listUsers(Request $request)
    {
        $search = $request->get('q');
        $query = \App\Models\User::query();

        if ($search) {
            $query->where('name', 'like', '%' . $search . '%');
        }

        $sort = $request->get('sort', 'reputation');
        if ($sort === 'newest') {
            $query->orderBy('created_at', 'desc');
        } else {
            $query->orderBy('reputation', 'desc');
        }

        $users = $query->paginate(24);

        $users->getCollection()->transform(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'avatar' => $user->avatar,
                'bio' => $user->bio,
                'location' => $user->location,
                'website' => $user->website,
                'reputation' => $user->reputation,
                'reputation_level' => $user->reputation_level,
                'created_at' => $user->created_at,
            ];
        });

        return response()->json(['success' => true, 'data' => $users]);
    }
}
