<?php

namespace Tests\Feature\Api\V1;

use App\Models\Category;
use App\Models\Post;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class PostTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $user;
    protected User $otherUser;
    protected Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::create(['name' => 'admin',     'display_name' => 'Admin']);
        $userRole  = Role::create(['name' => 'user',      'display_name' => 'User']);
        Role::create(['name' => 'moderator', 'display_name' => 'Moderator']);

        $this->admin = User::factory()->create();
        $this->admin->roles()->attach($adminRole->id);

        $this->user = User::factory()->create();
        $this->user->roles()->attach($userRole->id);

        $this->otherUser = User::factory()->create();
        $this->otherUser->roles()->attach($userRole->id);

        $this->category = Category::create(['name' => 'Tech', 'slug' => 'tech']);
    }

    // ─── PUBLIC ─────────────────────────────────────────────

    #[Test]
    public function public_can_list_posts(): void
    {
        $this->getJson('/api/v1/posts')
            ->assertStatus(200)
            ->assertJsonStructure(['success', 'data']);
    }

    #[Test]
    public function public_can_view_single_post(): void
    {
        $post = Post::create([
            'title'       => 'Post Publik',
            'body'        => 'Isi post publik',
            'user_id'     => $this->user->id,
            'category_id' => $this->category->id,
        ]);

        $this->getJson("/api/v1/posts/{$post->id}")
            ->assertStatus(200)
            ->assertJsonPath('data.title', 'Post Publik');
    }

    #[Test]
    public function post_show_increments_views_count(): void
    {
        $post = Post::create([
            'title'       => 'View Count Test',
            'body'        => 'Body',
            'user_id'     => $this->user->id,
            'category_id' => $this->category->id,
            'views_count' => 0,
        ]);

        $this->getJson("/api/v1/posts/{$post->id}");

        $this->assertEquals(1, $post->fresh()->views_count);
    }

    #[Test]
    public function post_show_returns_404_for_invalid_id(): void
    {
        $this->getJson('/api/v1/posts/nonexistent-id')
            ->assertStatus(404);
    }

    #[Test]
    public function public_can_view_posts_by_user(): void
    {
        Post::create([
            'title'       => 'User Post',
            'body'        => 'Body',
            'user_id'     => $this->user->id,
            'category_id' => $this->category->id,
        ]);

        $this->getJson("/api/v1/users/{$this->user->id}/posts")
            ->assertStatus(200)
            ->assertJsonStructure(['success', 'data']);
    }

    // ─── STORE ──────────────────────────────────────────────

    #[Test]
    public function authenticated_user_can_create_post(): void
    {
        $token = $this->user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/v1/posts', [
                'title'       => 'Post Baru',
                'body'        => 'Ini isi postingan baru saya',
                'category_id' => $this->category->id,
            ])
            ->assertStatus(201)
            ->assertJsonPath('data.title', 'Post Baru');

        $this->assertDatabaseHas('posts', ['title' => 'Post Baru']);
    }

    #[Test]
    public function authenticated_user_can_create_post_with_tags(): void
    {
        $token = $this->user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/v1/posts', [
                'title'       => 'Post Dengan Tag',
                'body'        => 'Isi post',
                'category_id' => $this->category->id,
                'tags'        => ['laravel', 'php'],
            ])
            ->assertStatus(201);

        $this->assertDatabaseHas('tags', ['name' => 'laravel']);
        $this->assertDatabaseHas('tags', ['name' => 'php']);
    }

    #[Test]
    public function guest_cannot_create_post(): void
    {
        $this->postJson('/api/v1/posts', [
            'title'       => 'Guest Post',
            'body'        => 'Body',
            'category_id' => $this->category->id,
        ])->assertStatus(401);
    }

    #[Test]
    public function create_post_fails_without_required_fields(): void
    {
        $token = $this->user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/v1/posts', [])
            ->assertStatus(422);
    }

    // ─── UPDATE ─────────────────────────────────────────────

    #[Test]
    public function post_owner_can_update_own_post(): void
    {
        $token = $this->user->createToken('test')->plainTextToken;
        $post  = Post::create([
            'title'       => 'Original Title',
            'body'        => 'Original body',
            'user_id'     => $this->user->id,
            'category_id' => $this->category->id,
            'edit_count'  => 0,
        ]);

        $this->withHeader('Authorization', "Bearer $token")
            ->putJson("/api/v1/posts/{$post->id}", ['title' => 'Updated Title'])
            ->assertStatus(200)
            ->assertJsonPath('data.title', 'Updated Title');
    }

    #[Test]
    public function other_user_cannot_update_post(): void
    {
        $token = $this->otherUser->createToken('test')->plainTextToken;
        $post  = Post::create([
            'title'       => 'Someone Post',
            'body'        => 'Body',
            'user_id'     => $this->user->id,
            'category_id' => $this->category->id,
        ]);

        $this->withHeader('Authorization', "Bearer $token")
            ->putJson("/api/v1/posts/{$post->id}", ['title' => 'Hacked Title'])
            ->assertStatus(403);
    }

    #[Test]
    public function post_update_blocked_after_3_edits(): void
    {
        $token = $this->user->createToken('test')->plainTextToken;
        $post  = Post::create([
            'title'       => 'Max Edit Post',
            'body'        => 'Body',
            'user_id'     => $this->user->id,
            'category_id' => $this->category->id,
            'edit_count'  => 3,
        ]);

        $this->withHeader('Authorization', "Bearer $token")
            ->putJson("/api/v1/posts/{$post->id}", ['title' => 'Edit ke 4'])
            ->assertStatus(403);
    }

    // ─── DELETE ─────────────────────────────────────────────

    #[Test]
    public function post_owner_can_delete_own_post(): void
    {
        $token = $this->user->createToken('test')->plainTextToken;
        $post  = Post::create([
            'title'       => 'To Delete',
            'body'        => 'Body',
            'user_id'     => $this->user->id,
            'category_id' => $this->category->id,
        ]);

        $this->withHeader('Authorization', "Bearer $token")
            ->deleteJson("/api/v1/posts/{$post->id}")
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertSoftDeleted('posts', ['id' => $post->id]);
    }

    #[Test]
    public function admin_can_delete_any_post(): void
    {
        $token = $this->admin->createToken('test')->plainTextToken;
        $post  = Post::create([
            'title'       => 'Admin Delete Test',
            'body'        => 'Body',
            'user_id'     => $this->user->id,
            'category_id' => $this->category->id,
        ]);

        $this->withHeader('Authorization', "Bearer $token")
            ->deleteJson("/api/v1/posts/{$post->id}")
            ->assertStatus(200);

        $this->assertSoftDeleted('posts', ['id' => $post->id]);
    }

    #[Test]
    public function other_user_cannot_delete_post(): void
    {
        $token = $this->otherUser->createToken('test')->plainTextToken;
        $post  = Post::create([
            'title'       => 'Protected Post',
            'body'        => 'Body',
            'user_id'     => $this->user->id,
            'category_id' => $this->category->id,
        ]);

        $this->withHeader('Authorization', "Bearer $token")
            ->deleteJson("/api/v1/posts/{$post->id}")
            ->assertStatus(403);
    }
}
