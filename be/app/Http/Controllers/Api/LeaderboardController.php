<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\CacheService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class LeaderboardController extends Controller
{
    // Leaderboard — cached 15 menit
    public function index(Request $request)
    {
        $page = (int) $request->get('page', 1);
        $key  = CacheService::leaderboardKey($page);

        $usersArray = Cache::remember($key, CacheService::TTL_LONG, function () {
            return User::withCount([
                'posts',
                'comments as accepted_count' => fn ($q) => $q->where('is_accepted', true),
            ])
                ->orderBy('reputation', 'desc')
                ->orderBy('accepted_count', 'desc')
                ->paginate(15)
                ->toArray();
        });

        // Hitung rank berdasarkan page & offset
        $perPage     = $usersArray['per_page'] ?? 15;
        $currentPage = $usersArray['current_page'] ?? 1;
        $rank        = ($currentPage - 1) * $perPage + 1;

        $usersArray['data'] = array_map(function ($user) use (&$rank) {
            $user['rank'] = $rank++;
            return $user;
        }, $usersArray['data'] ?? []);

        return response()->json(['success' => true, 'data' => $usersArray]);
    }
}
