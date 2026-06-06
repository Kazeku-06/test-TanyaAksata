<?php

namespace Tests\Feature\Api\V1;

use App\Models\Category;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $moderator;
    protected User $normalUser;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole     = Role::create(['name' => 'admin',     'display_name' => 'Admin']);
        $moderatorRole = Role::create(['name' => 'moderator', 'display_name' => 'Moderator']);
        $userRole      = Role::create(['name' => 'user',      'display_name' => 'User']);

        $this->admin = User::factory()->create();
        $this->admin->roles()->attach($adminRole->id);

        $this->moderator = User::factory()->create();
        $this->moderator->roles()->attach($moderatorRole->id);

        $this->normalUser = User::factory()->create();
        $this->normalUser->roles()->attach($userRole->id);
    }

    // ─── PUBLIC ─────────────────────────────────────────────

    #[Test]
    public function public_can_list_categories(): void
    {
        Category::create(['name' => 'Tech', 'slug' => 'tech']);

        $this->getJson('/api/v1/categories')
            ->assertStatus(200)
            ->assertJsonStructure(['success', 'data']);
    }

    #[Test]
    public function public_can_view_single_category(): void
    {
        $category = Category::create(['name' => 'Science', 'slug' => 'science']);

        $this->getJson("/api/v1/categories/{$category->id}")
            ->assertStatus(200)
            ->assertJsonPath('data.name', 'Science');
    }

    #[Test]
    public function category_show_returns_404_for_invalid_id(): void
    {
        $this->getJson('/api/v1/categories/nonexistent-id')
            ->assertStatus(404);
    }

    // ─── STORE ──────────────────────────────────────────────

    #[Test]
    public function admin_can_create_category(): void
    {
        $token = $this->admin->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/v1/categories', [
                'name'        => 'New Category',
                'description' => 'Deskripsi kategori baru',
            ])
            ->assertStatus(201)
            ->assertJsonPath('data.name', 'New Category');

        $this->assertDatabaseHas('categories', ['name' => 'New Category']);
    }

    #[Test]
    public function moderator_can_create_category(): void
    {
        $token = $this->moderator->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/v1/categories', ['name' => 'Moderator Category'])
            ->assertStatus(201);
    }

    #[Test]
    public function normal_user_cannot_create_category(): void
    {
        $token = $this->normalUser->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/v1/categories', ['name' => 'Hacker Category'])
            ->assertStatus(403);
    }

    #[Test]
    public function guest_cannot_create_category(): void
    {
        $this->postJson('/api/v1/categories', ['name' => 'Guest Category'])
            ->assertStatus(401);
    }

    #[Test]
    public function create_category_fails_with_duplicate_name(): void
    {
        Category::create(['name' => 'Duplikat', 'slug' => 'duplikat']);
        $token = $this->admin->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/v1/categories', ['name' => 'Duplikat'])
            ->assertStatus(422);
    }

    // ─── UPDATE ─────────────────────────────────────────────

    #[Test]
    public function admin_can_update_category(): void
    {
        $category = Category::create(['name' => 'Old Name', 'slug' => 'old-name']);
        $token    = $this->admin->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->putJson("/api/v1/categories/{$category->id}", ['name' => 'Updated Name'])
            ->assertStatus(200)
            ->assertJsonPath('data.name', 'Updated Name');

        $this->assertDatabaseHas('categories', ['name' => 'Updated Name']);
    }

    #[Test]
    public function normal_user_cannot_update_category(): void
    {
        $category = Category::create(['name' => 'Protected', 'slug' => 'protected']);
        $token    = $this->normalUser->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->putJson("/api/v1/categories/{$category->id}", ['name' => 'Hacked'])
            ->assertStatus(403);
    }

    // ─── DELETE ─────────────────────────────────────────────

    #[Test]
    public function admin_can_delete_category(): void
    {
        $category = Category::create(['name' => 'To Delete', 'slug' => 'to-delete']);
        $token    = $this->admin->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->deleteJson("/api/v1/categories/{$category->id}")
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
    }

    #[Test]
    public function normal_user_cannot_delete_category(): void
    {
        $category = Category::create(['name' => 'Safe', 'slug' => 'safe']);
        $token    = $this->normalUser->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->deleteJson("/api/v1/categories/{$category->id}")
            ->assertStatus(403);
    }
}
