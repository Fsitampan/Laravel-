<?php

namespace App\Helpers;

use App\Models\Notification;
use App\Models\User;

class NotificationHelper
{
    /**
     * Kirim notifikasi ke user
     */
    public static function send($userId, $type, $title, $message, $data = null)
    {
        return Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
            'read_at' => null,
        ]);
    }

    /**
     * Kirim notifikasi ke multiple users
     */
    public static function sendToMany(array $userIds, $type, $title, $message, $data = null)
    {
        $notifications = [];
        foreach ($userIds as $userId) {
            $notifications[] = [
                'user_id' => $userId,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'data' => $data ? json_encode($data) : null,
                'read_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        
        return Notification::insert($notifications);
    }

    /**
     * Kirim notifikasi ke semua admin
     */
    public static function sendToAdmins($type, $title, $message, $data = null)
    {
        $adminIds = User::whereIn('role', ['admin', 'super-admin'])->pluck('id')->toArray();
        return self::sendToMany($adminIds, $type, $title, $message, $data);
    }

    /**
     * Kirim notifikasi peminjaman baru ke admin
     */
    public static function notifyBorrowingCreated($borrowing)
    {
        return self::sendToAdmins(
            'borrowing_created',
            'Peminjaman Baru',
            "Peminjaman {$borrowing->room->name} oleh {$borrowing->borrower_name} menunggu persetujuan",
            ['borrowing_id' => $borrowing->id, 'action_url' => "/Approvals"]
        );
    }

    /**
     * Kirim notifikasi peminjaman disetujui ke user
     */
    public static function notifyBorrowingApproved($borrowing)
    {
        return self::send(
            $borrowing->user_id,
            'borrowing_approved',
            'Peminjaman Disetujui',
            "Peminjaman  {$borrowing->room->name} telah disetujui",
            ['borrowing_id' => $borrowing->id, 'action_url' => "/Borrowings/{$borrowing->id}"]
        );
    }

    /**
     * Kirim notifikasi peminjaman ditolak ke user
     */
    public static function notifyBorrowingRejected($borrowing, $rejectionReason = null)
    {
        $reason = $rejectionReason ?? $borrowing->rejection_reason ?? 'Tidak ada alasan yang diberikan';
        
        return self::send(
            $borrowing->user_id,
            'borrowing_rejected',
            'Peminjaman Ditolak',
            "Peminjaman  {$borrowing->room->name} telah ditolak. Alasan: {$reason}",
            ['borrowing_id' => $borrowing->id, 'action_url' => "/Borrowings/{$borrowing->id}"]
        );
    }

    /**
     * Kirim notifikasi peminjaman aktif ke user
     */
    public static function notifyBorrowingActive($borrowing)
    {
        return self::send(
            $borrowing->user_id,
            'borrowing_updated',
            'Peminjaman Aktif',
            "Peminjaman  {$borrowing->room->name} telah aktif",
            ['borrowing_id' => $borrowing->id, 'action_url' => "/Borrowings/{$borrowing->id}"]
        );
    }

    /**
     * Kirim notifikasi peminjaman selesai ke user
     */
    public static function notifyBorrowingCompleted($borrowing)
    {
        return self::send(
            $borrowing->user_id,
            'borrowing_completed',
            'Peminjaman Selesai',
            "Peminjaman  {$borrowing->room->name} telah selesai",
            ['borrowing_id' => $borrowing->id, 'action_url' => "/Borrowings/{$borrowing->id}"]
        );
    }

    /**
     * Kirim notifikasi pengingat peminjaman
     */
    public static function notifyBorrowingReminder($borrowing)
    {
        return self::send(
            $borrowing->user_id,
            'borrowing_reminder',
            'Pengingat Peminjaman',
            "Peminjaman  {$borrowing->room->name} akan dimulai dalam 1 jam",
            ['borrowing_id' => $borrowing->id, 'action_url' => "/Borrowings/{$borrowing->id}"]
        );
    }

    /**
     * Kirim notifikasi ruangan maintenance ke admin
     */
    public static function notifyRoomMaintenance($room)
    {
        return self::sendToAdmins(
            'room_maintenance',
            'Ruangan Maintenance',
            "Ruang {$room->name} sedang dalam perbaikan",
            ['room_id' => $room->id, 'action_url' => "/Rooms/{$room->id}"]
        );
    }

    /**
     * Kirim notifikasi user baru ke admin
     */
    public static function notifyUserRegistered($user)
    {
        return self::sendToAdmins(
            'user_registered',
            'Pengguna Baru Terdaftar',
            "Pengguna baru {$user->name} telah terdaftar",
            ['user_id' => $user->id, 'action_url' => "/users/{$user->id}"]
        );
    }
}