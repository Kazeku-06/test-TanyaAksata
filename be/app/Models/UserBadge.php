<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserBadge extends Model
{
    use HasFactory;

    // Tabel ini menggunakan auto-increment id biasa (bukan UUID)
    // karena kita buat dengan $table->id() di migration.
    protected $fillable = [
        'user_id',
        'badge_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function badge()
    {
        return $this->belongsTo(Badge::class, 'badge_id');
    }
}
