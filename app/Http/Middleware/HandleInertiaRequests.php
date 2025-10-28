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
    protected $rootView = 'app';

    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        $notifications = [];
        $unreadCount = 0;

        if ($user) {
            // 🔹 Ambil notifikasi personal + global + role-targeting
            $dbNotifications = Notification::forUser($user->id)
                ->orderByRaw('CASE WHEN read_at IS NULL THEN 0 ELSE 1 END')
                ->orderByDesc('created_at')
                ->limit(5)
                ->get()
                ->map(function ($n) {
                    return [
                        'id' => $n->id,
                        'type' => $n->type,
                        'title' => $n->title,
                        'message' => $n->message,
                        'read_at' => $n->read_at ? $n->read_at->toISOString() : null,
                        'created_at' => $n->created_at->toISOString(),
                        'icon' => $n->icon,
                        'color' => $n->color,
                        'category' => $n->category,
                    ];
                });

            $notifications = $dbNotifications->toArray();
            $dbUnread = Notification::forUser($user->id)->unread()->count();
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
                    'role' => $user->role,
                    'department' => $user->department,
                    'avatar' => $user->avatar,
                    'avatar_url' => $user->avatar ? asset('storage/' . $user->avatar) : null,
                ] : null,
            ],

            // 🔹 Bagian utama untuk notifikasi
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
     * 🔹 Hitung jumlah synthetic notifications (tidak tersimpan di DB)
     */
    private function getSyntheticNotificationCount($user): int
    {
        $count = 0;

        if ($user->role === 'super-admin') {
            $newUsers = User::where('created_at', '>=', now()->subDays(7))->count();
            if ($newUsers > 0) $count++;
        }

        if (in_array($user->role, ['admin', 'super-admin'])) {
            $pendingCount = Borrowing::where('status', 'pending')->count();
            if ($pendingCount > 0) $count++;

            $overdueCount = Borrowing::where('status', 'active')
                ->where('planned_return_at', '<', now())
                ->count();
            if ($overdueCount > 0) $count++;

            $maintenanceCount = Room::where('status', 'pemeliharaan')->count();
            if ($maintenanceCount > 0) $count++;
        }

        $upcomingBookings = Borrowing::where('user_id', $user->id)
            ->where('status', 'approved')
            ->whereBetween('borrowed_at', [now(), now()->addDay()])
            ->count();

        $count += $upcomingBookings;

        return $count;
    }
}
