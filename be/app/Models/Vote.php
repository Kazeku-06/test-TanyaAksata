<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vote extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'user_id',
        'target_type',
        'target_id',
        'vote', // 1 = upvote, -1 = downvote
    ];

    // Relasi polymorphic ke post atau comment
    public function target()
    {
        return $this->morphTo();
    }

    // User pemberi vote
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
