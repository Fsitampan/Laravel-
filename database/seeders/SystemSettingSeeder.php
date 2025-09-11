<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SystemSettingSeeder extends Seeder
{
    /**
     * Seed the BPS Riau System Settings
     */
    public function run(): void
    {
        // Clear existing system settings
        DB::table('system_settings')->truncate();

        $settings = [
            // General Settings
            ['key' => 'site_name', 'value' => 'BPS Riau - Sistem Manajemen Ruangan', 'type' => 'string', 'description' => 'Nama aplikasi sistem', 'is_public' => true],
            ['key' => 'office_name', 'value' => 'Badan Pusat Statistik Provinsi Riau', 'type' => 'string', 'description' => 'Nama instansi', 'is_public' => true],
            ['key' => 'office_address', 'value' => 'Jl. Pattimura No. 12, Pekanbaru, Riau 28131', 'type' => 'string', 'description' => 'Alamat kantor', 'is_public' => true],
            ['key' => 'office_phone', 'value' => '0761-21351', 'type' => 'string', 'description' => 'Telepon kantor', 'is_public' => true],
            ['key' => 'office_email', 'value' => 'bps1400@bps.go.id', 'type' => 'string', 'description' => 'Email kantor', 'is_public' => true],
            
            // Booking Settings
            ['key' => 'max_booking_days_ahead', 'value' => '30', 'type' => 'integer', 'description' => 'Maksimal hari booking ke depan', 'is_public' => false],
            ['key' => 'min_booking_hours_ahead', 'value' => '2', 'type' => 'integer', 'description' => 'Minimal jam booking ke depan', 'is_public' => false],
            ['key' => 'auto_approve_pegawai', 'value' => 'false', 'type' => 'boolean', 'description' => 'Auto approve untuk pegawai', 'is_public' => false],
            ['key' => 'max_booking_duration_hours', 'value' => '8', 'type' => 'integer', 'description' => 'Maksimal durasi booking (jam)', 'is_public' => false],
            
            // Notification Settings
            ['key' => 'email_notifications', 'value' => 'true', 'type' => 'boolean', 'description' => 'Aktifkan notifikasi email', 'is_public' => false],
            ['key' => 'sms_notifications', 'value' => 'false', 'type' => 'boolean', 'description' => 'Aktifkan notifikasi SMS', 'is_public' => false],
            ['key' => 'reminder_hours_before', 'value' => '24', 'type' => 'integer', 'description' => 'Reminder berapa jam sebelum meeting', 'is_public' => false],
            
            // Security Settings
            ['key' => 'session_timeout_minutes', 'value' => '120', 'type' => 'integer', 'description' => 'Timeout session (menit)', 'is_public' => false],
            ['key' => 'max_login_attempts', 'value' => '5', 'type' => 'integer', 'description' => 'Maksimal percobaan login', 'is_public' => false],
            ['key' => 'password_min_length', 'value' => '8', 'type' => 'integer', 'description' => 'Minimal panjang password', 'is_public' => false],
        ];

        foreach ($settings as $setting) {
            DB::table('system_settings')->insert(array_merge($setting, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        $this->command->info('✅ Created ' . count($settings) . ' system settings successfully');
    }
}