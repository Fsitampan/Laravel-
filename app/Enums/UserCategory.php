<?php

namespace App\Enums;

enum UserCategory: string
{
    case PEGAWAI = 'pegawai';
    case TAMU = 'tamu';
    case ANAK_MAGANG = 'anak-magang';

    public function label(): string
    {
        return match($this) {
            self::PEGAWAI => 'Pegawai',
            self::TAMU => 'Tamu',
            self::ANAK_MAGANG => 'Anak Magang',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::PEGAWAI => 'primary',
            self::TAMU => 'secondary',
            self::ANAK_MAGANG => 'accent',
        };
    }

    public function bgColor(): string
    {
        return match($this) {
            self::PEGAWAI => 'bg-blue-100 text-blue-800',
            self::TAMU => 'bg-orange-100 text-orange-800',
            self::ANAK_MAGANG => 'bg-purple-100 text-purple-800',
        };
    }

    public function description(): string
    {
        return match($this) {
            self::PEGAWAI => 'Pegawai BPS Riau',
            self::TAMU => 'Tamu eksternal/stakeholder',
            self::ANAK_MAGANG => 'Mahasiswa magang/PKL',
        };
    }

    public static function options(): array
    {
        return [
            ['value' => self::PEGAWAI->value, 'label' => self::PEGAWAI->label()],
            ['value' => self::TAMU->value, 'label' => self::TAMU->label()],
            ['value' => self::ANAK_MAGANG->value, 'label' => self::ANAK_MAGANG->label()],
        ];
    }
}