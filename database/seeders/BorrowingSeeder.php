<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Carbon\Carbon;
use App\Models\Borrowing;
use App\Models\BorrowingHistory;

class BorrowingSeeder extends Seeder
{
    /**
     * Seed the BPS Riau Borrowings
     */
    public function run(): void
    {
        // Clear existing borrowings and history
        Borrowing::truncate();
        BorrowingHistory::truncate();

        $borrowings = [
            // Active/Current Borrowings
            [
                'room_id' => 3, // Room C (Seminar)
                'user_id' => 5, // Andi Pratama
                'borrower_name' => 'Andi Pratama, S.ST',
                'borrower_email' => 'andi.pratama@bps.go.id',
                'borrower_phone' => '0761-21355',
                'borrower_identification' => '1471050101800001',
                'borrower_category' => 'pegawai',
                'borrower_department' => 'Statistik Produksi',
                'borrow_date' => Carbon::now()->format('Y-m-d'),
                'start_time' => '08:00',
                'end_time' => '12:00',
                'return_date' => Carbon::now()->format('Y-m-d'),
                'purpose' => 'Workshop Metodologi Survei Industri Besar dan Sedang',
                'status' => 'active',
                'approved_by' => 2,
                'approved_at' => Carbon::now()->subHours(3),
                'notes' => 'Mohon disiapkan microphone wireless dan sound system untuk presenter eksternal',
                'created_by' => 5,
            ],
            
            // Pending Approvals (More data for testing)
            [
                'room_id' => 1, // Room A (Kepala BPS)
                'user_id' => 9, // Prof. Hendri (Guest)
                'borrower_name' => 'Prof. Dr. Hendri Nelawan',
                'borrower_email' => 'hendri.nelawan@unri.ac.id',
                'borrower_phone' => '0761-567890',
                'borrower_identification' => '1471050201750001',
                'borrower_category' => 'tamu',
                'borrower_department' => 'Universitas Riau - Fakultas Ekonomi',
                'borrow_date' => Carbon::now()->addDays(3)->format('Y-m-d'),
                'start_time' => '10:00',
                'end_time' => '12:00',
                'return_date' => Carbon::now()->addDays(3)->format('Y-m-d'),
                'purpose' => 'Diskusi Kerjasama Penelitian Ekonomi Regional Riau',
                'status' => 'pending',
                'notes' => 'Meeting dengan Kepala BPS terkait proposal penelitian bersama tentang PDRB Riau',
                'created_by' => 9,
            ],
            [
                'room_id' => 2, // Room B (Koordinasi)
                'user_id' => 6, // Sari Wahyuni
                'borrower_name' => 'Sari Wahyuni, S.Si',
                'borrower_email' => 'sari.wahyuni@bps.go.id',
                'borrower_phone' => '0761-21356',
                'borrower_identification' => '1471054201850001',
                'borrower_category' => 'pegawai',
                'borrower_department' => 'Statistik Distribusi',
                'borrow_date' => Carbon::now()->addDays(1)->format('Y-m-d'),
                'start_time' => '14:00',
                'end_time' => '16:00',
                'return_date' => Carbon::now()->addDays(1)->format('Y-m-d'),
                'purpose' => 'Rapat Koordinasi Persiapan Survei Harga Konsumen',
                'status' => 'pending',
                'notes' => 'Koordinasi dengan tim lapangan untuk persiapan survei bulan depan',
                'created_by' => 6,
            ],
            [
                'room_id' => 4, // Room D (Diskusi Tim)
                'user_id' => 11, // Fajar (Intern)
                'borrower_name' => 'Fajar Ramadhan',
                'borrower_email' => 'fajar.ramadhan@student.unri.ac.id',
                'borrower_phone' => '0812-3456-7890',
                'borrower_identification' => '1471051101990001',
                'borrower_category' => 'anak-magang',
                'borrower_department' => 'Magang - Statistik Sosial',
                'borrow_date' => Carbon::now()->addDays(2)->format('Y-m-d'),
                'start_time' => '09:00',
                'end_time' => '11:00',
                'return_date' => Carbon::now()->addDays(2)->format('Y-m-d'),
                'purpose' => 'Diskusi Kelompok Project Penelitian Kemiskinan',
                'status' => 'pending',
                'notes' => 'Diskusi dengan supervisor dan mentor magang',
                'created_by' => 11,
            ],
            [
                'room_id' => 6, // Room F (Multiguna)
                'user_id' => 10, // Dr. Ratna (Guest)
                'borrower_name' => 'Dr. Ratna Sari Dewi',
                'borrower_email' => 'ratna.sari@bappeda.riau.go.id',
                'borrower_phone' => '0761-123456',
                'borrower_identification' => '1471054201780001',
                'borrower_category' => 'tamu',
                'borrower_department' => 'Bappeda Provinsi Riau',
                'borrow_date' => Carbon::now()->addDays(5)->format('Y-m-d'),
                'start_time' => '13:00',
                'end_time' => '17:00',
                'return_date' => Carbon::now()->addDays(5)->format('Y-m-d'),
                'purpose' => 'Workshop Analisis Data RPJMD Provinsi Riau',
                'status' => 'pending',
                'notes' => 'Workshop untuk tim Bappeda dalam analisis data statistik untuk RPJMD',
                'created_by' => 10,
            ],
            [
                'room_id' => 2, // Room B (Koordinasi)
                'user_id' => 8, // Dewi (Employee)
                'borrower_name' => 'Dewi Purnama Sari, S.E',
                'borrower_email' => 'dewi.purnama@bps.go.id',
                'borrower_phone' => '0761-21358',
                'borrower_identification' => '1471054201800001',
                'borrower_category' => 'pegawai',
                'borrower_department' => 'Tata Usaha',
                'borrow_date' => Carbon::now()->addWeek()->format('Y-m-d'),
                'start_time' => '08:30',
                'end_time' => '10:30',
                'return_date' => Carbon::now()->addWeek()->format('Y-m-d'),
                'purpose' => 'Rapat Evaluasi Kinerja Semester I',
                'status' => 'pending',
                'notes' => 'Rapat internal evaluasi dan planning semester mendatang',
                'created_by' => 8,
            ],
            
            // Completed Borrowings (Recent History)
            [
                'room_id' => 4, // Room D (Diskusi Tim)
                'user_id' => 7, // Muhammad Rizky
                'borrower_name' => 'Muhammad Rizky, A.Md',
                'borrower_email' => 'rizky.muhammad@bps.go.id',
                'borrower_phone' => '0761-21357',
                'borrower_identification' => '1471051101900001',
                'borrower_category' => 'pegawai',
                'borrower_department' => 'Neraca Wilayah dan Analisis Statistik',
                'borrow_date' => Carbon::yesterday()->format('Y-m-d'),
                'start_time' => '09:00',
                'end_time' => '12:00',
                'return_date' => Carbon::yesterday()->format('Y-m-d'),
                'actual_return_date' => Carbon::yesterday()->setTime(11, 30),
                'purpose' => 'Diskusi Tim Penyusunan Analisis PDRB Triwulan III',
                'status' => 'completed',
                'approved_by' => 3,
                'approved_at' => Carbon::yesterday()->subDay()->setTime(16, 0),
                'notes' => 'Diskusi berjalan lancar, terima kasih atas fasilitasnya',
                'created_by' => 7,
            ],
            [
                'room_id' => 6, // Room F (Multiguna)
                'user_id' => 11, // Fajar (Intern)
                'borrower_name' => 'Fajar Ramadhan',
                'borrower_email' => 'fajar.ramadhan@student.unri.ac.id',
                'borrower_phone' => '0812-3456-7890',
                'borrower_identification' => '1471051101990001',
                'borrower_category' => 'anak-magang',
                'borrower_department' => 'Magang - Statistik Sosial',
                'borrow_date' => Carbon::now()->subDays(3)->format('Y-m-d'),
                'start_time' => '13:00',
                'end_time' => '15:00',
                'return_date' => Carbon::now()->subDays(3)->format('Y-m-d'),
                'actual_return_date' => Carbon::now()->subDays(3)->setTime(15, 0),
                'purpose' => 'Presentasi Hasil Magang dan Penelitian Tugas Akhir',
                'status' => 'completed',
                'approved_by' => 4,
                'approved_at' => Carbon::now()->subDays(4)->setTime(10, 0),
                'notes' => 'Presentasi hasil penelitian tentang kemiskinan di Riau',
                'created_by' => 11,
            ],
            
            // Rejected Booking
            [
                'room_id' => 1, // Room A (Kepala BPS)
                'user_id' => 12, // Novi (Intern)
                'borrower_name' => 'Novi Oktavia',
                'borrower_email' => 'novi.oktavia@student.uin-suska.ac.id',
                'borrower_phone' => '0813-4567-8901',
                'borrower_identification' => '1471054201990001',
                'borrower_category' => 'anak-magang',
                'borrower_department' => 'Magang - IPDS',
                'borrow_date' => Carbon::now()->subDays(2)->format('Y-m-d'),
                'start_time' => '10:00',
                'end_time' => '12:00',
                'return_date' => Carbon::now()->subDays(2)->format('Y-m-d'),
                'purpose' => 'Diskusi Kelompok Mahasiswa PKL',
                'status' => 'rejected',
                'approved_by' => 2,
                'approved_at' => Carbon::now()->subDays(3)->setTime(14, 0),
                'rejection_reason' => 'Ruang A dikhususkan untuk meeting pimpinan dan tamu VIP. Silakan gunakan ruang lain yang tersedia.',
                'notes' => 'Mohon penggunaan ruang yang sesuai dengan keperluan',
                'created_by' => 12,
            ],
        ];

        foreach ($borrowings as $borrowingData) {
            $borrowingData['created_at'] = now();
            $borrowingData['updated_at'] = now();
            
            $borrowing = Borrowing::create($borrowingData);
            
            // Create borrowing history
            $this->createBorrowingHistory($borrowing);
        }

        $this->command->info('✅ Created ' . count($borrowings) . ' borrowings with history successfully');
    }

