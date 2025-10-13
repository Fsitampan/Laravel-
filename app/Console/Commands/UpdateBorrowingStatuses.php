<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Borrowing;
use App\Models\BorrowingHistory;
use App\Models\Room;
use App\Enums\BorrowingStatus;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class UpdateBorrowingStatuses extends Command
{
    protected $signature = 'borrowings:update-statuses';
    protected $description = 'Update borrowing and room statuses based on scheduled time';

    public function handle()
    {
        $now = Carbon::now();
        $this->info("⏳ Running auto status update at: {$now}");

        $startingBorrowings = collect();
        $endingBorrowings = collect();

        DB::transaction(function () use ($now, &$startingBorrowings, &$endingBorrowings) {
            // ✅ 1. APPROVED → ACTIVE
            $startingBorrowings = Borrowing::where('status', BorrowingStatus::APPROVED)
                ->where('borrowed_at', '<=', $now)
                ->where('planned_return_at', '>', $now)
                ->with('room')
                ->get();

            foreach ($startingBorrowings as $borrowing) {
                $oldStatus = $borrowing->status->value;
                $borrowing->status = BorrowingStatus::ACTIVE;
                $borrowing->save();

                // Update room status
                if ($borrowing->room) {
                    $borrowing->room->update(['status' => 'dipakai']);
                }

                BorrowingHistory::create([
                    'borrowing_id' => $borrowing->id,
                    'action' => 'started',
                    'old_status' => $oldStatus,
                    'new_status' => BorrowingStatus::ACTIVE->value,
                    'comment' => 'Status otomatis diubah ke sedang berlangsung',
                    'performed_by' => null,
                    'performed_at' => now(),
                ]);

                $this->info("✓ Borrowing #{$borrowing->id} started. Room #{$borrowing->room_id} now in use.");
            }

            // ✅ 2. ACTIVE → COMPLETED
            $endingBorrowings = Borrowing::where('status', BorrowingStatus::ACTIVE)
                ->where('planned_return_at', '<=', $now)
                ->with('room')
                ->get();

            foreach ($endingBorrowings as $borrowing) {
                $oldStatus = $borrowing->status->value;
                $borrowing->status = BorrowingStatus::COMPLETED;
                $borrowing->actual_return_date = $now;
                $borrowing->save();

                // Jika tidak ada peminjaman aktif lain, ubah ruangan jadi tersedia
                $room = $borrowing->room;
                if ($room && !$room->hasActiveBorrowing()) {
                    $room->status = 'tersedia';
                    $room->save();
                    $this->info("✓ Borrowing #{$borrowing->id} completed. Room #{$room->id} is now available.");
                }

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

            // ✅ 3. APPROVED tapi sudah lewat waktu → COMPLETED
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
                    'action' => 'completed',
                    'old_status' => $oldStatus,
                    'new_status' => BorrowingStatus::COMPLETED->value,
                    'comment' => 'Peminjaman expired (tidak pernah dimulai)',
                    'performed_by' => null,
                    'performed_at' => now(),
                ]);

                $this->warn("⚠ Borrowing #{$borrowing->id} expired without being started.");
            }
        });

        $this->info("✅ Finished. {$startingBorrowings->count()} started, {$endingBorrowings->count()} completed.");
        return Command::SUCCESS;
    }
}
