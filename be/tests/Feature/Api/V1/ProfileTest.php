<?php

namespace Tests\Feature\Api\V1;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $userRole   = Role::create(['name' => 'user', 'display_name' => 'User']);
        $this->user = User::factory()->create([
            'password' => Hash::make('password123'),
        ]);
        $this->user->roles()->attach($userRole->id);
    }

    // ─── SHOW ───────────────────────────────────────────────

    #[Test]
    public function authenticated_user_can_view_own_profile(): void
    {
        $token = $this->user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/v1/profile')
            ->assertStatus(200)
            ->assertJsonPath('data.email', $this->user->email);
    }

    #[Test]
    public function guest_cannot_view_profile(): void
    {
        $this->getJson('/api/v1/profile')
            ->assertStatus(401);
    }

    // ─── UPDATE ─────────────────────────────────────────────

    #[Test]
    public function user_can_update_name_and_bio(): void
    {
        $token = $this->user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->putJson('/api/v1/profile', [
                'name' => 'Nama Baru',
                'bio'  => 'Bio baru saya',
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.name', 'Nama Baru')
            ->assertJsonPath('data.bio', 'Bio baru saya');

        $this->assertDatabaseHas('users', [
            'id'   => $this->user->id,
            'name' => 'Nama Baru',
        ]);
    }

    #[Test]
    public function user_can_update_location_and_website(): void
    {
        $token = $this->user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->putJson('/api/v1/profile', [
                'location' => 'Jakarta',
                'website'  => 'https://example.com',
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.location', 'Jakarta')
            ->assertJsonPath('data.website', 'https://example.com');
    }

    #[Test]
    public function user_can_change_password_with_correct_current_password(): void
    {
        $token = $this->user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->putJson('/api/v1/profile', [
                'current_password'          => 'password123',
                'new_password'              => 'newpassword456',
                'new_password_confirmation' => 'newpassword456',
            ])
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertTrue(Hash::check('newpassword456', $this->user->fresh()->password));
    }

    #[Test]
    public function password_change_fails_with_wrong_current_password(): void
    {
        $token = $this->user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->putJson('/api/v1/profile', [
                'current_password'          => 'passwordSalah',
                'new_password'              => 'newpassword456',
                'new_password_confirmation' => 'newpassword456',
            ])
            ->assertStatus(401)
            ->assertJsonPath('success', false);
    }

    #[Test]
    public function profile_update_fails_with_invalid_website_url(): void
    {
        $token = $this->user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->putJson('/api/v1/profile', [
                'website' => 'bukan-url-valid',
            ])
            ->assertStatus(422);
    }
}
