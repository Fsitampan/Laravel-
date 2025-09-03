<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class NotificationSeeder extends Seeder
{
    /**
     * Seed the BPS Riau Notifications
     */
    public function run(): void
    {
        // Clear existing notifications
        DB::table('notifications')->truncate();

        $notifications = [
            [
                'user_id' => 5, // Andi Pratama
                'type' => 'borrowing_approved',
                'title' => 'Peminjaman Ruangan Disetujui',
                'message' => 'Peminjaman Ruang C untuk Workshop Metodologi Survei telah disetujui',
                'data' => json_encode(['borrowing_id' => 1]),
                'created_at' => Carbon::now()->subHours(3),
                'updated_at' => Carbon::now()->subHours(3),
            ],
            [
                'user_id' => 7, // Muhammad Rizky
                'type' => 'borrowing_completed',
                'title' => 'Peminjaman Ruangan Selesai',
                'message' => 'Terima kasih telah menggunakan Ruang D. Mohon feedback untuk perbaikan layanan.',
                'data' => json_encode(['borrowing_id' => 7]),
                'read_at' => Carbon::yesterday()->setTime(12, 0),
                'created_at' => Carbon::yesterday()->setTime(11, 30),
                'updated_at' => Carbon::yesterday()->setTime(12, 0),
            ],
            [
                'user_id' => 12, // Novi
                'type' => 'borrowing_rejected',
                'title' => 'Peminjaman Ruangan Ditolak',
                'message' => 'Mohon maaf, peminjaman Ruang A tidak dapat disetujui. Silakan pilih ruang lain.',
                'data' => json_encode(['borrowing_id' => 9]),
                'created_at' => Carbon::now()->subDays(3)->setTime(14, 30),
                'updated_at' => Carbon::now()->subDays(3)->setTime(14, 30),
            ],
            [
                'user_id' => 2, // Admin Kepala
                'type' => 'new_booking_request',
                'title' => 'Permintaan Peminjaman Baru',
                'message' => 'Prof. Dr. Hendri Nelawan mengajukan peminjaman Ruang A untuk meeting',
                'data' => json_encode(['borrowing_id' => 2]),
                'created_at' => Carbon::now()->subHour(),
                'updated_at' => Carbon::now()->subHour(),
            ],
            [
                'user_id' => 3, // Admin IPDS
                'type' => 'new_booking_request',
                'title' => 'Permintaan Peminjaman Baru',
                'message' => 'Sari Wahyuni mengajukan peminjaman Ruang B untuk rapat koordinasi',
                'data' => json_encode(['borrowing_id' => 3]),
                'created_at' => Carbon::now()->subMinutes(30),
                'updated_at' => Carbon::now()->subMinutes(30),
            ],
            [
                'user_id' => 4, // Admin Sosial
                'type' => 'new_booking_request',
                'title' => 'Permintaan Peminjaman Baru',
                'message' => 'Fajar Ramadhan mengajukan peminjaman Ruang D untuk diskusi kelompok',
                'data' => json_encode(['borrowing_id' => 4]),
                'created_at' => Carbon::now()->subMinutes(15),
                'updated_at' => Carbon::now()->subMinutes(15),
            ],
            [
                'user_id' => 1, // Super Admin
                'type' => 'system_maintenance',
                'title' => 'Pemeliharaan Sistem Terjadwal',
                'message' => 'Ruang E akan menjalani pemeliharaan AC dan renovasi mulai hari ini.',
                'data' => json_encode(['room_id' => 5]),
                'created_at' => Carbon::now()->subDays(1),
                'updated_at' => Carbon::now()->subDays(1),
            ],
            [
                'user_id' => 9, // Prof. Hendri
                'type' => 'booking_reminder',
                'title' => 'Pengingat Peminjaman Ruangan',
                'message' => 'Pengingat: Anda memiliki jadwal meeting di Ruang A besok pukul 10:00',
                'data' => json_encode(['borrowing_id' => 2]),
                'created_at' => Carbon::now()->subHours(2),
                'updated_at' => Carbon::now()->subHours(2),
            ],
        ];

        foreach ($notifications as $notification) {
            DB::table('notifications')->insert($notification);
        }

        $this->command->info('✅ Created ' . count($notifications) . ' notifications successfully');
    }
}