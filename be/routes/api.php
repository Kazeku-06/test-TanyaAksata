<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RoleController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\FollowController;
use App\Http\Controllers\Api\PostController;

Route::prefix('v1')->group(function () {

    // ========== PUBLIC ROUTES (tanpa token) ==========
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login', [AuthController::class, 'login']);

    // Public routes untuk melihat postingan (tidak perlu login)
    Route::get('/posts', [PostController::class, 'index']);
    Route::get('/posts/{id}', [PostController::class, 'show']);
    Route::get('/users/{userId}/posts', [PostController::class, 'userPosts']); // method userPosts harus ada di controller

    // ========== PROTECTED ROUTES (wajib token) ==========
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/me', [AuthController::class, 'me']);
    });

    // ========== ADMIN ROUTES (hanya admin) ==========
    Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
        Route::get('/users', [RoleController::class, 'listUsersWithRoles']);
        Route::post('/users/{userId}/assign-role', [RoleController::class, 'assignRole']);
        Route::post('/users/{userId}/remove-role', [RoleController::class, 'removeRole']);

        // Post management untuk admin (soft delete & history)
        Route::get('/posts/trashed', [PostController::class, 'trashed']);
        Route::get('/posts/{id}/trashed', [PostController::class, 'showTrashed']); // method showTrashed harus ada
        Route::get('/posts/{id}/history', [PostController::class, 'history']);
    });

    // ========== MODERATION ROUTES (admin atau moderator) ==========
    Route::middleware(['auth:sanctum', 'role:admin,moderator'])->prefix('moderation')->group(function () {
        Route::get('/dashboard', function () {
            return response()->json(['message' => 'Welcome, moderator or admin!']);
        });
    });

    // ========== USER ROUTES (semua user yang login) ==========
    Route::middleware('auth:sanctum')->group(function () {
        // Profile
        Route::get('/profile', [ProfileController::class, 'show']);
        Route::put('/profile', [ProfileController::class, 'update']);
        Route::patch('/profile', [ProfileController::class, 'update']);

        // Follow / Unfollow
        Route::prefix('users')->group(function () {
            Route::post('/{userId}/follow', [FollowController::class, 'follow']);
            Route::delete('/{userId}/unfollow', [FollowController::class, 'unfollow']);
            Route::get('/{userId}/is-following', [FollowController::class, 'isFollowing']);
            Route::get('/me/following', [FollowController::class, 'myFollowing']);
            Route::get('/me/followers', [FollowController::class, 'myFollowers']);
        });

        // CRUD Postingan (create, update, delete)
        Route::post('/posts', [PostController::class, 'store']);
        Route::put('/posts/{id}', [PostController::class, 'update']);
        Route::delete('/posts/{id}', [PostController::class, 'destroy']);
    });
});
