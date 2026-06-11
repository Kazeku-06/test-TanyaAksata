<?php

namespace Tests\Feature\Api\V1;

use App\Models\Follow;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class FollowTest extends TestCase
{
    use RefreshDatabase;

    protected User $userA;
    protected User $userB;

    protected function setUp(): void
    {
        parent::setUp();

        $userRole = Role::create(['name' => 'user', 'display_name' => 'User']);

        $this->userA = User::factory()->create();
        $this->userA->roles()->attach($userRole->id);

        $this->userB = User::factory()->create();
        $this->userB->roles()->attach($userRole->id);
    }

    // ─── FOLLOW ─────────────────────────────────────────────

    #[Test]
    public function user_can_follow_another_user(): void
    {
        $token = $this->userA->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->postJson("/api/v1/users/{$this->userB->id}/follow")
            ->assertStatus(201)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('follows', [
            'follower_id'  => $this->userA->id,
            'following_id' => $this->userB->id,
        ]);
    }

    #[Test]
    public function user_cannot_follow_themselves(): void
    {
        $token = $this->userA->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->postJson("/api/v1/users/{$this->userA->id}/follow")
            ->assertStatus(400)
            ->assertJsonPath('success', false);
    }

    #[Test]
    public function follow_returns_409_if_already_following(): void
    {
        Follow::create([
            'follower_id'  => $this->userA->id,
            'following_id' => $this->userB->id,
        ]);

        $token = $this->userA->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->postJson("/api/v1/users/{$this->userB->id}/follow")
            ->assertStatus(409);
    }

    #[Test]
    public function follow_returns_404_for_invalid_user(): void
    {
        $token = $this->userA->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/v1/users/invalid-user-id/follow')
            ->assertStatus(404);
    }

    #[Test]
    public function guest_cannot_follow_user(): void
    {
        $this->postJson("/api/v1/users/{$this->userB->id}/follow")
            ->assertStatus(401);
    }

    // ─── UNFOLLOW ────────────────────────────────────────────

    #[Test]
    public function user_can_unfollow_a_followed_user(): void
    {
        Follow::create([
            'follower_id'  => $this->userA->id,
            'following_id' => $this->userB->id,
        ]);

        $token = $this->userA->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->deleteJson("/api/v1/users/{$this->userB->id}/unfollow")
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('follows', [
            'follower_id'  => $this->userA->id,
            'following_id' => $this->userB->id,
        ]);
    }

    #[Test]
    public function unfollow_returns_409_if_not_following(): void
    {
        $token = $this->userA->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->deleteJson("/api/v1/users/{$this->userB->id}/unfollow")
            ->assertStatus(409);
    }

    // ─── IS FOLLOWING ────────────────────────────────────────

    #[Test]
    public function user_can_check_if_following_another_user(): void
    {
        Follow::create([
            'follower_id'  => $this->userA->id,
            'following_id' => $this->userB->id,
        ]);

        $token = $this->userA->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->getJson("/api/v1/users/{$this->userB->id}/is-following")
            ->assertStatus(200)
            ->assertJsonPath('data.is_following', true);
    }

    #[Test]
    public function is_following_returns_false_when_not_following(): void
    {
        $token = $this->userA->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->getJson("/api/v1/users/{$this->userB->id}/is-following")
            ->assertStatus(200)
            ->assertJsonPath('data.is_following', false);
    }

    // ─── MY FOLLOWING / FOLLOWERS ────────────────────────────

    #[Test]
    public function user_can_get_list_of_who_they_follow(): void
    {
        Follow::create([
            'follower_id'  => $this->userA->id,
            'following_id' => $this->userB->id,
        ]);

        $token = $this->userA->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/v1/users/me/following')
            ->assertStatus(200)
            ->assertJsonStructure(['success', 'data']);
    }

    #[Test]
    public function user_can_get_list_of_their_followers(): void
    {
        Follow::create([
            'follower_id'  => $this->userB->id,
            'following_id' => $this->userA->id,
        ]);

        $token = $this->userA->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/v1/users/me/followers')
            ->assertStatus(200)
            ->assertJsonStructure(['success', 'data']);
    }
}
