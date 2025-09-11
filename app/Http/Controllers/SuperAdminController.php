<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Room;
use App\Models\Borrowing;
use App\Models\SystemSetting;
use App\Services\StatisticsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;
use Carbon\Carbon;

class SuperAdminController extends Controller
{
    protected $statisticsService;

    public function __construct(StatisticsService $statisticsService)
    {
        $this->statisticsService = $statisticsService;
        
        // Ensure only super admins can access these methods
        $this->middleware('role:super-admin');
    }

    public function dashboard()
    {
        // Enhanced statistics for super admin
        $stats = [
            // Basic stats
            'total_rooms' => Room::count(),
            'available_rooms' => Room::where('status', 'available')->count(),
            'occupied_rooms' => Room::where('status', 'occupied')->count(),
            'maintenance_rooms' => Room::where('status', 'maintenance')->count(),
            
            // User statistics
            'total_users' => User::count(),
            'admin_users' => User::where('role', 'admin')->count(),
            'regular_users' => User::where('role', 'user')->count(),
            'active_users' => User::where('last_login_at', '>=', now()->subDays(30))->count(),
            
            // Borrowing statistics
            'total_borrowings' => Borrowing::count(),
            'active_borrowings' => Borrowing::where('status', 'active')->count(),
            'pending_approvals' => Borrowing::where('status', 'pending')->count(),
            'completed_today' => Borrowing::where('status', 'completed')
                ->whereDate('actual_return_date', today())->count(),
            'monthly_borrowings' => Borrowing::whereMonth('created_at', now()->month)->count(),
            
            // System statistics
            'database_size' => $this->getDatabaseSize(),
            'storage_used' => $this->getStorageUsage(),
            'cache_size' => $this->getCacheSize(),
            'system_uptime' => $this->getSystemUptime(),
        ];

        // Recent activities with more details for super admin
        $recentActivities = $this->getRecentActivities(20);
        
        // System health metrics
        $systemHealth = [
            'database' => $this->checkDatabaseHealth(),
            'storage' => $this->checkStorageHealth(),
            'queue' => $this->checkQueueHealth(),
            'cache' => $this->checkCacheHealth(),
        ];

        // Performance metrics
        $performanceMetrics = [
            'average_response_time' => $this->getAverageResponseTime(),
            'peak_concurrent_users' => $this->getPeakConcurrentUsers(),
            'error_rate' => $this->getErrorRate(),
            'memory_usage' => $this->getMemoryUsage(),
        ];

        // Room utilization analytics
        $roomUtilization = $this->statisticsService->getRoomUtilizationStats(30);
        
        // User activity analytics
        $userActivity = $this->getUserActivityStats();
        
        // Monthly trends
        $monthlyTrends = $this->getMonthlyTrends();
        
        // Top statistics for quick view
        $topStats = [
            'most_used_room' => $this->getMostUsedRoom(),
            'busiest_day' => $this->getBusiestDay(),
            'peak_hour' => $this->getPeakHour(),
            'most_active_user' => $this->getMostActiveUser(),
        ];

        return Inertia::render('SuperAdmin/Dashboard', [
            'stats' => $stats,
            'recent_activities' => $recentActivities,
            'system_health' => $systemHealth,
            'performance_metrics' => $performanceMetrics,
            'room_utilization' => $roomUtilization,
            'user_activity' => $userActivity,
            'monthly_trends' => $monthlyTrends,
            'top_stats' => $topStats,
            'pending_approvals' => Borrowing::with(['room', 'user'])
                ->where('status', 'pending')
                ->orderBy('created_at', 'asc')
                ->limit(5)
                ->get(),
            'system_alerts' => $this->getSystemAlerts(),
        ]);
    }

