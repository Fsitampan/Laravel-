<?php

namespace App\Enums;

enum UserCategory: string
{
    // value = database, case name = english
    case EMPLOYEE = 'pegawai';
    case GUEST = 'tamu';
    case INTERN = 'anak-magang';

    public function label(): string
    {
        return match($this) {
            self::EMPLOYEE => 'Employee',
            self::GUEST => 'Guest',
            self::INTERN => 'Intern',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::EMPLOYEE => 'primary',
            self::GUEST => 'secondary',
            self::INTERN => 'accent',
        };
    }

    public function bgColor(): string
    {
        return match($this) {
            self::EMPLOYEE => 'bg-blue-100 text-blue-800',
            self::GUEST => 'bg-orange-100 text-orange-800',
            self::INTERN => 'bg-purple-100 text-purple-800',
        };
    }

    public function description(): string
    {
        return match($this) {
            self::EMPLOYEE => 'Employee of BPS Riau',
            self::GUEST => 'External guest/stakeholder',
            self::INTERN => 'Internship student',
        };
    }

    public static function options(): array
    {
        return [
            ['value' => self::EMPLOYEE->value, 'label' => self::EMPLOYEE->label()],
            ['value' => self::GUEST->value, 'label' => self::GUEST->label()],
            ['value' => self::INTERN->value, 'label' => self::INTERN->label()],
        ];
    }
}
