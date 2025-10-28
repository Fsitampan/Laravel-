<?php

namespace App\Http\Controllers;

use App\Models\Borrowing;
use App\Models\Room;
use App\Models\BorrowingHistory;
use App\Enums\BorrowingStatus;
use App\Helpers\NotificationHelper; 
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class BorrowingController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        $query = Borrowing::query()
            ->with(['room', 'user'])
            ->orderBy('created_at', 'desc');

        $viewAll = $request->boolean('viewAll', false);

        if (!in_array($user->role, ['admin', 'super-admin'])) {
            if (!$viewAll) {
                $query->where('user_id', $user->id);
            }
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('borrower_name', 'like', "%{$search}%")
                    ->orWhere('purpose', 'like', "%{$search}%")
                    ->orWhereHas('room', fn($r) => $r->where('name', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

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

    public function create(Request $request): Response
    {
        $availableRooms = Room::where('status', 'tersedia')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $processedRooms = $availableRooms->map(function ($room) {
            return $room->toInertiaArray();
        })->values();

        Log::info('Available rooms count: ' . $processedRooms->count());

        $selectedRoom = null;
        if ($request->filled('room_id')) {
            $roomId = (int) $request->room_id;
            $selectedRoom = $processedRooms->firstWhere('id', $roomId);
            
            if ($selectedRoom) {
                Log::info("Selected room: {$selectedRoom['name']}");
            }
        }

        return Inertia::render('Borrowings/Create', [
            'rooms'        => $processedRooms,
            'selectedRoom' => $selectedRoom,
        ]);
    }

    public function store(Request $request)
    {
        Log::info('=== BORROWING STORE REQUEST ===');
        Log::info('Request Method:', ['method' => $request->method()]);
        Log::info('Request URL:', ['url' => $request->fullUrl()]);
        Log::info('All Request Data:', $request->all());
        Log::info('Content-Type:', [$request->header('Content-Type')]);
        Log::info('Auth User:', ['id' => auth()->id(), 'name' => auth()->user()->name]);
        
        try {
            // ✅ Validasi dengan penanganan yang lebih baik
            $validated = $request->validate([
                'room_id'              => 'required|integer|exists:rooms,id',
                'borrower_name'        => 'required|string|max:255',
                'borrower_email'       => 'nullable|email|max:255',
                'borrower_phone'       => 'required|string|max:20',
                'borrower_identification' => 'nullable|string|max:50',
                'borrower_category'    => 'required|in:pegawai,tamu,anak-magang',
                'borrower_department'  => 'nullable|string|max:255',
                'borrower_institution' => 'nullable|string|max:255',
                'borrow_date'          => 'required|date|after_or_equal:today',
                'start_time'           => 'required|date_format:H:i',
                'end_time'             => 'required|date_format:H:i',
                'return_date'          => 'nullable|date|after_or_equal:borrow_date',
                'purpose'              => 'required|string|max:1000',
                'participant_count'    => 'required|integer|min:1',
                'equipment_needed'     => 'nullable|array',
                'equipment_needed.*'   => 'nullable|string|max:255',
                'notes'                => 'nullable|string|max:1000',
                'layout_choice'        => 'nullable|string|max:500',
                'is_recurring'         => 'nullable|boolean',
                'recurring_pattern'    => 'nullable|required_if:is_recurring,true|string|in:daily,weekly,monthly',
                'recurring_end_date'   => 'nullable|required_if:is_recurring,true|date|after:borrow_date',
            ], [
                'room_id.required' => 'Ruangan harus dipilih',
                'room_id.exists' => 'Ruangan yang dipilih tidak valid',
                'borrower_name.required' => 'Nama peminjam harus diisi',
                'borrower_phone.required' => 'Nomor telepon harus diisi',
                'borrower_category.required' => 'Kategori peminjam harus dipilih',
                'borrow_date.required' => 'Tanggal peminjaman harus diisi',
                'borrow_date.after_or_equal' => 'Tanggal peminjaman tidak boleh di masa lampau',
                'start_time.required' => 'Jam mulai harus diisi',
                'end_time.required' => 'Jam selesai harus diisi',
                'purpose.required' => 'Tujuan peminjaman harus diisi',
                'participant_count.required' => 'Jumlah peserta harus diisi',
            ]);

            Log::info('✅ Validation passed:', $validated);

            // ✅ Parse dates dengan Carbon
            $borrowDate = Carbon::parse($validated['borrow_date']);
            $returnDate = isset($validated['return_date']) && !empty($validated['return_date'])
                ? Carbon::parse($validated['return_date'])
                : $borrowDate->copy();

            // ✅ Buat datetime lengkap
            $startDateTime = $borrowDate->copy()->setTimeFromTimeString($validated['start_time']);
            $endDateTime = $returnDate->copy()->setTimeFromTimeString($validated['end_time']);

            Log::info('📅 Parsed dates:', [
                'borrow_date' => $borrowDate->toDateString(),
                'return_date' => $returnDate->toDateString(),
                'start_datetime' => $startDateTime->toDateTimeString(),
                'end_datetime' => $endDateTime->toDateTimeString(),
            ]);

            // ✅ Validasi waktu
            if ($endDateTime->lte($startDateTime)) {
                return back()
                    ->withErrors(['end_time' => 'Waktu selesai harus setelah waktu mulai'])
                    ->withInput();
            }

            if ($startDateTime->isPast()) {
                return back()
                    ->withErrors(['borrow_date' => 'Waktu peminjaman tidak boleh di masa lampau'])
                    ->withInput();
            }

            // ✅ Check room capacity
            $room = Room::findOrFail($validated['room_id']);
            if ($validated['participant_count'] > $room->capacity) {
                return back()
                    ->withErrors(['participant_count' => "Jumlah peserta melebihi kapasitas ruangan ({$room->capacity} orang)"])
                    ->withInput();
            }

            // ✅ Prepare data untuk create
            $borrowingData = [
                'room_id' => $validated['room_id'],
                'user_id' => auth()->id(),
                'created_by' => auth()->id(),
                
                // Borrower info
                'borrower_name' => $validated['borrower_name'],
                'borrower_email' => $validated['borrower_email'] ?? null,
                'borrower_phone' => $validated['borrower_phone'],
                'borrower_identification' => $validated['borrower_identification'] ?? null,
                'borrower_category' => $validated['borrower_category'],
                'borrower_department' => $validated['borrower_department'] ?? null,
                'borrower_institution' => $validated['borrower_institution'] ?? null,
                
                // Time fields - PENTING: Format yang benar
                'borrow_date' => $borrowDate->format('Y-m-d'),
                'start_time' => $validated['start_time'],
                'end_time' => $validated['end_time'],
                'return_date' => $returnDate->format('Y-m-d'),
                'borrowed_at' => $startDateTime->format('Y-m-d H:i:s'),
                'planned_return_at' => $endDateTime->format('Y-m-d H:i:s'),
                
                // Details
                'purpose' => $validated['purpose'],
                'participant_count' => $validated['participant_count'],
                'equipment_needed' => !empty($validated['equipment_needed']) 
                    ? array_filter($validated['equipment_needed']) 
                    : [],
                'notes' => $validated['notes'] ?? null,
                'layout_choice' => $validated['layout_choice'] ?? null,
                
                // Recurring
                'is_recurring' => $validated['is_recurring'] ?? false,
                'recurring_pattern' => $validated['recurring_pattern'] ?? null,
                'recurring_end_date' => !empty($validated['recurring_end_date']) 
                ? Carbon::parse($validated['recurring_end_date'])->format('Y-m-d')
                : null,
                
                // Status
                'status' => 'pending',
            ];

            Log::info('💾 Data to be created:', $borrowingData);

            // ✅ Create borrowing in transaction
            DB::beginTransaction();
            
            try {
                $borrowing = Borrowing::create($borrowingData);
                
                Log::info('✅ Borrowing created successfully', [
                    'id' => $borrowing->id,
                    'room_id' => $borrowing->room_id,
                    'borrowed_at' => $borrowing->borrowed_at,
                    'status' => $borrowing->status,
                ]);
                
                // Load relasi room untuk notifikasi
                $borrowing->load('room');

                // Kirim notifikasi ke admin
                try {
                    NotificationHelper::notifyBorrowingCreated($borrowing);
                    Log::info('📧 Notification sent successfully');
                } catch (\Exception $e) {
                    Log::error('⚠️ Failed to send notification: ' . $e->getMessage());
                    // Don't fail the whole operation if notification fails
                }
                
                DB::commit();
                
                Log::info('✅ Transaction committed successfully');
                
                return redirect()->route('Borrowings.Index')
                    ->with('success', 'Peminjaman berhasil diajukan dan menunggu persetujuan.');
                    
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('❌ Failed to create borrowing:', [
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString()
                ]);
                
                return back()
                    ->withErrors(['error' => 'Gagal membuat peminjaman: ' . $e->getMessage()])
                    ->withInput();
            }
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('❌ Validation failed:', $e->errors());
            throw $e;
        } catch (\Exception $e) {
            Log::error('❌ Unexpected error in store method:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()
                ->withErrors(['error' => 'Terjadi kesalahan: ' . $e->getMessage()])
                ->withInput();
        }
    }

    public function edit($id): Response
    {
        $borrowing = Borrowing::with(['room'])->findOrFail($id);
        
        $availableRooms = Room::where('status', 'tersedia')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();
        
        $processedRooms = $availableRooms->map(function ($room) {
            return $room->toInertiaArray();
        })->values();

        return Inertia::render('Borrowings/Edit', [
            'borrowing' => $borrowing->toInertiaArray(),
            'rooms'     => $processedRooms,
        ]);
    }

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
            'layout_choice'         => 'nullable|string|max:500',
        ]);

        $borrowing->update($validated);

        return redirect()
            ->route('Borrowings.Index')
            ->with('success', 'Peminjaman berhasil diperbarui.');
    }

    public function destroy($id): RedirectResponse
    {
        $borrowing = Borrowing::findOrFail($id);
        $borrowing->delete();

        return redirect()
            ->route('Borrowings.Index')
            ->with('success', 'Peminjaman berhasil dihapus.');
    }

    public function cancel(Request $request, Borrowing $borrowing): RedirectResponse
    {
        if ($borrowing->user_id !== auth()->id() && !in_array(auth()->user()->role, ['admin', 'super-admin'])) {
            return back()->with('error', 'Anda tidak memiliki izin untuk membatalkan peminjaman ini.');
        }

        if (!$borrowing->canBeCancelled()) {
            return back()->with('error', 'Peminjaman ini tidak dapat dibatalkan karena sudah ' . $borrowing->status_label . '.');
        }

        $request->validate([
            'cancellation_reason' => 'required|string|max:500',
        ]);

        $oldStatus = $borrowing->status;

        DB::transaction(function () use ($borrowing, $request, $oldStatus) {
            $borrowing->update([
                'status' => BorrowingStatus::CANCELLED,
                'notes' => $request->cancellation_reason,
            ]);

            BorrowingHistory::create([
                'borrowing_id' => $borrowing->id,
                'action' => 'cancelled',
                'old_status' => $oldStatus->value,
                'new_status' => BorrowingStatus::CANCELLED->value,
                'comment' => 'Dibatalkan: ' . $request->cancellation_reason,
                'performed_by' => auth()->id(),
                'performed_at' => now(),
            ]);

            $borrowing->load('room');

            if (!in_array(auth()->user()->role, ['admin', 'super-admin'])) {
                NotificationHelper::notifyBorrowingCancelled($borrowing, $request->cancellation_reason);
            }
        });

        return back()->with('success', 'Peminjaman berhasil dibatalkan.');
    }

    public function show(Borrowing $borrowing): Response
    {
        $this->authorize('view', $borrowing);

        $borrowing->load(['room', 'user', 'approver', 'creator', 'history.performedBy']);

        if ($borrowing->room && is_string($borrowing->room->facilities)) {
            $borrowing->room->facilities = json_decode($borrowing->room->facilities, true) ?? [];
        }

        return Inertia::render('Borrowings/Show', [
            'borrowing' => $borrowing->toInertiaArray(),
            'history' => $borrowing->history->map(fn($history) => $history->toInertiaArray()),
        ]);
    }
}