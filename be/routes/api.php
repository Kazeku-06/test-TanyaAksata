<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RoleController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\FollowController;
use App\Http\Controllers\Api\PostController;

Route::prefix('v1')->group(function () {

    // Public routes (tanpa token)
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login', [AuthController::class, 'login']);

    // Protected routes (pakai token)
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/me', [AuthController::class, 'me']);
    });

    //public post
    Route::get('/posts', [PostController::class, 'index']);
    Route::get('/posts/{id}', [PostController::class, 'show']);
    Route::get('/users/{userId}/posts', [PostController::class, 'userPosts']);

    // Admin routes
    Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
        Route::get('/users', [RoleController::class, 'listUsersWithRoles']);
        Route::post('/users/{userId}/assign-role', [RoleController::class, 'assignRole']);
        Route::post('/users/{userId}/remove-role', [RoleController::class, 'removeRole']);

        //route buat liat soft delete postingan
        Route::get('/posts/trashed', [PostController::class, 'trashed']);
        Route::get('/posts/{id}/trashed', [PostController::class, 'showTrashed']);
    });

    // Moderation routes
    Route::middleware(['auth:sanctum', 'role:admin,moderator'])->prefix('moderation')->group(function () {
        Route::get('/dashboard', function () {
            return response()->json(['message' => 'Welcome, moderator or admin!']);
        });
    });

    // Protected user routes
    Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::patch('/profile', [ProfileController::class, 'update']);

    // routing buat follow unfollow user lain
    Route::prefix('users')->group(function () {
        Route::post('/{userId}/follow', [FollowController::class, 'follow']);
        Route::delete('/{userId}/unfollow', [FollowController::class, 'unfollow']);
        Route::get('/{userId}/is-following', [FollowController::class, 'isFollowing']);
        Route::get('/me/following', [FollowController::class, 'myFollowing']);
        Route::get('/me/followers', [FollowController::class, 'myFollowers']);
    });

    //routing untuk post
    Route::post('/posts', [PostController::class, 'store']);
    Route::put('/posts/{id}', [PostController::class, 'update']);
    Route::patch('/posts/{id}', [PostController::class, 'update']);
    Route::delete('/posts/{id}', [PostController::class, 'destroy']);
    });
});
