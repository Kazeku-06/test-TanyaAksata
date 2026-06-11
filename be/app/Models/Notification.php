<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'user_id', 'actor_id', 'type', 'target_id', 'target_type', 'message', 'is_read'
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    public function target()
    {
        return $this->morphTo();
    }

    /**
     * Helper untuk mengirim notifikasi
     */
    public static function send($userId, $actorId, $type, $targetType, $targetId, $message)
    {
        return self::create([
            'user_id' => $userId,
            'actor_id' => $actorId,
            'type' => $type,
            'target_type' => $targetType,
            'target_id' => $targetId,
            'message' => $message,
            'is_read' => false,
        ]);
    }
}
