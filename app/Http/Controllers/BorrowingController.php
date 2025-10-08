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
 public function index(Request $request)
{
    $user = auth()->user();

    $query = Borrowing::query()
        ->with(['room', 'user'])
        ->orderBy('created_at', 'desc');

    // ✅ VIEW FILTER: Semua / Peminjaman Saya
    $viewAll = $request->boolean('viewAll', false);

    if (!in_array($user->role, ['admin', 'super-admin'])) {
        // User biasa hanya bisa melihat semua jika viewAll=1
        if (!$viewAll) {
            $query->where('user_id', $user->id);
        }
    }

    // 🔍 Pencarian
    if ($request->filled('search')) {
        $search = $request->input('search');
        $query->where(function ($q) use ($search) {
            $q->where('borrower_name', 'like', "%{$search}%")
                ->orWhere('purpose', 'like', "%{$search}%")
                ->orWhereHas('room', fn($r) => $r->where('name', 'like', "%{$search}%"));
        });
    }

    // 🔎 Filter Status (gunakan enum BorrowingStatus)
    if ($request->filled('status') && $request->status !== 'all') {
        $query->where('status', $request->status);
    }

    // 🔄 Pagination
    $borrowings = $query->paginate(10)->withQueryString();

    return Inertia::render('Borrowings/Index', [
        'borrowings' => $borrowings->through(fn($b) => $b->toInertiaArray()),
        'filters' => [
            'search'  => $request->input('search'),
            'status'  => $request->input('status', 'all'),
            'viewAll' => $viewAll,
        ],
        'can_manage' => in_array($user->role, ['admin', 'super-admin']),
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
public function store(Request $request)
{
    $validated = $request->validate([
        'room_id'              => 'required|exists:rooms,id',
        'borrower_name'        => 'required|string|max:255',
        'borrower_email'       => 'nullable|email|max:255',
        'borrower_phone'       => 'required|string|max:20',
        'borrower_identification' => 'nullable|string|max:50',
        'borrower_category'    => 'required|in:pegawai,tamu,anak-magang',
        'borrower_department'  => 'nullable|string',
        'borrower_institution' => 'nullable|string',
        'borrow_date'          => 'required|date|after_or_equal:today',
        'start_time'           => 'required|date_format:H:i',
        'end_time'             => 'required|date_format:H:i|after:start_time',
        'return_date'          => 'nullable|date|after_or_equal:borrow_date',
        'purpose'              => 'required|string|max:500',
        'participant_count'    => 'required|integer|min:1',
        'equipment_needed'     => 'nullable|array',
        'notes'                => 'nullable|string|max:500',
    ]);

    // Gabungkan tanggal dan waktu dengan benar
    $borrowDate = \Carbon\Carbon::parse($validated['borrow_date']);
    $returnDate = isset($validated['return_date']) 
        ? \Carbon\Carbon::parse($validated['return_date'])
        : $borrowDate->copy();

    $validated['user_id'] = auth()->id();
    $validated['created_by'] = auth()->id();
    $validated['borrowed_at'] = $borrowDate->setTimeFromTimeString($validated['start_time']);
    $validated['planned_return_at'] = $returnDate->setTimeFromTimeString($validated['end_time']);
    $validated['status'] = 'pending'; // Set status awal

    Borrowing::create($validated);

    return redirect()->route('Borrowings.Index')
        ->with('success', 'Peminjaman berhasil dibuat dan menunggu persetujuan.');
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

        public function show(Borrowing $borrowing): Response
    {
        $this->authorize('view', $borrowing);

     $borrowing->load(['room', 'user', 'approver', 'creator', 'history.performedBy']);

        if ($borrowing->room && is_string($borrowing->room->facilities)) {
        $borrowing->room->facilities = json_decode($borrowing->room->facilities, true) ?? [];}

        return Inertia::render('Borrowings/Show', [
            'borrowing' => $borrowing->toInertiaArray(),
            'history' => $borrowing->history->map(fn($history) => $history->toInertiaArray()),
        ]);
    }
}
