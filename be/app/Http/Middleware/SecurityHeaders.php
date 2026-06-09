<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * OWASP A05: Security Misconfiguration
 * Tambahkan security headers ke setiap response API.
 */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Cegah browser menebak content-type (OWASP: MIME sniffing)
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // Cegah clickjacking (OWASP A05)
        $response->headers->set('X-Frame-Options', 'DENY');

        // Batasi info referrer
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Cegah XSS di browser lama (OWASP A03)
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        // Hapus header yang membocorkan info server (OWASP A05)
        $response->headers->remove('X-Powered-By');
        $response->headers->remove('Server');

        // Permissions Policy — batasi akses ke fitur browser
        $response->headers->set(
            'Permissions-Policy',
            'camera=(), microphone=(), geolocation=(), payment=()'
        );

        // Content-Security-Policy untuk API (hanya JSON, bukan HTML)
        $response->headers->set(
            'Content-Security-Policy',
            "default-src 'none'; frame-ancestors 'none'"
        );

        return $response;
    }
}