    private function createBorrowingHistory($borrowing): void
    {
        $histories = [];
        
        // Created history
        $histories[] = [
            'borrowing_id' => $borrowing->id,
            'action' => 'created',
            'old_status' => null,
            'new_status' => 'pending',
            'comment' => 'Peminjaman ruangan dibuat',
            'performed_by' => $borrowing->created_by,
            'performed_at' => $borrowing->created_at,
        ];

        // Status changes based on current status
        if (in_array($borrowing->status, ['approved', 'active', 'completed', 'rejected'])) {
            $histories[] = [
                'borrowing_id' => $borrowing->id,
                'action' => $borrowing->status === 'rejected' ? 'rejected' : 'approved',
                'old_status' => 'pending',
                'new_status' => $borrowing->status === 'rejected' ? 'rejected' : 'approved',
                'comment' => $borrowing->status === 'rejected' 
                    ? 'Peminjaman ditolak: ' . $borrowing->rejection_reason
                    : 'Peminjaman disetujui',
                'performed_by' => $borrowing->approved_by,
                'performed_at' => $borrowing->approved_at,
            ];
        }

        if ($borrowing->status === 'active') {
            $histories[] = [
                'borrowing_id' => $borrowing->id,
                'action' => 'started',
                'old_status' => 'approved',
                'new_status' => 'active',
                'comment' => 'Peminjaman dimulai',
                'performed_by' => $borrowing->created_by,
                'performed_at' => $borrowing->borrow_date . ' ' . $borrowing->start_time,
            ];
        }

        if ($borrowing->status === 'completed') {
            $histories[] = [
                'borrowing_id' => $borrowing->id,
                'action' => 'completed',
                'old_status' => 'active',
                'new_status' => 'completed',
                'comment' => 'Peminjaman selesai',
                'performed_by' => $borrowing->created_by,
                'performed_at' => $borrowing->actual_return_date,
            ];
        }

        foreach ($histories as $history) {
            BorrowingHistory::create($history);
        }
    }
}