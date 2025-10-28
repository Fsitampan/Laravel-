<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Room;

class RoomSeeder extends Seeder
{
    /**
     * Seed the BPS Riau Rooms
     */
    public function run(): void
    {
        // Clear existing rooms
        Room::truncate();

        $rooms = [
            [
                'name' => 'Ruang Sungkai',
                'code' => 'A',
                'description' => 'Ruang rapat dengan kapasitas 20 orang, dilengkapi meja rapat besar dan proyektor.',
                'image' => 'rooms/sungkai.jpg', // ✅ Path relatif dari storage/app/public
                'capacity' => 20,
                'status' => 'tersedia',
                'location' => 'Lantai 2',
                'facilities' => [ // ✅ Langsung array, Laravel otomatis cast ke JSON
                    'AC Split',
                    'Proyektor LCD',
                    'Screen Proyektor',
                    'Sound System',
                    'WiFi Khusus',
                    'Meja Rapat Oval',
                    'Kursi Eksekutif',
                    'Whiteboard',
                    'Flip Chart',
                    'Telepon Konferensi'
                ],
                'notes' => 'Ruangan rapat',
                'created_by' => 1,
                'updated_by' => 1,
            ],
            [
                'name' => 'Ruang Rapat Ex Distribusi',
                'code' => 'B',
                'description' => 'Ruang untuk koordinasi antar bidang dan meeting rutin. Cocok untuk diskusi tim dan presentasi internal.',
                'capacity' => 20,
                'status' => 'tersedia',
                'location' => 'Lantai 2',
                'facilities' => [
                    'AC Split',
                    'Proyektor LCD',
                    'Screen Proyektor',
                    'WiFi',
                    'Meja Rapat',
                    'Kursi Kantor',
                    'Whiteboard',
                    'Flip Chart'
                ],
                'notes' => 'Ruangan untuk koordinasi dan meeting rutin',
                'created_by' => 1,
                'updated_by' => 1,
            ],
            [
                'name' => 'Ruang Aula',
                'code' => 'C',
                'description' => 'Aula utama BPS yang dapat digunakan untuk acara besar dan rapat umum.',
                'capacity' => 100,
                'image' => 'public/storage/rooms/aula.jpg',
                'status' => 'dipakai',
                'location' => 'Lantai 3',
                'facilities' => [
                    'AC Central',
                    'Proyektor LCD HD',
                    'Screen Besar',
                    'Sound System Lengkap',
                    'Microphone Wireless',
                    'WiFi Khusus',
                    'Kursi Auditorium',
                    'Panggung Kecil',
                    'Pencahayaan Optimal'
                ],
                'notes' => 'Ruangan serbaguna untuk acara besar',
                'created_by' => 1,
                'updated_by' => 1,
            ],
            [
                'name' => 'Ruang Agro',
                'code' => 'D',
                'description' => 'Ruang untuk diskusi kelompok kecil dan brainstorming. Suasana informal dan kondusif untuk kreativitas.',
                'capacity' => 10,
                'status' => 'tersedia',
                'location' => 'Lantai 3',
                'facilities' => [
                    'AC Split',
                    'TV LED 55 inch',
                    'WiFi',
                    'Meja Bundar',
                    'Kursi Santai',
                    'Whiteboard Kecil',
                    'Marker Set',
                    'Dispenser Air'
                ],
                'notes' => 'Ruangan santai untuk diskusi tim kecil',
                'created_by' => 1,
                'updated_by' => 1,
            ],
            [
                'name' => 'Ruangan Rapat PST',
                'code' => 'E',
                'description' => 'Ruang Rapat',
                'capacity' => 6,
                'status' => 'pemeliharaan',
                'location' => 'Lantai 1',
                'facilities' => [
                    'AC Split',
                    'TV LED',
                    'WiFi',
                    'Meja Meeting Kecil',
                    'Kursi Nyaman',
                    'Lemari Dokumen',
                    'Dispenser Air',
                    'Sofa Set'
                ],
                'notes' => 'Sedang dalam pemeliharaan AC dan renovasi',
                'created_by' => 1,
                'updated_by' => 1,
            ],
            [
                'name' => 'Ruangan Rapat Ex Distribusi ke-2',
                'code' => 'F',
                'description' => 'Ruang kecil di dalam ruangan Ex-Distribusi',
                'capacity' => 30,
                'status' => 'tersedia',
                'location' => 'Lantai 2',
                'facilities' => [
                    'AC Central',
                    'Proyektor Portable',
                    'Screen Portable',
                    'Sound System',
                    'WiFi',
                    'Meja Lipat',
                    'Kursi Plastik',
                    'Whiteboard Besar',
                    'Flip Chart'
                ],
                'notes' => 'Ruangan kecil',
                'created_by' => 1,
                'updated_by' => 1,
            ],
        ];

        foreach ($rooms as $roomData) {
            Room::create($roomData);
        }

        $this->command->info('✅ Created ' . count($rooms) . ' rooms successfully');
    }
}
