<?php

use App\Http\Controllers\ApprovalController;
use App\Http\Controllers\BorrowingController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\SuperAdminController;
use App\Http\Controllers\NotificationController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes - BPS Riau Room Management System
|--------------------------------------------------------------------------
*/

// Welcome page
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Authenticated routes
Route::middleware('auth')->group(function () {

    // ✅ FIXED: Notification Page Routes (Inertia - hanya untuk render halaman)
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('index');
    });

    // ✅ FIXED: Notification API Routes (JSON - untuk AJAX calls)
    Route::prefix('api/notifications')->name('api.notifications.')->group(function () {
        // GET routes
        Route::get('/', [NotificationController::class, 'index'])->name('index');
        Route::get('/statistics', [NotificationController::class, 'statistics'])->name('statistics');
        Route::get('/unread-count', [NotificationController::class, 'unreadCount'])->name('unread-count');
        
        // PATCH routes (untuk mark as read/unread)
        Route::patch('/{id}/mark-read', [NotificationController::class, 'markAsRead'])->name('mark-read');
        Route::patch('/{id}/mark-unread', [NotificationController::class, 'markAsUnread'])->name('mark-unread');
        Route::patch('/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('mark-all-read');
        
        // DELETE routes (untuk hapus notifikasi)
        Route::delete('/{id}', [NotificationController::class, 'destroy'])->name('destroy');
        Route::delete('/', [NotificationController::class, 'destroyAll'])->name('destroy-all');
    });
    
    // Dashboard routes with role-based redirection
    Route::get('/Dashboard', function () {
        $user = auth()->user();
        
        // Super Admin gets separate dashboard
        if ($user->role === 'super-admin') {
            return redirect('/SuperAdmin/Dashboard');
        }
        
        // Regular dashboard for admin and users
        return app(DashboardController::class)->index();
    })->name('Dashboard');

    // Super Admin Dashboard (separate from regular dashboard)
    Route::get('/SuperAdmin/Dashboard', [DashboardController::class, 'superAdminDashboard'])
        ->middleware('role:super-admin')
        ->name('superadmin.dashboard');

    // Profile routes
    Route::get('/Profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/Profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/Profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Room Management routes (Capital case)
    Route::prefix('Rooms')->name('Rooms.')->group(function () {
        Route::get('/', [RoomController::class, 'Index'])->name('Index');
        Route::get('/create', [RoomController::class, 'create'])
            ->middleware('role:admin,super-admin')
            ->name('create');
        Route::post('/', [RoomController::class, 'store'])
            ->middleware('role:admin,super-admin')
            ->name('store');
        Route::get('/{room}', [RoomController::class, 'Show'])->name('Show');
        Route::get('/{room}/edit', [RoomController::class, 'edit'])
            ->middleware('role:admin,super-admin')
            ->name('edit');
        Route::post('/{room}', [RoomController::class, 'update'])
            ->middleware('role:admin,super-admin')
            ->name('update');
        Route::delete('/{room}', [RoomController::class, 'destroy'])
            ->middleware('role:super-admin')
            ->name('destroy');
        Route::patch('/{room}/Status', [RoomController::class, 'updateStatus'])
            ->middleware('role:admin,super-admin')
            ->name('status.update');
    });

    // Borrowing Management routes (Capital case)
    Route::prefix('Borrowings')->name('Borrowings.')->group(function () {
        Route::get('/', [BorrowingController::class, 'Index'])->name('Index');
        Route::get('/Create', [BorrowingController::class, 'create'])->name('create');
        Route::post('/', [BorrowingController::class, 'store'])->name('store');
        Route::get('/{borrowing}', [BorrowingController::class, 'show'])->name('show');
        Route::get('/{borrowing}/Edit', [BorrowingController::class, 'edit'])->name('edit');
        Route::put('/{borrowing}', [BorrowingController::class, 'update'])->name('update');
        Route::delete('/{borrowing}', [BorrowingController::class, 'destroy'])->name('destroy');
        Route::patch('/{borrowing}/Return', [BorrowingController::class, 'returnRoom'])->name('return');
        Route::get('/Export', [BorrowingController::class, 'export'])->name('export');
    });

    // Approval Management routes (Capital case) - Admin and Super Admin only
    Route::prefix('Approvals')->middleware('role:admin,super-admin')->name('approvals.')->group(function () {
        Route::get('/', [ApprovalController::class, 'index'])->name('index');
        Route::post('/{borrowing}/approve', [ApprovalController::class, 'approve'])->name('approve');
        Route::post('/{borrowing}/reject', [ApprovalController::class, 'reject'])->name('reject');
        Route::get('/Pending', [ApprovalController::class, 'pending'])->name('pending');
        Route::get('/History', [ApprovalController::class, 'history'])->name('history');
    });

    // History Management routes (Capital case)
    Route::prefix('History')->name('history.')->group(function () {
        Route::get('/', [HistoryController::class, 'index'])->name('index');
        Route::get('/{id}', [HistoryController::class, 'show'])->name('show');
        Route::get('/Export', [HistoryController::class, 'export'])->name('export');
        Route::get('/Analytics', [HistoryController::class, 'analytics'])
            ->middleware('role:admin,super-admin')
            ->name('analytics');
    });

    // User Management routes (Capital case) - Super Admin only
    Route::prefix('users')->middleware('role:super-admin')->name('users.')->group(function () {
        Route::get('/', [UserManagementController::class, 'Index'])->name('Index');
        Route::get('/create', [UserManagementController::class, 'create'])->name('create');
        Route::post('/', [UserManagementController::class, 'store'])->name('store');
        Route::get('/{user}', [UserManagementController::class, 'show'])->name('show');
        Route::get('/{user}/edit', [UserManagementController::class, 'edit'])->name('edit');
        Route::put('/{user}', [UserManagementController::class, 'update'])->name('update');
        Route::delete('/{user}', [UserManagementController::class, 'destroy'])->name('destroy');
        Route::patch('/{user}/Role', [UserManagementController::class, 'updateRole'])->name('role.update');
        Route::patch('/{user}/Status', [UserManagementController::class, 'updateStatus'])->name('status.update');
        Route::get('/Export', [UserManagementController::class, 'export'])->name('export');
    });

    // Settings Management routes (Capital case) - Role-based access
    Route::prefix('Settings')->name('settings.')->group(function () {
        // General settings - accessible by all authenticated users
        Route::get('/', [SettingsController::class, 'index'])->name('index');
        Route::get('/Profile', [SettingsController::class, 'profile'])->name('profile');
        
        // System settings - Admin and Super Admin only
        Route::middleware('role:admin,super-admin')->group(function () {
            Route::get('/System', [SettingsController::class, 'system'])->name('system');
            Route::put('/System', [SettingsController::class, 'updateSystem'])->name('system.update');
            Route::get('/Rooms', [SettingsController::class, 'Rooms'])->name('Rooms');
            Route::get('/notifications', [SettingsController::class, 'notifications'])->name('notifications');
            Route::put('/notifications', [SettingsController::class, 'updateNotifications'])->name('notifications.update');
        });
        
        // Advanced settings - Super Admin only
        Route::middleware('role:super-admin')->group(function () {
            Route::get('/Advanced', [SettingsController::class, 'advanced'])->name('advanced');
            Route::put('/Advanced', [SettingsController::class, 'updateAdvanced'])->name('advanced.update');
            Route::get('/Security', [SettingsController::class, 'security'])->name('security');
            Route::put('/Security', [SettingsController::class, 'updateSecurity'])->name('security.update');
            Route::get('/Database', [SettingsController::class, 'database'])->name('database');
            Route::post('/Database/Backup', [SettingsController::class, 'backup'])->name('database.backup');
            Route::post('/Database/Restore', [SettingsController::class, 'restore'])->name('database.restore');
        });
    });

    // API Routes for AJAX calls (Capital case)
    Route::prefix('Api')->name('api.')->group(function () {
        Route::get('/Rooms/Available', [RoomController::class, 'Available'])->name('Rooms.Available');
        Route::get('/Statistics/Dashboard', [DashboardController::class, 'Statistics'])->name('Statistics.Dashboard');
        Route::get('/Statistics/Analytics', [HistoryController::class, 'Analytics'])->name('Statistics.Analytics');
        Route::get('/users/Search', [UserManagementController::class, 'Search'])
            ->middleware('role:admin,super-admin')
            ->name('users.Search');
    });
});

// Additional Super Admin specific routes
Route::middleware(['auth', 'role:super-admin'])->prefix('SuperAdmin')->name('superadmin.')->group(function () {
    Route::get('/System/Logs', [SettingsController::class, 'systemLogs'])->name('system.logs');
    Route::get('/System/Performance', [SettingsController::class, 'systemPerformance'])->name('system.performance');
    Route::get('/System/Health', [SettingsController::class, 'systemHealth'])->name('system.health');
    Route::post('/System/Maintenance', [SettingsController::class, 'enableMaintenance'])->name('system.maintenance');
    Route::delete('/System/Cache', [SettingsController::class, 'clearCache'])->name('system.cache.clear');
});

require __DIR__.'/auth.php';