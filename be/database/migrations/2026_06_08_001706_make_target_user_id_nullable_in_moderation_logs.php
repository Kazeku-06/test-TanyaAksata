<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('moderation_logs', function (Blueprint $table) {
            $table->uuid('target_user_id')->nullable()->change();
        });
    }

    public function down()
    {
        Schema::table('moderation_logs', function (Blueprint $table) {
            $table->uuid('target_user_id')->nullable(false)->change();
        });
    }
};
