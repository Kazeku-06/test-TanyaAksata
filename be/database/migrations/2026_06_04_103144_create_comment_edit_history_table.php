<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comment_edit_history', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('comment_id');
            $table->uuid('edited_by');
            $table->text('body_before');
            $table->text('body_after');
            $table->text('edit_summary')->nullable();
            $table->timestamps();

            $table->foreign('comment_id')->references('id')->on('comments')->onDelete('cascade');
            $table->foreign('edited_by')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comment_edit_history');
    }
};
