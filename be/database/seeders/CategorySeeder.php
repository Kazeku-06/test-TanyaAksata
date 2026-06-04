<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Pemrograman',
                'slug' => 'pemrograman',
                'description' => 'Diskusi seputar bahasa pemrograman, algoritma, dan best practices.'
            ],
            [
                'name' => 'Framework',
                'slug' => 'framework',
                'description' => 'Laravel, React, Vue, Django, dan framework lainnya.'
            ],
            [
                'name' => 'Database',
                'slug' => 'database',
                'description' => 'MySQL, PostgreSQL, MongoDB, dan desain database.'
            ],
            [
                'name' => 'DevOps',
                'slug' => 'devops',
                'description' => 'Docker, Kubernetes, CI/CD, dan server management.'
            ],
            [
                'name' => 'UI/UX',
                'slug' => 'ui-ux',
                'description' => 'Desain antarmuka dan pengalaman pengguna.'
            ],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(['slug' => $cat['slug']], $cat);
        }
    }
}
