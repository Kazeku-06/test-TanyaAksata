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
        $admin = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@tanyaaksata.com',
            'password' => Hash::make('password123'),
            'reputation' => 0,
            'is_banned' => false,
        ]);

        // Ambil role admin
        $adminRole = Role::where('name', 'admin')->first();

        // Assign role admin ke user
        $admin->roles()->attach($adminRole->id);

        // Opsional: buat juga user moderator dan user biasa untuk testing
        $moderator = User::create([
            'name' => 'Moderator User',
            'email' => 'moderator@tanyaaksata.com',
            'password' => Hash::make('password123'),
            'reputation' => 0,
            'is_banned' => false,
        ]);
        $modRole = Role::where('name', 'moderator')->first();
        $moderator->roles()->attach($modRole->id);

        $normalUser = User::create([
            'name' => 'Regular User',
            'email' => 'user@tanyaaksata.com',
            'password' => Hash::make('password123'),
            'reputation' => 0,
            'is_banned' => false,
        ]);
        $userRole = Role::where('name', 'user')->first();
        $normalUser->roles()->attach($userRole->id);
    }
}
