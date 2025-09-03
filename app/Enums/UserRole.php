<?php

namespace App\Enums;

enum UserRole: string
{
    case SUPER_ADMIN = 'super-admin';
    case ADMIN = 'admin';
    case PENGGUNA = 'pengguna';

    public function label(): string
    {
        return match($this) {
            self::SUPER_ADMIN => 'Super Administrator',
            self::ADMIN => 'Administrator',
            self::PENGGUNA => 'Pengguna',
        };
    }

    public function shortLabel(): string
    {
        return match($this) {
            self::SUPER_ADMIN => 'Super Admin',
            self::ADMIN => 'Admin',
            self::PENGGUNA => 'User',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::SUPER_ADMIN => 'purple',
            self::ADMIN => 'blue',
            self::PENGGUNA => 'green',
        };
    }

    public function bgColor(): string
    {
        return match($this) {
            self::SUPER_ADMIN => 'bg-purple-100 text-purple-800',
            self::ADMIN => 'bg-blue-100 text-blue-800',
            self::PENGGUNA => 'bg-green-100 text-green-800',
        };
    }

    public function description(): string
    {
        return match($this) {
            self::SUPER_ADMIN => 'Akses penuh ke seluruh sistem',
            self::ADMIN => 'Mengelola ruangan dan persetujuan',
            self::PENGGUNA => 'Menggunakan dan meminjam ruangan',
        };
    }

    public function permissions(): array
    {
        return match($this) {
            self::SUPER_ADMIN => [
                'manage-users',
                'manage-rooms',
                'approve-bookings', 
                'manage-settings',
                'view-analytics',
                'manage-system'
            ],
            self::ADMIN => [
                'manage-rooms',
                'approve-bookings',
                'view-analytics'
            ],
            self::PENGGUNA => [
                'create-booking',
                'view-own-bookings'
            ],
        };
    }

    public function canManageUsers(): bool
    {
        return $this === self::SUPER_ADMIN;
    }

    public function canManageRooms(): bool
    {
        return in_array($this, [self::SUPER_ADMIN, self::ADMIN]);
    }

    public function canApproveRejects(): bool
    {
        return in_array($this, [self::SUPER_ADMIN, self::ADMIN]);
    }

    public function canManageSettings(): bool
    {
        return $this === self::SUPER_ADMIN;
    }

    public function canViewAnalytics(): bool
    {
        return in_array($this, [self::SUPER_ADMIN, self::ADMIN]);
    }

    public static function options(): array
    {
        return [
            ['value' => self::SUPER_ADMIN->value, 'label' => self::SUPER_ADMIN->label()],
            ['value' => self::ADMIN->value, 'label' => self::ADMIN->label()],
            ['value' => self::PENGGUNA->value, 'label' => self::PENGGUNA->label()],
        ];
    }

    public static function adminRoles(): array
    {
        return [self::SUPER_ADMIN, self::ADMIN];
    }

    public static function userRoles(): array
    {
        return [self::PENGGUNA];
    }
}