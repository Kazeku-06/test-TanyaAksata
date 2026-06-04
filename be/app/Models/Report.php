<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'reporter_id',
        'target_type',
        'target_id',
        'reason',
        'description',
        'status',
        'resolved_by',
        'resolution_note',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    // Pelapor
    public function reporter()
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    // Target yang dilaporkan (polymorphic: post/comment)
    public function target()
    {
        return $this->morphTo();
    }

    // Admin/moderator yang menyelesaikan
    public function resolver()
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }
}