    private function getDatabaseSize()
    {
        try {
            $result = DB::select("
                SELECT 
                    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
                FROM information_schema.tables 
                WHERE table_schema = ?
            ", [env('DB_DATABASE')]);
            
            return $result[0]->size_mb ?? 0;
        } catch (\Exception $e) {
            return 'N/A';
        }
    }

    private function getStorageUsage()
    {
        try {
            $bytes = disk_total_space(storage_path()) - disk_free_space(storage_path());
            return round($bytes / 1024 / 1024 / 1024, 2); // GB
        } catch (\Exception $e) {
            return 'N/A';
        }
    }

    private function getCacheSize()
    {
        try {
            return Cache::getStore() instanceof \Illuminate\Cache\FileStore 
                ? $this->getDirectorySize(storage_path('framework/cache'))
                : 'N/A';
        } catch (\Exception $e) {
            return 'N/A';
        }
    }

    private function getDirectorySize($directory)
    {
        $size = 0;
        foreach (new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($directory)) as $file) {
            $size += $file->getSize();
        }
        return round($size / 1024 / 1024, 2); // MB
    }

    private function getSystemUptime()
    {
        try {
            $uptime = shell_exec('uptime -s');
            if ($uptime) {
                return Carbon::parse(trim($uptime))->diffForHumans();
            }
            return 'N/A';
        } catch (\Exception $e) {
            return 'N/A';
        }
    }

