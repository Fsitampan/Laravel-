<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;
use App\Enums\BorrowingStatus;
use App\Enums\UserCategory;
use Carbon\Carbon;

class Borrowing extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_id',
        'user_id',

        // Data peminjam
        'borrower_name',
        'borrower_email',
        'borrower_phone',
        'borrower_identification',
        'borrower_category',
        'borrower_department',
        'borrower_institution',

        // Waktu pinjam
        'borrow_date',
        'start_time',
        'end_time',
        'borrowed_at',
        'planned_return_at',
        'return_date',
        'actual_return_date',

        // Detail pinjaman
        'purpose',
        'status',
        'notes',
        'rejection_reason',
        'participant_count',
        'equipment_needed',

        // Persetujuan
        'approved_by',
        'approved_at',

        'created_by',
    ];

    protected $casts = [
    'borrow_date'        => 'date',
    'return_date'        => 'date',
    'borrowed_at'        => 'datetime',
    'planned_return_at'  => 'datetime',
    'actual_return_date' => 'datetime',
    'approved_at'        => 'datetime',
    'equipment_needed'   => 'array',
    'status'             => \App\Enums\BorrowingStatus::class,
    'borrower_category'  => \App\Enums\UserCategory::class,
];


    // Auto-generate datetime fields (hanya jika belum diset controller)
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($borrowing) {
            // Generate borrowed_at jika belum ada
            if (!$borrowing->borrowed_at && $borrowing->borrow_date && $borrowing->start_time) {
                $borrowing->borrowed_at = Carbon::parse($borrowing->borrow_date)
                    ->setTimeFromTimeString($borrowing->start_time);
            }

            // Generate planned_return_at jika belum ada
            if (!$borrowing->planned_return_at && $borrowing->return_date && $borrowing->end_time) {
                $borrowing->planned_return_at = Carbon::parse($borrowing->return_date)
                    ->setTimeFromTimeString($borrowing->end_time);
            }
        });
    }

    // Relationships
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function history(): HasMany
    {
        return $this->hasMany(BorrowingHistory::class);
    }

    // Accessors
    protected function statusLabel(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status->label(),
        );
    }

    protected function statusColor(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status->color(),
        );
    }

    protected function categoryLabel(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->borrower_category->label(),
        );
    }

    protected function categoryColor(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->borrower_category->color(),
        );
    }

    // Helper methods (status checks)
    public function isPending(): bool    { return $this->status === BorrowingStatus::PENDING; }
    public function isApproved(): bool   { return $this->status === BorrowingStatus::APPROVED; }
    public function isActive(): bool     { return $this->status === BorrowingStatus::ACTIVE; }
    public function isCompleted(): bool  { return $this->status === BorrowingStatus::COMPLETED; }
    public function isRejected(): bool   { return $this->status === BorrowingStatus::REJECTED; }
    public function isCancelled(): bool  { return $this->status === BorrowingStatus::CANCELLED; }

    public function canBeApproved(): bool  { return $this->isPending(); }
    public function canBeRejected(): bool  { return $this->isPending(); }
    public function canBeStarted(): bool   { return $this->isApproved() && $this->borrowed_at <= now(); }
    public function canBeCompleted(): bool { return $this->isActive(); }
    public function canBeCancelled(): bool { return in_array($this->status, [BorrowingStatus::PENDING, BorrowingStatus::APPROVED]); }

    public function getDurationInHours(): float
    {
        if (!$this->borrowed_at || !$this->planned_return_at) return 0;
        return $this->borrowed_at->diffInHours($this->planned_return_at);
    }

    public function getActualDurationInHours(): float
    {
        if (!$this->borrowed_at || !$this->actual_return_date) return 0;
        return $this->borrowed_at->diffInHours($this->actual_return_date);
    }

    public function isOverdue(): bool
    {
        return $this->isActive() && $this->planned_return_at < now();
    }

    // Scopes
    public function scopePending($query)   { return $query->where('status', BorrowingStatus::PENDING); }
    public function scopeApproved($query)  { return $query->where('status', BorrowingStatus::APPROVED); }
    public function scopeActive($query)    { return $query->where('status', BorrowingStatus::ACTIVE); }
    public function scopeCompleted($query) { return $query->where('status', BorrowingStatus::COMPLETED); }
    public function scopeRejected($query)  { return $query->where('status', BorrowingStatus::REJECTED); }
    public function scopeOverdue($query)   { return $query->where('status', BorrowingStatus::ACTIVE)->where('planned_return_at', '<', now()); }
    public function scopeToday($query)     { return $query->whereDate('borrow_date', today()); }
    public function scopeThisWeek($query)  { return $query->whereBetween('borrow_date', [now()->startOfWeek(), now()->endOfWeek()]); }
    public function scopeThisMonth($query) { return $query->whereMonth('borrow_date', now()->month)->whereYear('borrow_date', now()->year); }

    // ✅ Fix: scopeForUser untuk User object / ID
   public function scopeForUser($query, $user, $viewAll = false)
{
    if (!$user) return $query;

    // Admin & super-admin bisa lihat semua data
    if (in_array($user->role, ['admin', 'super-admin'])) {
        return $query;
    }

    // Kalau user biasa, defaultnya lihat miliknya sendiri
    if ($viewAll) {
        return $query; // override → lihat semua
    }

    return $query->where('user_id', $user->id ?? $user);
}


    // For Inertia.js sharing
    public function toInertiaArray(): array
    {
        return [
            'id' => $this->id,
            'room_id' => $this->room_id,
            'user_id' => $this->user_id,
            'borrower_name' => $this->borrower_name,
            'borrower_email' => $this->borrower_email,
            'borrower_phone' => $this->borrower_phone,
            'borrower_identification' => $this->borrower_identification,
            'borrower_category' => $this->borrower_category->value,
            'borrower_category_label' => $this->borrower_category->label(),
            'borrower_category_color' => $this->borrower_category->color(),
            'borrower_department' => $this->borrower_department,
            'borrow_date' => $this->borrow_date?->format('Y-m-d'),
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'return_date' => $this->return_date?->format('Y-m-d'),
            'borrowed_at' => $this->borrowed_at?->toISOString(),
            'planned_return_at' => $this->planned_return_at?->toISOString(),
            'actual_return_date' => $this->actual_return_date?->toISOString(),
            'purpose' => $this->purpose,
            'notes' => $this->notes,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'status_color' => $this->status->color(),
            'approved_by' => $this->approved_by,
            'approved_at' => $this->approved_at?->toISOString(),
            'rejection_reason' => $this->rejection_reason,
            'duration_hours' => $this->getDurationInHours(),
            'actual_duration_hours' => $this->getActualDurationInHours(),
            'is_overdue' => $this->isOverdue(),
            'can_be_approved' => $this->canBeApproved(),
            'can_be_rejected' => $this->canBeRejected(),
            'can_be_started' => $this->canBeStarted(),
            'can_be_completed' => $this->canBeCompleted(),
            'can_be_cancelled' => $this->canBeCancelled(),
            'room' => $this->room?->toInertiaArray(),
            'user' => $this->user?->toInertiaArray(),
            'approved_by_user' => $this->approvedBy?->toInertiaArray(),
            'created_by_user' => $this->createdBy?->toInertiaArray(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

      public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

       public function performer(): BelongsTo
    {
        // Eloquent akan mencari foreign key 'user_id' di tabel borrowing_histories.
        // Jika nama kolom Anda berbeda (misalnya, 'performed_by'),
        // ubah menjadi: return $this->belongsTo(User::class, 'performed_by');
        return $this->belongsTo(User::class, 'user_id');
    }

    // Relasi ke borrowing jika ada
    public function borrowing(): BelongsTo
    {
        return $this->belongsTo(Borrowing::class);
    }
}
