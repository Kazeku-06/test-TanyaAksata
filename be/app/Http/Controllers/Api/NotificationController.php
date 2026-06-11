<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    // Mendapatkan semua notifikasi user yang login
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);
        return response()->json(['success' => true, 'data' => $notifications]);
    }

    // Menandai notifikasi sebagai sudah dibaca
    public function markAsRead(Request $request, $id)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $notification = Notification::find($id);
        if (!$notification) {
            return response()->json(['success' => false, 'message' => 'Notifikasi tidak ditemukan'], 404);
        }

        if ($notification->user_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        $notification->is_read = true;
        $notification->save();
        return response()->json(['success' => true, 'message' => 'Notifikasi ditandai dibaca']);
    }

    // Menandai semua notifikasi sebagai sudah dibaca
    public function markAllAsRead(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        Notification::where('user_id', $user->id)->update(['is_read' => true]);
        return response()->json(['success' => true, 'message' => 'Semua notifikasi ditandai dibaca']);
    }
}
