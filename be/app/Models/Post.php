<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Post extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'title', 'body', 'user_id', 'category_id', 'accepted_answer_id',
        'votes_count', 'likes_count', 'comments_count', 'views_count',
        'is_solved', 'edited_at', 'edit_count'
    ];

    protected $casts = [
        'is_solved' => 'boolean',
        'edited_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'post_tags', 'post_id', 'tag_id')
                    ->withTimestamps();
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function acceptedAnswer()
    {
        return $this->belongsTo(Comment::class, 'accepted_answer_id');
    }

    public function editHistories()
    {
        return $this->hasMany(PostEditHistory::class);
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