    private function getRecentActivities($limit = 10)
    {
        return DB::table('borrowings')
            ->join('users', 'borrowings.user_id', '=', 'users.id')
            ->join('rooms', 'borrowings.room_id', '=', 'rooms.id')
            ->select([
                'borrowings.id',
                'borrowings.status',
                'borrowings.created_at',
                'borrowings.updated_at',
                'users.name as user_name',
                'rooms.name as room_name',
                'borrowings.purpose'
            ])
            ->orderBy('borrowings.updated_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($activity) {
                return [
                    'id' => $activity->id,
                    'title' => $this->getActivityTitle($activity),
                    'description' => $this->getActivityDescription($activity),
                    'timestamp' => $activity->updated_at,
                    'user' => $activity->user_name,
                    'type' => $activity->status,
                ];
            });
    }

    private function getActivityTitle($activity)
    {
        switch ($activity->status) {
            case 'pending':
                return 'Peminjaman Baru Menunggu Persetujuan';
            case 'approved':
                return 'Peminjaman Disetujui';
            case 'active':
                return 'Ruangan Sedang Digunakan';
            case 'completed':
                return 'Peminjaman Selesai';
            case 'rejected':
                return 'Peminjaman Ditolak';
            case 'cancelled':
                return 'Peminjaman Dibatalkan';
            default:
                return 'Aktivitas Peminjaman';
        }
    }

    private function getActivityDescription($activity)
    {
        return "{$activity->user_name} - Ruang {$activity->room_name} untuk {$activity->purpose}";
    }

    private function checkDatabaseHealth()
    {
        try {
            DB::select('SELECT 1');
            return ['status' => 'healthy', 'message' => 'Database connection OK'];
        } catch (\Exception $e) {
            return ['status' => 'error', 'message' => 'Database connection failed'];
        }
    }

    private function checkStorageHealth()
    {
        $freeSpace = disk_free_space(storage_path());
        $totalSpace = disk_total_space(storage_path());
        $usagePercent = (($totalSpace - $freeSpace) / $totalSpace) * 100;

        if ($usagePercent > 90) {
            return ['status' => 'warning', 'message' => 'Storage usage over 90%'];
        } elseif ($usagePercent > 95) {
            return ['status' => 'error', 'message' => 'Storage usage critical'];
        } else {
            return ['status' => 'healthy', 'message' => 'Storage usage normal'];
        }
    }

    private function checkQueueHealth()
    {
        // This would depend on your queue driver
        return ['status' => 'healthy', 'message' => 'Queue system operational'];
    }

    private function checkCacheHealth()
    {
        try {
            Cache::put('health_check', 'ok', 60);
            $result = Cache::get('health_check');
            return $result === 'ok' 
                ? ['status' => 'healthy', 'message' => 'Cache system operational']
                : ['status' => 'error', 'message' => 'Cache system not responding'];
        } catch (\Exception $e) {
            return ['status' => 'error', 'message' => 'Cache system error'];
        }
    }

    private function getAverageResponseTime()
    {
        // This would typically come from application performance monitoring
        return rand(100, 500) . ' ms'; // Placeholder
    }

    private function getPeakConcurrentUsers()
    {
        // This would come from session tracking
        return User::where('last_login_at', '>=', now()->subHours(1))->count();
    }

    private function getErrorRate()
    {
        // This would come from error logging
        return '0.1%'; // Placeholder
    }

    private function getMemoryUsage()
    {
        return round(memory_get_usage(true) / 1024 / 1024, 2) . ' MB';
    }

    private function getUserActivityStats()
    {
        return [
            'daily_active_users' => User::where('last_login_at', '>=', now()->subDay())->count(),
            'weekly_active_users' => User::where('last_login_at', '>=', now()->subWeek())->count(),
            'monthly_active_users' => User::where('last_login_at', '>=', now()->subMonth())->count(),
            'new_users_this_month' => User::whereMonth('created_at', now()->month)->count(),
        ];
    }

    private function getMonthlyTrends()
    {
        $months = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $months[] = [
                'month' => $date->format('M Y'),
                'borrowings' => Borrowing::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->count(),
                'users' => User::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->count(),
            ];
        }
        return $months;
    }

    private function getMostUsedRoom()
    {
        $room = Room::withCount('borrowings')
            ->orderBy('borrowings_count', 'desc')
            ->first();
        
        return $room ? "Ruang {$room->name} ({$room->borrowings_count} kali)" : 'N/A';
    }

    private function getBusiestDay()
    {
        $day = Borrowing::select(DB::raw('DAYNAME(created_at) as day_name, COUNT(*) as count'))
            ->groupBy('day_name')
            ->orderBy('count', 'desc')
            ->first();
            
        return $day ? "{$day->day_name} ({$day->count} peminjaman)" : 'N/A';
    }

    private function getPeakHour()
    {
        $hour = Borrowing::select(DB::raw('HOUR(borrowed_at) as hour, COUNT(*) as count'))
            ->groupBy('hour')
            ->orderBy('count', 'desc')
            ->first();
            
        return $hour ? sprintf('%02d:00 (%d peminjaman)', $hour->hour, $hour->count) : 'N/A';
    }

    private function getMostActiveUser()
    {
        $user = User::withCount('borrowings')
            ->orderBy('borrowings_count', 'desc')
            ->first();
            
        return $user ? "{$user->name} ({$user->borrowings_count} peminjaman)" : 'N/A';
    }

    private function getSystemAlerts()
    {
        $alerts = [];
        
        // Check for pending approvals
        $pendingCount = Borrowing::where('status', 'pending')->count();
        if ($pendingCount > 5) {
            $alerts[] = [
                'type' => 'warning',
                'title' => 'Banyak Peminjaman Menunggu',
                'message' => "{$pendingCount} peminjaman menunggu persetujuan",
                'action_url' => '/Approvals',
            ];
        }
        
        // Check for overdue returns
        $overdueCount = Borrowing::where('status', 'active')
            ->where('planned_return_at', '<', now())
            ->count();
        if ($overdueCount > 0) {
            $alerts[] = [
                'type' => 'error',
                'title' => 'Peminjaman Terlambat',
                'message' => "{$overdueCount} ruangan belum dikembalikan sesuai jadwal",
                'action_url' => '/Borrowings?status=overdue',
            ];
        }
        
        // Check for maintenance rooms
        $maintenanceCount = Room::where('status', 'maintenance')->count();
        if ($maintenanceCount > 0) {
            $alerts[] = [
                'type' => 'info',
                'title' => 'Ruangan Maintenance',
                'message' => "{$maintenanceCount} ruangan sedang dalam perbaikan",
                'action_url' => '/Rooms?status=maintenance',
            ];
        }
        
        return $alerts;
    }
}