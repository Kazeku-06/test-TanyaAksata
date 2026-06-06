<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
        'bio',
        'location',
        'website',
        'reputation',
        'is_banned',
        'banned_until',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_banned' => 'boolean',
        'banned_until' => 'datetime',
    ];

    // ========== RELASI ==========

    public function posts()
    {
        return $this->hasMany(Post::class, 'user_id');
    }

    public function comments()
    {
        return $this->hasMany(Comment::class, 'user_id');
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'user_roles', 'user_id', 'role_id')
                    ->withTimestamps();
    }

    public function bookmarks()
    {
        return $this->hasMany(Bookmark::class, 'user_id');
    }

    public function following()
    {
        return $this->belongsToMany(User::class, 'follows', 'follower_id', 'following_id')
                    ->withTimestamps()
                    ->select('users.id', 'users.name', 'users.email', 'users.avatar');
    }

    public function followers()
    {
        return $this->belongsToMany(User::class, 'follows', 'following_id', 'follower_id')
                    ->withTimestamps()
                    ->select('users.id', 'users.name', 'users.email', 'users.avatar');
    }

    public function votes()
    {
        return $this->hasMany(Vote::class);
    }

    public function likes()
    {
        return $this->hasMany(Like::class, 'user_id');
    }

    public function pointsLogs()
    {
        return $this->hasMany(PointsLog::class, 'user_id');
    }

    public function badges()
    {
        return $this->belongsToMany(Badge::class, 'user_badges', 'user_id', 'badge_id')
                    ->withTimestamps();
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class, 'user_id');
    }

    public function reports()
    {
        return $this->hasMany(Report::class, 'reporter_id');
    }

    public function resolvedReports()
    {
        return $this->hasMany(Report::class, 'resolved_by');
    }

    public function moderationLogsAsModerator()
    {
        return $this->hasMany(ModerationLog::class, 'moderator_id');
    }

    public function moderationLogsAsTarget()
    {
        return $this->hasMany(ModerationLog::class, 'target_user_id');
    }

    // ========== HELPER METHODS ==========

    public function hasRole($roleName)
    {
        return $this->roles->contains('name', $roleName);
    }

    // Tambah reputasi dan catat log
    public function addReputation($points, $reason, $relatedType = null, $relatedId = null)
    {
        $this->reputation += $points;
        $this->save();

        \App\Models\PointsLog::create([
            'user_id' => $this->id,
            'points' => $points,
            'reason' => $reason,
            'related_type' => $relatedType,
            'related_id' => $relatedId,
        ]);
    }

    // Accessor untuk level reputasi (opsional)
    public function getReputationLevelAttribute()
    {
        if ($this->reputation < 100) return 'Newbie';
        if ($this->reputation < 500) return 'Regular';
        if ($this->reputation < 2000) return 'Pro';
        return 'Expert';
    }
}
