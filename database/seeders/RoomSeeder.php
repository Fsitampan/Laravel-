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
                'name' => 'Ruang Rapat Kepala BPS',
                'code' => 'A',
                'description' => 'Ruang rapat utama untuk meeting pimpinan dan tamu VIP. Dilengkapi dengan fasilitas modern dan suasana formal yang nyaman.',
                'capacity' => 20,
                'status' => 'tersedia',
                'location' => 'Lantai 2 - Gedung Utama',
                'facilities' => json_encode([
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
                ]),
                'notes' => 'Ruangan khusus untuk meeting pimpinan dan tamu VIP',
                'created_by' => 1,
                'updated_by' => 1,
            ],
            [
                'name' => 'Ruang Rapat Koordinasi',
                'code' => 'B',
                'description' => 'Ruang untuk koordinasi antar bidang dan meeting rutin. Cocok untuk diskusi tim dan presentasi internal.',
                'capacity' => 15,
                'status' => 'tersedia',
                'location' => 'Lantai 2 - Gedung Utama',
                'facilities' => json_encode([
                    'AC Split',
                    'Proyektor LCD',
                    'Screen Proyektor',
                    'WiFi',
                    'Meja Rapat',
                    'Kursi Kantor',
                    'Whiteboard',
                    'Flip Chart'
                ]),
                'notes' => 'Ruangan untuk koordinasi dan meeting rutin',
                'created_by' => 1,
                'updated_by' => 1,
            ],
            [
                'name' => 'Ruang Seminar dan Pelatihan',
                'code' => 'C',
                'description' => 'Ruang serbaguna untuk seminar, workshop, dan kegiatan pelatihan. Layout fleksibel untuk berbagai jenis acara.',
                'capacity' => 50,
                'status' => 'dipakai',
                'location' => 'Lantai 1 - Gedung Utama',
                'facilities' => json_encode([
                    'AC Central',
                    'Proyektor LCD HD',
                    'Screen Besar',
                    'Sound System Lengkap',
                    'Microphone Wireless',
                    'WiFi Khusus',
                    'Kursi Auditorium',
                    'Panggung Kecil',
                    'Pencahayaan Optimal'
                ]),
                'notes' => 'Ruangan serbaguna untuk acara besar',
                'created_by' => 1,
                'updated_by' => 1,
            ],
            [
                'name' => 'Ruang Diskusi Tim',
                'code' => 'D',
                'description' => 'Ruang untuk diskusi kelompok kecil dan brainstorming. Suasana informal dan kondusif untuk kreativitas.',
                'capacity' => 10,
                'status' => 'tersedia',
                'location' => 'Lantai 1 - Gedung Utama',
                'facilities' => json_encode([
                    'AC Split',
                    'TV LED 55 inch',
                    'WiFi',
                    'Meja Bundar',
                    'Kursi Santai',
                    'Whiteboard Kecil',
                    'Marker Set',
                    'Dispenser Air'
                ]),
                'notes' => 'Ruangan santai untuk diskusi tim kecil',
                'created_by' => 1,
                'updated_by' => 1,
            ],
            [
                'name' => 'Ruang Konsultasi',
                'code' => 'E',
                'description' => 'Ruang khusus untuk konsultasi dengan stakeholder eksternal dan meeting dengan tamu. Privasi terjamin.',
                'capacity' => 8,
                'status' => 'pemeliharaan',
                'location' => 'Lantai 1 - Gedung Utama',
                'facilities' => json_encode([
                    'AC Split',
                    'TV LED',
                    'WiFi',
                    'Meja Meeting Kecil',
                    'Kursi Nyaman',
                    'Lemari Dokumen',
                    'Dispenser Air',
                    'Sofa Set'
                ]),
                'notes' => 'Sedang dalam pemeliharaan AC dan renovasi',
                'created_by' => 1,
                'updated_by' => 1,
            ],
            [
                'name' => 'Ruang Multiguna',
                'code' => 'F',
                'description' => 'Ruang fleksibel untuk berbagai keperluan seperti workshop, training, dan acara khusus. Dapat dikonfigurasi sesuai kebutuhan.',
                'capacity' => 30,
                'status' => 'tersedia',
                'location' => 'Lantai 1 - Gedung Annex',
                'facilities' => json_encode([
                    'AC Central',
                    'Proyektor Portable',
                    'Screen Portable',
                    'Sound System',
                    'WiFi',
                    'Meja Lipat',
                    'Kursi Plastik',
                    'Whiteboard Besar',
                    'Flip Chart'
                ]),
                'notes' => 'Ruangan fleksibel dengan layout yang dapat diubah',
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