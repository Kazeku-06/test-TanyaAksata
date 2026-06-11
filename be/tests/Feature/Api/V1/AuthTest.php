<?php

namespace Tests\Feature\Api\V1;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::create(['name' => 'user',  'display_name' => 'User']);
        Role::create(['name' => 'admin', 'display_name' => 'Admin']);
    }

    #[Test]
    public function user_can_register_with_valid_data(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name'                  => 'Tester Baru',
            'email'                 => 'tester@example.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success', 'message',
                'data' => ['user', 'token', 'token_type'],
            ]);

        $this->assertDatabaseHas('users', ['email' => 'tester@example.com']);
    }

    #[Test]
    public function register_fails_with_duplicate_email(): void
    {
        User::factory()->create(['email' => 'duplikat@example.com']);

        $response = $this->postJson('/api/v1/auth/register', [
            'name'                  => 'Duplikat User',
            'email'                 => 'duplikat@example.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    #[Test]
    public function register_fails_when_password_not_confirmed(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name'                  => 'User',
            'email'                 => 'user@example.com',
            'password'              => 'password123',
            'password_confirmation' => 'salah',
        ]);

        $response->assertStatus(422);
    }

    #[Test]
    public function register_auto_assigns_user_role(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'name'                  => 'Role Test',
            'email'                 => 'roletest@example.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $user = User::where('email', 'roletest@example.com')->first();
        $this->assertTrue($user->hasRole('user'));
    }

    #[Test]
    public function user_can_login_with_correct_credentials(): void
    {
        User::factory()->create([
            'email'    => 'login@example.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => 'login@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success', 'message',
                'data' => ['user', 'token', 'token_type'],
            ]);
    }

    #[Test]
    public function login_fails_with_wrong_password(): void
    {
        User::factory()->create([
            'email'    => 'wrong@example.com',
            'password' => Hash::make('benar'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => 'wrong@example.com',
            'password' => 'salah',
        ]);

        $response->assertStatus(401)
            ->assertJsonPath('success', false);
    }

    #[Test]
    public function login_fails_if_user_is_banned(): void
    {
        User::factory()->create([
            'email'     => 'banned@example.com',
            'password'  => Hash::make('password123'),
            'is_banned' => true,
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => 'banned@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('success', false);
    }

    #[Test]
    public function authenticated_user_can_get_own_data(): void
    {
        $user  = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/v1/auth/me');

        $response->assertStatus(200)
            ->assertJsonPath('data.email', $user->email);
    }

    #[Test]
    public function unauthenticated_user_cannot_access_me(): void
    {
        $response = $this->getJson('/api/v1/auth/me');
        $response->assertStatus(401);
    }

    #[Test]
    public function authenticated_user_can_logout(): void
    {
        $user  = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/v1/auth/logout')
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        // Token sudah tidak bisa dipakai lagi
        $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/v1/auth/me')
            ->assertStatus(401);
    }
}
