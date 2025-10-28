<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\Borrowing;
use App\Http\Requests\Room\StoreRoomRequest;
use App\Http\Requests\Room\UpdateRoomRequest;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule; // ✅ TAMBAHKAN INI
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Storage;

class RoomController extends Controller
{
    public function __construct()
    {
        $this->middleware('role:admin,super-admin')->only(['create', 'store', 'edit', 'update', 'updateStatus']);
        $this->middleware('role:super-admin')->only(['destroy']);
    }

    public function index(Request $request): Response
    {
        $query = Room::query();

        // 🔎 Filter by search
        if ($request->filled('search')) {
            $q = $request->input('search');
            $query->where(function ($qq) use ($q) {
                $qq->where('name', 'like', "%{$q}%")
                ->orWhere('code', 'like', "%{$q}%")
                ->orWhere('description', 'like', "%{$q}%")
                ->orWhere('location', 'like', "%{$q}%");
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $statusMap = [
                'available' => \App\Enums\RoomStatus::TERSEDIA,
                'occupied' => \App\Enums\RoomStatus::DIPAKAI,
                'maintenance' => \App\Enums\RoomStatus::PEMELIHARAAN,
            ];
            if (isset($statusMap[$request->status])) {
                $query->where('status', $statusMap[$request->status]);
            }
        }

        $rooms = $query
            ->with(['currentBorrowing.user'])
            ->orderBy('name')
            ->paginate(9);

        return Inertia::render('Rooms/Index', [
            'rooms' => $rooms->through(fn($room) => $room->toInertiaArray()),
            'filters' => [
                'search' => $request->input('search'),
            ],
            'can_manage' => auth()->user()->role === 'admin' || auth()->user()->role === 'super-admin',
            'can_delete' => auth()->user()->role === 'super-admin',
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Rooms/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:rooms,code',
            'full_name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'capacity' => 'required|integer|min:1',
            'status' => 'required|in:tersedia,dipakai,pemeliharaan',
            'location' => 'nullable|string|max:255',
            'facilities' => 'nullable',
            'notes' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'layouts.*' => 'nullable|image|max:2048',
        ]);

        // Simpan gambar utama
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('rooms', 'public');
        }

        // Simpan layout images (bisa banyak file)
        $layoutPaths = [];
        if ($request->hasFile('layouts')) {
            foreach ($request->file('layouts') as $file) {
                $layoutPaths[] = $file->store('rooms/layouts', 'public');
            }
        }

        // Ubah facilities ke JSON jika belum
        if (is_array($validated['facilities'] ?? null)) {
            $validated['facilities'] = json_encode($validated['facilities']);
        }

        // Simpan data ruangan ke DB
        $room = Room::create([
            'name' => $validated['name'],
            'code' => $validated['code'],
            'full_name' => $validated['full_name'] ?? null,
            'description' => $validated['description'] ?? null,
            'capacity' => $validated['capacity'],
            'status' => $validated['status'],
            'location' => $validated['location'] ?? null,
            'facilities' => $validated['facilities'] ?? json_encode([]),
            'layout_images' => json_encode($layoutPaths), // ✅ simpan path ke kolom ini
            'image' => $validated['image'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'created_by' => auth()->id(),
            'updated_by' => auth()->id(),
            'is_active' => true,
        ]);

        return redirect()->route('Rooms.Index')->with('success', 'Ruangan berhasil ditambahkan!');
    }

    public function show(Room $room): Response
    {
        // Muat relasi yang diperlukan (currentBorrowing sudah otomatis dimuat via toInertiaArray)
        $room->load(['currentBorrowing.user']);

        // Hitung statistik
        $stats = [
            'total_bookings' => $room->borrowings()->count(),
            'active_bookings' => $room->borrowings()->where('status', 'active')->count(),
            'completed_bookings' => $room->borrowings()->where('status', 'completed')->count(),
            'monthly_bookings' => $room->borrowings()
                ->whereMonth('created_at', now()->month)
                ->count(),
        ];

        // Ambil peminjaman yang akan datang
        $upcomingBookings = $room->borrowings()
            ->where('status', 'approved')
            ->where('borrow_date', '>=', now()->toDateString())
            ->with('user')
            ->orderBy('borrow_date')
            ->limit(5)
            ->get();
        
        // Ambil peminjaman terbaru (untuk riwayat)
        $recentBookings = $room->borrowings()
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Kirim data yang sudah diproses oleh model
        return Inertia::render('Rooms/Show', [
            'room' => $room->toInertiaArray(), // ✅ Menggunakan accessor dari model
            'stats' => $stats,
            'upcoming_borrowings' => $upcomingBookings,
            'recent_borrowings' => $recentBookings,
        ]);
    }

   public function edit(Room $room): Response
    {
        return Inertia::render('Rooms/edit', [
            'room' => [
                ...$room->toArray(),
                'facilities' => json_encode($room->facilities),
                'layout_images' => json_encode($room->layout_images),
            ],
        ]);
    }

    public function update(Request $request, Room $room)
    {
        // ✅ Validasi input
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('rooms', 'code')->ignore($room->id),
            ],
            'capacity' => 'required|integer|min:1',
            'status' => 'required|in:tersedia,dipakai,pemeliharaan',
            'full_name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'is_active' => 'nullable|in:true,false,1,0',
            'facilities' => 'nullable',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'layouts.*' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ], [
            'code.unique' => 'Kode ruangan sudah digunakan oleh ruangan lain.',
            'image.max' => 'Ukuran gambar maksimal 2MB.',
            'layouts.*.max' => 'Ukuran setiap layout maksimal 2MB.',
        ]);

       
        if (isset($validated['facilities'])) {
            if (is_string($validated['facilities'])) {
                $decoded = json_decode($validated['facilities'], true);
                $validated['facilities'] = is_array($decoded) ? $decoded : [$validated['facilities']];
            }
        }

    
        if (isset($validated['is_active'])) {
            $validated['is_active'] = filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN);
        }

        if ($request->hasFile('image')) {
            // Hapus gambar lama (jika ada)
            if ($room->image && Storage::disk('public')->exists($room->image)) {
                Storage::disk('public')->delete($room->image);
            }

            // Simpan gambar baru
            $validated['image'] = $request->file('image')->store('rooms', 'public');
        }

   
        if ($request->hasFile('layouts')) {
            // Hapus layout lama terlebih dahulu
            $oldLayouts = $room->layout_images ?? [];
            if (is_string($oldLayouts)) {
                $oldLayouts = json_decode($oldLayouts, true) ?? [];
            }

            if (is_array($oldLayouts)) {
                foreach ($oldLayouts as $oldPath) {
                    if (Storage::disk('public')->exists($oldPath)) {
                        Storage::disk('public')->delete($oldPath);
                    }
                }
            }

            // Simpan layout baru
            $newLayoutPaths = [];
            foreach ($request->file('layouts') as $layoutFile) {
                $path = $layoutFile->store('rooms/layouts', 'public');
                $newLayoutPaths[] = $path;
            }

            $validated['layout_images'] = $newLayoutPaths;
        }

        unset($validated['layouts']);
    
        $room->update($validated);

        return redirect()
            ->route('Rooms.Index')
            ->with('success', 'Ruangan berhasil diperbarui.');
    }

    public function updateStatus(Request $request, Room $room)
    {
        $request->validate([
            'status' => 'required|in:tersedia,dipakai,pemeliharaan'
        ]);

        $room->update(['status' => $request->status]);

        return redirect()->back()
            ->with('success', 'Status ruangan berhasil diperbarui.');
    }

    public function destroy(Room $room)
    {
        // Check active borrowings
        if ($room->borrowings()->where('status', 'active')->exists()) {
            return redirect()->back()
                ->with('error', 'Tidak dapat menghapus ruangan yang sedang dipinjam.');
        }

        // ✅ FIX: Hapus gambar utama
        if ($room->image_url && Storage::disk('public')->exists($room->image_url)) {
            Storage::disk('public')->delete($room->image_url);
        }

        // ✅ FIX: Hapus semua layout
        if ($room->layouts) {
            $layouts = json_decode($room->layouts, true);
            if (is_array($layouts)) {
                foreach ($layouts as $layoutPath) {
                    if (Storage::disk('public')->exists($layoutPath)) {
                        Storage::disk('public')->delete($layoutPath);
                    }
                }
            }
        }

        $room->delete();

        // ✅ FIX: Typo - huruf kecil
        return redirect()->route('Rooms.Index')
            ->with('success', 'Ruangan berhasil dihapus.');
    }

    public function available()
    {
        $rooms = Room::where('status', 'tersedia')
            ->where('is_active', true) // ✅ Tambahkan filter aktif
            ->orderBy('name')
            ->get(['id', 'name', 'full_name', 'capacity', 'location']);

        return response()->json($rooms);
    }
}