<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory, HasUuids;

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

    // Penulis post
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Kategori post
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    // Tag (many-to-many)
    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'post_tags', 'post_id', 'tag_id')
                    ->withTimestamps();
    }

    // Komentar pada post
    public function comments()
    {
        return $this->hasMany(Comment::class, 'post_id');
    }

    // Jawaban yang diterima (accepted answer)
    public function acceptedAnswer()
    {
        return $this->belongsTo(Comment::class, 'accepted_answer_id');
    }

    // Bookmark pada post
    public function bookmarks()
    {
        return $this->hasMany(Bookmark::class, 'post_id');
    }

    // Riwayat edit post
    public function editHistories()
    {
        return $this->hasMany(PostEditHistory::class, 'post_id');
    }

    // Polymorphic: vote
    public function votes()
    {
        return $this->morphMany(Vote::class, 'target');
    }

    // Polymorphic: like
    public function likes()
    {
        return $this->morphMany(Like::class, 'target');
    }

    // Polymorphic: report
    public function reports()
    {
        return $this->morphMany(Report::class, 'target');
    }
}
