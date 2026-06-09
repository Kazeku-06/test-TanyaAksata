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

        $users = Cache::remember($key, CacheService::TTL_LONG, function () {
            return User::withCount([
                'posts',
                'comments as accepted_count' => fn ($q) => $q->where('is_accepted', true),
            ])
                ->orderBy('reputation', 'desc')
                ->orderBy('accepted_count', 'desc')
                ->paginate(15);
        });

        // Hitung rank setelah dari cache
        $rank = ($users->currentPage() - 1) * $users->perPage() + 1;
        $users->getCollection()->transform(function ($user) use (&$rank) {
            $user->rank = $rank++;
            return $user;
        });

        return response()->json(['success' => true, 'data' => $users]);
    }
}

class LeaderboardController extends Controller
{
    public function index(Request $request)
    {
        $users = User::withCount(['posts', 'comments as accepted_count' => function ($query) {
                $query->where('is_accepted', true);
            }])
            ->orderBy('reputation', 'desc')
            ->orderBy('accepted_count', 'desc')
            ->paginate(15);

        // Menambahkan rank secara manual
        $rank = ($users->currentPage() - 1) * $users->perPage() + 1;
        $users->getCollection()->transform(function ($user) use (&$rank) {
            $user->rank = $rank++;
            return $user;
        });

        return response()->json(['success' => true, 'data' => $users]);
    }
}
