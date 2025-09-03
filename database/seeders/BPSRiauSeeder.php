<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BPSRiauSeeder extends Seeder
{
    /**
     * BPS Riau Master Seeder - Orchestrates all modular seeders
     */
    public function run(): void
    {
        $this->command->info('🚀 Starting BPS Riau Room Management System seeding...');
        
        // Disable foreign key checks during seeding
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        try {
            // 1. Seed Users first (required for foreign keys)
            $this->command->info('👥 Seeding Users...');
            $this->call(UserSeeder::class);
            
            // 2. Seed Rooms
            $this->command->info('🏠 Seeding Rooms...');
            $this->call(RoomSeeder::class);
            
            // 3. Seed Room Equipment (depends on rooms)
            $this->command->info('🔧 Seeding Room Equipment...');
            $this->call(RoomEquipmentSeeder::class);
            
            // 4. Seed System Settings
            $this->command->info('⚙️ Seeding System Settings...');
            $this->call(SystemSettingSeeder::class);
            
            // 5. Seed Borrowings with History (depends on users and rooms)
            $this->command->info('📋 Seeding Borrowings and History...');
            $this->call(BorrowingSeeder::class);
            
            // 6. Seed Notifications (depends on users and borrowings)
            $this->command->info('🔔 Seeding Notifications...');
            $this->call(NotificationSeeder::class);
            
        } finally {
            // Re-enable foreign key checks
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        }
        
        $this->command->info('✅ BPS Riau seeding completed successfully!');
        $this->displaySummary();
    }
    
    private function displaySummary(): void
    {
        $this->command->info('');
        $this->command->info('📊 Database Summary:');
        $this->command->info('   - 12 Users (1 Super Admin, 3 Admins, 8 Pengguna)');
        $this->command->info('   - 6 Rooms (A-F) with proper facilities');
        $this->command->info('   - 17 Room Equipment items');
        $this->command->info('   - 15 System Settings');
        $this->command->info('   - 9 Borrowings (5 Pending, 1 Active, 2 Completed, 1 Rejected)');
        $this->command->info('   - 8 Notifications');
        $this->command->info('');
        $this->command->info('🔑 Login Credentials:');
        $this->command->info('   Super Admin: superadmin@bps.go.id / password');
        $this->command->info('   Admin Kepala: admin.kepala@bps.go.id / password');
        $this->command->info('   Admin IPDS: admin.ipds@bps.go.id / password');
        $this->command->info('   Admin Sosial: admin.sosial@bps.go.id / password');
        $this->command->info('');
        $this->command->info('🎯 Ready for testing! 5 pending approvals available.');
    }
}