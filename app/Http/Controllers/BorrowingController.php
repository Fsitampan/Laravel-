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
     * Tampilkan daftar peminjaman.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();

        $query = Borrowing::with(['room', 'user', 'creator'])
            ->forUser($user);

        // Filter pencarian
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('borrower_name', 'like', "%{$request->search}%")
                  ->orWhere('purpose', 'like', "%{$request->search}%");
            });
        }
        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $borrowings = $query->orderByDesc('created_at')
            ->paginate(10)
            ->withQueryString();

        $borrowings->getCollection()
            ->transform(fn($borrowing) => $borrowing->toInertiaArray());

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
     * Form create peminjaman.
     */
    public function create(Request $request): Response
    {
        $rooms = Room::where('status', 'tersedia')
            ->where('is_active', true)
            ->get();

        $selectedRoom = $request->room_id
            ? $rooms->firstWhere('id', $request->room_id)
            : null;

        return Inertia::render('Borrowings/Create', [
            'rooms'        => $rooms,
            'selectedRoom' => $selectedRoom,
        ]);
    }

    /**
     * Simpan peminjaman baru.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'room_id'               => 'required|exists:rooms,id',
            'borrower_name'         => 'required|string|max:255',
            'borrower_email'        => 'nullable|email|max:255',
            'borrower_phone'        => 'nullable|string|max:30',
            'borrower_identification' => 'nullable|string|max:50',
            'borrower_category'     => 'required|in:pegawai,tamu,anak-magang',
            'borrower_department'   => 'nullable|string|max:255',
            'borrow_date'           => 'required|date',
            'start_time'            => 'required|date_format:H:i',
            'end_time'              => 'required|date_format:H:i|after:start_time',
            'return_date'           => 'nullable|date|after_or_equal:borrow_date',
            'actual_return_date'    => 'nullable|date',
            'purpose'               => 'required|string|max:500',
            'notes'                 => 'nullable|string|max:500',
        ]);

        Borrowing::create([
            ...$validated,
            'user_id'    => $user->id,
            'created_by' => $user->id,
            'status'     => 'pending',
        ]);

        return redirect()
            ->route('Borrowings.Index')
            ->with('success', 'Peminjaman berhasil diajukan.');
    }

    /**
     * Form edit peminjaman.
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
     * Update peminjaman.
     */
    public function update(Request $request, $id): RedirectResponse
    {
        $borrowing = Borrowing::findOrFail($id);

        $validated = $request->validate([
            'room_id'               => 'required|exists:rooms,id',
            'borrower_name'         => 'required|string|max:255',
            'borrower_email'        => 'nullable|email|max:255',
            'borrower_phone'        => 'nullable|string|max:30',
            'borrower_identification' => 'nullable|string|max:50',
            'borrower_category'     => 'required|in:pegawai,tamu,anak-magang',
            'borrower_department'   => 'nullable|string|max:255',
            'borrow_date'           => 'required|date',
            'start_time'            => 'required|date_format:H:i',
            'end_time'              => 'required|date_format:H:i|after:start_time',
            'return_date'           => 'nullable|date|after_or_equal:borrow_date',
            'actual_return_date'    => 'nullable|date',
            'purpose'               => 'required|string|max:500',
            'notes'                 => 'nullable|string|max:500',
        ]);

        $borrowing->update($validated);

        return redirect()
            ->route('Borrowings.Index')
            ->with('success', 'Peminjaman berhasil diperbarui.');
    }

    /**
     * Hapus peminjaman.
     */
    public function destroy($id): RedirectResponse
    {
        $borrowing = Borrowing::findOrFail($id);
        $borrowing->delete();

        return redirect()
            ->route('Borrowings.Index')
            ->with('success', 'Peminjaman berhasil dihapus.');
    }
}
