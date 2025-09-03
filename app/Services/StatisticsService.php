<?php

namespace App\Services;

use App\Models\User;
use App\Models\Room;
use App\Models\Borrowing;
use App\Enums\RoomStatus;
use App\Enums\BorrowingStatus;

class StatisticsService
{
    public function getDashboardStatistics(User $user): array
    {
        $totalRooms = Room::count();
        $availableRooms = Room::where('status', RoomStatus::AVAILABLE)->count();
        $occupiedRooms = Room::where('status', RoomStatus::OCCUPIED)->count();
        $maintenanceRooms = Room::where('status', RoomStatus::MAINTENANCE)->count();
        
        $totalBorrowings = Borrowing::count();
        $activeBorrowings = Borrowing::where('status', BorrowingStatus::ACTIVE)->count();
        $pendingBorrowings = Borrowing::where('status', BorrowingStatus::PENDING)->count();
        $completedBorrowings = Borrowing::where('status', BorrowingStatus::COMPLETED)->count();
        
        // User-specific statistics
        $userBorrowings = $user->createdBorrowings();
        $userTotalBorrowings = $userBorrowings->count();
        $userActiveBorrowings = $userBorrowings->where('status', BorrowingStatus::ACTIVE)->count();
        $userPendingBorrowings = $userBorrowings->where('status', BorrowingStatus::PENDING)->count();
        $userCompletedBorrowings = $userBorrowings->where('status', BorrowingStatus::COMPLETED)->count();

        return [
            'totalRooms' => $totalRooms,
            'availableRooms' => $availableRooms,
            'occupiedRooms' => $occupiedRooms,
            'maintenanceRooms' => $maintenanceRooms,
            'totalBorrowings' => $totalBorrowings,
            'activeBorrowings' => $activeBorrowings,
            'pendingBorrowings' => $pendingBorrowings,
            'completedBorrowings' => $completedBorrowings,
            'userTotalBorrowings' => $userTotalBorrowings,
            'userActiveBorrowings' => $userActiveBorrowings,
            'userPendingBorrowings' => $userPendingBorrowings,
            'userCompletedBorrowings' => $userCompletedBorrowings,
            'completionRate' => $user->canManageBorrowers() 
                ? ($totalBorrowings > 0 ? round(($completedBorrowings / $totalBorrowings) * 100) : 0)
                : ($userTotalBorrowings > 0 ? round(($userCompletedBorrowings / $userTotalBorrowings) * 100) : 0),
        ];
    }

    public function getChartData(User $user): array
    {
        return [
            'roomUtilization' => [
                [
                    'name' => 'Tersedia',
                    'value' => Room::where('status', RoomStatus::AVAILABLE)->count(),
                    'color' => '#10b981',
                ],
                [
                    'name' => 'Dipakai',
                    'value' => Room::where('status', RoomStatus::OCCUPIED)->count(),
                    'color' => '#f59e0b',
                ],
                [
                    'name' => 'Pemeliharaan',
                    'value' => Room::where('status', RoomStatus::MAINTENANCE)->count(),
                    'color' => '#ef4444',
                ],
            ],
            'borrowingTrend' => $this->getBorrowingTrendData(),
            'categoryDistribution' => [
                [
                    'name' => 'Pegawai',
                    'value' => Borrowing::where('borrower_category', 'pegawai')->count(),
                    'color' => '#0ea5e9',
                ],
                [
                    'name' => 'Tamu',
                    'value' => Borrowing::where('borrower_category', 'tamu')->count(),
                    'color' => '#f59e0b',
                ],
                [
                    'name' => 'Anak Magang',
                    'value' => Borrowing::where('borrower_category', 'anak-magang')->count(),
                    'color' => '#8b5cf6',
                ],
            ],
        ];
    }

    public function getRecentActivity(User $user): array
    {
        $query = Borrowing::with(['room', 'user', 'creator'])
            ->orderBy('created_at', 'desc')
            ->limit(5);

        if (!$user->canManageBorrowers()) {
            $query->where('created_by', $user->id);
        }

        return $query->get()->map(fn($borrowing) => $borrowing->toInertiaArray())->toArray();
    }

    public function getQuickActions(User $user): array
    {
        $actions = [];
        
        // Room management - Admin/Super Admin only
        if ($user->canManageRooms()) {
            $actions[] = [
                'title' => 'Kelola Ruangan',
                'description' => 'Tambah, edit, atau ubah status ruangan',
                'icon' => 'Building',
                'route' => 'Rooms.Index',
                'restricted' => false,
            ];
        } else {
            $actions[] = [
                'title' => 'Kelola Ruangan',
                'description' => 'Lihat status dan informasi ruangan',
                'icon' => 'Building',
                'route' => 'Rooms.Index',
                'restricted' => true,
            ];
        }

        // Borrowing creation
        $actions[] = [
            'title' => 'Tambah Peminjaman',
            'description' => $user->canCreateBorrowings() ? 'Ajukan peminjaman ruangan baru' : 'Fitur tidak tersedia',
            'icon' => 'UserPlus',
            'route' => 'borrowings.create',
            'restricted' => !$user->canCreateBorrowings(),
        ];

        // Approvals
        $pendingCount = Borrowing::where('status', BorrowingStatus::PENDING)->count();
        $actions[] = [
            'title' => 'Proses Persetujuan',
            'description' => $user->canApproveRejects() 
                ? ($pendingCount > 0 ? "{$pendingCount} peminjaman menunggu persetujuan" : "Tidak ada peminjaman pending")
                : 'Lihat status persetujuan peminjaman Anda',
            'icon' => 'CheckCircle',
            'route' => 'Approvals.Index',
            'badge' => $user->canApproveRejects() && $pendingCount > 0 ? $pendingCount : null,
            'restricted' => !$user->canApproveRejects(),
        ];

        // History
        $actions[] = [
            'title' => $user->canManageBorrowers() ? 'Lihat Semua Riwayat' : 'Riwayat Saya',
            'description' => $user->canManageBorrowers() ? 'Riwayat lengkap semua peminjaman' : 'Riwayat peminjaman Anda',
            'icon' => 'History',
            'route' => 'History.Index',
            'restricted' => false,
        ];

        return $actions;
    }

    private function getBorrowingTrendData(): array
    {
        // This would typically use real data from the database
        // For now, returning mock data for demonstration
        return [
            ['month' => 'Jan', 'peminjaman' => 65, 'pengembalian' => 58],
            ['month' => 'Feb', 'peminjaman' => 59, 'pengembalian' => 62],
            ['month' => 'Mar', 'peminjaman' => 80, 'pengembalian' => 75],
            ['month' => 'Apr', 'peminjaman' => 81, 'pengembalian' => 79],
            ['month' => 'Mei', 'peminjaman' => 56, 'pengembalian' => 58],
            ['month' => 'Jun', 'peminjaman' => 55, 'pengembalian' => 52],
        ];
    }
}