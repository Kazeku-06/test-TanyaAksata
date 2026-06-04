<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Buat user admin
        $admin = User::updateOrCreate(
            ['email' => 'admin@tanyaaksata.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password123'),
                'reputation' => 0,
                'is_banned' => false,
            ]
        );

        // Ambil role admin
        $adminRole = Role::where('name', 'admin')->first();

        // Assign role admin ke user jika belum punya
        if ($adminRole && !$admin->roles()->where('role_id', $adminRole->id)->exists()) {
            $admin->roles()->attach($adminRole->id);
        }

        // Opsional: buat juga user moderator dan user biasa untuk testing
        $moderator = User::updateOrCreate(
            ['email' => 'moderator@tanyaaksata.com'],
            [
                'name' => 'Moderator User',
                'password' => Hash::make('password123'),
                'reputation' => 0,
                'is_banned' => false,
            ]
        );
        $modRole = Role::where('name', 'moderator')->first();
        if ($modRole && !$moderator->roles()->where('role_id', $modRole->id)->exists()) {
            $moderator->roles()->attach($modRole->id);
        }

        $normalUser = User::updateOrCreate(
            ['email' => 'user@tanyaaksata.com'],
            [
                'name' => 'Regular User',
                'password' => Hash::make('password123'),
                'reputation' => 0,
                'is_banned' => false,
            ]
        );
        $userRole = Role::where('name', 'user')->first();
        if ($userRole && !$normalUser->roles()->where('role_id', $userRole->id)->exists()) {
            $normalUser->roles()->attach($userRole->id);
        }
    }
}
