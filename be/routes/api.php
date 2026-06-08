<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RoleController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\FollowController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\VoteController;
use App\Http\Controllers\Api\LikeController;
use App\Http\Controllers\Api\BookmarkController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\LeaderboardController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\UserModerationController;

Route::prefix('v1')->group(function () {

    // ========== PUBLIC ROUTES (tanpa token) ==========
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login', [AuthController::class, 'login']);


    //leaderboard
    Route::get('/leaderboard', [LeaderboardController::class, 'index']);


    //trending post
    Route::get('/posts/trending', [PostController::class, 'trending']);

    // ========== CATEGORY ROUTES (Public) ==========
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{id}', [CategoryController::class, 'show']);

    // ========== CATEGORY CRUD (Admin & Moderator) ==========
    Route::middleware(['auth:sanctum', 'role:admin,moderator'])->group(function () {
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::match(['put', 'patch'], '/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);
    });

    // ========== PUBLIC POST ROUTES ==========
    Route::get('/posts', [PostController::class, 'index']);
    Route::get('/posts/search', [PostController::class, 'search']);
    Route::get('/posts/{id}', [PostController::class, 'show']);
    Route::get('/users/{userId}/posts', [PostController::class, 'userPosts']);
    Route::get('/posts/{postId}/comments', [CommentController::class, 'index']);

    // ========== PROTECTED ROUTES (wajib token) ==========
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/me', [AuthController::class, 'me']);

        // Profile
        Route::get('/profile', [ProfileController::class, 'show']);
        Route::match(['put', 'patch'], '/profile', [ProfileController::class, 'update']);

        // CRUD Postingan
        Route::post('/posts', [PostController::class, 'store']);
        Route::match(['put', 'patch'], '/posts/{id}', [PostController::class, 'update']);
        Route::delete('/posts/{id}', [PostController::class, 'destroy']);

        // CRUD Komentar
        Route::post('/comments', [CommentController::class, 'store']);
        Route::match(['put', 'patch'], '/comments/{id}', [CommentController::class, 'update']);
        Route::delete('/comments/{id}', [CommentController::class, 'destroy']);
        Route::post('/comments/{id}/accept', [CommentController::class, 'accept']);

        //laporan
        Route::post('/reports', [ReportController::class, 'store']);

        Route::get('/my-badges', [ProfileController::class, 'badges']);

        //notifikasi
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);


        //voting postingan
        Route::post('/posts/{postId}/vote', [VoteController::class, 'votePost']);
        Route::post('/comments/{commentId}/vote', [VoteController::class, 'voteComment']);
        Route::get('/posts/{postId}/user-vote', [VoteController::class, 'getUserPostVote']);
        Route::get('/comments/{commentId}/user-vote', [VoteController::class, 'getUserCommentVote']);

        //like postingan dan comentar
        Route::post('/posts/{postId}/like', [LikeController::class, 'toggleLike']);
        Route::get('/posts/{postId}/user-like', [LikeController::class, 'getUserLike']);
        Route::post('/comments/{commentId}/like', [LikeController::class, 'toggleLikeComment']);
        Route::get('/comments/{commentId}/user-like', [LikeController::class, 'getUserCommentLike']);

        Route::post('/posts/{postId}/bookmark', [BookmarkController::class, 'toggle']);
        Route::get('/bookmarks', [BookmarkController::class, 'index']);
        Route::delete('/bookmarks/{id}', [BookmarkController::class, 'destroy']);

        // Follow / Unfollow
        Route::prefix('users')->group(function () {
            Route::post('/{userId}/follow', [FollowController::class, 'follow']);
            Route::delete('/{userId}/unfollow', [FollowController::class, 'unfollow']);
            Route::get('/{userId}/is-following', [FollowController::class, 'isFollowing']);
            Route::get('/me/following', [FollowController::class, 'myFollowing']);
            Route::get('/me/followers', [FollowController::class, 'myFollowers']);
        });
    });

    // ========== ADMIN & MODERATOR SPECIAL ROUTES ==========
    Route::middleware(['auth:sanctum', 'role:admin,moderator'])->prefix('moderation')->group(function () {
        Route::get('/dashboard', function () {
            return response()->json(['message' => 'Welcome, moderator or admin!']);
        });

        Route::get('/posts/trashed', [PostController::class, 'trashed']);
        Route::get('/posts/{id}/trashed', [PostController::class, 'showTrashed']);
        Route::get('/posts/{id}/history', [PostController::class, 'history']);

        Route::post('/users/{userId}/warn', [UserModerationController::class, 'warn']);
        Route::post('/users/{userId}/ban', [UserModerationController::class, 'ban']);
        Route::post('/users/{userId}/unban', [UserModerationController::class, 'unban']);


        //laoran
        Route::get('/reports', [ReportController::class, 'index']);
        Route::get('/reports/{id}', [ReportController::class, 'show']);
        Route::put('/reports/{id}/resolve', [ReportController::class, 'resolve']);

        Route::get('/comments/trashed', [CommentController::class, 'trashed']);
        Route::get('/comments/{id}/trashed', [CommentController::class, 'showTrashed']);
        Route::get('/comments/{id}/history', [CommentController::class, 'history']);
    });

    // ========== ADMIN ONLY ROUTES ==========
    Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
        Route::get('/users', [RoleController::class, 'listUsersWithRoles']);
        Route::post('/users/{userId}/assign-role', [RoleController::class, 'assignRole']);
        Route::post('/users/{userId}/remove-role', [RoleController::class, 'removeRole']);


                //laoran
        Route::get('/reports', [ReportController::class, 'index']);
        Route::get('/reports/{id}', [ReportController::class, 'show']);
        Route::put('/reports/{id}/resolve', [ReportController::class, 'resolve']);
    });


    Route::middleware(['auth:sanctum', 'banned'])->group(function () {
    // semua route yang butuh login dan tidak boleh diakses banned user
});
});
