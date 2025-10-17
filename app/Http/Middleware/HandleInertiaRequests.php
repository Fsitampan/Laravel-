<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\Notification;
use App\Models\Borrowing;
use App\Models\Room;
use App\Models\User;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
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
        
        // Get notifications jika user login
        $notifications = [];
        $unreadCount = 0;
        
        if ($user) {
            // Ambil notifikasi dari database (limit 5 untuk dropdown)
            $dbNotifications = Notification::forUser($user->id)
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($n) {
                    return [
                        'id' => $n->id,
                        'type' => $n->type,
                        'title' => $n->title,
                        'message' => $n->message,
                        'read_at' => $n->read_at ? $n->read_at->diffForHumans() : null,
                        'created_at' => $n->created_at->diffForHumans(),
                    ];
                });

            $notifications = $dbNotifications->toArray();
            
            // Hitung unread dari DB
            $dbUnread = Notification::forUser($user->id)->unread()->count();
            
            // Hitung synthetic notifications
            $syntheticCount = $this->getSyntheticNotificationCount($user);
            
            $unreadCount = $dbUnread + $syntheticCount;
        }
        
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
                    'avatar' => $user->avatar,
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
            
            // ✅ Tambahkan notifications & unread_count
            'notifications' => $notifications,
            'unread_count' => $unreadCount,

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

    /**
     * Hitung jumlah synthetic notifications yang belum dibaca
     */
    private function getSyntheticNotificationCount($user): int
    {
        $count = 0;

        if ($user->role === 'super-admin') {
            // New users in last 7 days
            $newUsers = User::where('created_at', '>=', now()->subDays(7))->count();
            if ($newUsers > 0) $count++;
        }

        if (in_array($user->role, ['admin', 'super-admin'])) {
            // Pending approvals
            $pendingCount = Borrowing::where('status', 'pending')->count();
            if ($pendingCount > 0) $count++;

            // Overdue returns
            $overdueCount = Borrowing::where('status', 'active')
                ->where('planned_return_at', '<', now())
                ->count();
            if ($overdueCount > 0) $count++;

            // Rooms in maintenance
            $maintenanceCount = Room::where('status', 'pemeliharaan')->count();
            if ($maintenanceCount > 0) $count++;
        }

        // User specific - upcoming bookings
        $upcomingBookings = Borrowing::where('user_id', $user->id)
            ->where('status', 'approved')
            ->where('borrowed_at', '>=', now())
            ->where('borrowed_at', '<=', now()->addDay())
            ->count();
        
        $count += $upcomingBookings;

        return $count;
    }
}