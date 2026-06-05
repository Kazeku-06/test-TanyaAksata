<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class CommentEditHistory extends Model
{
    use HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'comment_edit_history';

    protected $fillable = [
        'comment_id', 'edited_by', 'body_before', 'body_after', 'edit_summary'
    ];

    public function comment()
    {
        return $this->belongsTo(Comment::class);
    }

    public function editor()
    {
        return $this->belongsTo(User::class, 'edited_by');
    }
}
