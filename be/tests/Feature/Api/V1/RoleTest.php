<?php

namespace Tests\Feature\Api\V1;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class RoleTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $normalUser;
    protected Role $userRole;
    protected Role $adminRole;

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminRole = Role::create(['name' => 'admin', 'display_name' => 'Admin']);
        $this->userRole  = Role::create(['name' => 'user',  'display_name' => 'User']);
        Role::create(['name' => 'moderator', 'display_name' => 'Moderator']);

        $this->admin = User::factory()->create();
        $this->admin->roles()->attach($this->adminRole->id);

        $this->normalUser = User::factory()->create();
        $this->normalUser->roles()->attach($this->userRole->id);
    }

    // ─── LIST USERS WITH ROLES ──────────────────────────────

    #[Test]
    public function admin_can_list_users_with_roles(): void
    {
        $token = $this->admin->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/v1/admin/users')
            ->assertStatus(200)
            ->assertJsonStructure(['success', 'data']);
    }

    #[Test]
    public function normal_user_cannot_list_users_with_roles(): void
    {
        $token = $this->normalUser->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/v1/admin/users')
            ->assertStatus(403);
    }

    #[Test]
    public function guest_cannot_list_users_with_roles(): void
    {
        $this->getJson('/api/v1/admin/users')
            ->assertStatus(401);
    }

    // ─── ASSIGN ROLE ─────────────────────────────────────────

    #[Test]
    public function admin_can_assign_role_to_user(): void
    {
        $token = $this->admin->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->postJson("/api/v1/admin/users/{$this->normalUser->id}/assign-role", [
                'role_name' => 'moderator',
            ])
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertTrue($this->normalUser->fresh()->hasRole('moderator'));
    }

    #[Test]
    public function assign_role_is_idempotent_for_existing_role(): void
    {
        $token = $this->admin->createToken('test')->plainTextToken;

        // Assign role yang sudah dimiliki — tidak boleh error
        $this->withHeader('Authorization', "Bearer $token")
            ->postJson("/api/v1/admin/users/{$this->normalUser->id}/assign-role", [
                'role_name' => 'user',
            ])
            ->assertStatus(200);
    }

    #[Test]
    public function normal_user_cannot_assign_role(): void
    {
        $token = $this->normalUser->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->postJson("/api/v1/admin/users/{$this->admin->id}/assign-role", [
                'role_name' => 'admin',
            ])
            ->assertStatus(403);
    }

    // ─── REMOVE ROLE ─────────────────────────────────────────

    #[Test]
    public function admin_can_remove_role_from_user(): void
    {
        $token = $this->admin->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->postJson("/api/v1/admin/users/{$this->normalUser->id}/remove-role", [
                'role_name' => 'user',
            ])
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertFalse($this->normalUser->fresh()->hasRole('user'));
    }

    #[Test]
    public function normal_user_cannot_remove_role(): void
    {
        $token = $this->normalUser->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->postJson("/api/v1/admin/users/{$this->admin->id}/remove-role", [
                'role_name' => 'admin',
            ])
            ->assertStatus(403);
    }
}
