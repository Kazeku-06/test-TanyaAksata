<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('moderation_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('moderator_id');
            $table->uuid('target_user_id');
            $table->string('action'); // 'ban', 'unban', 'delete_post', 'warn', dll
            $table->string('target_type')->nullable(); // 'post', 'comment', 'user'
            $table->uuid('target_id')->nullable();
            $table->text('reason');
            $table->timestamps();

            $table->foreign('moderator_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('target_user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('moderation_logs');
    }
};
