<?php

namespace App\Http\Controllers;

use App\Models\Borrowing;
use App\Models\BorrowingHistory;
use App\Enums\BorrowingStatus;
use App\Enums\RoomStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB; // ← TAMBAHKAN INI

class ApprovalController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:approve-rejects');
    }

    /**
     * Display a listing of pending approvals and recent decisions.
     */
    public function index(Request $request): Response
    {
        // Pending approvals (paginated)
        $pendingApprovals = Borrowing::with(['room', 'user', 'creator'])
            ->where('status', BorrowingStatus::PENDING)
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('borrower_name', 'like', "%{$search}%")
                      ->orWhere('purpose', 'like', "%{$search}%")
                      ->orWhereHas('room', function ($q2) use ($search) {
                          $q2->where('name', 'like', "%{$search}%");
                      });
                });
            })
            ->orderBy('created_at', 'asc')
            ->paginate(10)
            ->withQueryString();

        // Recent decisions (last 10 approved/rejected)
        $recentDecisions = Borrowing::with(['room', 'user', 'creator'])
            ->whereIn('status', [BorrowingStatus::APPROVED, BorrowingStatus::REJECTED])
            ->orderBy('updated_at', 'desc')
            ->limit(10)
            ->get();

        // Stats
        $stats = [
            'total_pending'    => Borrowing::where('status', BorrowingStatus::PENDING)->count(),
            'approved_today'   => Borrowing::where('status', BorrowingStatus::APPROVED)
                                        ->whereDate('approved_at', today())->count(),
            'rejected_today'   => Borrowing::where('status', BorrowingStatus::REJECTED)
                                        ->whereDate('updated_at', today())->count(),
            'avg_response_time'=> $this->getAverageResponseTime(),
        ];

        return Inertia::render('Approvals/Index', [
            'approvals' => $pendingApprovals->through(fn($b) => $b->toInertiaArray()),
            'recent_decisions'  => $recentDecisions->map(fn($b) => $b->toInertiaArray()),
            'stats'             => $stats,
            'filters'           => $request->only(['search', 'status']), // ← Perbaiki ini
        ]);
    }

    /**
     * Approve a borrowing request.
     */
    public function approve(Request $request, Borrowing $borrowing): RedirectResponse
    {
        if (!$borrowing->isPending()) {
            return back()->with('error', 'Peminjaman ini sudah diproses sebelumnya.');
        }

        // Simpan status lama untuk history
        $oldStatus = $borrowing->status;

        DB::transaction(function () use ($borrowing, $request, $oldStatus) {
            // Update borrowing - STATUS TETAP APPROVED, nanti auto jadi ACTIVE oleh command
            $borrowing->update([
                'status' => BorrowingStatus::APPROVED,
                'approved_by' => auth()->id(),
                'approved_at' => now(),
                'notes' => $request->admin_notes, // ← Gunakan 'notes' bukan 'admin_notes'
            ]);

            // JANGAN update room status di sini - biarkan command yang handle
            // Room status akan berubah saat borrowing menjadi ACTIVE

            // Create history
            BorrowingHistory::create([
                'borrowing_id' => $borrowing->id,
                'action' => 'approved',
                'old_status' => $oldStatus->value,
                'new_status' => BorrowingStatus::APPROVED->value,
                'comment' => $request->admin_notes ?? 'Peminjaman disetujui',
                'performed_by' => auth()->id(),
                'performed_at' => now(),
            ]);
        });

        return back()->with('success', 'Peminjaman berhasil disetujui.');
    }

    /**
     * Reject a borrowing request.
     */
    public function reject(Request $request, Borrowing $borrowing): RedirectResponse
    {
        $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        if (!$borrowing->isPending()) {
            return back()->with('error', 'Peminjaman ini sudah diproses sebelumnya.');
        }

        $oldStatus = $borrowing->status;

        DB::transaction(function () use ($borrowing, $request, $oldStatus) {
            $borrowing->update([
                'status' => BorrowingStatus::REJECTED,
                'rejection_reason' => $request->rejection_reason,
                'notes' => $request->admin_notes, // ← Gunakan 'notes' bukan 'admin_notes'
                'approved_by' => auth()->id(),
                'approved_at' => now(),
            ]);

            BorrowingHistory::create([
                'borrowing_id' => $borrowing->id,
                'action' => 'rejected',
                'old_status' => $oldStatus->value,
                'new_status' => BorrowingStatus::REJECTED->value,
                'comment' => 'Peminjaman ditolak: ' . $request->rejection_reason,
                'performed_by' => auth()->id(),
                'performed_at' => now(),
            ]);
        });

        return back()->with('success', 'Peminjaman berhasil ditolak.');
    }

    /**
     * Hitung rata-rata waktu respons.
     */
    private function getAverageResponseTime(): string
    {
        $approved = Borrowing::whereNotNull('approved_at')
            ->whereNotNull('created_at')
            ->get(['created_at', 'approved_at']);

        if ($approved->isEmpty()) {
            return '-';
        }

        $totalSeconds = $approved->reduce(function ($carry, $item) {
            return $carry + Carbon::parse($item->approved_at)->diffInSeconds(Carbon::parse($item->created_at));
        }, 0);

        $avgSeconds = $totalSeconds / $approved->count();
        
        if ($avgSeconds < 60) {
            return round($avgSeconds) . ' detik';
        } elseif ($avgSeconds < 3600) {
            return round($avgSeconds / 60) . ' menit';
        } else {
            return round($avgSeconds / 3600, 1) . ' jam';
        }
    }
}