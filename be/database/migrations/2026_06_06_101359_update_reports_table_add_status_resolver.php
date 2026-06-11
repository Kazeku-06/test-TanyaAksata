<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('reports', function (Blueprint $table) {
            if (!Schema::hasColumn('reports', 'status')) {
                $table->enum('status', ['pending', 'resolved', 'rejected'])->default('pending');
            }
            if (!Schema::hasColumn('reports', 'resolved_by')) {
                $table->uuid('resolved_by')->nullable();
                $table->foreign('resolved_by')->references('id')->on('users')->onDelete('set null');
            }
            if (!Schema::hasColumn('reports', 'resolution_note')) {
                $table->text('resolution_note')->nullable();
            }
        });
    }

    public function down()
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropForeign(['resolved_by']);
            $table->dropColumn(['status', 'resolved_by', 'resolution_note']);
        });
    }
};
