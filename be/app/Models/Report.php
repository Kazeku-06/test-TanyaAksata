<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasUuids;

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
        'action_taken',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    public function reporter()
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function resolver()
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    public function target()
    {
        return $this->morphTo();
    }

    // Scope untuk laporan pending
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}
