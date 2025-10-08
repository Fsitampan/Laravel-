<?php

namespace App\Http\Controllers;

use App\Models\Borrowing;
use App\Models\User;
use App\Models\Room;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class NotificationController extends Controller
{
  public function index(Request $request)
    {
        $user = Auth::user();

        // DB query (filterable)
        $query = Notification::forUser($user->id);

        if ($request->has('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        if ($request->has('category') && $request->category !== 'all') {
            $categories = [
                'user' => ['user_registered', 'user_profile_updated', 'user_deleted'],
                'room' => ['room_created', 'room_updated', 'room_deleted', 'room_maintenance', 'room_available'],
                'borrowing' => ['borrowing_created', 'borrowing_approved', 'borrowing_rejected', 'borrowing_cancelled', 'borrowing_completed', 'borrowing_reminder', 'borrowing_updated', 'borrowing_deleted', 'borrowing_pending', 'borrowing_overdue'],
                'system' => ['system_update', 'system_alert', 'system_maintenance'],
            ];

            if (isset($categories[$request->category])) {
                $query->whereIn('type', $categories[$request->category]);
            }
        }

        if ($request->has('status')) {
            if ($request->status === 'unread') {
                $query->unread();
            } elseif ($request->status === 'read') {
                $query->read();
            }
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                ->orWhere('message', 'like', "%{$search}%");
            });
        }

        $dbNotifications = $query->orderBy('created_at', 'desc')
            ->limit(100)
            ->get();

        // Build synthetic notifications (from helper functions)
        $synthetic = $this->getUserNotifications($user); // array of arrays

        // Normalize DB notifications to uniform array structure
        $normalizedDb = $dbNotifications->map(function ($n) {
            return [
                'id' => (string) $n->id,
                'user_id' => $n->user_id,
                'type' => $n->type,
                'title' => $n->title,
                'message' => $n->message,
                'data' => $n->data,
                'read_at' => $n->read_at ? $n->read_at->toDateTimeString() : null,
                'created_at' => $n->created_at ? $n->created_at->toDateTimeString() : now()->toDateTimeString(),
                'updated_at' => $n->updated_at ? $n->updated_at->toDateTimeString() : null,
                'source' => 'db',
            ];
        })->toArray();

        // Normalize synthetic notifications
        $normalizedSynth = array_map(function ($s) {
            // ensure fields exist and map timestamp -> created_at
            $created = isset($s['created_at']) ? $s['created_at'] : (isset($s['timestamp']) ? $s['timestamp'] : now()->toDateTimeString());
            // try parse if ISO string, else keep
            try {
                $created_dt = Carbon::parse($created)->toDateTimeString();
            } catch (\Throwable $e) {
                $created_dt = now()->toDateTimeString();
            }

            // ensure type uses consistent naming (developer should also set types correctly at creation)
            $type = $s['type'] ?? 'system_update';

            return [
                'id' => (string) ($s['id'] ?? 'synthetic_'.uniqid()),
                'user_id' => $s['user_id'] ?? null,
                'type' => $type,
                'title' => $s['title'] ?? ($s['message'] ?? 'Notifikasi Sistem'),
                'message' => $s['message'] ?? '',
                'data' => $s['data'] ?? null,
                'read_at' => $s['read_at'] ?? null,
                'created_at' => $created_dt,
                'updated_at' => $s['updated_at'] ?? null,
                'source' => 'synthetic',
            ];
        }, $synthetic);

        // Merge, sort by created_at desc, limit 100
        $merged = collect(array_merge($normalizedDb, $normalizedSynth))
            ->sortByDesc(function ($item) {
                return Carbon::parse($item['created_at'])->getTimestamp();
            })
            ->values()
            ->take(100)
            ->map(function ($n) {
                // compute UI helpers
                $n['time_ago'] = Carbon::parse($n['created_at'])->diffForHumans();
                $n['icon'] = $this->getNotificationIcon($n['type']);
                $n['color'] = $this->getNotificationColor($n['type']);
                $n['category'] = $this->getNotificationCategory($n['type']);
                $n['priority'] = $this->getNotificationPriority($n['type']);
                return $n;
            });

        // Compute unread count & stats from merged list (so synthetic included)
        $unreadCount = $merged->filter(function ($n) {
            return empty($n['read_at']);
        })->count();

        $stats = $this->computeStatisticsFromCollection($merged, $user->id);

        // Return json for api/* routes OR Inertia for normal page
        if ($request->is('api/*')) {
            return response()->json([
                'notifications' => $merged->values(),
                'unread_count'  => $unreadCount,
                'total'         => $merged->count(),
                'stats'         => $stats,
            ]);
        }

        // For Inertia page: pass initialNotifications & initialStats (as collections/arrays)
        return inertia('notifications/index', [
            'initialNotifications' => $merged->values(),
            'initialStats' => $stats,
        ]);
    }

    private function computeStatisticsFromCollection($collection, $userId)
    {
        $total = $collection->count();
        $unread = $collection->filter(fn($n) => empty($n['read_at']))->count();
        $read = $total - $unread;

        $byCategory = [
            'user' => $collection->filter(fn($n) => str_starts_with($n['type'], 'user_'))->count(),
            'room' => $collection->filter(fn($n) => str_starts_with($n['type'], 'room_'))->count(),
            'borrowing' => $collection->filter(fn($n) => str_starts_with($n['type'], 'borrowing_'))->count(),
            'system' => $collection->filter(fn($n) => str_starts_with($n['type'], 'system_'))->count(),
        ];

        return [
            'total' => $total,
            'unread' => $unread,
            'read' => $read,
            'by_category' => $byCategory,
        ];
    }

        private function getStatistics($userId)
    {
        $total = Notification::forUser($userId)->count();
        $unread = Notification::forUser($userId)->unread()->count();
        $read = Notification::forUser($userId)->read()->count();
        
        // Count by category - perbaiki query
        $userNotifications = Notification::forUser($userId)
            ->where('type', 'like', 'user_%')
            ->count();
            
        $roomNotifications = Notification::forUser($userId)
            ->where('type', 'like', 'room_%')
            ->count();
            
        $borrowingNotifications = Notification::forUser($userId)
            ->where('type', 'like', 'borrowing_%')
            ->count();
            
        // System termasuk semua yang dimulai dengan 'system_'
        $systemNotifications = Notification::forUser($userId)
            ->where('type', 'like', 'system_%')
            ->count();
        
        return [
            'total' => $total,
            'unread' => $unread,
            'read' => $read,
            'by_category' => [
                'user' => $userNotifications,
                'room' => $roomNotifications,
                'borrowing' => $borrowingNotifications,
                'system' => $systemNotifications,
            ]
        ];
    }
    private function getNotificationIcon($type)
    {
        $icons = [
            'user_registered' => 'user-plus',
            'user_profile_updated' => 'user-cog',
            'user_deleted' => 'user-minus',
            'room_created' => 'plus',
            'room_updated' => 'edit',
            'room_deleted' => 'trash',
            'room_maintenance' => 'alert-triangle',
            'room_available' => 'check-circle',
            'borrowing_created' => 'alert-circle',
            'borrowing_approved' => 'check-circle',
            'borrowing_rejected' => 'x-circle',
            'borrowing_cancelled' => 'ban',
            'borrowing_completed' => 'check',
            'borrowing_reminder' => 'clock',
            'borrowing_updated' => 'edit',
            'borrowing_deleted' => 'trash',
            'system_update' => 'info',
            'system_maintenance' => 'tool', // ← Tambahkan ini
            'system_alert' => 'alert-triangle', // ← Tambahkan ini
        ];
        
        return $icons[$type] ?? 'bell';
    }
        
    private function getNotificationColor($type)
    {
        $colors = [
            'user_registered' => 'purple',
            'user_profile_updated' => 'purple',
            'user_deleted' => 'gray',
            'room_created' => 'blue',
            'room_updated' => 'indigo',
            'room_deleted' => 'gray',
            'room_maintenance' => 'orange',
            'room_available' => 'green',
            'borrowing_created' => 'blue',
            'borrowing_approved' => 'green',
            'borrowing_rejected' => 'red',
            'borrowing_cancelled' => 'gray',
            'borrowing_completed' => 'emerald',
            'borrowing_reminder' => 'yellow',
            'borrowing_updated' => 'blue',
            'borrowing_deleted' => 'gray',
            'system_update' => 'blue',
            'system_maintenance' => 'orange', // ← Tambahkan ini
            'system_alert' => 'yellow', // ← Tambahkan ini
        ];
        
        return $colors[$type] ?? 'gray';
    }
        
    private function getNotificationCategory($type)
    {
        if (str_starts_with($type, 'user_')) return 'user';
        if (str_starts_with($type, 'room_')) return 'room';
        if (str_starts_with($type, 'borrowing_')) return 'borrowing';
        return 'system';
    }
    
    private function getNotificationPriority($type)
    {
        $highPriority = ['borrowing_created', 'borrowing_rejected', 'borrowing_reminder', 'room_maintenance', 'user_registered'];
        $lowPriority = ['user_profile_updated', 'room_updated', 'borrowing_completed', 'borrowing_cancelled'];
        
        if (in_array($type, $highPriority)) return 'high';
        if (in_array($type, $lowPriority)) return 'low';
        return 'medium';
    }

    public function markAsRead($id)
{
    $user = Auth::user();

    // only allow numeric DB ids
    if (!is_numeric($id)) {
        return response()->json([
            'success' => false,
            'message' => 'Notifikasi tidak dapat ditandai (synthetic / non-db).'
        ], 422);
    }

    $notification = Notification::forUser($user->id)->findOrFail($id);
    $notification->markAsRead();

    return response()->json([
        'success' => true,
        'message' => 'Notifikasi telah ditandai sebagai dibaca'
    ]);
}


    public function markAllAsRead()
    {
        $user = Auth::user();
        
        Notification::forUser($user->id)->unread()->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'Semua notifikasi telah ditandai sebagai dibaca'
        ]);
    }

    public function unreadCount()
    {
        $user = Auth::user();
        $count = Notification::forUser($user->id)->unread()->count();

        return response()->json(['count' => $count]);
    }

    public function markAsUnread($id)
    {
        $user = Auth::user();
        
        $notification = Notification::forUser($user->id)->findOrFail($id);
        $notification->markAsUnread();

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi telah ditandai sebagai belum dibaca'
        ]);
    }

    public function destroy($id)
    {
        $user = Auth::user();
        
        $notification = Notification::forUser($user->id)->findOrFail($id);
        $notification->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi telah dihapus'
        ]);
    }

    public function destroyAll()
    {
        $user = Auth::user();
        
        Notification::forUser($user->id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Semua notifikasi telah dihapus'
        ]);
    }
    
    public function statistics(Request $request)
    {
        $user = Auth::user();

        // DB rows
        $dbNotifications = Notification::forUser($user->id)->get()->map(function ($n) {
            return [
                'id' => (string) $n->id,
                'type' => $n->type,
                'read_at' => $n->read_at ? $n->read_at->toDateTimeString() : null,
                'created_at' => $n->created_at ? $n->created_at->toDateTimeString() : now()->toDateTimeString(),
            ];
        })->toArray();

        // synthetic
        $synthetic = $this->getUserNotifications($user);
        // normalize synthetic very lightly: ensure created_at & read_at exist
        $normalizedSynth = array_map(function($s) {
            return [
                'id' => (string) ($s['id'] ?? 's_'.uniqid()),
                'type' => $s['type'] ?? 'system_update',
                'read_at' => $s['read_at'] ?? null,
                'created_at' => $s['created_at'] ?? ($s['timestamp'] ?? now()->toDateTimeString()),
            ];
        }, $synthetic);

        $merged = collect(array_merge($dbNotifications, $normalizedSynth));

        $stats = $this->computeStatisticsFromCollection($merged, $user->id);

        return response()->json($stats);
    }


   private function getUserNotifications($user)
    {
        $notifications = [];

        // Notifications for Super Admin
        if ($user->role === 'super-admin') {
            $notifications = array_merge($notifications, $this->getSuperAdminNotifications());
        }

        // Notifications for Admin and Super Admin
        if (in_array($user->role, ['admin', 'super-admin'])) {
            $notifications = array_merge($notifications, $this->getAdminNotifications());
        }

        // Notifications for all users
        $notifications = array_merge($notifications, $this->getUserSpecificNotifications($user));

        // Ensure every synthetic notification has a created_at (normalize keys)
        foreach ($notifications as &$n) {
            // If created_at not present but timestamp exists, map it
            if (!isset($n['created_at']) && isset($n['timestamp'])) {
                $n['created_at'] = $n['timestamp'];
            }

            // If still not present, set now as fallback
            if (!isset($n['created_at'])) {
                $n['created_at'] = now()->toDateTimeString();
            }
        }
        unset($n);

        // Sort by created_at (newest first) — safe because we normalized above
        usort($notifications, function ($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });

        return array_slice($notifications, 0, 20); // Limit to 20 notifications
    }


  private function getSuperAdminNotifications()
    {
    $notifications = [];

    // System health alerts
    $systemAlerts = $this->getSystemHealthAlerts();
    foreach ($systemAlerts as $alert) {
        $notifications[] = [
            'id' => 'system_' . uniqid(),
            'type' => 'system_alert', // standardized
            'title' => $alert['title'],
            'message' => $alert['message'],
            'created_at' => now()->subMinutes(rand(1, 60))->toDateTimeString(),
            'read_at' => null,
            'priority' => $alert['priority'],
            'data' => ['action_url' => $alert['action_url'] ?? null],
        ];
    }

            // New user registrations
            $newUsers = User::where('created_at', '>=', now()->subDays(7))->count();
        if ($newUsers > 0) {
            $notifications[] = [
                'id' => 'new_users_' . uniqid(),
                'type' => 'user_registered', // standardized
                'title' => 'Pengguna Baru Terdaftar',
                'message' => "{$newUsers} pengguna baru telah mendaftar dalam 7 hari terakhir",
                'created_at' => now()->subHours(2)->toDateTimeString(),
                'read_at' => null,
                'priority' => 'info',
                'data' => ['action_url' => '/Users'],
            ];
        }

                return $notifications;
        }
    private function getAdminNotifications()
{
    $notifications = [];

    $pendingCount = Borrowing::where('status', 'pending')->count();
    if ($pendingCount > 0) {
        $notifications[] = [
            'id' => 'pending_approvals_' . uniqid(),
            'type' => 'borrowing_pending', // standardized borrowing_*
            'title' => 'Persetujuan Menunggu',
            'message' => "{$pendingCount} peminjaman menunggu persetujuan Anda",
            'created_at' => now()->subMinutes(30)->toDateTimeString(),
            'read_at' => null,
            'priority' => 'high',
            'data' => ['action_url' => '/Approvals'],
        ];
    }

        // Overdue returns
       
    $overdueCount = Borrowing::where('status', 'active')
        ->where('planned_return_at', '<', now())
        ->count();
    if ($overdueCount > 0) {
        $notifications[] = [
            'id' => 'overdue_returns_' . uniqid(),
            'type' => 'borrowing_overdue',
            'title' => 'Peminjaman Terlambat',
            'message' => "{$overdueCount} ruangan belum dikembalikan sesuai jadwal",
            'created_at' => now()->subHours(1)->toDateTimeString(),
            'read_at' => null,
            'priority' => 'high',
            'data' => ['action_url' => '/Borrowings?filter=overdue'],
        ];
    }

        // Rooms in maintenance
    $maintenanceCount = Room::where('status', 'maintenance')->count();
        if ($maintenanceCount > 0) {
            $notifications[] = [
                'id' => 'maintenance_rooms_' . uniqid(),
                'type' => 'room_maintenance',
                'title' => 'Ruangan Maintenance',
                'message' => "{$maintenanceCount} ruangan sedang dalam perbaikan",
                'created_at' => now()->subHours(3)->toDateTimeString(),
                'read_at' => null,
                'priority' => 'medium',
                'data' => ['action_url' => '/Rooms?status=maintenance'],
            ];
        }

        return $notifications;
    }

   private function getUserSpecificNotifications($user)
    {
    $notifications = [];

    $recentBookings = Borrowing::where('user_id', $user->id)
        ->where('updated_at', '>=', now()->subDays(3))
        ->where('status', '!=', 'pending')
        ->get();

    foreach ($recentBookings as $booking) {
        $notifications[] = [
            'id' => 'booking_' . $booking->id,
            'type' => 'borrowing_updated',
            'title' => $this->getBookingNotificationTitle($booking->status),
            'message' => "Peminjaman ruang {$booking->room->name} telah {$this->getBookingStatusText($booking->status)}",
            'created_at' => $booking->updated_at ? $booking->updated_at->toDateTimeString() : now()->toDateTimeString(),
            'read_at' => null,
            'priority' => 'medium',
            'data' => ['action_url' => "/Borrowings/{$booking->id}", 'borrowing_id' => $booking->id],
        ];
    }

        // Upcoming bookings reminder
            $upcomingBookings = Borrowing::where('user_id', $user->id)
            ->where('status', 'approved')
            ->where('borrowed_at', '>=', now())
            ->where('borrowed_at', '<=', now()->addDay())
            ->get();

        foreach ($upcomingBookings as $booking) {
            $timeUntil = Carbon::parse($booking->borrowed_at)->diffForHumans();
            $notifications[] = [
                'id' => 'reminder_' . $booking->id,
                'type' => 'borrowing_reminder',
                'title' => 'Pengingat Peminjaman',
                'message' => "Peminjaman ruang {$booking->room->name} dimulai {$timeUntil}",
                'created_at' => now()->subMinutes(15)->toDateTimeString(),
                'read_at' => null,
                'priority' => 'high',
                'data' => ['action_url' => "/Borrowings/{$booking->id}", 'borrowing_id' => $booking->id],
            ];
        }

        return $notifications;
    }

    private function getSystemHealthAlerts()
    {
        $alerts = [];

        // Mock system health checks - in real app, these would be actual system metrics
        $diskUsage = 85; // Mock percentage
        if ($diskUsage > 80) {
            $alerts[] = [
                'title' => 'Storage Usage Tinggi',
                'message' => "Penggunaan disk mencapai {$diskUsage}%",
                'priority' => 'warning',
                'action_url' => '/Settings/Database'
            ];
        }

        // Database size check
        $dbSize = 250; // Mock MB
        if ($dbSize > 200) {
            $alerts[] = [
                'title' => 'Database Size Warning',
                'message' => "Ukuran database mencapai {$dbSize}MB",
                'priority' => 'info',
                'action_url' => '/Settings/Database'
            ];
        }

        return $alerts;
    }

    private function getBookingNotificationTitle($status)
    {
        switch ($status) {
            case 'approved':
                return 'Peminjaman Disetujui';
            case 'rejected':
                return 'Peminjaman Ditolak';
            case 'active':
                return 'Peminjaman Aktif';
            case 'completed':
                return 'Peminjaman Selesai';
            case 'cancelled':
                return 'Peminjaman Dibatalkan';
            default:
                return 'Update Peminjaman';
        }
    }

    private function getBookingStatusText($status)
    {
        switch ($status) {
            case 'approved':
                return 'disetujui';
            case 'rejected':
                return 'ditolak';
            case 'active':
                return 'dimulai';
            case 'completed':
                return 'selesai';
            case 'cancelled':
                return 'dibatalkan';
            default:
                return 'diperbarui';
        }
    }
}