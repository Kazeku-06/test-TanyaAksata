<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'user_id',
        'actor_id',
        'type',
        'target_id',
        'target_type',
        'message',
        'is_read',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    // Penerima notifikasi
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Pembuat aksi (actor)
    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    // Target notifikasi (post/comment)
    public function target()
    {
        return $this->morphTo();
    }
}
