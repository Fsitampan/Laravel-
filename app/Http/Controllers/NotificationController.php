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
        
        $query = Notification::forUser($user->id);
        
        // Filter by type
        if ($request->has('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }
        
        // Filter by category
        if ($request->has('category') && $request->category !== 'all') {
            $categories = [
                'user' => ['user_registered', 'user_profile_updated', 'user_deleted'],
                'room' => ['room_created', 'room_updated', 'room_deleted', 'room_maintenance', 'room_available'],
                'borrowing' => ['borrowing_created', 'borrowing_approved', 'borrowing_rejected', 'borrowing_cancelled', 'borrowing_completed', 'borrowing_reminder', 'borrowing_updated', 'borrowing_deleted'],
                'system' => ['system_update', 'system_alert']
            ];
            
            if (isset($categories[$request->category])) {
                $query->whereIn('type', $categories[$request->category]);
            }
        }
        
        // Filter by read/unread
        if ($request->has('status')) {
            if ($request->status === 'unread') {
                $query->unread();
            } elseif ($request->status === 'read') {
                $query->read();
            }
        }
        
        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%");
            });
        }
        
        $notifications = $query->orderBy('created_at', 'desc')
            ->limit(100)
            ->get();

        $unreadCount = Notification::forUser($user->id)->unread()->count();
        
        // Add computed fields to each notification
        foreach ($notifications as $notification) {
            $notification->time_ago = $notification->created_at->diffForHumans();
            $notification->icon = $this->getNotificationIcon($notification->type);
            $notification->color = $this->getNotificationColor($notification->type);
            $notification->category = $this->getNotificationCategory($notification->type);
            $notification->priority = $this->getNotificationPriority($notification->type);
        }

        // Get statistics
        $stats = $this->getStatistics($user->id);

        // If this is an AJAX request (for React components), return JSON
        if ($request->wantsJson() || $request->header('X-Requested-With') === 'XMLHttpRequest') {
            return response()->json([
                'notifications' => $notifications,
                'unread_count' => $unreadCount,
                'total' => $notifications->count(),
                'stats' => $stats,
            ]);
        }

        // Otherwise, return Inertia view
        return inertia('notifications/index', [
            'initialNotifications' => $notifications,
            'initialStats' => $stats,
        ]);
    }
    
    private function getStatistics($userId)
    {
        $total = Notification::forUser($userId)->count();
        $unread = Notification::forUser($userId)->unread()->count();
        $read = Notification::forUser($userId)->read()->count();
        
        // Count by category
        $userNotifications = Notification::forUser($userId)
            ->whereIn('type', ['user_registered', 'user_profile_updated', 'user_deleted'])
            ->count();
            
        $roomNotifications = Notification::forUser($userId)
            ->whereIn('type', ['room_created', 'room_updated', 'room_deleted', 'room_maintenance', 'room_available'])
            ->count();
            
        $borrowingNotifications = Notification::forUser($userId)
            ->whereIn('type', ['borrowing_created', 'borrowing_approved', 'borrowing_rejected', 'borrowing_cancelled', 'borrowing_completed', 'borrowing_reminder', 'borrowing_updated', 'borrowing_deleted'])
            ->count();
            
        $systemNotifications = Notification::forUser($userId)
            ->whereIn('type', ['system_update', 'system_alert'])
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
    
    public function statistics()
    {
        $user = Auth::user();
        
        $total = Notification::forUser($user->id)->count();
        $unread = Notification::forUser($user->id)->unread()->count();
        $read = Notification::forUser($user->id)->read()->count();
        
        // Count by category
        $userNotifications = Notification::forUser($user->id)
            ->whereIn('type', ['user_registered', 'user_profile_updated', 'user_deleted'])
            ->count();
            
        $roomNotifications = Notification::forUser($user->id)
            ->whereIn('type', ['room_created', 'room_updated', 'room_deleted', 'room_maintenance', 'room_available'])
            ->count();
            
        $borrowingNotifications = Notification::forUser($user->id)
            ->whereIn('type', ['borrowing_created', 'borrowing_approved', 'borrowing_rejected', 'borrowing_cancelled', 'borrowing_completed', 'borrowing_reminder', 'borrowing_updated', 'borrowing_deleted'])
            ->count();
            
        $systemNotifications = Notification::forUser($user->id)
            ->whereIn('type', ['system_update', 'system_alert'])
            ->count();
        
        return response()->json([
            'total' => $total,
            'unread' => $unread,
            'read' => $read,
            'by_category' => [
                'user' => $userNotifications,
                'room' => $roomNotifications,
                'borrowing' => $borrowingNotifications,
                'system' => $systemNotifications,
            ]
        ]);
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

        // Sort by timestamp (newest first)
        usort($notifications, function ($a, $b) {
            return strtotime($b['timestamp']) - strtotime($a['timestamp']);
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
                'type' => 'system',
                'title' => $alert['title'],
                'message' => $alert['message'],
                'timestamp' => now()->subMinutes(rand(1, 60))->toISOString(),
                'read' => false,
                'priority' => $alert['priority'],
                'action_url' => $alert['action_url'] ?? null,
            ];
        }

        // New user registrations
        $newUsers = User::where('created_at', '>=', now()->subDays(7))->count();
        if ($newUsers > 0) {
            $notifications[] = [
                'id' => 'new_users_' . uniqid(),
                'type' => 'user',
                'title' => 'Pengguna Baru Terdaftar',
                'message' => "{$newUsers} pengguna baru telah mendaftar dalam 7 hari terakhir",
                'timestamp' => now()->subHours(2)->toISOString(),
                'read' => false,
                'priority' => 'info',
                'action_url' => '/Users',
            ];
        }

        return $notifications;
    }

    private function getAdminNotifications()
    {
        $notifications = [];

        // Pending approvals
        $pendingCount = Borrowing::where('status', 'pending')->count();
        if ($pendingCount > 0) {
            $notifications[] = [
                'id' => 'pending_approvals_' . uniqid(),
                'type' => 'approval',
                'title' => 'Persetujuan Menunggu',
                'message' => "{$pendingCount} peminjaman menunggu persetujuan Anda",
                'timestamp' => now()->subMinutes(30)->toISOString(),
                'read' => false,
                'priority' => 'high',
                'action_url' => '/Approvals',
            ];
        }

        // Overdue returns
        $overdueCount = Borrowing::where('status', 'active')
            ->where('planned_return_at', '<', now())
            ->count();
        if ($overdueCount > 0) {
            $notifications[] = [
                'id' => 'overdue_returns_' . uniqid(),
                'type' => 'warning',
                'title' => 'Peminjaman Terlambat',
                'message' => "{$overdueCount} ruangan belum dikembalikan sesuai jadwal",
                'timestamp' => now()->subHours(1)->toISOString(),
                'read' => false,
                'priority' => 'high',
                'action_url' => '/Borrowings?filter=overdue',
            ];
        }

        // Rooms in maintenance
        $maintenanceCount = Room::where('status', 'maintenance')->count();
        if ($maintenanceCount > 0) {
            $notifications[] = [
                'id' => 'maintenance_rooms_' . uniqid(),
                'type' => 'maintenance',
                'title' => 'Ruangan Maintenance',
                'message' => "{$maintenanceCount} ruangan sedang dalam perbaikan",
                'timestamp' => now()->subHours(3)->toISOString(),
                'read' => false,
                'priority' => 'medium',
                'action_url' => '/Rooms?status=maintenance',
            ];
        }

        return $notifications;
    }

    private function getUserSpecificNotifications($user)
    {
        $notifications = [];

        // User's recent booking updates
        $recentBookings = Borrowing::where('user_id', $user->id)
            ->where('updated_at', '>=', now()->subDays(3))
            ->where('status', '!=', 'pending')
            ->get();

        foreach ($recentBookings as $booking) {
            $notifications[] = [
                'id' => 'booking_' . $booking->id,
                'type' => 'booking',
                'title' => $this->getBookingNotificationTitle($booking->status),
                'message' => "Peminjaman ruang {$booking->room->name} telah {$this->getBookingStatusText($booking->status)}",
                'timestamp' => $booking->updated_at->toISOString(),
                'read' => false,
                'priority' => 'medium',
                'action_url' => "/Borrowings/{$booking->id}",
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
                'type' => 'reminder',
                'title' => 'Pengingat Peminjaman',
                'message' => "Peminjaman ruang {$booking->room->name} dimulai {$timeUntil}",
                'timestamp' => now()->subMinutes(15)->toISOString(),
                'read' => false,
                'priority' => 'high',
                'action_url' => "/Borrowings/{$booking->id}",
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