<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

/**
 * Centralized cache key management.
 * Semua cache key dan TTL di satu tempat agar mudah di-invalidate.
 */
class CacheService
{
    // TTL dalam detik
    const TTL_SHORT  = 60;          // 1 menit   — data sering berubah (posts list)
    const TTL_MEDIUM = 5 * 60;      // 5 menit   — data agak statis (categories)
    const TTL_LONG   = 15 * 60;     // 15 menit  — data jarang berubah (leaderboard)

    // ── Cache key builders ─────────────────────────────────────

    public static function postsKey(int $page = 1): string
    {
        return "posts:list:page:{$page}";
    }

    public static function trendingKey(int $limit = 10): string
    {
        return "posts:trending:{$limit}";
    }

    public static function postDetailKey(string $id): string
    {
        return "posts:detail:{$id}";
    }

    public static function categoriesKey(bool $flat = false): string
    {
        return 'categories:' . ($flat ? 'flat' : 'tree');
    }

    public static function leaderboardKey(int $page = 1): string
    {
        return "leaderboard:page:{$page}";
    }

    public static function userPublicKey(string $userId): string
    {
        return "users:public:{$userId}";
    }

    public static function userPostsKey(string $userId, int $page = 1): string
    {
        return "users:{$userId}:posts:page:{$page}";
    }

    public static function postCommentsKey(string $postId): string
    {
        return "posts:{$postId}:comments";
    }

    // ── Cache invalidation helpers ─────────────────────────────

    /**
     * Invalidate semua cache yang berkaitan dengan post list.
     * Dipanggil saat post dibuat, diedit, atau dihapus.
     */
    public static function invalidatePostLists(): void
    {
        // Hapus page 1–5 (yang paling sering diakses)
        for ($i = 1; $i <= 5; $i++) {
            Cache::forget(self::postsKey($i));
        }

        // Hapus trending
        foreach ([5, 10, 15, 20] as $limit) {
            Cache::forget(self::trendingKey($limit));
        }
    }

    /**
     * Invalidate cache detail post beserta komentar-nya.
     */
    public static function invalidatePost(string $postId): void
    {
        Cache::forget(self::postDetailKey($postId));
        Cache::forget(self::postCommentsKey($postId));
        self::invalidatePostLists();
    }

    /**
     * Invalidate cache categories.
     */
    public static function invalidateCategories(): void
    {
        Cache::forget(self::categoriesKey(false));
        Cache::forget(self::categoriesKey(true));
    }

    /**
     * Invalidate cache user public profile dan post-nya.
     */
    public static function invalidateUser(string $userId): void
    {
        Cache::forget(self::userPublicKey($userId));
        for ($i = 1; $i <= 3; $i++) {
            Cache::forget(self::userPostsKey($userId, $i));
        }
    }

    /**
     * Invalidate leaderboard.
     */
    public static function invalidateLeaderboard(): void
    {
        for ($i = 1; $i <= 3; $i++) {
            Cache::forget(self::leaderboardKey($i));
        }
    }
}
