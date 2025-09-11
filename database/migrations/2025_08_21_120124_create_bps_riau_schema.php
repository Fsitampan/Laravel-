<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for BPS Riau Room Management System
     */
    public function up(): void
    {
        // Users table (already exists, but let's ensure proper structure)
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'role')) {
                $table->enum('role', ['super-admin', 'admin', 'user'])->default('user')->after('email_verified_at');
            }
            if (!Schema::hasColumn('users', 'category')) {
                $table->enum('category', ['pegawai', 'tamu', 'anak-magang'])->default('pegawai')->after('role');
            }
            if (!Schema::hasColumn('users', 'phone')) {
                $table->string('phone')->nullable()->after('category');
            }
            if (!Schema::hasColumn('users', 'department')) {
                $table->string('department')->nullable()->after('phone');
            }
            if (!Schema::hasColumn('users', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('department');
            }
        });

        // Rooms table
        if (!Schema::hasTable('rooms')) {
            Schema::create('rooms', function (Blueprint $table) {
                $table->id();
                $table->string('name', 100)->unique(); // A, B, C, D, E, F
                $table->text('description')->nullable();
                $table->integer('capacity')->default(0);
                $table->enum('status', ['available', 'occupied', 'maintenance'])->default('available');
                $table->json('facilities')->nullable(); // AC, Projector, WiFi, etc.
                $table->string('location')->nullable(); // Lantai 1, Gedung Utama
                $table->string('image_url')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                
                $table->index(['status', 'is_active']);
                $table->index(['capacity']);
            });
        }

        // Borrowings table
        if (!Schema::hasTable('borrowings')) {
            Schema::create('borrowings', function (Blueprint $table) {
                $table->id();
                $table->foreignId('room_id')->constrained()->onDelete('cascade');
                $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Peminjam
                $table->string('borrower_name');
                $table->string('borrower_phone', 20);
                $table->enum('borrower_category', ['pegawai', 'tamu', 'anak-magang']);
                $table->string('borrower_department')->nullable();
                $table->string('borrower_institution')->nullable(); // For guests
                $table->text('purpose'); // Tujuan peminjaman
                $table->dateTime('borrowed_at');
                $table->dateTime('returned_at')->nullable();
                $table->dateTime('planned_return_at')->nullable();
                $table->enum('status', ['pending', 'approved', 'rejected', 'active', 'completed', 'cancelled'])->default('pending');
                $table->text('notes')->nullable();
                $table->text('admin_notes')->nullable();
                $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
                $table->dateTime('approved_at')->nullable();
                $table->text('rejection_reason')->nullable();
                $table->integer('participant_count')->default(1);
                $table->json('equipment_needed')->nullable(); // Additional equipment
                $table->boolean('is_recurring')->default(false);
                $table->string('recurring_pattern')->nullable(); // daily, weekly, monthly
                $table->date('recurring_end_date')->nullable();
                $table->timestamps();
                
                $table->index(['status', 'borrowed_at']);
                $table->index(['room_id', 'status']);
                $table->index(['user_id']);
                $table->index(['approved_by']);
            });
        }

        // Borrowing History table (for audit trail)
        if (!Schema::hasTable('borrowing_histories')) {
            Schema::create('borrowing_histories', function (Blueprint $table) {
                $table->id();
                $table->foreignId('borrowing_id')->constrained()->onDelete('cascade');
                $table->string('action'); // created, approved, rejected, completed, etc.
                $table->string('old_status')->nullable();
                $table->string('new_status')->nullable();
                $table->text('notes')->nullable();
                $table->json('metadata')->nullable(); // Additional data
                $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
                $table->timestamps();
                
                $table->index(['borrowing_id', 'created_at']);
                $table->index(['action']);
            });
        }

        // System Settings table
        if (!Schema::hasTable('system_settings')) {
            Schema::create('system_settings', function (Blueprint $table) {
                $table->id();
                $table->string('key')->unique();
                $table->text('value');
                $table->string('type')->default('string'); // string, integer, boolean, json
                $table->text('description')->nullable();
                $table->string('group')->default('general'); // general, email, security, etc.
                $table->boolean('is_public')->default(false); // Can be accessed by non-admin
                $table->timestamps();
                
                $table->index(['group', 'is_public']);
            });
        }

        // Room Equipment table (for detailed facility management)
        if (!Schema::hasTable('room_equipment')) {
            Schema::create('room_equipment', function (Blueprint $table) {
                $table->id();
                $table->foreignId('room_id')->constrained()->onDelete('cascade');
                $table->string('name'); // Proyektor, AC, Kursi, etc.
                $table->string('type')->nullable(); // electronics, furniture, etc.
                $table->integer('quantity')->default(1);
                $table->enum('condition', ['excellent', 'good', 'fair', 'poor', 'broken'])->default('good');
                $table->text('description')->nullable();
                $table->date('last_maintenance')->nullable();
                $table->date('next_maintenance')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                
                $table->index(['room_id', 'is_active']);
                $table->index(['condition']);
            });
        }

        // Notifications table
        if (!Schema::hasTable('notifications')) {
            Schema::create('notifications', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->string('type'); // borrowing_approved, borrowing_rejected, reminder, etc.
                $table->string('title');
                $table->text('message');
                $table->json('data')->nullable(); // Additional data like borrowing_id, etc.
                $table->timestamp('read_at')->nullable();
                $table->timestamps();
                
                $table->index(['user_id', 'read_at']);
                $table->index(['type']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('room_equipment');
        Schema::dropIfExists('system_settings');
        Schema::dropIfExists('borrowing_histories');
        Schema::dropIfExists('borrowings');
        Schema::dropIfExists('rooms');
        
        // Remove columns from users table
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'category', 'phone', 'department', 'is_active']);
        });
    }
};