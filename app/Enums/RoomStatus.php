<?php

namespace App\Enums;

enum RoomStatus: string
{
    case TERSEDIA = 'tersedia';
    case DIPAKAI = 'dipakai';
    case PEMELIHARAAN = 'pemeliharaan';

    public function label(): string
    {
        return match($this) {
            self::TERSEDIA => 'Tersedia',
            self::DIPAKAI => 'Sedang Dipakai',
            self::PEMELIHARAAN => 'Pemeliharaan',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::TERSEDIA => 'success',
            self::DIPAKAI => 'warning',
            self::PEMELIHARAAN => 'destructive',
        };
    }

    public function bgColor(): string
    {
        return match($this) {
            self::TERSEDIA => 'bg-green-100 text-green-800',
            self::DIPAKAI => 'bg-yellow-100 text-yellow-800',
            self::PEMELIHARAAN => 'bg-red-100 text-red-800',
        };
    }

    public static function options(): array
    {
        return [
            ['value' => self::TERSEDIA->value, 'label' => self::TERSEDIA->label()],
            ['value' => self::DIPAKAI->value, 'label' => self::DIPAKAI->label()],
            ['value' => self::PEMELIHARAAN->value, 'label' => self::PEMELIHARAAN->label()],
        ];
    }
}