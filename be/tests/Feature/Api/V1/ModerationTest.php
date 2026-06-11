<?php

namespace Tests\Feature\Api\V1;

use App\Models\Category;
use App\Models\Comment;
use App\Models\Post;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ModerationTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $moderator;
    protected User $normalUser;
    protected Post $post;
    protected Comment $comment;

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

        $category    = Category::create(['name' => 'General', 'slug' => 'general']);
        $this->post  = Post::create([
            'title'          => 'Post Moderation Test',
            'body'           => 'Body',
            'user_id'        => $this->normalUser->id,
            'category_id'    => $category->id,
            'comments_count' => 0,
        ]);

        $this->comment = Comment::create([
            'post_id'    => $this->post->id,
            'user_id'    => $this->normalUser->id,
            'body'       => 'Komentar moderation test',
            'edit_count' => 0,
        ]);
    }

    // ─── DASHBOARD ──────────────────────────────────────────

    #[Test]
    public function admin_can_access_moderation_dashboard(): void
    {
        $token = $this->admin->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/v1/moderation/dashboard')
            ->assertStatus(200);
    }

    #[Test]
    public function moderator_can_access_moderation_dashboard(): void
    {
        $token = $this->moderator->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/v1/moderation/dashboard')
            ->assertStatus(200);
    }

    #[Test]
    public function normal_user_cannot_access_moderation_dashboard(): void
    {
        $token = $this->normalUser->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/v1/moderation/dashboard')
            ->assertStatus(403);
    }

    // ─── TRASHED POSTS ──────────────────────────────────────

    #[Test]
    public function admin_can_list_trashed_posts(): void
    {
        $this->post->delete();
        $token = $this->admin->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/v1/moderation/posts/trashed')
            ->assertStatus(200)
            ->assertJsonStructure(['success', 'data']);
    }

    #[Test]
    public function admin_can_view_trashed_post_detail(): void
    {
        $this->post->delete();
        $token = $this->admin->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->getJson("/api/v1/moderation/posts/{$this->post->id}/trashed")
            ->assertStatus(200)
            ->assertJsonPath('data.id', $this->post->id);
    }

    #[Test]
    public function normal_user_cannot_list_trashed_posts(): void
    {
        $this->post->delete();
        $token = $this->normalUser->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/v1/moderation/posts/trashed')
            ->assertStatus(403);
    }

    // ─── POST EDIT HISTORY ───────────────────────────────────

    #[Test]
    public function admin_can_view_post_edit_history(): void
    {
        $token = $this->admin->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->getJson("/api/v1/moderation/posts/{$this->post->id}/history")
            ->assertStatus(200)
            ->assertJsonStructure(['success', 'data']);
    }

    // ─── TRASHED COMMENTS ───────────────────────────────────

    #[Test]
    public function admin_can_list_trashed_comments(): void
    {
        $this->comment->delete();
        $token = $this->admin->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/v1/moderation/comments/trashed')
            ->assertStatus(200)
            ->assertJsonStructure(['success', 'data']);
    }

    #[Test]
    public function admin_can_view_trashed_comment_detail(): void
    {
        $this->comment->delete();
        $token = $this->admin->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->getJson("/api/v1/moderation/comments/{$this->comment->id}/trashed")
            ->assertStatus(200)
            ->assertJsonPath('data.id', $this->comment->id);
    }

    #[Test]
    public function moderator_can_view_comment_edit_history(): void
    {
        $token = $this->moderator->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->getJson("/api/v1/moderation/comments/{$this->comment->id}/history")
            ->assertStatus(200)
            ->assertJsonStructure(['success', 'data']);
    }

    #[Test]
    public function normal_user_cannot_access_trashed_comments(): void
    {
        $this->comment->delete();
        $token = $this->normalUser->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/v1/moderation/comments/trashed')
            ->assertStatus(403);
    }
}
