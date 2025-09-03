<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoomEquipment extends Model
{
    use HasFactory;

    protected $table = 'room_equipment';

    protected $fillable = [
        'room_id', 'name', 'type', 'quantity', 'condition', 'notes'
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
        ];
    }

    // Relationships
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    // Helper methods
    public function isInGoodCondition(): bool
    {
        return in_array($this->condition, ['excellent', 'good']);
    }

    public function needsMaintenance(): bool
    {
        return in_array($this->condition, ['fair', 'poor', 'broken']);
    }

    public function getConditionLabel(): string
    {
        return match($this->condition) {
            'excellent' => 'Sangat Baik',
            'good' => 'Baik',
            'fair' => 'Cukup',
            'poor' => 'Buruk',
            'broken' => 'Rusak',
            default => 'Tidak Diketahui'
        };
    }

    public function getConditionColor(): string
    {
        return match($this->condition) {
            'excellent' => 'success',
            'good' => 'success',
            'fair' => 'warning',
            'poor' => 'destructive',
            'broken' => 'destructive',
            default => 'secondary'
        };
    }

    public function getTypeLabel(): string
    {
        return match($this->type) {
            'electronics' => 'Elektronik',
            'furniture' => 'Furniture',
            'tools' => 'Peralatan',
            'misc' => 'Lain-lain',
            default => ucfirst($this->type)
        };
    }

    // Scopes
    public function scopeInGoodCondition($query)
    {
        return $query->whereIn('condition', ['excellent', 'good']);
    }

    public function scopeNeedsMaintenance($query)
    {
        return $query->whereIn('condition', ['fair', 'poor', 'broken']);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    // For Inertia.js sharing
    public function toInertiaArray(): array
    {
        return [
            'id' => $this->id,
            'room_id' => $this->room_id,
            'name' => $this->name,
            'type' => $this->type,
            'type_label' => $this->getTypeLabel(),
            'quantity' => $this->quantity,
            'condition' => $this->condition,
            'condition_label' => $this->getConditionLabel(),
            'condition_color' => $this->getConditionColor(),
            'notes' => $this->notes,
            'is_in_good_condition' => $this->isInGoodCondition(),
            'needs_maintenance' => $this->needsMaintenance(),
            'room' => $this->room?->only(['id', 'name', 'code']),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}