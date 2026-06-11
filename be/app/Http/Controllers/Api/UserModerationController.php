<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ModerationLog;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UserModerationController extends Controller
{
    // Ban user (admin/moderator)
    public function ban(Request $request, $userId)
    {
        $moderator = $request->user();
        if (!$moderator->hasRole('admin') && !$moderator->hasRole('moderator')) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        $user = User::find($userId);
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }
        if ($user->is_banned) {
            return response()->json(['success' => false, 'message' => 'User sudah dibanned'], 409);
        }

        $validator = Validator::make($request->all(), [
            'days' => 'nullable|integer|min:1|max:365',
            'reason' => 'nullable|string|max:255',
        ]);
        $days = $request->get('days', 30);
        $reason = $request->get('reason', 'Melanggar aturan komunitas');

        $user->is_banned = true;
        $user->banned_until = now()->addDays($days);
        $user->save();

        // Catat di moderation_logs
        ModerationLog::create([
            'moderator_id' => $moderator->id,
            'target_user_id' => $user->id,
            'action' => 'ban_user',
            'target_type' => null,
            'target_id' => null,
            'reason' => $reason,
        ]);

        // Kirim notifikasi ke user
        Notification::send(
            $user->id,
            $moderator->id,
            'ban',
            null,
            null,
            "Akun Anda dibanned selama {$days} hari. Alasan: {$reason}"
        );

        return response()->json([
            'success' => true,
            'message' => "User {$user->name} berhasil dibanned selama {$days} hari"
        ]);
    }

    // Unban user
    public function unban(Request $request, $userId)
    {
        $moderator = $request->user();
        if (!$moderator->hasRole('admin') && !$moderator->hasRole('moderator')) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        $user = User::find($userId);
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }
        if (!$user->is_banned) {
            return response()->json(['success' => false, 'message' => 'User tidak sedang dibanned'], 409);
        }

        $user->is_banned = false;
        $user->banned_until = null;
        $user->save();

        ModerationLog::create([
            'moderator_id' => $moderator->id,
            'target_user_id' => $user->id,
            'action' => 'unban_user',
            'target_type' => null,
            'target_id' => null,
            'reason' => $request->get('reason', 'Ban dicabut oleh moderator'),
        ]);

        Notification::send(
            $user->id,
            $moderator->id,
            'unban',
            null,
            null,
            "Akun Anda telah di-unban. Silakan login kembali."
        );

        return response()->json([
            'success' => true,
            'message' => "User {$user->name} berhasil di-unban"
        ]);
    }

    public function warn(Request $request, $userId)
    {
        $moderator = $request->user();
        if (!$moderator->hasRole('admin') && !$moderator->hasRole('moderator')) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        $user = User::find($userId);
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }
        if ($user->is_banned) {
            return response()->json(['success' => false, 'message' => 'User sudah dibanned, tidak bisa diberi warning'], 409);
        }

        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|max:255',
        ]);
        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user->addWarning($moderator->id, $request->reason);

        return response()->json([
            'success' => true,
            'message' => "User {$user->name} mendapat peringatan ke-{$user->warning_count}"
        ]);
    }
}
