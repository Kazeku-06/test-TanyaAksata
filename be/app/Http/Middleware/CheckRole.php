<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // Ambil user yang sedang login
        $user = $request->user();

        // Jika user belum login, tolak akses
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.'
            ], 401);
        }

        // Ambil daftar nama role yang dimiliki user
        $userRoles = $user->roles->pluck('name')->toArray();

        // Cek apakah user memiliki setidaknya satu role yang diizinkan
        foreach ($roles as $role) {
            if (in_array($role, $userRoles)) {
                return $next($request);
            }
        }

        // Jika tidak ada role yang cocok, tolak akses
        return response()->json([
            'success' => false,
            'message' => 'Forbidden. Anda tidak memiliki akses ke resource ini.'
        ], 403);
    }
}
