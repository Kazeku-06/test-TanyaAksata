<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Badge;
use App\Models\UserBadge;
use App\Models\Notification;

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

    protected $appends = ['reputation_level'];

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

         $this->checkAndAwardBadges();
    }



    // Accessor untuk level reputasi (opsional)
    public function getReputationLevelAttribute()
    {
        if ($this->reputation < 100) return 'Newbie';
        if ($this->reputation < 500) return 'Regular';
        if ($this->reputation < 2000) return 'Pro';
        return 'Expert';
    }

    public function checkAndAwardBadges()
    {
        $badgesToAward = [];

        // Hitung stat user
        $postCount = $this->posts()->count();
        $commentCount = $this->comments()->count();
        $acceptedCount = $this->comments()->where('is_accepted', true)->count();

        $badges = Badge::all();
        foreach ($badges as $badge) {
            // Cek apakah sudah punya
            if ($this->badges->contains($badge->id)) {
                continue;
            }

            $earned = false;
            switch ($badge->achievement_type) {
                case 'points':
                    if ($this->reputation >= $badge->threshold) $earned = true;
                    break;
                case 'post_count':
                    if ($postCount >= $badge->threshold) $earned = true;
                    break;
                case 'comment_count':
                    if ($commentCount >= $badge->threshold) $earned = true;
                    break;
                case 'accepted_count':
                    if ($acceptedCount >= $badge->threshold) $earned = true;
                    break;
            }

            if ($earned) {
                $badgesToAward[] = $badge;
            }
        }

        foreach ($badgesToAward as $badge) {
            UserBadge::create([
                'user_id' => $this->id,
                'badge_id' => $badge->id
            ]);
            // Notifikasi badge baru
            Notification::send($this->id, null, 'badge', Badge::class, $badge->id, "Selamat! Anda mendapatkan badge '{$badge->name}'.");
        }

        // Reload badges relationship
        $this->load('badges');
    }

    public function addWarning($moderatorId, $reason)
    {
        $this->warning_count += 1;
        $this->save();

        ModerationLog::create([
            'moderator_id' => $moderatorId,
            'target_user_id' => $this->id,
            'action' => 'warn_user',
            'target_type' => null,
            'target_id' => null,
            'reason' => $reason,
        ]);

        Notification::send($this->id, $moderatorId, 'warning', null, null, "Anda menerima peringatan ke-{$this->warning_count}. Alasan: {$reason}");

        // Auto ban jika mencapai threshold (misal 3)
        if ($this->warning_count >= 3) {
            $this->is_banned = true;
            $this->banned_until = now()->addDays(30);
            $this->save();

            ModerationLog::create([
                'moderator_id' => $moderatorId,
                'target_user_id' => $this->id,
                'action' => 'auto_ban_after_warnings',
                'target_type' => null,
                'target_id' => null,
                'reason' => "Mencapai {$this->warning_count} peringatan",
            ]);

            Notification::send($this->id, $moderatorId, 'ban', null, null, "Akun Anda dibanned otomatis setelah mencapai 3 peringatan.");
        }
    }
}
