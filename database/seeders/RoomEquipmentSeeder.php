<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoomEquipmentSeeder extends Seeder
{
    /**
     * Seed the BPS Riau Room Equipment
     */
    public function run(): void
    {
        // Clear existing room equipment
        DB::table('room_equipment')->truncate();

        $equipment = [
            // Room A Equipment
            ['room_id' => 1, 'name' => 'Proyektor Epson EB-X41', 'type' => 'electronics', 'quantity' => 1, 'condition' => 'excellent'],
            ['room_id' => 1, 'name' => 'Screen Proyektor 100 inch', 'type' => 'electronics', 'quantity' => 1, 'condition' => 'good'],
            ['room_id' => 1, 'name' => 'Sound System Yamaha', 'type' => 'electronics', 'quantity' => 1, 'condition' => 'good'],
            ['room_id' => 1, 'name' => 'Kursi Eksekutif', 'type' => 'furniture', 'quantity' => 20, 'condition' => 'good'],
            ['room_id' => 1, 'name' => 'Meja Rapat Oval', 'type' => 'furniture', 'quantity' => 1, 'condition' => 'excellent'],
            
            // Room B Equipment
            ['room_id' => 2, 'name' => 'Proyektor Canon LV-WX320', 'type' => 'electronics', 'quantity' => 1, 'condition' => 'good'],
            ['room_id' => 2, 'name' => 'Kursi Kantor', 'type' => 'furniture', 'quantity' => 15, 'condition' => 'good'],
            
            // Room C Equipment
            ['room_id' => 3, 'name' => 'Proyektor Benq MX550', 'type' => 'electronics', 'quantity' => 1, 'condition' => 'excellent'],
            ['room_id' => 3, 'name' => 'Kursi Auditorium', 'type' => 'furniture', 'quantity' => 50, 'condition' => 'good'],
            ['room_id' => 3, 'name' => 'Microphone Wireless', 'type' => 'electronics', 'quantity' => 4, 'condition' => 'good'],
            
            // Room D Equipment
            ['room_id' => 4, 'name' => 'TV LED LG 55 inch', 'type' => 'electronics', 'quantity' => 1, 'condition' => 'excellent'],
            ['room_id' => 4, 'name' => 'Kursi Santai', 'type' => 'furniture', 'quantity' => 10, 'condition' => 'good'],
            
            // Room E Equipment (Maintenance)
            ['room_id' => 5, 'name' => 'TV LED Samsung 43 inch', 'type' => 'electronics', 'quantity' => 1, 'condition' => 'poor'],
            ['room_id' => 5, 'name' => 'AC Split 1.5 PK', 'type' => 'electronics', 'quantity' => 1, 'condition' => 'broken'],
            
            // Room F Equipment
            ['room_id' => 6, 'name' => 'Proyektor Portable', 'type' => 'electronics', 'quantity' => 1, 'condition' => 'good'],
            ['room_id' => 6, 'name' => 'Meja Lipat', 'type' => 'furniture', 'quantity' => 15, 'condition' => 'good'],
            ['room_id' => 6, 'name' => 'Kursi Plastik', 'type' => 'furniture', 'quantity' => 30, 'condition' => 'fair'],
        ];

        foreach ($equipment as $item) {
            DB::table('room_equipment')->insert(array_merge($item, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        $this->command->info('✅ Created ' . count($equipment) . ' room equipment items successfully');
    }
}