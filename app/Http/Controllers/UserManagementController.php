<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Enums\UserRole;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Controller; // pastikan ini ada!

class UserManagementController extends Controller
{
    public function __construct()
    {
        // Add explicit permission check with debugging
        $this->middleware(function ($request, $next) {
            $user = auth()->user();
            
            // Debug logging
            \Log::info('UserManagementController Access Check', [
                'user_id' => $user?->id,
                'user_role' => $user?->role,
                'can_manage_users' => $user?->canManageUsers(),
                'request_url' => $request->url(),
                'request_method' => $request->method()
            ]);
            
            // Check if user can manage users
            if (!$user || !$user->canManageUsers()) {
                if ($request->expectsJson()) {
                    return response()->json([
                        'message' => 'Anda tidak memiliki izin untuk mengakses resource ini.',
                        'error' => 'Forbidden',
                        'user_role' => $user?->role,
                        'required_permission' => 'manage-users'
                    ], 403);
                }
                
                return redirect()->route('dashboard')
                    ->with('error', 'Anda tidak memiliki izin untuk mengakses halaman ini.');
            }
            
            return $next($request);
        });
    }

    /**
     * Display a listing of the resource.
     */
  public function Index(Request $request)
{
    $query = User::query();

    if ($request->filled('search')) {
        $query->where('name', 'like', '%' . $request->search . '%')
              ->orWhere('email', 'like', '%' . $request->search . '%');
    }

    if ($request->filled('role')) {
        $query->where('role', $request->role);
    }

    if ($request->filled('category')) {
        $query->where('category', $request->category);
    }

    if ($request->filled('is_active')) {
        $query->where('is_active', $request->is_active === 'true');
    }

    // ✅ pakai paginate, bukan simplePaginate
    $users = $query->orderBy('created_at', 'desc')->paginate(10);

    return inertia('users/Index', [
        'users' => $users,
        'filters' => $request->only(['search', 'role', 'category', 'is_active']),
        'stats' => [
            'total' => User::count(),
            'active' => User::where('is_active', true)->count(),
            'inactive' => User::where('is_active', false)->count(),
            'admins' => User::where('role', 'admin')->count(),
            'super_admins' => User::where('role', 'super-admin')->count(),
            'regular_users' => User::where('role', 'pengguna')->count(),
        ]
    ]);
}


    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('users/create', [
            'roles' => collect(UserRole::cases())->map(fn($role) => [
                'value' => $role->value,
                'label' => $role->label(),
            ]),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['password'] = Hash::make($data['password']);
        $data['created_by'] = auth()->id();
        $data['email_verified_at'] = now();

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        User::create($data);

        return redirect()->route('users.Index')
            ->with('success', 'Pengguna berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user): Response
    {
        $user->load(['createdBorrowings', 'approvedBorrowings']);

        $statistics = [
            'total_borrowings' => $user->createdBorrowings()->count(),
            'active_borrowings' => $user->createdBorrowings()->where('status', 'active')->count(),
            'completed_borrowings' => $user->createdBorrowings()->where('status', 'completed')->count(),
            'approved_count' => $user->approvedBorrowings()->count(),
        ];

        return Inertia::render('users/show', [
            'user' => $user->toInertiaArray(),
            'statistics' => $statistics,
            'recentBorrowings' => $user->createdBorrowings()
                ->with(['room'])
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn($borrowing) => $borrowing->toInertiaArray()),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user): Response
    {
        return Inertia::render('users/edit', [
            'user' => $user->toInertiaArray(),
            'roles' => collect(UserRole::cases())->map(fn($role) => [
                'value' => $role->value,
                'label' => $role->label(),
            ]),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $data = $request->validated();

        // Only update password if provided
        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $user->update($data);

        return redirect()->route('users.Index')
            ->with('success', 'Pengguna berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        // Prevent deleting super admin
        if ($user->isSuperAdmin()) {
            return back()->with('error', 'Super Admin tidak dapat dihapus.');
        }

        // Prevent self-deletion
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Anda tidak dapat menghapus akun sendiri.');
        }

        // Check if user has active borrowings
        if ($user->createdBorrowings()->whereIn('status', ['pending', 'approved', 'active'])->exists()) {
            return back()->with('error', 'Tidak dapat menghapus pengguna yang memiliki peminjaman aktif.');
        }

        // Delete avatar
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $user->delete();

        return redirect()->route('users.Index')
            ->with('success', 'Pengguna berhasil dihapus.');
    }
}