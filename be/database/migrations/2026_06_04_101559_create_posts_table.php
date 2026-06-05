<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->longText('body');
            $table->uuid('user_id');
            $table->uuid('category_id');
            $table->uuid('accepted_answer_id')->nullable();
            $table->integer('votes_count')->default(0);
            $table->integer('likes_count')->default(0);
            $table->integer('comments_count')->default(0);
            $table->integer('views_count')->default(0);
            $table->boolean('is_solved')->default(false);
            $table->timestamp('edited_at')->nullable();
            $table->integer('edit_count')->default(0);
            $table->softDeletes();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('cascade');
            $table->foreign('accepted_answer_id')->references('id')->on('comments')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('posts');
    }
};
