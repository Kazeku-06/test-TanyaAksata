<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Post;
use App\Models\Comment;
use App\Models\Vote;
use App\Models\Like;
use App\Models\Report;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminStatisticController extends Controller
{
    public function index(Request $request)
    {
        // Pastikan hanya admin yang bisa akses
        $user = $request->user();
        if (!$user->hasRole('admin')) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        // Statistik dasar
        $stats = [
            'users' => [
                'total' => User::count(),
                'new_this_week' => User::where('created_at', '>=', now()->subDays(7))->count(),
                'banned' => User::where('is_banned', true)->count(),
            ],
            'posts' => [
                'total' => Post::count(),
                'published_this_week' => Post::where('created_at', '>=', now()->subDays(7))->count(),
                'solved' => Post::where('is_solved', true)->count(),
                'deleted' => Post::onlyTrashed()->count(),
            ],
            'comments' => [
                'total' => Comment::count(),
                'this_week' => Comment::where('created_at', '>=', now()->subDays(7))->count(),
                'deleted' => Comment::onlyTrashed()->count(),
            ],
            'votes' => [
                'total' => Vote::count(),
                'upvotes' => Vote::where('vote', 1)->count(),
                'downvotes' => Vote::where('vote', -1)->count(),
            ],
            'likes' => [
                'total' => Like::count(),
                'this_week' => Like::where('created_at', '>=', now()->subDays(7))->count(),
            ],
            'reports' => [
                'total' => Report::count(),
                'pending' => Report::where('status', 'pending')->count(),
                'resolved' => Report::where('status', 'resolved')->count(),
                'rejected' => Report::where('status', 'rejected')->count(),
            ],
            'categories' => [
                'total' => Category::count(),
            ],
            'engagement' => [
                'total_interactions' => Vote::count() + Like::count() + Comment::count(),
                'avg_comments_per_post' => Post::count() > 0 ? round(Comment::count() / Post::count(), 2) : 0,
                'avg_votes_per_post' => Post::count() > 0 ? round(Vote::count() / Post::count(), 2) : 0,
            ]
        ];

        return response()->json(['success' => true, 'data' => $stats]);
    }

    // Opsional: Statistik aktivitas per hari dalam 7 hari terakhir
    public function activityTrend(Request $request)
    {
        $user = $request->user();
        if (!$user->hasRole('admin')) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        $days = 7;
        $trend = [];

        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $trend[] = [
                'date' => $date,
                'posts' => Post::whereDate('created_at', $date)->count(),
                'comments' => Comment::whereDate('created_at', $date)->count(),
                'users' => User::whereDate('created_at', $date)->count(),
                'votes' => Vote::whereDate('created_at', $date)->count(),
                'likes' => Like::whereDate('created_at', $date)->count(),
            ];
        }

        return response()->json(['success' => true, 'data' => $trend]);
    }
}
