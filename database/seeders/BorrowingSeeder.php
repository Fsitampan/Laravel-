<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Carbon\Carbon;
use App\Models\Borrowing;
use App\Models\BorrowingHistory;

class BorrowingSeeder extends Seeder
{
    public function run(): void
    {
        // Clear existing borrowings and history
        Borrowing::truncate();
        BorrowingHistory::truncate();

        $borrowings = [
            // Active Borrowing
            [
                'room_id' => 3,
                'user_id' => 5,
                'borrower_name' => 'Andi Pratama, S.ST',
                'borrower_email' => 'andi.pratama@bps.go.id',
                'borrower_phone' => '0761-21355',
                'borrower_identification' => '1471050101800001',
                'borrower_category' => 'pegawai',
                'borrower_department' => 'Statistik Produksi',
                'borrower_institution' => 'BPS Provinsi Riau',
                'borrow_date' => Carbon::now()->format('Y-m-d'),
                'start_time' => '08:00',
                'end_time' => '12:00',
                'return_date' => Carbon::now()->format('Y-m-d'),
                'purpose' => 'Workshop Metodologi Survei Industri Besar dan Sedang',
                'status' => 'active',
                'approved_by' => 2,
                'approved_at' => Carbon::now()->subHours(3),
                'notes' => 'Mohon disiapkan microphone wireless dan sound system',
                'created_by' => 5,
                'participant_count' => 50,
                'equipment_needed' => ['projector', 'sound system', 'microphone'],
                'is_recurring' => false,
                'recurring_pattern' => null,
                'recurring_end_date' => null,
            ],

            // Pending Approval (Recurring Example)
            [
                'room_id' => 1,
                'user_id' => 9,
                'borrower_name' => 'Prof. Dr. Hendri Nelawan',
                'borrower_email' => 'hendri.nelawan@unri.ac.id',
                'borrower_phone' => '0761-567890',
                'borrower_identification' => '1471050201750001',
                'borrower_category' => 'tamu',
                'borrower_department' => 'Universitas Riau - Fakultas Ekonomi',
                'borrower_institution' => 'Universitas Riau',
                'borrow_date' => Carbon::now()->addDays(3)->format('Y-m-d'),
                'start_time' => '10:00',
                'end_time' => '12:00',
                'return_date' => Carbon::now()->addDays(3)->format('Y-m-d'),
                'purpose' => 'Diskusi Kerjasama Penelitian Ekonomi Regional Riau',
                'status' => 'pending',
                'notes' => 'Meeting dengan Kepala BPS terkait penelitian',
                'created_by' => 9,
                'participant_count' => 20,
                'equipment_needed' => ['whiteboard', 'LCD screen'],
                'is_recurring' => true,
                'recurring_pattern' => 'weekly',
                'recurring_end_date' => Carbon::now()->addWeeks(4)->format('Y-m-d'),
            ],

            // Completed Borrowing
            [
                'room_id' => 4,
                'user_id' => 7,
                'borrower_name' => 'Muhammad Rizky, A.Md',
                'borrower_email' => 'rizky.muhammad@bps.go.id',
                'borrower_phone' => '0761-21357',
                'borrower_identification' => '1471051101900001',
                'borrower_category' => 'pegawai',
                'borrower_department' => 'Neraca Wilayah dan Analisis Statistik',
                'borrower_institution' => 'BPS Provinsi Riau',
                'borrow_date' => Carbon::yesterday()->format('Y-m-d'),
                'start_time' => '09:00',
                'end_time' => '12:00',
                'return_date' => Carbon::yesterday()->format('Y-m-d'),
                'actual_return_date' => Carbon::yesterday()->setTime(11, 30),
                'purpose' => 'Diskusi Tim Penyusunan Analisis PDRB Triwulan III',
                'status' => 'completed',
                'approved_by' => 3,
                'approved_at' => Carbon::yesterday()->subDay()->setTime(16, 0),
                'notes' => 'Diskusi berjalan lancar',
                'created_by' => 7,
                'participant_count' => 15,
                'equipment_needed' => ['projector'],
                'is_recurring' => false,
                'recurring_pattern' => null,
                'recurring_end_date' => null,
            ],

            // Rejected Borrowing
            [
                'room_id' => 1,
                'user_id' => 12,
                'borrower_name' => 'Novi Oktavia',
                'borrower_email' => 'novi.oktavia@student.uin-suska.ac.id',
                'borrower_phone' => '0813-4567-8901',
                'borrower_identification' => '1471054201990001',
                'borrower_category' => 'anak-magang',
                'borrower_department' => 'Magang - IPDS',
                'borrower_institution' => 'UIN Suska Riau',
                'borrow_date' => Carbon::now()->subDays(2)->format('Y-m-d'),
                'start_time' => '10:00',
                'end_time' => '12:00',
                'return_date' => Carbon::now()->subDays(2)->format('Y-m-d'),
                'purpose' => 'Diskusi Kelompok Mahasiswa PKL',
                'status' => 'rejected',
                'approved_by' => 2,
                'approved_at' => Carbon::now()->subDays(3)->setTime(14, 0),
                'rejection_reason' => 'Ruang A khusus untuk pimpinan dan tamu VIP',
                'notes' => 'Silakan gunakan ruang lain yang tersedia',
                'created_by' => 12,
                'participant_count' => 10,
                'equipment_needed' => ['laptop', 'proyektor'],
                'is_recurring' => false,
                'recurring_pattern' => null,
                'recurring_end_date' => null,
            ],
        ];

        foreach ($borrowings as $borrowingData) {
            $borrowingData['created_at'] = now();
            $borrowingData['updated_at'] = now();
            
            $borrowing = Borrowing::create($borrowingData);
            $this->createBorrowingHistory($borrowing);
        }

        $this->command->info('✅ Created ' . count($borrowings) . ' borrowings with history successfully');
    }

    private function createBorrowingHistory($borrowing): void
    {
        $histories = [];

        $histories[] = [
            'borrowing_id' => $borrowing->id,
            'action' => 'created',
            'old_status' => null,
            'new_status' => 'pending',
            'comment' => 'Peminjaman ruangan dibuat',
            'performed_by' => $borrowing->created_by,
            'performed_at' => $borrowing->created_at,
        ];

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
