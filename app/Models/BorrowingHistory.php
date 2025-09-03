<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BorrowingHistory extends Model
{
    use HasFactory;

    protected $table = 'borrowing_history';

    protected $fillable = [
        'borrowing_id', 'action', 'old_status', 'new_status',
        'comment', 'performed_by', 'performed_at'
    ];

    protected function casts(): array
    {
        return [
            'performed_at' => 'datetime',
        ];
    }

    // 🔹 Relationships
    public function borrowing(): BelongsTo
    {
        return $this->belongsTo(Borrowing::class);
    }

    public function performedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    // 🔹 Helper methods
    public function getActionLabel(): string
    {
        return match($this->action) {
            'created'   => 'Dibuat',
            'approved'  => 'Disetujui',
            'rejected'  => 'Ditolak',
            'started'   => 'Dimulai',
            'completed' => 'Selesai',
            'cancelled' => 'Dibatalkan',
            'updated'   => 'Diperbarui',
            'returned'  => 'Dikembalikan', // 🔹 tambahan
            default     => ucfirst($this->action)
        };
}

    public function getActionColor(): string
    {
        return match($this->action) {
            'created'   => 'blue',
            'approved'  => 'green',
            'rejected'  => 'red',
            'started'   => 'yellow',
            'completed' => 'green',
            'cancelled' => 'gray',
            'updated'   => 'blue',
            'returned'  => 'purple', // 🔹 tambahan (bisa pilih warna lain)
            default     => 'gray'
        };
    }

    // 🔹 Scopes
    public function scopeForUser($query, $user)
    {
        if (!$user->canManageBorrowers()) {
            return $query->whereHas('borrowing', function ($q) use ($user) {
                $q->where('created_by', $user->id);
            });
        }
        return $query;
    }

    public function scopeByAction($query, $action)
    {
        return $query->where('action', $action);
    }

    // 🔹 For Inertia.js sharing
    public function toInertiaArray(): array
    {
        return [
            'id'              => $this->id,
            'borrowing_id'    => $this->borrowing_id,
            'action'          => $this->action,
            'action_label'    => $this->getActionLabel(),
            'action_color'    => $this->getActionColor(),
            'old_status'      => $this->old_status,
            'new_status'      => $this->new_status,
            'comment'         => $this->comment,
            'performed_by'    => $this->performed_by,
            'performed_at'    => $this->performed_at?->toISOString(),

            // ✅ konsisten: gunakan relasi performedBy tapi expose sebagai performed_by_user
            'performed_by_user' => $this->performedBy
                ? $this->performedBy->only(['id', 'name', 'email'])
                : null,

            'borrowing' => $this->borrowing
                ? $this->borrowing->only(['id', 'borrower_name', 'purpose'])
                : null,

            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
