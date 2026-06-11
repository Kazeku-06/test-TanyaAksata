<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class PointsLog extends Model
{
    use HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'points_log';

    protected $fillable = ['user_id', 'points', 'reason', 'related_type', 'related_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
