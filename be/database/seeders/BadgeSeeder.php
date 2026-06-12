<?php

namespace Database\Seeders;

use App\Models\Badge;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BadgeSeeder extends Seeder
{
    public function run()
    {
        $badges = [
            ['name' => 'Newbie', 'required_points' => 0, 'achievement_type' => 'points', 'threshold' => 0, 'description' => 'Selamat datang!', 'icon' => '🌱'],
            ['name' => 'Rising Star', 'required_points' => 100, 'achievement_type' => 'points', 'threshold' => 100, 'description' => '100 poin reputasi', 'icon' => '⭐'],
            ['name' => 'Talkative', 'achievement_type' => 'comment_count', 'threshold' => 10, 'description' => '10 komentar', 'icon' => '💬'],
            ['name' => 'Problem Solver', 'achievement_type' => 'accepted_count', 'threshold' => 1, 'description' => 'Jawaban pertama diterima', 'icon' => '🏆'],
            ['name' => 'Prolific', 'achievement_type' => 'post_count', 'threshold' => 5, 'description' => '5 postingan', 'icon' => '✍️'],
        ];

        foreach ($badges as $badge) {
            Badge::create([
                'name' => $badge['name'],
                'slug' => Str::slug($badge['name']),
                'description' => $badge['description'],
                'icon' => $badge['icon'],
                'required_points' => $badge['required_points'] ?? null,
                'achievement_type' => $badge['achievement_type'],
                'threshold' => $badge['threshold'],
            ]);
        }
    }
}
