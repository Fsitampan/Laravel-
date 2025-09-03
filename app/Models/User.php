<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'role', 'department', 
        'phone', 'address', 'bio', 'avatar', 'is_active', 'created_by'
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
            'is_active' => 'boolean',
        ];
    }

    // Relationships
    public function borrowings(): HasMany
    {
        return $this->hasMany(Borrowing::class);
    }

    public function createdBorrowings(): HasMany
    {
        return $this->hasMany(Borrowing::class, 'created_by');
    }

    public function approvedBorrowings(): HasMany
    {
        return $this->hasMany(Borrowing::class, 'approved_by');
    }

    public function createdRooms(): HasMany
    {
        return $this->hasMany(Room::class, 'created_by');
    }

    // Accessors
    protected function avatar(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ? asset('storage/' . $value) : null,
        );
    }

    protected function roleLabel(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->role->label(),
        );
    }

    // Role checking methods
    public function isSuperAdmin(): bool
    {
        return $this->role === UserRole::SUPER_ADMIN;
    }

    public function isAdmin(): bool
    {
        return in_array($this->role, [UserRole::ADMIN, UserRole::SUPER_ADMIN]);
    }

    public function isPengguna(): bool
    {
        return $this->role === UserRole::PENGGUNA;
    }

    public function canManageRooms(): bool
    {
        return $this->role->canManageRooms();
    }

    public function canApproveRejects(): bool
    {
        return $this->role->canApproveRejects();
    }

    public function canManageUsers(): bool
    {
        return $this->role->canManageUsers();
    }

    public function canCreateBorrowings(): bool
    {
        return true; // All authenticated users can create borrowings
    }

    public function canManageBorrowers(): bool
    {
        return $this->isAdmin(); // Only admins can manage all borrowings
    }

    public function hasPermission(string $permission): bool
    {
        return in_array($permission, $this->role->permissions());
    }

    // For Inertia.js sharing
    public function toInertiaArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role->value,
            'role_label' => $this->role->label(),
            'department' => $this->department,
            'phone' => $this->phone,
            'address' => $this->address,
            'bio' => $this->bio,
            'avatar' => $this->avatar,
            'is_active' => $this->is_active,
            'can_manage_rooms' => $this->canManageRooms(),
            'can_approve_rejects' => $this->canApproveRejects(),
            'can_manage_users' => $this->canManageUsers(),
            'can_create_borrowings' => $this->canCreateBorrowings(),
            'can_manage_borrowers' => $this->canManageBorrowers(),
            'permissions' => $this->role->permissions(),
        ];
    }

    // Update last login
    public function updateLastLogin(): void
    {
        $this->update(['last_login_at' => now()]);
    }
}