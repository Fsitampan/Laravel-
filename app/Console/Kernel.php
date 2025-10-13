<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use App\Console\Commands\UpdateBorrowingStatuses;

class Kernel extends ConsoleKernel
{
    /**
     * Daftar command artisan custom.
     */
    protected $commands = [
        UpdateBorrowingStatuses::class,
    ];

    /**
     * Jadwal command otomatis.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Jalankan setiap 1 menit untuk update status otomatis
        $schedule->command('borrowings:update-statuses')->everyMinute();
    }

    /**
     * Register file command tambahan.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        if (file_exists(base_path('routes/console.php'))) {
            require base_path('routes/console.php');
        }
    }
}
