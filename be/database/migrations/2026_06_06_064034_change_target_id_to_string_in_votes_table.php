<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('votes', function (Blueprint $table) {
            // Ubah target_id dari integer/bigInteger menjadi string (UUID length 36)
            $table->string('target_id', 36)->change();
        });
    }

    public function down()
    {
        Schema::table('votes', function (Blueprint $table) {
            // Kembalikan ke tipe semula (misal unsignedBigInteger)
            $table->unsignedBigInteger('target_id')->change();
        });
    }
};
