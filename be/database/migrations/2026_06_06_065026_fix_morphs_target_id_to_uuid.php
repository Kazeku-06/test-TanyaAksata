<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('likes', function (Blueprint $table) {
            $table->string('target_id', 36)->change();
        });

        Schema::table('reports', function (Blueprint $table) {
            $table->string('target_id', 36)->change();
        });
        
        // Pastikan votes juga benar jika sebelumnya belum berhasil
        Schema::table('votes', function (Blueprint $table) {
            $table->string('target_id', 36)->change();
        });
    }

    public function down(): void
    {
        Schema::table('likes', function (Blueprint $table) {
            $table->unsignedBigInteger('target_id')->change();
        });

        Schema::table('reports', function (Blueprint $table) {
            $table->unsignedBigInteger('target_id')->change();
        });
        
        Schema::table('votes', function (Blueprint $table) {
            $table->unsignedBigInteger('target_id')->change();
        });
    }
};
