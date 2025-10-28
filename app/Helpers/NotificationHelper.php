<?php

namespace App\Helpers;

use App\Models\Notification;
use App\Models\User;
use App\Models\Borrowing;

class NotificationHelper
{
    /**
     * Notifikasi saat peminjaman dibuat (ke admin)
     */
    public static function notifyBorrowingCreated(Borrowing $borrowing): void
    {
        $admins = User::whereIn('role', ['admin', 'super-admin'])->get();
        
        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'type' => 'borrowing_created',
                'title' => 'Peminjaman Baru Menunggu Persetujuan',
                'message' => "{$borrowing->borrower_name} mengajukan peminjaman {$borrowing->room->name}",
                'data' => [
                    'borrowing_id' => $borrowing->id,
                    'room_name' => $borrowing->room->name,
                    'borrower_name' => $borrowing->borrower_name,
                    'action_url' => '/Approvals',
                ],
            ]);
        }
    }

    /**
     * Notifikasi saat peminjaman disetujui (ke user)
     */
    public static function notifyBorrowingApproved(Borrowing $borrowing): void
    {
        Notification::create([
            'user_id' => $borrowing->user_id,
            'type' => 'borrowing_approved',
            'title' => 'Peminjaman Disetujui',
            'message' => "Peminjaman {$borrowing->room->name} Anda telah disetujui",
            'data' => [
                'borrowing_id' => $borrowing->id,
                'room_name' => $borrowing->room->name,
                'action_url' => "/Borrowings/{$borrowing->id}",
            ],
        ]);
    }

    /**
     * Notifikasi saat peminjaman ditolak (ke user)
     */
    public static function notifyBorrowingRejected(Borrowing $borrowing, string $reason): void
    {
        Notification::create([
            'user_id' => $borrowing->user_id,
            'type' => 'borrowing_rejected',
            'title' => 'Peminjaman Ditolak',
            'message' => "Peminjaman {$borrowing->room->name} Anda ditolak. Alasan: {$reason}",
            'data' => [
                'borrowing_id' => $borrowing->id,
                'room_name' => $borrowing->room->name,
                'rejection_reason' => $reason,
                'action_url' => "/Borrowings/{$borrowing->id}",
            ],
        ]);
    }

    /**
     * ✅ FITUR BARU: Notifikasi saat peminjaman dibatalkan oleh user (ke admin)
     */
        /**
     * ✅ PERBAIKAN: Type hint yang benar
     */
    public static function notifyBorrowingCancelled($borrowing, string $reason): void
    {
        $admins = User::whereIn('role', ['admin', 'super-admin'])->get();
        
        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'type' => 'borrowing_cancelled',
                'title' => 'Peminjaman Dibatalkan oleh User',
                'message' => "{$borrowing->borrower_name} membatalkan peminjaman {$borrowing->room->name}. Alasan: {$reason}",
                'data' => [
                    'borrowing_id' => $borrowing->id,
                    'room_name' => $borrowing->room->name,
                    'borrower_name' => $borrowing->borrower_name,
                    'cancellation_reason' => $reason,
                    'action_url' => "/Borrowings/{$borrowing->id}",
                ],
            ]);
        }
    }
}