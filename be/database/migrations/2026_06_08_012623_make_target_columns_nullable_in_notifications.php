<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->string('target_type')->nullable()->change();
            $table->string('target_id')->nullable()->change();
        });
    }

    public function down()
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->string('target_type')->nullable(false)->change();
            $table->string('target_id')->nullable(false)->change();
        });
    }
};
