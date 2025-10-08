<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use App\Models\Borrowing;
use App\Models\Room;

class Kernel extends ConsoleKernel
{
    /**
     * Define your application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Jalankan setiap menit untuk menyinkronkan status ruangan dan peminjaman
        $schedule->call(function () {
            // Update status semua peminjaman
            \App\Models\Borrowing::with('room')->get()->each(function ($borrowing) {
                $borrowing->refreshStatus();
            });

            // Update status semua ruangan
            \App\Models\Room::with('currentBorrowing')->get()->each(function ($room) {
                $room->refreshRoomStatus();
            });
        })->everyMinute();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        // File ini akan otomatis dipanggil jika kamu membuat command artisan khusus
        if (file_exists(base_path('routes/console.php'))) {
            require base_path('routes/console.php');
        }
    }
}
