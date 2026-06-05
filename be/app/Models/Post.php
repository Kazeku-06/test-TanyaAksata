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
        'title',
        'body',
        'user_id',
        'category_id',
        'accepted_answer_id',
        'votes_count',
        'likes_count',
        'comments_count',
        'views_count',
        'is_solved',
    ];

    protected $casts = [
        'is_solved' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'post_tags', 'post_id', 'tag_id')
                    ->withTimestamps();
    }

    public function comments()
    {
        return $this->hasMany(Comment::class, 'post_id');
    }

    public function acceptedAnswer()
    {
        return $this->belongsTo(Comment::class, 'accepted_answer_id');
    }

    public function bookmarks()
    {
        return $this->hasMany(Bookmark::class, 'post_id');
    }

    public function editHistories()
    {
        return $this->hasMany(PostEditHistory::class, 'post_id');
    }

    public function votes()
    {
        return $this->morphMany(Vote::class, 'target');
    }

    public function likes()
    {
        return $this->morphMany(Like::class, 'target');
    }

    public function reports()
    {
        return $this->morphMany(Report::class, 'target');
    }
}
