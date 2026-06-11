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
     */
    protected function configureRateLimiting(): void
    {
        /**
         * Auth limiter — paling ketat.
         * Login & register: 10 request per menit per IP.
         * Setelah limit, tunggu 60 detik.
         */
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(100)
                ->by($request->ip())
                ->response(function () {
                    return response()->json([
                        'success' => false,
                        'message' => 'Terlalu banyak percobaan. Silakan coba lagi dalam 1 menit.',
                    ], 429);
                });
        });

        /**
         * Public read limiter — endpoint publik tanpa auth.
         * 60 request per menit per IP.
         */
        RateLimiter::for('public', function (Request $request) {
            return Limit::perMinute(100)
                ->by($request->ip())
                ->response(function () {
                    return response()->json([
                        'success' => false,
                        'message' => 'Terlalu banyak request. Silakan coba lagi sebentar.',
                    ], 429);
                });
        });

        /**
         * Authenticated user limiter.
         * 120 request per menit per user (atau IP jika belum login).
         */
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(120)
                ->by(optional($request->user())->id ?: $request->ip())
                ->response(function () {
                    return response()->json([
                        'success' => false,
                        'message' => 'Rate limit tercapai. Silakan tunggu sebentar.',
                    ], 429);
                });
        });

        /**
         * Write operations limiter — POST/PUT/PATCH/DELETE.
         * 30 request per menit per user — cegah spam.
         */
        RateLimiter::for('write', function (Request $request) {
            return Limit::perMinute(100)
                ->by(optional($request->user())->id ?: $request->ip())
                ->response(function () {
                    return response()->json([
                        'success' => false,
                        'message' => 'Terlalu banyak operasi tulis. Silakan tunggu.',
                    ], 429);
                });
        });

        /**
         * Report limiter — cegah spam laporan.
         * 5 laporan per 10 menit per user.
         */
        RateLimiter::for('report', function (Request $request) {
            return Limit::perMinutes(10, 5)
                ->by(optional($request->user())->id ?: $request->ip())
                ->response(function () {
                    return response()->json([
                        'success' => false,
                        'message' => 'Terlalu banyak laporan. Silakan tunggu 10 menit.',
                    ], 429);
                });
        });

        /**
         * Vote/like limiter — cegah vote manipulation.
         * 60 vote/like per menit per user.
         */
        RateLimiter::for('interaction', function (Request $request) {
            return Limit::perMinute(60)
                ->by(optional($request->user())->id ?: $request->ip())
                ->response(function () {
                    return response()->json([
                        'success' => false,
                        'message' => 'Terlalu banyak interaksi. Silakan tunggu.',
                    ], 429);
                });
        });
    }
}
