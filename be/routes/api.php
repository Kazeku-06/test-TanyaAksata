<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RoleController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProfileController;

Route::prefix('v1')->group(function () {

    // Public routes (tanpa token)
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login', [AuthController::class, 'login']);

    // Protected routes (pakai token)
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/me', [AuthController::class, 'me']);
    });

    // Admin routes
    Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
        Route::get('/users', [RoleController::class, 'listUsersWithRoles']);
        Route::post('/users/{userId}/assign-role', [RoleController::class, 'assignRole']);
        Route::post('/users/{userId}/remove-role', [RoleController::class, 'removeRole']);
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
    });
});
