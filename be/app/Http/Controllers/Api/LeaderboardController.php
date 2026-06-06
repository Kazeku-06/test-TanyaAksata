<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Comment;
use Illuminate\Http\Request;

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
