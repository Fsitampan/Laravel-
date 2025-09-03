<?php


namespace App\Http\Controllers;

use App\Models\Borrowing;
use App\Models\Room;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class BorrowingController extends Controller
{
    /**
     * Tampilkan daftar peminjaman (list).
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();

        $query = Borrowing::with(['room', 'user', 'creator'])
            ->forUser($user);

        // Filter pencarian
        if ($request->search) {
            $query->where('borrower_name', 'like', "%{$request->search}%")
                  ->orWhere('purpose', 'like', "%{$request->search}%");
        }
        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $borrowings = $query->orderByDesc('created_at')->paginate(10)->withQueryString();
        $borrowings->getCollection()->transform(fn($borrowing) => $borrowing->toInertiaArray());

        // Statistik status
        $stats = [
            'total'     => Borrowing::forUser($user)->count(),
            'pending'   => Borrowing::forUser($user)->pending()->count(),
            'approved'  => Borrowing::forUser($user)->approved()->count(),
            'active'    => Borrowing::forUser($user)->active()->count(),
            'completed' => Borrowing::forUser($user)->completed()->count(),
            'rejected'  => Borrowing::forUser($user)->rejected()->count(),
            'cancelled' => Borrowing::forUser($user)->where('status', 'cancelled')->count(),
        ];

        return Inertia::render('Borrowings/Index', [
            'borrowings' => $borrowings,
            'filters'    => $request->only(['search', 'status']),
            'stats'      => $stats,
        ]);
    }

    /**
     * Tampilkan form create.
     */
    public function create(Request $request): Response
    {
        $rooms = Room::where('status', 'tersedia')->where('is_active', true)->get();
        $selectedRoom = null;
        if ($request->room_id) {
            $selectedRoom = $rooms->firstWhere('id', $request->room_id);
        }

        return Inertia::render('Borrowings/Create', [
            'rooms' => $rooms,
            'selectedRoom' => $selectedRoom,
        ]);
    }

    /**
     * Simpan data peminjaman baru.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'room_id'             => 'required|exists:rooms,id',
            'borrower_name'       => 'required|string|max:255',
            'borrower_phone'      => 'required|string|max:30',
            'borrower_category'   => 'required|string',
            'borrower_department' => 'nullable|string|max:255',
            'borrower_institution'=> 'nullable|string|max:255',
            'purpose'             => 'required|string|max:255',
            'borrowed_at'         => 'required|date',
            'planned_return_at'   => 'required|date|after:borrowed_at',
            'participant_count'   => 'required|integer|min:1',
            'equipment_needed'    => 'nullable|array',
            'equipment_needed.*'  => 'string|max:100',
            'notes'               => 'nullable|string|max:255',
            'is_recurring'        => 'boolean',
            'recurring_pattern'   => 'nullable|string',
            'recurring_end_date'  => 'nullable|date|after:borrowed_at',
        ]);

        $borrowing = Borrowing::create([
            ...$validated,
            'user_id'    => $user->id,
            'created_by' => $user->id,
            'status'     => 'pending',
        ]);

        return redirect()->route('borrowings.index')->with('success', 'Peminjaman berhasil diajukan.');
    }

    /**
     * Tampilkan form edit.
     */
    public function edit($id): Response
    {
        $borrowing = Borrowing::with(['room'])->findOrFail($id);
        $rooms = Room::where('status', 'tersedia')->where('is_active', true)->get();

        return Inertia::render('Borrowings/Edit', [
            'borrowing' => $borrowing->toInertiaArray(),
            'rooms'     => $rooms,
        ]);
    }

    /**
     * Update data peminjaman.
     */
    public function update(Request $request, $id): RedirectResponse
    {
        $borrowing = Borrowing::findOrFail($id);

        $validated = $request->validate([
            'room_id'             => 'required|exists:rooms,id',
            'borrower_name'       => 'required|string|max:255',
            'borrower_phone'      => 'required|string|max:30',
            'borrower_category'   => 'required|string',
            'borrower_department' => 'nullable|string|max:255',
            'borrower_institution'=> 'nullable|string|max:255',
            'purpose'             => 'required|string|max:255',
            'borrowed_at'         => 'required|date',
            'planned_return_at'   => 'required|date|after:borrowed_at',
            'participant_count'   => 'required|integer|min:1',
            'equipment_needed'    => 'nullable|array',
            'equipment_needed.*'  => 'string|max:100',
            'notes'               => 'nullable|string|max:255',
            'is_recurring'        => 'boolean',
            'recurring_pattern'   => 'nullable|string',
            'recurring_end_date'  => 'nullable|date|after:borrowed_at',
        ]);

        $borrowing->update($validated);

        return redirect()->route('borrowings.index')->with('success', 'Peminjaman berhasil diperbarui.');
    }

    /**
     * Hapus data peminjaman.
     */
    public function destroy($id): RedirectResponse
    {
        $borrowing = Borrowing::findOrFail($id);
        $borrowing->delete();

        return redirect()->route('borrowings.index')->with('success', 'Peminjaman berhasil dihapus.');
    }
}