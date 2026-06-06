<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Comment extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'post_id', 'user_id', 'parent_id', 'body',
        'votes_count', 'likes_count', 'is_accepted',
        'edited_at', 'edit_count'
    ];

    protected $casts = [
        'is_accepted' => 'boolean',
        'edited_at' => 'datetime',
    ];

    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function parent()
    {
        return $this->belongsTo(Comment::class, 'parent_id');
    }

    public function replies()
    {
        return $this->hasMany(Comment::class, 'parent_id');
    }

    public function editHistories()
    {
        return $this->hasMany(CommentEditHistory::class);
    }

    // Polymorphic relasi untuk vote
    public function votes()
    {
        return $this->morphMany(Vote::class, 'target');
    }

    // Accessor untuk is_edited
    public function getIsEditedAttribute()
    {
        return $this->edit_count > 0;
    }

    public function likes()
    {
        return $this->morphMany(Like::class, 'target');
    }
}
