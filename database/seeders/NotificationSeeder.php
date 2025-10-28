<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class NotificationSeeder extends Seeder
{
    /**
     * Jalankan seeder untuk tabel notifications.
     */
    public function run(): void
    {
        $users = User::all();

        if ($users->isEmpty()) {
            $this->command->warn('⚠️ Tidak ada user ditemukan. Jalankan UserSeeder terlebih dahulu.');
            return;
        }

        $now = Carbon::now();

        $notifications = [];

        foreach ($users as $user) {
            $notifications[] = [
                'user_id' => $user->id,
                'type' => 'system',
                'title' => 'Selamat Datang di Sistem Peminjaman Ruangan BPS Riau',
                'message' => 'Halo ' . $user->name . '! Terima kasih telah bergabung. Silakan ajukan peminjaman ruangan sesuai kebutuhan Anda.',
                'data' => json_encode([
                    'redirect_url' => '/dashboard',
                    'icon' => 'bell',
                    'importance' => 'info',
                ]),
                'read_at' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ];

            $notifications[] = [
                'user_id' => $user->id,
                'type' => 'reminder',
                'title' => 'Pengingat: Pemesanan Ruangan Anda Hari Ini',
                'message' => 'Jangan lupa, Anda memiliki jadwal rapat hari ini. Silakan cek detailnya di menu Jadwal Rapat.',
                'data' => json_encode([
                    'redirect_url' => '/borrowings',
                    'icon' => 'calendar',
                    'importance' => 'reminder',
                ]),
                'read_at' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        DB::table('notifications')->insert($notifications);

        $this->command->info('✅ Created ' . count($notifications) . ' notifications successfully');
    }
}
