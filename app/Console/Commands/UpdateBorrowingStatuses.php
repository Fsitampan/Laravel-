<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Borrowing;
use App\Models\BorrowingHistory;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Enums\BorrowingStatus; 

class UpdateBorrowingStatuses extends Command
{
    protected $signature = 'borrowings:update-statuses';
    protected $description = 'Update borrowing and room statuses based on scheduled time';

    public function handle()
    {
        $now = Carbon::now();
        $this->info("Running status update at: {$now}");

        $startingBorrowings = collect();
        $endingBorrowings = collect();

        DB::transaction(function () use ($now, &$startingBorrowings, &$endingBorrowings) {
            // 1. Ubah APPROVED → ACTIVE (waktu mulai sudah tiba, tapi belum lewat waktu selesai)
            $startingBorrowings = Borrowing::where('status', BorrowingStatus::APPROVED)
                ->where('borrowed_at', '<=', $now)
                ->where('planned_return_at', '>', $now) // Pastikan belum lewat waktu selesai
                ->with('room')
                ->get();

            foreach ($startingBorrowings as $borrowing) {
                $oldStatus = $borrowing->status->value;
                $borrowing->status = BorrowingStatus::ACTIVE;
                $borrowing->save();
                
                // Update room status SAAT ACTIVE (bukan saat approved)
                if ($borrowing->room) {
                    $borrowing->room->update(['status' => 'dipakai']);
                }
                
                // Catat ke history
                BorrowingHistory::create([
                    'borrowing_id' => $borrowing->id,
                    'action' => 'started',
                    'old_status' => $oldStatus,
                    'new_status' => BorrowingStatus::ACTIVE->value,
                    'comment' => 'Status otomatis diubah ke sedang berlangsung',
                    'performed_by' => null,
                    'performed_at' => now(),
                ]);
                
                $this->info("✓ Borrowing #{$borrowing->id} started. Room #{$borrowing->room_id} is now occupied.");
            }

            // 2. Ubah ACTIVE → COMPLETED (waktu selesai sudah tiba)
            $endingBorrowings = Borrowing::where('status', BorrowingStatus::ACTIVE)
                ->where('planned_return_at', '<=', $now)
                ->with('room')
                ->get();

            foreach ($endingBorrowings as $borrowing) {
                $oldStatus = $borrowing->status->value;
                $borrowing->status = BorrowingStatus::COMPLETED;
                $borrowing->actual_return_date = $now;
                $borrowing->save();

                // Cek apakah room masih ada peminjaman aktif lain
                $room = $borrowing->room;
                if ($room && !$room->hasActiveBorrowing()) {
                    $room->status = 'tersedia';
                    $room->save();
                    $this->info("✓ Borrowing #{$borrowing->id} completed. Room #{$room->id} is now available.");
                } else {
                    $this->warn("⚠ Borrowing #{$borrowing->id} completed, but Room #{$room->id} has other active borrowings.");
                }
                
                // Catat ke history
                BorrowingHistory::create([
                    'borrowing_id' => $borrowing->id,
                    'action' => 'completed',
                    'old_status' => $oldStatus,
                    'new_status' => BorrowingStatus::COMPLETED->value,
                    'comment' => 'Peminjaman selesai secara otomatis',
                    'performed_by' => null,
                    'performed_at' => now(),
                ]);
            }

            // 3. Handle APPROVED yang sudah lewat waktu selesai (tidak pernah dimulai)
            $expiredApproved = Borrowing::where('status', BorrowingStatus::APPROVED)
                ->where('planned_return_at', '<=', $now)
                ->with('room')
                ->get();

            foreach ($expiredApproved as $borrowing) {
                $oldStatus = $borrowing->status->value;
                $borrowing->status = BorrowingStatus::COMPLETED;
                $borrowing->actual_return_date = $now;
                $borrowing->save();

                if ($borrowing->room && !$borrowing->room->hasActiveBorrowing()) {
                    $borrowing->room->update(['status' => 'tersedia']);
                }

                BorrowingHistory::create([
                    'borrowing_id' => $borrowing->id,
                    'action' => 'expired',
                    'old_status' => $oldStatus,
                    'new_status' => BorrowingStatus::COMPLETED->value,
                    'comment' => 'Peminjaman expired (tidak pernah dimulai)',
                    'performed_by' => null,
                    'performed_at' => now(),
                ]);

                $this->warn("⚠ Borrowing #{$borrowing->id} expired without being started.");
            }
        });

        $countStarted = $startingBorrowings->count();
        $countEnded = $endingBorrowings->count();
        
        $this->info("Status update finished: {$countStarted} started, {$countEnded} completed.");
        return Command::SUCCESS;
    }
}