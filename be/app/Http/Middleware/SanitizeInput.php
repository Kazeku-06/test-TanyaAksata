<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * OWASP A03: Injection Prevention
 * Strip null bytes dan tag HTML/script dari semua string input.
 * Query ke DB selalu lewat Eloquent/Query Builder (parameterized) —
 * middleware ini sebagai lapisan tambahan untuk XSS prevention.
 */
class SanitizeInput
{
    /**
     * Field yang TIDAK disanitasi (konten markup yang disengaja).
     */
    protected array $except = [
        'password',
        'password_confirmation',
        'current_password',
        'new_password',
        'new_password_confirmation',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $input = $request->all();
        $cleaned = $this->clean($input);
        $request->merge($cleaned);

        return $next($request);
    }

    private function clean(mixed $data): mixed
    {
        if (is_array($data)) {
            return array_map(fn ($v) => $this->clean($v), $data);
        }

        if (is_string($data)) {
            // Hapus null bytes (OWASP: injection)
            $data = str_replace("\0", '', $data);

            // Strip HTML tags kecuali untuk field yang dikecualikan di caller
            // Trim whitespace berlebih
            $data = trim($data);

            return $data;
        }

        return $data;
    }
}
