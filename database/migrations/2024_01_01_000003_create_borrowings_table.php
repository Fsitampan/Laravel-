<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('borrowings', function (Blueprint $table) {
            $table->id();

            //mencocokkan
            $table->string('borrower_institution')->nullable();
            $table->integer('participant_count')->default(1);
            $table->json('equipment_needed')->nullable();
            $table->boolean('is_recurring')->default(false);
            $table->string('recurring_pattern')->nullable();
            $table->date('recurring_end_date')->nullable();


            // Relasi ke rooms & users
            $table->foreignId('room_id')->constrained('rooms')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');

            // Data peminjam
            $table->string('borrower_name');
            $table->string('borrower_email')->nullable();
            $table->string('borrower_phone')->nullable();
            $table->string('borrower_identification')->nullable(); // NIP, NIK, dll
            $table->enum('borrower_category', ['pegawai', 'tamu', 'anak-magang'])->default('pegawai');
            $table->string('borrower_department')->nullable();


            // Waktu pinjam
            $table->date('borrow_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->dateTime('borrowed_at')->nullable();
            $table->dateTime('planned_return_at')->nullable();
            $table->date('return_date')->nullable();       // Tanggal rencana pengembalian
            $table->dateTime('actual_return_date')->nullable(); // Tanggal realisasi pengembalian

            // Detail pinjaman
            $table->text('purpose')->nullable();
            $table->enum('status', [
            'pending', 
            'approved', 
            'rejected', 
            'active', 
            'completed', 
            'cancelled'
            ])->default('pending');

            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->dateTime('approved_at')->nullable();
            $table->text('rejection_reason')->nullable(); // alasan penolakan
            $table->text('notes')->nullable();

            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');

            $table->timestamps();

            // Indexes tambahan
            $table->index('status');
            $table->index(['room_id', 'borrow_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('borrowings');
    }
};
