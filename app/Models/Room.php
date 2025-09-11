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
        'location', 'facilities', 'notes', 'created_by', 'updated_by', 'image'
    ];

    protected function casts(): array
    {
        return [
            'status' => RoomStatus::class,
            'facilities' => 'array',
            'capacity' => 'integer',
        ];
    }

    // Auto-generate full_name when saving
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($room) {
            $room->full_name = "Ruang {$room->code} - {$room->name}";
        });
    }

    // Relationships
    public function borrowings(): HasMany
    {
        return $this->hasMany(Borrowing::class);
    }

    // Current active borrowing - should return single instance, not collection
    public function currentBorrowing()
    {
        return $this->hasOne(Borrowing::class)
            ->where('status', 'active')
            ->latest('created_at'); // Use created_at as fallback until migration runs
    }

    // All current borrowings (if multiple needed) - returns collection
    public function currentBorrowings(): HasMany
    {
        return $this->hasMany(Borrowing::class)
            ->where('status', 'active')
            ->latest('created_at'); // Use created_at as fallback until migration runs
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
        return $this->borrowings()->where('status', 'active')->exists();
    }

    public function getActiveBorrowing()
    {
        return $this->borrowings()->where('status', 'active')->with('user')->first();
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

  public function getImageUrlAttribute()
{
    return $this->image 
        ? asset('storage/Rooms/' . $this->image)
        : asset('images/default-room.jpg'); // fallback kalau kosong
}



    // For Inertia.js sharing
    public function toInertiaArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'full_name' => $this->full_name,
            'description' => $this->description,
            'capacity' => $this->capacity,
            'location' => $this->location,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'status_color' => $this->status->color(),
            'facilities' => $this->facilities,
            'notes' => $this->notes,
            'is_available' => $this->isAvailable(),
            'is_occupied' => $this->isOccupied(),
            'is_under_maintenance' => $this->isUnderMaintenance(),
            'has_active_borrowing' => $this->hasActiveBorrowing(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'image' => $this->image,
            'image_url' => $this->image_url,
        ];
    }
}