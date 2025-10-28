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
        'name', 'code', 'full_name', 'description', 'capacity', 'status',
        'location', 'facilities', 'layout_images', 'notes', 'created_by', 'updated_by',
        'image', 'is_active',
    ];

    // ✅ Casting untuk auto-parse JSON
    protected $casts = [
        'status' => RoomStatus::class,
        'facilities' => 'array', // ✅ Cast facilities sebagai array
        'capacity' => 'integer',
        // JANGAN cast layout_images - biarkan accessor yang handle
        'is_active' => 'boolean',
    ];

    // Auto-generate full_name when saving
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($room) {
            if (!empty($room->code) && !empty($room->name)) {
                $room->full_name = "Ruang {$room->code} - {$room->name}";
            }
        });
    }

    // ========================================
    // RELATIONSHIPS
    // ========================================
    
    public function borrowings(): HasMany
    {
        return $this->hasMany(Borrowing::class);
    }

    public function currentBorrowing(): HasOne
    {
        return $this->hasOne(Borrowing::class)
            ->whereIn('status', ['approved', 'active'])
            ->latestOfMany();
    }

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

    // ========================================
    // ACCESSORS (Laravel 9+ Style)
    // ========================================
    
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

    // ========================================
    // CUSTOM ACCESSORS (Old Style)
    // ========================================
    
    /**
     * ✅ Accessor untuk image_url (gambar utama)
     */
    public function getImageUrlAttribute(): string
    {
        if (!empty($this->attributes['image'])) {
            $imagePath = $this->attributes['image'];
            $cleanPath = ltrim($imagePath, '/');
            $cleanPath = preg_replace('#^public/#', '', $cleanPath);
            $cleanPath = preg_replace('#^storage/#', '', $cleanPath);
            return asset('storage/' . $cleanPath);
        }

        return 'https://placehold.co/800x600/e2e8f0/7c3aed?text=Ruang%20' . urlencode($this->name ?? 'Unknown');
    }

    /**
     * ✅✅✅ FIXED: Accessor untuk layout_images
     * Pastikan TIDAK ada double encoding
     */
    public function getLayoutImagesAttribute(): array
    {
        $rawData = $this->attributes['layout_images'] ?? null;
        
        if (empty($rawData) || is_null($rawData)) {
            return [];
        }

        $paths = [];
        if (is_string($rawData)) {
            try {
                $decoded = json_decode($rawData, true);
                
                if (json_last_error() !== JSON_ERROR_NONE) {
                    \Log::error("Room {$this->id} - JSON decode error: " . json_last_error_msg());
                    return [];
                }
                
                $paths = is_array($decoded) ? $decoded : [];
            } catch (\Exception $e) {
                \Log::error("Room {$this->id} - Failed to parse layout_images: " . $e->getMessage());
                return [];
            }
        } elseif (is_array($rawData)) {
            $paths = $rawData;
        } else {
            return [];
        }

        if (empty($paths)) {
            return [];
        }

        // Convert ke URL lengkap
        $urls = array_map(function ($path) {
            if (empty($path)) {
                return null;
            }
            
            if (is_string($path) && filter_var($path, FILTER_VALIDATE_URL)) {
                return $path;
            }

            if (is_array($path)) {
                $path = reset($path);
                if (empty($path)) {
                    return null;
                }
            }

            if (!is_string($path)) {
                return null;
            }

            $cleanPath = ltrim($path, '/');
            $cleanPath = preg_replace('#^public/#', '', $cleanPath);
            $cleanPath = preg_replace('#^storage/#', '', $cleanPath);
            
            return asset('storage/' . $cleanPath);
        }, $paths);

        // Filter null values dan reset keys
        $urls = array_values(array_filter($urls, fn($url) => !is_null($url)));
        
        return $urls;
    }

    // ========================================
    // HELPER METHODS
    // ========================================
    
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
        return $this->borrowings()->whereIn('status', ['approved', 'active'])->exists();
    }

    public function getActiveBorrowing()
    {
        return $this->borrowings()->whereIn('status', ['approved', 'active'])->with('user')->first();
    }

    public function refreshRoomStatus(): void
    {
        $borrowing = $this->currentBorrowing;

        if ($borrowing) {
            $statusValue = is_object($borrowing->status) && property_exists($borrowing->status, 'value')
                ? $borrowing->status->value
                : (string) $borrowing->status;

            if ($statusValue === 'active') {
                $this->status = RoomStatus::DIPAKAI;
            } elseif ($statusValue === 'approved') {
                $this->status = RoomStatus::TERSEDIA;
            }
        } else {
            $this->status = RoomStatus::TERSEDIA;
        }

        $this->save();
    }

    // ========================================
    // SCOPES
    // ========================================
    
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

    // ========================================
    // FOR INERTIA.JS
    // ========================================
    
    /**
     * ✅✅✅ FINAL FIX: toInertiaArray dengan proper handling
     */
    public function toInertiaArray(): array
    {
        $current = $this->currentBorrowing;

        // ✅ Handle facilities - pastikan tidak double-encoded
        $facilities = $this->facilities; // Ini sudah array karena casting
        
        // ✅ Jika masih berupa string yang ter-encode, decode lagi
        if (is_array($facilities) && count($facilities) === 1 && is_string($facilities[0])) {
            $firstElement = $facilities[0];
            // Check if it's a JSON string
            if (is_string($firstElement) && (str_starts_with($firstElement, '[') || str_starts_with($firstElement, '{'))) {
                try {
                    $decoded = json_decode($firstElement, true);
                    if (is_array($decoded)) {
                        $facilities = $decoded;
                    }
                } catch (\Exception $e) {
                    \Log::warning("Failed to decode facilities for room {$this->id}");
                }
            }
        }

        // ✅ Handle layout images
        $layoutImages = $this->layout_images;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'full_name' => $this->full_name,
            'description' => $this->description,
            'capacity' => $this->capacity,
            'location' => $this->location,
            'notes' => $this->notes,
            'is_active' => $this->is_active,
            
            'status' => is_object($this->status) && method_exists($this->status, 'value') 
                ? $this->status->value 
                : $this->status,
            'status_label' => is_object($this->status) ? $this->status->label() : $this->status,
            'status_color' => is_object($this->status) ? $this->status->color() : null,
            
            // ✅ Facilities yang sudah di-clean
            'facilities' => $facilities,
            
            // ✅ Images
            'image' => $this->attributes['image'] ?? null,
            'image_url' => $this->image_url,
            'layout_images' => $layoutImages,
            
            'is_available' => $this->isAvailable(),
            'is_occupied' => $this->isOccupied(),
            'is_under_maintenance' => $this->isUnderMaintenance(),
            'has_active_borrowing' => $this->hasActiveBorrowing(),
            
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            
            'current_borrowing' => $current ? [
                'id' => $current->id,
                'borrower_name' => $current->borrower_name,
                'user_name' => $current->user?->name ?? null,
                'borrow_date' => $current->borrow_date ?? null,
                'start_time' => $current->start_time ?? null,
                'end_time' => $current->end_time ?? null,
                'purpose' => $current->purpose ?? null,
                'status' => is_object($current->status) ? $current->status->value : $current->status,
            ] : null,
        ];
    }
}