<?php

namespace App\Http\Controllers;

use App\Models\Borrowing;
use App\Models\BorrowingHistory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HistoryController extends Controller
{
    /**
     * Display borrowing history.
     */
    public function index(Request $request): Response
    {
        $user = auth()->user();

        // Query utama untuk riwayat aktivitas (BorrowingHistory)
        $historyQuery = BorrowingHistory::query()
            ->with(['borrowing.room', 'performedBy'])
            ->when($request->search, function ($query, $search) {
                // Mencari di kolom 'comment' pada history atau di nama peminjam terkait
                $query->where('comment', 'like', '%' . $search . '%')
                    ->orWhereHas('borrowing', function ($q) use ($search) {
                        $q->where('borrower_name', 'like', '%' . $search . '%')
                          ->orWhere('purpose', 'like', '%' . $search . '%');
                    });
            })
            ->when($request->action, function ($query, $action) {
                // Filter berdasarkan jenis aksi (misal: 'created', 'approved')
                $query->where('action', $action);
            })
            ->orderBy('performed_at', 'desc');

        // Batasi riwayat hanya untuk pengguna yang tidak memiliki hak akses manajemen
        if (!$user->canManageBorrowers()) {
            $historyQuery->whereHas('borrowing', function ($q) use ($user) {
                $q->where('created_by', $user->id);
            });
        }
        
        // Paginate hasil query riwayat
        $histories = $historyQuery->paginate(10)->withQueryString();

        // Hitung total count untuk setiap aksi riwayat.
        // Asumsi ada scope 'forUser' dan 'byAction' di model BorrowingHistory.
        $actionCounts = [
            'total' => BorrowingHistory::forUser($user)->count(),
            'created' => BorrowingHistory::forUser($user)->byAction('created')->count(),
            'updated' => BorrowingHistory::forUser($user)->byAction('updated')->count(),
            'approved' => BorrowingHistory::forUser($user)->byAction('approved')->count(),
            'rejected' => BorrowingHistory::forUser($user)->byAction('rejected')->count(),
        ];
        
        // Kirim data yang sudah diperbaiki ke Inertia
        return Inertia::render('History/Index', [
            'histories' => $histories->through(fn($history) => $history->toInertiaArray()),
            'actionCounts' => $actionCounts,
            'filters' => $request->only(['search', 'action']),
        ]);
    }
    
    public function show($id)
    {
        $borrowing = Borrowing::with(['room', 'user'])->findOrFail($id);

        // ✅ Perbaikan: Ubah with(['performedByUser']) menjadi with(['performedBy'])
        $histories = BorrowingHistory::with(['performedBy']) 
            ->where('borrowing_id', $id)
            ->orderBy('created_at', 'desc')
            ->get();

        // optional: related borrowings kalau Anda mau pakai
        $relatedBorrowings = Borrowing::where('user_id', $borrowing->user_id)
            ->where('id', '!=', $borrowing->id)
            ->limit(5)
            ->get();

        return Inertia::render('History/Show', [
            'borrowing' => $borrowing,
            'histories' => $histories,
            'relatedBorrowings' => $relatedBorrowings,
            'canManage' => auth()->user()->can('update', $borrowing),
        ]);
    }
}
