<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;
use App\Enums\RoomStatus;

class Room extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'code', 'description', 'capacity', 'status',
        'location', 'facilities', 'notes', 'created_by', 'updated_by',
        'image',
    ];

    // Correct casting property
    protected $casts = [
        'status' => RoomStatus::class,
        'facilities' => 'array',
        'capacity' => 'integer',
    ];

    // Auto-generate full_name when saving
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($room) {
            // Pastikan code/name ada sebelum membuat full_name
            $room->full_name = "Ruang {$room->code} - {$room->name}";
        });
    }

    // Relationships
    public function borrowings(): HasMany
    {
        return $this->hasMany(Borrowing::class);
    }

    /**
     * currentBorrowing:
     * - kita ambil borrowing terakhir yang relevan untuk ditampilkan di UI.
     * - gunakan whereIn agar kompatibel jika Anda memakai 'approved' atau 'active' sebagai indikator.
     */
    public function currentBorrowing(): HasOne
    {
        return $this->hasOne(Borrowing::class)
            ->whereIn('status', ['approved', 'active'])
            ->latestOfMany();
    }

    // Jika Anda butuh daftar borrowings yang sedang aktif
    public function currentBorrowings(): HasMany
    {
        return $this->hasMany(Borrowing::class)
            ->whereIn('status', ['approved', 'active'])
            ->latest('created_at');
    }

    public function equipment(): HasMany
    {
        return $this->hasMany(RoomEquipment::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Accessors
    protected function fullName(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ?: "Ruang {$this->code} - {$this->name}",
        );
    }

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

     /**
     * Helper untuk URL gambar yang konsisten.
     * @return string
     */
    public function getImageUrlAttribute(): string
    {
        // Prioritas 1: Jika ada gambar lokal yang di-upload.
        // Kita akses nilai asli dari kolom 'image'
        if (!empty($this->attributes['image'])) {
            // Pastikan Anda sudah menjalankan `php artisan storage:link`
            return asset('storage/' . $this->attributes['image']);
        }

        // Prioritas 2: Jika ada link gambar eksternal yang diisi manual.
        // Kita akses nilai asli dari kolom 'image_url' untuk menghindari rekursi
        if (!empty($this->attributes['image_url'])) {
            return $this->attributes['image_url'];
        }

        // Prioritas 3 (Fallback): Jika keduanya tidak ada, gunakan URL default.
        return 'https://placehold.co/800x600/e2e8f0/7c3aed?text=Ruang%20' . urlencode($this->name);
    }

    // Helper methods
    public function isAvailable(): bool
    {
        return $this->status === RoomStatus::TERSEDIA;
    }

    public function isOccupied(): bool
    {
        return $this->status === RoomStatus::DIPAKAI;
    }

    public function isUnderMaintenance(): bool
    {
        return $this->status === RoomStatus::PEMELIHARAAN;
    }

    public function hasActiveBorrowing(): bool
    {
        // mempertimbangkan approved/active sesuai currentBorrowing
        return $this->borrowings()->whereIn('status', ['approved', 'active'])->exists();
    }

    public function getActiveBorrowing()
    {
        return $this->borrowings()->whereIn('status', ['approved', 'active'])->with('user')->first();
    }

    // Scopes
    public function scopeAvailable($query)
    {
        return $query->where('status', RoomStatus::TERSEDIA);
    }

    public function scopeOccupied($query)
    {
        return $query->where('status', RoomStatus::DIPAKAI);
    }

    public function scopeUnderMaintenance($query)
    {
        return $query->where('status', RoomStatus::PEMELIHARAAN);
    }
    
        public function refreshRoomStatus(): void
    {
        $borrowing = $this->currentBorrowing;

        if ($borrowing) {
            if ($borrowing->status->value === 'active') {
                $this->status = \App\Enums\RoomStatus::DIPAKAI;
            } elseif ($borrowing->status->value === 'approved') {
                $this->status = \App\Enums\RoomStatus::TERSEDIA; // masih disetujui tapi belum mulai
            }
        } else {
            $this->status = \App\Enums\RoomStatus::TERSEDIA;
        }

        $this->save();
    }


    // For Inertia.js sharing
    public function toInertiaArray(): array
    {
        $current = $this->currentBorrowing;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'full_name' => $this->full_name,
            'description' => $this->description,
            'capacity' => $this->capacity,
            'location' => $this->location,
            'status' => is_object($this->status) && method_exists($this->status, 'value') ? $this->status->value : $this->status,
            'status_label' => is_object($this->status) ? $this->status->label() : $this->status,
            'status_color' => is_object($this->status) ? $this->status->color() : null,
            'facilities' => $this->facilities,
            'notes' => $this->notes,
            'is_available' => $this->isAvailable(),
            'is_occupied' => $this->isOccupied(),
            'is_under_maintenance' => $this->isUnderMaintenance(),
            'has_active_borrowing' => $this->hasActiveBorrowing(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'image' => $this->image,
            'image_url' => $this->image_url ?? $this->image_url, // tetap kirim apa adanya
            // kirim image_url computed agar front-end mudah pakai
            'computed_image_url' => $this->image_url ?? $this->getImageUrlAttribute(),

            // Tambahan: informasi current borrowing agar UI bisa menampilkan nama peminjam
            'current_borrowing' => $current ? [
                'id' => $current->id,
                'borrower_name' => $current->borrower_name,
                'user_name' => $current->user?->name ?? null,
                'borrow_date' => $current->borrow_date ?? null,
                'start_time' => $current->start_time ?? null,
                'end_time' => $current->end_time ?? null,
                'purpose' => $current->purpose ?? null,
                'status' => $current->status ?? null,
            ] : null,
        ];
    }
}
