<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        
        return [
            ...parent::share($request),
            
                'auth' => [
                'user' => $user ? [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at,
                'role' => $user->role,
                'department' => $user->department,
                'phone' => $user->phone,
                'address' => $user->address,
                'bio' => $user->bio,
                'avatar' => $user->avatar, // path relatif
                'avatar_url' => $user->avatar ? asset('storage/' . $user->avatar) : null,
                'is_active' => $user->is_active,
                'last_login_at' => $user->last_login_at,
                'created_by' => $user->created_by,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,

                // Permissions
                'can_manage_users' => $user->canManageUsers(),
                'can_manage_rooms' => $user->canManageRooms(),
                'can_manage_borrowers' => $user->canManageBorrowers(),
                'can_approve_rejects' => $user->canApproveRejects(),
                'can_create_borrowings' => $user->canCreateBorrowings(),

                // Roles
                'is_super_admin' => $user->isSuperAdmin(),
                'is_admin' => $user->isAdmin(),
                'is_pengguna' => $user->isPengguna(),

                // Label
                'role_label' => $user->role_label,
            ] : null,
        ],

            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
            ],
            'ziggy' => fn () => [
                ...(new \Tighten\Ziggy\Ziggy)->toArray(),
                'location' => $request->url(),
            ],
        ];
    }
}