<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PointsLog extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'points_log';

    protected $fillable = [
        'user_id',
        'points',
        'reason',
        'related_id',
        'related_type',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Relasi polymorphic ke entitas terkait (post/comment)
    public function related()
    {
        return $this->morphTo();
    }
}
