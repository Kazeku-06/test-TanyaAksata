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

    // Postingan yang dibuat user
    public function posts()
    {
        return $this->hasMany(Post::class, 'user_id');
    }

    // Komentar yang dibuat user
    public function comments()
    {
        return $this->hasMany(Comment::class, 'user_id');
    }

    // Role (many-to-many)
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'user_roles', 'user_id', 'role_id')
                    ->withTimestamps();
    }

    // Bookmark yang disimpan user
    public function bookmarks()
    {
        return $this->hasMany(Bookmark::class, 'user_id');
    }

    // User yang diikuti (following)
    public function following()
    {
    return $this->belongsToMany(User::class, 'follows', 'follower_id', 'following_id')
                ->withTimestamps()
                ->select('users.id', 'users.name', 'users.email', 'users.avatar');
    }


    // Pengikut user (followers)
    public function followers()
    {
    return $this->belongsToMany(User::class, 'follows', 'following_id', 'follower_id')
                ->withTimestamps()
                ->select('users.id', 'users.name', 'users.email', 'users.avatar');
    }
    // Vote yang diberikan user
    // Di dalam model User, tambahkan relasi:
    public function votes()
    {
        return $this->hasMany(Vote::class);
    }

    // Like yang diberikan user
    public function likes()
    {
        return $this->hasMany(Like::class, 'user_id');
    }

    // Log poin user
    public function pointsLogs()
    {
        return $this->hasMany(PointsLog::class, 'user_id');
    }

    // Badge yang dimiliki user
    public function badges()
    {
        return $this->belongsToMany(Badge::class, 'user_badges', 'user_id', 'badge_id')
                    ->withTimestamps();
    }

    // Notifikasi yang diterima user
    public function notifications()
    {
        return $this->hasMany(Notification::class, 'user_id');
    }

    // Laporan yang dibuat user (sebagai reporter)
    public function reports()
    {
        return $this->hasMany(Report::class, 'reporter_id');
    }

    // Laporan yang diselesaikan user (sebagai resolver)
    public function resolvedReports()
    {
        return $this->hasMany(Report::class, 'resolved_by');
    }

    // Log moderasi yang dilakukan user (sebagai moderator)
    public function moderationLogsAsModerator()
    {
        return $this->hasMany(ModerationLog::class, 'moderator_id');
    }

    // Log moderasi yang menarget user ini
    public function moderationLogsAsTarget()
    {
        return $this->hasMany(ModerationLog::class, 'target_user_id');
    }

    // Helper: cek apakah user punya role tertentu
    public function hasRole($roleName)
    {
        return $this->roles->contains('name', $roleName);
    }


}
