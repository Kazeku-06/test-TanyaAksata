<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [
                'name' => 'admin',
                'display_name' => 'Administrator',
                'description' => 'Memiliki akses penuh ke sistem'
            ],
            [
                'name' => 'moderator',
                'display_name' => 'Moderator',
                'description' => 'Dapat mengelola konten dan laporan'
            ],
            [
                'name' => 'user',
                'display_name' => 'User Biasa',
                'description' => 'User standar yang dapat bertanya dan menjawab'
            ],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(['name' => $role['name']], $role);
        }
    }
}
