<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('full_name')->nullable();
            $table->string('code', 50)->unique();
            $table->text('description')->nullable();
            $table->integer('capacity')->default(0);
            $table->enum('status', ['tersedia', 'dipakai', 'pemeliharaan'])->default('tersedia');
            $table->string('location')->nullable();
            $table->json('facilities')->nullable();
            $table->json('layout_images')->nullable();
            $table->string('image')->nullable();
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->boolean('is_active')->default(true); 
            $table->timestamps();
            
            // Indexes
            $table->index('status');
            $table->index('code');
            $table->index('name');
            
            // Foreign keys
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};