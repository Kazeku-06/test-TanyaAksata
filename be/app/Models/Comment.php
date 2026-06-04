<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'post_id',
        'user_id',
        'parent_id',
        'body',
        'votes_count',
        'likes_count',
        'is_accepted',
    ];

    protected $casts = [
        'is_accepted' => 'boolean',
    ];

    // Post tempat komentar berada
    public function post()
    {
        return $this->belongsTo(Post::class, 'post_id');
    }

    // Penulis komentar
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Komentar induk (untuk reply)
    public function parent()
    {
        return $this->belongsTo(Comment::class, 'parent_id');
    }

    // Balasan dari komentar ini
    public function replies()
    {
        return $this->hasMany(Comment::class, 'parent_id');
    }

    // Riwayat edit komentar
    public function editHistories()
    {
        return $this->hasMany(CommentEditHistory::class, 'comment_id');
    }

    // Polymorphic vote
    public function votes()
    {
        return $this->morphMany(Vote::class, 'target');
    }

    // Polymorphic like
    public function likes()
    {
        return $this->morphMany(Like::class, 'target');
    }

    // Polymorphic report
    public function reports()
    {
        return $this->morphMany(Report::class, 'target');
    }
}
