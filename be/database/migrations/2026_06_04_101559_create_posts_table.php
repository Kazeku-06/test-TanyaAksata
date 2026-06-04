<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->longText('body');
            $table->uuid('user_id');
            $table->uuid('category_id');
            $table->uuid('accepted_answer_id')->nullable(); // merujuk ke comments.id
            $table->integer('votes_count')->default(0);
            $table->integer('likes_count')->default(0);
            $table->integer('comments_count')->default(0);
            $table->integer('views_count')->default(0);
            $table->boolean('is_solved')->default(false);
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('cascade');
            // foreign untuk accepted_answer_id akan ditambahkan setelah tabel comments dibuat, atau pakai ALTER
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
