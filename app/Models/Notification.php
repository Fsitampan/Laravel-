<?php

namespace App\Models;
use App\Models\User;
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

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    public function scopeRead($query)
    {
        return $query->whereNotNull('read_at');
    }

    public function scopeForUser($query, $userId)
{
    $user = User::find($userId);

    return $query->where(function ($q) use ($user, $userId) {
        // personal notifications
        $q->where('user_id', $userId)
          // include global notifications (system-wide)
          ->orWhereNull('user_id');

        // jika Anda menyimpan role-targeting di data->roles (array), include juga
        if ($user) {
            // contoh: data->roles = ["admin","super-admin"]
            $q->orWhereJsonContains('data->roles', $user->role);
        }
    });
}

    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function isRead(): bool
    {
        return !is_null($this->read_at);
    }

    public function markAsRead(): void
    {
        if (is_null($this->read_at)) {
            $this->update(['read_at' => now()]);
        }
    }

    public function markAsUnread(): void
    {
        if (!is_null($this->read_at)) {
            $this->update(['read_at' => null]);
        }
    }

    public function getTimeAgoAttribute(): string
    {
        return $this->created_at->diffForHumans();
    }

    public function getIconAttribute(): string
    {
        return match($this->type) {
            'borrowing_created' => 'plus-circle',
            'borrowing_approved' => 'check-circle',
            'borrowing_rejected' => 'x-circle',
            'borrowing_cancelled' => 'ban',
            'borrowing_completed' => 'check-square',
            'borrowing_reminder' => 'clock',
            'borrowing_updated' => 'edit',
            'borrowing_deleted' => 'trash',
            'room_maintenance', 'system_maintenance' => 'tool', // ← Tambahkan ini
            'room_available' => 'home',
            'room_created' => 'plus',
            'room_updated' => 'edit',
            'room_deleted' => 'trash',
            'user_registered' => 'user-plus',
            'user_profile_updated' => 'user-cog',
            'user_deleted' => 'user-minus',
            'system_update' => 'settings',
            'system_alert' => 'alert-triangle', // ← Tambahkan ini
            default => 'bell'
        };
    }

    public function getColorAttribute(): string
    {
        return match($this->type) {
            'borrowing_created' => 'blue',
            'borrowing_approved' => 'green',
            'borrowing_rejected' => 'red',
            'borrowing_cancelled' => 'gray',
            'borrowing_completed' => 'emerald',
            'borrowing_reminder' => 'yellow',
            'borrowing_updated' => 'blue',
            'borrowing_deleted' => 'gray',
            'room_maintenance', 'system_maintenance' => 'orange', // ← Tambahkan ini
            'room_available' => 'green',
            'room_created' => 'blue',
            'room_updated' => 'indigo',
            'room_deleted' => 'gray',
            'user_registered' => 'purple',
            'user_profile_updated' => 'purple',
            'user_deleted' => 'gray',
            'system_update' => 'blue',
            'system_alert' => 'yellow', // ← Tambahkan ini
            default => 'gray'
        };
    }

    // Tambahkan method untuk get category
    public function getCategoryAttribute(): string
    {
        if (str_starts_with($this->type, 'user_')) return 'user';
        if (str_starts_with($this->type, 'room_')) return 'room';
        if (str_starts_with($this->type, 'borrowing_')) return 'borrowing';
        return 'system'; // ← system_maintenance akan masuk sini
    }

   public static function createNotification(
        ?int $userId,
        string $type,
        string $title,
        string $message,
        ?array $data = null
    ): self {
        return static::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
        ]);
    }

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
            'borrowing_created' => "Peminjaman  {$borrowing->room->name} telah dibuat dan menunggu persetujuan",
            'borrowing_approved' => "Peminjaman  {$borrowing->room->name} telah disetujui",
            'borrowing_rejected' => "Peminjaman  {$borrowing->room->name} telah ditolak",
            'borrowing_cancelled' => "Peminjaman  {$borrowing->room->name} telah dibatalkan",
            'borrowing_completed' => "Peminjaman  {$borrowing->room->name} telah selesai",
            'borrowing_reminder' => "Pengingat: Peminjaman  {$borrowing->room->name} akan dimulai dalam 1 jam",
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

    public static function notifyAdminsAboutNewBorrowing($borrowing): void
    {
        $adminUsers = \App\Models\User::whereIn('role', ['admin', 'super-admin'])->get();
        
        foreach ($adminUsers as $admin) {
            static::createBorrowingNotification(
                $admin->id,
                'borrowing_created',
                $borrowing
            );
        }
    }

    public static function notifyUserAboutBorrowingStatusChange($borrowing, string $status): void
    {
        static::createBorrowingNotification(
            $borrowing->user_id,
            "borrowing_{$status}",
            $borrowing
        );
    }
}