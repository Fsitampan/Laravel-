<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Room;
use App\Models\Borrowing;
use App\Services\StatisticsService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    protected $statisticsService;

    public function __construct(StatisticsService $statisticsService)
    {
        $this->statisticsService = $statisticsService;
    }

    /**
     * Display the main dashboard based on user role.
     * Super Admins are redirected to their specialized dashboard.
     */
    public function index(): Response|RedirectResponse
    {
        $user = auth()->user();
        
        // Super Admin should be redirected to their specialized dashboard
        if ($user->role === 'super-admin') {
            return redirect('/SuperAdmin/Dashboard');
        }

        // Regular dashboard for admin and users
        return $this->renderStandardDashboard($user);
    }

    /**
     * Super Admin specialized dashboard - handled by SuperAdminController
     * This method redirects to ensure proper controller handling
     */
    public function superAdminDashboard(): RedirectResponse
    {
        // Ensure only super admins can access this
        if (auth()->user()->role !== 'super-admin') {
            return redirect('/Dashboard');
        }

        // Redirect to the actual SuperAdmin controller method
        return redirect()->action([\App\Http\Controllers\SuperAdminController::class, 'dashboard']);
    }

    /**
     * Render the standard dashboard for admin and regular users
     */
    private function renderStandardDashboard($user): Response
    {
        // Basic statistics
        $stats = [
            'total_rooms' => Room::count(),
            'available_rooms' => Room::where('status', 'tersedia')->count(),
            'occupied_rooms' => Room::where('status', 'dipakai')->count(),
            'maintenance_rooms' => Room::where('status', 'pemeliharaan')->count(),
            'total_borrowings_today' => Borrowing::whereDate('created_at', today())->count(),
            'pending_approvals' => Borrowing::where('status', 'pending')->count(),
            'active_borrowings' => Borrowing::where('status', 'active')->count(),
            'total_users' => User::count(),
        ];

        // Room utilization data (last 30 days) - FIXED VERSION
        $roomUtilization = Room::withCount(['borrowings' => function ($query) {
            $query->where('created_at', '>=', now()->subDays(30));
        }])
        ->with(['borrowings' => function ($query) {
            $query->where('created_at', '>=', now()->subDays(30))
                  ->select('room_id', 'start_time', 'end_time', 'borrow_date', 'return_date');
        }])
        ->get()
        ->map(function ($room) {
            // Calculate total hours used
            $totalHours = 0;
            
            foreach ($room->borrowings as $borrowing) {
                if ($borrowing->start_time && $borrowing->end_time) {
                    // Parse waktu mulai dan selesai
                    $startTime = Carbon::parse($borrowing->start_time);
                    $endTime = Carbon::parse($borrowing->end_time);
                    
                    // Hitung durasi dalam jam
                    $duration = $endTime->diffInHours($startTime, true);
                    
                    // Jika ada borrow_date dan return_date, hitung total hari
                    if ($borrowing->borrow_date && $borrowing->return_date) {
                        $borrowDate = Carbon::parse($borrowing->borrow_date);
                        $returnDate = Carbon::parse($borrowing->return_date);
                        $days = $returnDate->diffInDays($borrowDate) + 1; // +1 untuk menghitung hari pertama
                        
                        // Kalikan durasi harian dengan jumlah hari
                        $duration = $duration * $days;
                    }
                    
                    $totalHours += $duration;
                }
            }
            
            // Calculate utilization percentage
            // Asumsi: 8 jam kerja per hari x 30 hari = 240 jam maksimal
            $maxHours = 8 * 30; // 240 jam
            $utilization = $maxHours > 0 ? ($totalHours / $maxHours) * 100 : 0;
            
            return [
                'room_name' => $room->name,
                'total_hours' => round($totalHours, 1),
                'utilization' => min(round($utilization, 1), 100)
            ];
        })
        ->sortByDesc('utilization')
        ->values()
        ->toArray();

        // Monthly bookings trend (last 12 months)
        $monthlyBookings = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthlyBookings[] = [
                'month' => $date->format('M Y'),
                'bookings' => Borrowing::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->count()
            ];
        }

        // Recent activities
   $recentActivities = Borrowing::with(['user', 'room'])
            ->whereIn('status', ['pending', 'approved', 'active'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($borrowing) {
                $activityType = match($borrowing->status) {
                    'pending' => 'borrowing_created',
                    'approved' => 'borrowing_approved',
                    'active' => 'borrowing_active',
                    default => 'borrowing_created',
                };

                $title = match($borrowing->status) {
                    'pending' => 'Peminjaman Baru Menunggu Persetujuan',
                    'approved' => 'Peminjaman Disetujui',
                    'active' => 'Ruangan Sedang Digunakan',
                    default => 'Peminjaman Baru',
                };

                //  deskripsi yang informatif
                $description = "Ruang {$borrowing->room->name} - {$borrowing->purpose}";
                if (!empty($borrowing->participant_count)) {
                    $description .= " ({$borrowing->participant_count} peserta)";
                }

                return [
                    'id' => $borrowing->id,
                    'type' => $activityType,
                    'title' => $title,
                    'description' => $description,
                    'timestamp' => $borrowing->created_at->toIso8601String(),
                    'user' => $borrowing->user->name ?? $borrowing->borrower_name,
                    'room' => $borrowing->room->name,
                    'borrowing_id' => $borrowing->id,
                ];
            });

        // Recent rooms (for display in rooms tab)
        $recentRooms = Room::with(['currentBorrowing' => function ($query) {
            $query->where('status', 'active')
                  ->with('user')
                  ->latest('created_at');
        }])
        ->orderBy('updated_at', 'desc')
        ->limit(6)
        ->get()
        ->map(function ($room) {
            $currentBorrowing = $room->currentBorrowing;
            
            return [
                'id' => $room->id,
                'name' => $room->name,
                'full_name' => $room->full_name ?? "Ruang {$room->name}",
                'capacity' => $room->capacity,
                'location' => $room->location,
                'status' => $room->status,
                'current_borrowing' => $currentBorrowing ? [
                    'borrower_name' => $currentBorrowing->borrower_name ?? $currentBorrowing->user?->name ?? 'Unknown',
                    'borrowed_at' => $currentBorrowing->borrowed_at ?? $currentBorrowing->created_at,
                    'planned_return_at' => $currentBorrowing->planned_return_at ?? null,
                ] : null,
            ];
        });

        // Recent borrowings (role-based filtering)
        $recentBorrowingsQuery = Borrowing::with(['room', 'user']);
        
        if ($user->role === 'user') {
            // Users only see their own borrowings
            $recentBorrowingsQuery->where('user_id', $user->id);
        }
        
        $recentBorrowings = $recentBorrowingsQuery
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Pending approvals (admin only)
        $pendingApprovals = [];
        if (in_array($user->role, ['admin', 'super-admin'])) {
            $pendingApprovals = Borrowing::with(['room', 'user'])
                ->where('status', 'pending')
                ->orderBy('created_at', 'asc')
                ->limit(5)
                ->get();
        }

        // Active borrowings
        $activeBorrowings = Borrowing::with(['room', 'user'])
            ->where('status', 'active')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'room_utilization' => $roomUtilization,
            'monthly_bookings' => $monthlyBookings,
            'recent_activities' => $recentActivities,
            'recent_rooms' => $recentRooms,
            'recent_borrowings' => $recentBorrowings,
            'pending_approvals' => $pendingApprovals,
            'active_borrowings' => $activeBorrowings,
        ]);
    }

    /**
     * API endpoint for real-time statistics
     */
    public function statistics()
    {
        return response()->json([
            'total_rooms' => Room::count(),
            'available_rooms' => Room::where('status', 'tersedia')->count(),
            'occupied_rooms' => Room::where('status', 'dipakai')->count(),
            'maintenance_rooms' => Room::where('status', 'pemeliharaan')->count(),
            'total_borrowings' => Borrowing::count(),
            'active_borrowings' => Borrowing::where('status', 'active')->count(),
            'pending_approvals' => Borrowing::where('status', 'pending')->count(),
            'total_users' => User::count(),
            'last_updated' => now()->toISOString(),
        ]);
    }

    /**
     * Generate activity title based on borrowing status
     */
    private function getActivityTitle($status)
    {
        switch ($status) {
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
}