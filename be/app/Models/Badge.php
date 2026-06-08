<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Badge extends Model
{
    use HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['name', 'slug', 'description', 'icon', 'required_points', 'achievement_type', 'threshold'];

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_badges', 'badge_id', 'user_id')->withTimestamps();
    }
}
