<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function listUsersWithRoles()
    {
        $users = User::with('roles')->get();
        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    public function assignRole(Request $request, $userId)
    {
        $user = User::findOrFail($userId);
        $role = Role::where('name', $request->role_name)->firstOrFail();

        if (!$user->roles()->where('role_id', $role->id)->exists()) {
            $user->roles()->attach($role->id);
        }

        return response()->json([
            'success' => true,
            'message' => 'Role assigned successfully'
        ]);
    }

    public function removeRole(Request $request, $userId)
    {
        $user = User::findOrFail($userId);
        $role = Role::where('name', $request->role_name)->firstOrFail();

        $user->roles()->detach($role->id);

        return response()->json([
            'success' => true,
            'message' => 'Role removed successfully'
        ]);
    }
}
