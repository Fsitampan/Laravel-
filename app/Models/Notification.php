<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'data',
        'read_at',
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationship with User
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scope for unread notifications
    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    // Scope for read notifications
    public function scopeRead($query)
    {
        return $query->whereNotNull('read_at');
    }

    // Scope for specific user
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    // Scope for specific type
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    // Check if notification is read
    public function isRead(): bool
    {
        return !is_null($this->read_at);
    }

    // Mark notification as read
    public function markAsRead(): void
    {
        if (is_null($this->read_at)) {
            $this->update(['read_at' => now()]);
        }
    }

    // Mark notification as unread
    public function markAsUnread(): void
    {
        if (!is_null($this->read_at)) {
            $this->update(['read_at' => null]);
        }
    }

    // Get formatted time ago
    public function getTimeAgoAttribute(): string
    {
        return $this->created_at->diffForHumans();
    }

    // Get notification icon based on type
    public function getIconAttribute(): string
    {
        return match($this->type) {
            'borrowing_created' => 'plus-circle',
            'borrowing_approved' => 'check-circle',
            'borrowing_rejected' => 'x-circle',
            'borrowing_cancelled' => 'ban',
            'borrowing_completed' => 'check-square',
            'borrowing_reminder' => 'clock',
            'room_maintenance' => 'tool',
            'room_available' => 'home',
            'user_registered' => 'user-plus',
            'system_update' => 'settings',
            default => 'bell'
        };
    }

    // Get notification color based on type
    public function getColorAttribute(): string
    {
        return match($this->type) {
            'borrowing_created' => 'blue',
            'borrowing_approved' => 'green',
            'borrowing_rejected' => 'red',
            'borrowing_cancelled' => 'gray',
            'borrowing_completed' => 'emerald',
            'borrowing_reminder' => 'yellow',
            'room_maintenance' => 'orange',
            'room_available' => 'green',
            'user_registered' => 'purple',
            'system_update' => 'blue',
            default => 'gray'
        };
    }

    // Static method to create notification
    public static function createNotification(
        int $userId,
        string $type,
        string $title,
        string $message,
        array $data = null
    ): self {
        return static::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
        ]);
    }

    // Static method to create borrowing notification
    public static function createBorrowingNotification(
        int $userId,
        string $type,
        $borrowing,
        string $customMessage = null
    ): self {
        $titles = [
            'borrowing_created' => 'Peminjaman Baru Dibuat',
            'borrowing_approved' => 'Peminjaman Disetujui',
            'borrowing_rejected' => 'Peminjaman Ditolak',
            'borrowing_cancelled' => 'Peminjaman Dibatalkan',
            'borrowing_completed' => 'Peminjaman Selesai',
            'borrowing_reminder' => 'Pengingat Peminjaman',
        ];

        $defaultMessages = [
            'borrowing_created' => "Peminjaman ruangan {$borrowing->room->name} telah dibuat dan menunggu persetujuan",
            'borrowing_approved' => "Peminjaman ruangan {$borrowing->room->name} telah disetujui",
            'borrowing_rejected' => "Peminjaman ruangan {$borrowing->room->name} telah ditolak",
            'borrowing_cancelled' => "Peminjaman ruangan {$borrowing->room->name} telah dibatalkan",
            'borrowing_completed' => "Peminjaman ruangan {$borrowing->room->name} telah selesai",
            'borrowing_reminder' => "Pengingat: Peminjaman ruangan {$borrowing->room->name} akan dimulai dalam 1 jam",
        ];

        return static::createNotification(
            $userId,
            $type,
            $titles[$type] ?? 'Notifikasi Peminjaman',
            $customMessage ?? $defaultMessages[$type] ?? 'Notifikasi terkait peminjaman ruangan',
            [
                'borrowing_id' => $borrowing->id,
                'room_name' => $borrowing->room->name,
                'borrower_name' => $borrowing->borrower_name,
                'start_time' => $borrowing->start_time,
                'end_time' => $borrowing->end_time,
            ]
        );
    }

    // Static method to notify admins about new borrowing
    public static function notifyAdminsAboutNewBorrowing($borrowing): void
    {
        $adminUsers = User::whereIn('role', ['admin', 'super-admin'])->get();
        
        foreach ($adminUsers as $admin) {
            static::createBorrowingNotification(
                $admin->id,
                'borrowing_created',
                $borrowing
            );
        }
    }

    // Static method to notify user about borrowing status change
    public static function notifyUserAboutBorrowingStatusChange($borrowing, string $status): void
    {
        static::createBorrowingNotification(
            $borrowing->user_id,
            "borrowing_{$status}",
            $borrowing
        );
    }
}