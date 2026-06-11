<?php

namespace Database\Seeders;

use App\Models\Tag;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TagSeeder extends Seeder
{
    public function run(): void
    {
        $tags = [
            ['name' => 'php', 'slug' => 'php', 'description' => 'Hypertext Preprocessor'],
            ['name' => 'javascript', 'slug' => 'javascript', 'description' => 'Bahasa scripting web'],
            ['name' => 'laravel', 'slug' => 'laravel', 'description' => 'PHP Framework'],
            ['name' => 'react', 'slug' => 'react', 'description' => 'Frontend library'],
            ['name' => 'mysql', 'slug' => 'mysql', 'description' => 'Database relational'],
            ['name' => 'docker', 'slug' => 'docker', 'description' => 'Containerization'],
            ['name' => 'rest-api', 'slug' => 'rest-api', 'description' => 'API design'],
            ['name' => 'eloquent', 'slug' => 'eloquent', 'description' => 'Laravel ORM'],
        ];

        foreach ($tags as $tag) {
            Tag::updateOrCreate(['slug' => $tag['slug']], $tag);
        }
    }
}
