<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database for BPS Riau Room Management System.
     */
    public function run(): void
    {
        // Run BPS Riau comprehensive seeder
        $this->call([
            BPSRiauSeeder::class,
        ]);

        $this->command->info('🎉 BPS Riau Room Management System database seeded successfully!');
        $this->command->info('');
        $this->command->info('📊 DATABASE SUMMARY:');
        $this->command->info('• Users: 12 (1 Super Admin, 3 Admins, 8 Users)');
        $this->command->info('• Rooms: 6 (A-F with complete facilities)');
        $this->command->info('• Sample Borrowings: 6 (Various statuses)');
        $this->command->info('• Equipment: 17 items across all rooms');
        $this->command->info('• System Settings: 15 configurations');
        $this->command->info('• Notifications: 4 sample notifications');
        $this->command->info('');
        $this->command->info('🔐 DEFAULT LOGIN CREDENTIALS:');
        $this->command->info('Super Admin: superadmin@bps.go.id / password1234');
        $this->command->info('Admin: admin@bps.go.id / password');
        $this->command->info('User: pengguna@bps.go.id / password');
        $this->command->info('');
        $this->command->info('✅ Ready for development and testing!');
    }
}