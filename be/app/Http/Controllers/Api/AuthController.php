<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Register user baru
     * POST /api/v1/auth/register
     */
    public function register(Request $request)
    {
        // 1. Validasi input
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // 2. Buat user
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'reputation' => 0,
        ]);

        // 3. Assign role default 'user' (jika tabel roles dan user_roles sudah ada)
        // Cek apakah role user ada, lalu attach
        $userRole = \App\Models\Role::where('name', 'user')->first();
        if ($userRole) {
            $user->roles()->attach($userRole->id);
        }

        // Cek dan berikan badge pertama (Newbie)
        $user->checkAndAwardBadges();

        // 4. Buat token Sanctum
        $token = $user->createToken('auth_token')->plainTextToken;

        // 5. Response
        return response()->json([
            'success' => true,
            'message' => 'Registrasi berhasil',
            'data' => [
                'user' => $user,
                'token' => $token,
                'token_type' => 'Bearer'
            ]
        ], 201);
    }

    /**
     * Login user
     * POST /api/v1/auth/login
     */
    public function login(Request $request)
    {
        // Validasi
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Cek kredensial
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau password salah'
            ], 401);
        }

        $user = Auth::user();

        // Cek apakah user dibanned
        if ($user->is_banned) {
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda sedang dibanned'
            ], 403);
        }

        // Hapus token lama (opsional, biar tidak menumpuk)
        // $user->tokens()->delete();

        // Buat token baru
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil',
            'data' => [
                'user' => $user->load('roles'),
                'token' => $token,
                'token_type' => 'Bearer'
            ]
        ], 200);
    }

    /**
     * Logout (hapus token yang sedang dipakai)
     * POST /api/v1/auth/logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil'
        ], 200);
    }

    /**
     * Ambil data user yang login
     * GET /api/v1/auth/me
     */
    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $request->user()->load('roles')
        ], 200);
    }
}
