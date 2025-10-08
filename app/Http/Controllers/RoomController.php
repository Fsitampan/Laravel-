<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\Borrowing;
use App\Http\Requests\Room\StoreRoomRequest;
use App\Http\Requests\Room\UpdateRoomRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RoomController extends Controller
{
    public function __construct()
    {
        // Apply role middleware for specific actions
        $this->middleware('role:admin,super-admin')->only(['create', 'store', 'edit', 'update', 'updateStatus']);
        $this->middleware('role:super-admin')->only(['destroy']);
    }

    /**
     * Display a listing of the rooms.
     */
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

        // 🔄 Ambil data dengan relasi currentBorrowing
     $rooms = $query
    ->with(['currentBorrowing.user'])
    ->orderBy('name')
    ->paginate(9);

    foreach ($rooms as $room) {
        $room->refreshRoomStatus();
    }

    return Inertia::render('Rooms/Index', [
        'rooms' => $rooms->through(fn($room) => $room->toInertiaArray()),
        'filters' => [
            'search' => $request->input('search'),
        ],
        'can_manage' => auth()->user()->role === 'admin' || auth()->user()->role === 'super-admin',
        'can_delete' => auth()->user()->role === 'super-admin',
    ]);
        }


    /**
     * Show the form for creating a new room.
     */
    public function create(): Response
    {
        return Inertia::render('Rooms/create');
    }

    /**
     * Store a newly created room in storage.
     */
    public function store(StoreRoomRequest $request)
    {
        $data = $request->validated();

        // Cek upload file
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('rooms', 'public');
            $data['image'] = $path;
            $data['image_url'] = null; // kalau pakai upload, kosongkan url
        } elseif ($request->filled('image_url')) {
            // Kalau user isi URL
            $data['image_url'] = $request->input('image_url');
            $data['image'] = null;
        }

        $room = Room::create($data);

        return redirect()->route('Rooms.Index')
            ->with('success', 'Ruangan berhasil ditambahkan.');
    }

    /**
     * Display the specified room.
     */
    public function show(Room $room): Response
    {
        $room->load(['borrowings' => function ($q) {
            $q->with('user')
              ->orderBy('created_at', 'desc')
              ->limit(10);
        }]);

        // Get room statistics
        $stats = [
            'total_bookings' => $room->borrowings()->count(),
            'active_bookings' => $room->borrowings()->where('status', 'active')->count(),
            'completed_bookings' => $room->borrowings()->where('status', 'completed')->count(),
            'monthly_bookings' => $room->borrowings()
                ->whereMonth('created_at', now()->month)
                ->count(),
        ];

        // Get current borrowing if any
        $currentBorrowing = $room->borrowings()
            ->where('status', 'active')
            ->with('user')
            ->first();

        // Get upcoming bookings (approved)
        $upcomingBookings = $room->borrowings()
            ->where('status', 'approved')
            ->where('borrow_date', '>=', now()->toDateString())
            ->with('user')
            ->orderBy('borrow_date')
            ->limit(5)
            ->get();

        return Inertia::render('Rooms/Show', [
            'room' => [
                'id' => $room->id,
                'name' => $room->name,
                'code' => $room->code,
                'full_name' => $room->full_name,
                'description' => $room->description,
                'capacity' => $room->capacity,
                'status' => $room->status,
                'location' => $room->location,
                'notes' => $room->notes,
                'image' => $room->image,
                'image_url' => $room->image_url,
                'facilities' => $room->facilities
                    ? (is_array($room->facilities) ? $room->facilities : json_decode($room->facilities, true))
                    : [],
                'equipment' => $room->equipment ?? [],
                'current_borrowing' => $currentBorrowing ? [
                    'id' => $currentBorrowing->id,
                    'borrower_name' => $currentBorrowing->borrower_name,
                    'user_name' => $currentBorrowing->user?->name ?? null,
                    'purpose' => $currentBorrowing->purpose,
                ] : null,
                'recent_borrowings' => $room->borrowings->map(fn($b) => [
                    'id' => $b->id,
                    'borrower_name' => $b->borrower_name,
                    'status' => $b->status,
                    'created_at' => $b->created_at,
                ]),
                'upcoming_borrowings' => $upcomingBookings->map(fn($b) => [
                    'id' => $b->id,
                    'borrow_date' => $b->borrow_date,
                    'start_time' => $b->start_time,
                    'borrower_name' => $b->borrower_name,
                ]),
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for editing the specified room.
     */
    public function edit(Room $room): Response
    {
        return Inertia::render('Rooms/edit', [
            'room' => [
                'id' => $room->id,
                'name' => $room->name,
                'code' => $room->code,
                'full_name' => $room->full_name,
                'capacity' => $room->capacity,
                'location' => $room->location,
                'description' => $room->description,
                'status' => $room->status,
                'image' => $room->image,
                'facilities' => $room->facilities
                    ? (is_array($room->facilities) ? $room->facilities : json_decode($room->facilities, true))
                    : [],
            ]
        ]);
    }

    /**
     * Update the specified room in storage.
     */
    public function update(UpdateRoomRequest $request, Room $room)
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('rooms', 'public');
            $data['image'] = $path;
            $data['image_url'] = null;
        } elseif ($request->filled('image_url')) {
            $data['image_url'] = $request->input('image_url');
            $data['image'] = null;
        }

        $room->update($data);

        return redirect()->route('Rooms.Show', $room)
            ->with('success', 'Ruangan berhasil diperbarui.');
    }

    /**
     * Update room status.
     */
    public function updateStatus(Request $request, Room $room)
    {
        $request->validate([
            'status' => 'required|in:tersedia,dipakai,pemeliharaan'
        ]);

        $room->update(['status' => $request->status]);

        return redirect()->back()
            ->with('success', 'Status ruangan berhasil diperbarui.');
    }

    /**
     * Remove the specified room from storage.
     */
    public function destroy(Room $room)
    {
        // Check if room has active borrowings
        if ($room->borrowings()->where('status', 'active')->exists()) {
            return redirect()->back()
                ->with('error', 'Tidak dapat menghapus ruangan yang sedang dipinjam.');
        }

        $room->delete();

        return redirect()->route('Rooms.Index')
            ->with('success', 'Ruangan berhasil dihapus.');
    }

    /**
     * Get available rooms for API calls.
     */
    public function available()
    {
        $rooms = Room::where('status', 'tersedia')
            ->orderBy('name')
            ->get(['id', 'name', 'full_name', 'capacity', 'location']);

        return response()->json($rooms);
    }
}
