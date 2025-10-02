<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Borrowing;
use App\Models\Room;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Enums\BorrowingStatus; // <-- 1. Tambahkan ini

class UpdateBorrowingStatuses extends Command
{
    // ... (properti signature dan description tidak berubah)

    public function handle()
    {
        $now = Carbon::now();
        $this->info("Running status update at: {$now}");

        DB::transaction(function () use ($now) {
            // 1. Cari peminjaman yang 'approved' dan waktunya sudah mulai
            $startingBorrowings = Borrowing::where('status', BorrowingStatus::APPROVED) // <-- 2. Gunakan Enum
                ->where('borrow_date', '<=', $now->toDateString())
                ->whereRaw("CONCAT(borrow_date, ' ', start_time) <= ?", [$now->toDateTimeString()])
                ->get();

            foreach ($startingBorrowings as $borrowing) {
                $borrowing->status = BorrowingStatus::ACTIVE; // <-- Gunakan Enum
                $borrowing->save();
                
                $borrowing->room()->update(['status' => 'dipakai']);
                $this->info("Borrowing #{$borrowing->id} started. Room #{$borrowing->room_id} is now occupied.");
            }

            // 2. Cari peminjaman yang 'active' dan waktunya sudah selesai
            $endingBorrowings = Borrowing::where('status', BorrowingStatus::ACTIVE) // <-- Gunakan Enum
                ->whereRaw("CONCAT(borrow_date, ' ', end_time) <= ?", [$now->toDateTimeString()])
                ->get();

            foreach ($endingBorrowings as $borrowing) {
                $borrowing->status = BorrowingStatus::COMPLETED; // <-- Gunakan Enum
                $borrowing->save();

                $room = $borrowing->room;
                if (!$room->hasActiveBorrowing()) {
                    $room->status = 'tersedia';
                    $room->save();
                    $this->info("Borrowing #{$borrowing->id} completed. Room #{$room->id} is now available.");
                } else {
                     $this->warn("Borrowing #{$borrowing->id} completed, but Room #{$room->id} has other active/upcoming borrowings.");
                }
            }
        });

        $this->info('Status update finished.');
    }
}