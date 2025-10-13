<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('borrowing_history', function (Blueprint $table) {
            $table->unsignedBigInteger('performed_by')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('borrowing_history', function (Blueprint $table) {
            $table->unsignedBigInteger('performed_by')->nullable(false)->change();
        });
    }
};
