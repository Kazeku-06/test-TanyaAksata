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

class CommentTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected User $admin;
    protected User $otherUser;
    protected Post $post;

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

        $category   = Category::create(['name' => 'Tech', 'slug' => 'tech']);
        $this->post = Post::create([
            'title'          => 'Post For Comments',
            'body'           => 'Body',
            'user_id'        => $this->user->id,
            'category_id'    => $category->id,
            'comments_count' => 0,
        ]);
    }

    // ─── INDEX ──────────────────────────────────────────────

    #[Test]
    public function public_can_list_comments_on_post(): void
    {
        Comment::create([
            'post_id'    => $this->post->id,
            'user_id'    => $this->otherUser->id,
            'body'       => 'Komentar publik',
            'edit_count' => 0,
        ]);

        $this->getJson("/api/v1/posts/{$this->post->id}/comments")
            ->assertStatus(200)
            ->assertJsonStructure(['success', 'data']);
    }

    #[Test]
    public function comment_index_returns_404_for_invalid_post(): void
    {
        $this->getJson('/api/v1/posts/nonexistent-post/comments')
            ->assertStatus(404);
    }

    // ─── STORE ──────────────────────────────────────────────

    #[Test]
    public function authenticated_user_can_comment_on_post(): void
    {
        $token = $this->otherUser->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/v1/comments', [
                'post_id' => $this->post->id,
                'body'    => 'Komentar bagus sekali!',
            ])
            ->assertStatus(201)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('comments', ['body' => 'Komentar bagus sekali!']);
    }

    #[Test]
    public function user_can_reply_to_comment(): void
    {
        $parent = Comment::create([
            'post_id'    => $this->post->id,
            'user_id'    => $this->otherUser->id,
            'body'       => 'Komentar utama',
            'edit_count' => 0,
        ]);

        $token = $this->user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/v1/comments', [
                'post_id'   => $this->post->id,
                'parent_id' => $parent->id,
                'body'      => 'Balasan komentar',
            ])
            ->assertStatus(201)
            ->assertJsonPath('data.parent_id', $parent->id);
    }

    #[Test]
    public function guest_cannot_comment(): void
    {
        $this->postJson('/api/v1/comments', [
            'post_id' => $this->post->id,
            'body'    => 'Komentar tamu',
        ])->assertStatus(401);
    }

    #[Test]
    public function post_owner_can_comment_up_to_4_times(): void
    {
        $token = $this->user->createToken('test')->plainTextToken;

        for ($i = 1; $i <= 4; $i++) {
            $this->withHeader('Authorization', "Bearer $token")
                ->postJson('/api/v1/comments', [
                    'post_id' => $this->post->id,
                    'body'    => "Komentar ke-{$i}",
                ])->assertStatus(201);
        }
    }

    #[Test]
    public function post_owner_blocked_after_4_comments_on_own_post(): void
    {
        // Buat 4 komentar langsung ke DB
        for ($i = 1; $i <= 4; $i++) {
            Comment::create([
                'post_id'    => $this->post->id,
                'user_id'    => $this->user->id,
                'body'       => "Komentar {$i}",
                'edit_count' => 0,
            ]);
        }

        $token = $this->user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/v1/comments', [
                'post_id' => $this->post->id,
                'body'    => 'Komentar ke-5 seharusnya ditolak',
            ])
            ->assertStatus(403);
    }

    // ─── UPDATE ─────────────────────────────────────────────

    #[Test]
    public function comment_owner_can_edit_comment(): void
    {
        $token   = $this->otherUser->createToken('test')->plainTextToken;
        $comment = Comment::create([
            'post_id'    => $this->post->id,
            'user_id'    => $this->otherUser->id,
            'body'       => 'Body asli',
            'edit_count' => 0,
        ]);

        $this->withHeader('Authorization', "Bearer $token")
            ->putJson("/api/v1/comments/{$comment->id}", [
                'body' => 'Body yang sudah diedit',
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.body', 'Body yang sudah diedit');
    }

    #[Test]
    public function comment_edit_blocked_after_1_edit(): void
    {
        $token   = $this->otherUser->createToken('test')->plainTextToken;
        $comment = Comment::create([
            'post_id'    => $this->post->id,
            'user_id'    => $this->otherUser->id,
            'body'       => 'Sudah pernah diedit',
            'edit_count' => 1,
        ]);

        $this->withHeader('Authorization', "Bearer $token")
            ->putJson("/api/v1/comments/{$comment->id}", [
                'body' => 'Mau edit lagi tapi ditolak',
            ])
            ->assertStatus(403);
    }

    #[Test]
    public function other_user_cannot_edit_comment(): void
    {
        $token   = $this->admin->createToken('test')->plainTextToken;
        $comment = Comment::create([
            'post_id'    => $this->post->id,
            'user_id'    => $this->otherUser->id,
            'body'       => 'Milik orang lain',
            'edit_count' => 0,
        ]);

        $this->withHeader('Authorization', "Bearer $token")
            ->putJson("/api/v1/comments/{$comment->id}", [
                'body' => 'Admin tidak bisa edit komentar orang',
            ])
            ->assertStatus(403);
    }

    // ─── DELETE ─────────────────────────────────────────────

    #[Test]
    public function comment_owner_can_delete_own_comment(): void
    {
        $token   = $this->otherUser->createToken('test')->plainTextToken;
        $comment = Comment::create([
            'post_id'    => $this->post->id,
            'user_id'    => $this->otherUser->id,
            'body'       => 'Mau dihapus',
            'edit_count' => 0,
        ]);

        $this->withHeader('Authorization', "Bearer $token")
            ->deleteJson("/api/v1/comments/{$comment->id}")
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertSoftDeleted('comments', ['id' => $comment->id]);
    }

    #[Test]
    public function admin_can_delete_any_comment(): void
    {
        $token   = $this->admin->createToken('test')->plainTextToken;
        $comment = Comment::create([
            'post_id'    => $this->post->id,
            'user_id'    => $this->otherUser->id,
            'body'       => 'Komentar yang dihapus admin',
            'edit_count' => 0,
        ]);

        $this->withHeader('Authorization', "Bearer $token")
            ->deleteJson("/api/v1/comments/{$comment->id}")
            ->assertStatus(200);

        $this->assertSoftDeleted('comments', ['id' => $comment->id]);
    }

    #[Test]
    public function other_user_cannot_delete_comment(): void
    {
        $token   = $this->otherUser->createToken('test')->plainTextToken;
        $comment = Comment::create([
            'post_id'    => $this->post->id,
            'user_id'    => $this->user->id,
            'body'       => 'Bukan milik saya',
            'edit_count' => 0,
        ]);

        $this->withHeader('Authorization', "Bearer $token")
            ->deleteJson("/api/v1/comments/{$comment->id}")
            ->assertStatus(403);
    }
}
