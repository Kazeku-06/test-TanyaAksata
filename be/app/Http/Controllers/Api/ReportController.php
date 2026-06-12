<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\Post;
use App\Models\Comment;
use App\Models\User;
use App\Models\ModerationLog;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReportController extends Controller
{
    /**
     * User membuat laporan baru (post, comment, atau user)
     * POST /api/v1/reports
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $validator = Validator::make($request->all(), [
            'target_type' => 'required|string|in:post,comment,user',
            'target_id' => 'required|string',
            'reason' => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
        ]);
        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $modelClass = match ($request->target_type) {
            'post' => Post::class,
            'comment' => Comment::class,
            'user' => User::class,
            default => null,
        };

        if (!$modelClass) {
            return response()->json(['success' => false, 'message' => 'Invalid target type'], 400);
        }

        $target = $modelClass::find($request->target_id);
        if (!$target) {
            return response()->json(['success' => false, 'message' => 'Target not found'], 404);
        }

        $existing = Report::where('reporter_id', $user->id)
            ->where('target_type', $modelClass)
            ->where('target_id', $request->target_id)
            ->whereIn('status', ['pending', 'resolved'])
            ->first();
        if ($existing) {
            return response()->json(['success' => false, 'message' => 'Anda sudah melaporkan konten ini sebelumnya'], 409);
        }

        $report = Report::create([
            'reporter_id' => $user->id,
            'target_type' => $modelClass,
            'target_id' => $request->target_id,
            'reason' => $request->reason,
            'description' => $request->description,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Laporan berhasil dikirim, akan ditinjau oleh moderator.',
            'data' => $report->load('reporter')
        ], 201);
    }

    // ========== ADMIN / MODERATOR ==========

    public function index(Request $request)
    {
        $status = $request->get('status');
        $query = Report::with([
            'reporter',
            'resolver',
            'target' => function ($morphTo) {
                $morphTo->withTrashed()->morphWith([
                    Post::class => ['user'],
                    Comment::class => ['user', 'post'],
                ]);
            }
        ]);
        if ($status && in_array($status, ['pending', 'resolved', 'rejected'])) {
            $query->where('status', $status);
        }
        $reports = $query->orderBy('created_at', 'desc')->paginate(15);
        return response()->json(['success' => true, 'data' => $reports]);
    }

    public function show($id)
    {
        $report = Report::with([
            'reporter',
            'resolver',
            'target' => function ($morphTo) {
                $morphTo->withTrashed()->morphWith([
                    Post::class => ['user'],
                    Comment::class => ['user', 'post'],
                ]);
            }
        ])->find($id);
        if (!$report) {
            return response()->json(['success' => false, 'message' => 'Report not found'], 404);
        }
        return response()->json(['success' => true, 'data' => $report]);
    }

    /**
     * Menyelesaikan laporan dengan tindakan
     * PUT /api/v1/admin/reports/{id}/resolve
     */
    public function resolve(Request $request, $id)
    {
        $moderator = $request->user();
        $report = Report::with(['target' => function ($morphTo) {
            $morphTo->withTrashed();
        }])->find($id);
        if (!$report) {
            return response()->json(['success' => false, 'message' => 'Report not found'], 404);
        }
        if ($report->status !== 'pending') {
            return response()->json(['success' => false, 'message' => 'Laporan sudah diproses sebelumnya'], 400);
        }

        $validator = Validator::make($request->all(), [
            'action' => 'required|in:resolve,reject',
            'action_taken' => 'required_if:action,resolve|in:delete_content,ban_user,warn,ignore',
            'resolution_note' => 'nullable|string|max:255',
        ]);
        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        if ($request->action === 'reject') {
            $report->status = 'rejected';
            $report->resolved_by = $moderator->id;
            $report->resolution_note = $request->resolution_note;
            $report->action_taken = 'ignore';
            $report->save();

            // Catat ke moderation_logs
            ModerationLog::create([
                'moderator_id' => $moderator->id,
                'target_user_id' => null, // tidak ada target user spesifik
                'action' => 'report_rejected',
                'target_type' => Report::class,
                'target_id' => $report->id,
                'reason' => $request->resolution_note ?? 'Laporan ditolak',
            ]);

            return response()->json(['success' => true, 'message' => 'Laporan ditolak']);
        }

        // Proses resolve dengan tindakan
        $target = $report->target;
        if (!$target) {
            return response()->json(['success' => false, 'message' => 'Target tidak ditemukan'], 404);
        }

        $actionTaken = $request->action_taken;
        $report->status = 'resolved';
        $report->resolved_by = $moderator->id;
        $report->resolution_note = $request->resolution_note;
        $report->action_taken = $actionTaken;
        $report->save();

        // Variabel untuk mencatat ke moderation_logs
        $logAction = '';
        $logTargetType = null;
        $logTargetId = null;
        $logTargetUserId = null;
        $logReason = $request->resolution_note ?? $report->reason;

        // Eksekusi tindakan
        switch ($actionTaken) {
            case 'delete_content':
                if ($report->target_type === Post::class) {
                    $target->delete();
                    $logAction = 'delete_post';
                    $logTargetType = Post::class;
                    $logTargetId = $target->id;
                    $logTargetUserId = $target->user_id;
                } elseif ($report->target_type === Comment::class) {
                    $target->delete();
                    $logAction = 'delete_comment';
                    $logTargetType = Comment::class;
                    $logTargetId = $target->id;
                    $logTargetUserId = $target->user_id;
                } else {
                    return response()->json(['success' => false, 'message' => 'Tindakan delete hanya untuk post/comment'], 400);
                }
                break;

            case 'ban_user':
                if ($report->target_type === User::class) {
                    $target->is_banned = true;
                    $target->banned_until = now()->addDays(30);
                    $target->save();
                    $logAction = 'ban_user';
                    $logTargetUserId = $target->id;
                    // notifikasi
                    Notification::send($target->id, $moderator->id, 'ban', null, null, "Akun Anda dibanned selama 30 hari karena melanggar aturan.");
                } else {
                    return response()->json(['success' => false, 'message' => 'Tindakan ban hanya untuk user'], 400);
                }
                break;

            case 'warn':
                if ($report->target_type === User::class) {
                    $logTargetUserId = $target->id;
                    Notification::send($target->id, $moderator->id, 'warning', null, null, "Anda menerima peringatan karena laporan: {$report->reason}");
                    $logAction = 'warn_user';
                } else {
                    $owner = $target->user ?? null;
                    if ($owner) {
                        Notification::send($owner->id, $moderator->id, 'warning', $report->target_type, $report->target_id, "Konten Anda dilaporkan dan mendapatkan peringatan.");
                        $logTargetUserId = $owner->id;
                        $logAction = 'warn_content_owner';
                    }
                }
                break;

            case 'ignore':
                $logAction = 'report_ignored';
                break;
        }

        // Catat ke moderation_logs
        ModerationLog::create([
            'moderator_id' => $moderator->id,
            'target_user_id' => $logTargetUserId,
            'action' => $logAction,
            'target_type' => $logTargetType,
            'target_id' => $logTargetId,
            'reason' => $logReason,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Laporan diproses dengan tindakan: ' . $actionTaken,
            'data' => $report
        ]);
    }
}
