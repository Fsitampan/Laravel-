<?php

namespace App\Enums;

enum BorrowingStatus: string
{
    case PENDING = 'pending';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';
    case ACTIVE = 'active';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match($this) {
            self::PENDING => 'Menunggu Persetujuan',
            self::APPROVED => 'Disetujui',
            self::REJECTED => 'Ditolak',
            self::ACTIVE => 'Aktif',
            self::COMPLETED => 'Selesai',
            self::CANCELLED => 'Dibatalkan',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::PENDING => 'text-orange-600',
            self::APPROVED => 'text-green-600',
            self::REJECTED => 'text-red-600',
            self::ACTIVE => 'text-blue-600',
            self::COMPLETED => 'text-gray-600',
            self::CANCELLED => 'text-gray-400',
        };
    }

    public function bgColor(): string
    {
        return match($this) {
            self::PENDING => 'bg-orange-100',
            self::APPROVED => 'bg-green-100',
            self::REJECTED => 'bg-red-100',
            self::ACTIVE => 'bg-blue-100',
            self::COMPLETED => 'bg-gray-100',
            self::CANCELLED => 'bg-gray-50',
        };
    }
}