<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->configureRateLimiting();
    }

    /**
     * Konfigurasi semua rate limiter aplikasi.
     *
     * OWASP A04: Insecure Design — batasi brute force & abuse.
     *
     * Key strategy:
     * - User login  → by user ID (limit per akun, bukan per IP)
     * - Guest/publik → by IP
     * - Auth routes  → by IP saja (belum ada user ID saat login)
     */
    protected function configureRateLimiting(): void
    {
        /**
         * Auth limiter — login & register.
         * By IP karena belum ada user ID saat request masuk.
         * 30 req/menit per IP — cukup longgar untuk dev, tetap cegah brute force.
         */
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(30)
                ->by('auth:' . $request->ip())
                ->response(function () {
                    return response()->json([
                        'success' => false,
                        'message' => 'Terlalu banyak percobaan. Silakan coba lagi dalam 1 menit.',
                    ], 429);
                });
        });

        /**
         * Public read limiter — endpoint publik tanpa auth.
         * By IP karena tidak ada user ID.
         * 300 req/menit per IP — longgar untuk akses banyak halaman sekaligus.
         */
        RateLimiter::for('public', function (Request $request) {
            return Limit::perMinute(300)
                ->by('public:' . $request->ip())
                ->response(function () {
                    return response()->json([
                        'success' => false,
                        'message' => 'Terlalu banyak request. Silakan coba lagi sebentar.',
                    ], 429);
                });
        });

        /**
         * Authenticated user limiter — protected routes.
         * By user ID jika login, fallback ke IP jika guest.
         * 500 req/menit per user / IP.
         */
        RateLimiter::for('api', function (Request $request) {
            $key = $request->user()
                ? 'api:user:' . $request->user()->id
                : 'api:ip:' . $request->ip();

            return Limit::perMinute(500)
                ->by($key)
                ->response(function () {
                    return response()->json([
                        'success' => false,
                        'message' => 'Rate limit tercapai. Silakan tunggu sebentar.',
                    ], 429);
                });
        });

        /**
         * Write operations limiter — POST/PUT/PATCH/DELETE.
         * By user ID jika login, fallback ke IP.
         * 200 req/menit — cegah spam tapi tidak ganggu pemakaian normal.
         */
        RateLimiter::for('write', function (Request $request) {
            $key = $request->user()
                ? 'write:user:' . $request->user()->id
                : 'write:ip:' . $request->ip();

            return Limit::perMinute(200)
                ->by($key)
                ->response(function () {
                    return response()->json([
                        'success' => false,
                        'message' => 'Terlalu banyak operasi tulis. Silakan tunggu.',
                    ], 429);
                });
        });

        /**
         * Report limiter — cegah spam laporan.
         * By user ID jika login, fallback ke IP.
         * 20 laporan per 10 menit.
         */
        RateLimiter::for('report', function (Request $request) {
            $key = $request->user()
                ? 'report:user:' . $request->user()->id
                : 'report:ip:' . $request->ip();

            return Limit::perMinutes(10, 20)
                ->by($key)
                ->response(function () {
                    return response()->json([
                        'success' => false,
                        'message' => 'Terlalu banyak laporan. Silakan tunggu 10 menit.',
                    ], 429);
                });
        });

        /**
         * Vote/like limiter — cegah vote manipulation.
         * By user ID jika login, fallback ke IP.
         * 200 interaksi per menit.
         */
        RateLimiter::for('interaction', function (Request $request) {
            $key = $request->user()
                ? 'interaction:user:' . $request->user()->id
                : 'interaction:ip:' . $request->ip();

            return Limit::perMinute(200)
                ->by($key)
                ->response(function () {
                    return response()->json([
                        'success' => false,
                        'message' => 'Terlalu banyak interaksi. Silakan tunggu.',
                    ], 429);
                });
        });
    }
}
