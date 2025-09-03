<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('borrowing_history', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('borrowing_id');
            $table->enum('action', ['created', 'approved', 'rejected', 'started', 'completed', 'cancelled', 'returned']);
            $table->enum('old_status', ['pending', 'approved', 'rejected', 'active', 'completed', 'cancelled'])->nullable();
            $table->enum('new_status', ['pending', 'approved', 'rejected', 'active', 'completed', 'cancelled'])->nullable();
            $table->text('comment')->nullable();
            $table->unsignedBigInteger('performed_by');
            $table->timestamp('performed_at')->default(now());
            $table->timestamps();
            
            // Indexes
            $table->index('borrowing_id');
            $table->index('action');
            $table->index('performed_by');
            $table->index('performed_at');
            
            // Foreign keys
            $table->foreign('borrowing_id')->references('id')->on('borrowings')->onDelete('cascade');
            $table->foreign('performed_by')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('borrowing_history');
    }
};