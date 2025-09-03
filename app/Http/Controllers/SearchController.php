<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\Borrowing;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->get('q', '');
        $type = $request->get('type', 'all'); // all, rooms, borrowings, users
        
        if (strlen($query) < 2) {
            return response()->json([
                'results' => [],
                'message' => 'Query terlalu pendek, minimal 2 karakter'
            ]);
        }

        $results = [];
        $user = auth()->user();

        // Search based on type and user permissions
        switch ($type) {
            case 'rooms':
                $results = $this->searchRooms($query);
                break;
            case 'borrowings':
                $results = $this->searchBorrowings($query, $user);
                break;
            case 'users':
                if (in_array($user->role, ['admin', 'super-admin'])) {
                    $results = $this->searchUsers($query);
                }
                break;
            case 'all':
            default:
                $results = array_merge(
                    $this->searchRooms($query),
                    $this->searchBorrowings($query, $user),
                    in_array($user->role, ['admin', 'super-admin']) ? $this->searchUsers($query) : []
                );
                break;
        }

        // Sort results by relevance (exact matches first)
        usort($results, function ($a, $b) use ($query) {
            $aExact = (stripos($a['title'], $query) === 0) ? 1 : 0;
            $bExact = (stripos($b['title'], $query) === 0) ? 1 : 0;
            return $bExact - $aExact;
        });

        return response()->json([
            'results' => array_slice($results, 0, 50), // Limit to 50 results
            'total' => count($results),
            'query' => $query
        ]);
    }

    public function quickSearch(Request $request)
    {
        $query = $request->get('q', '');
        
        if (strlen($query) < 2) {
            return response()->json(['results' => []]);
        }

        $user = auth()->user();
        $results = [];

        // Quick search for immediate results (limited to 10 items)
        
        // Search rooms
        $rooms = Room::where('name', 'LIKE', "%{$query}%")
            ->orWhere('full_name', 'LIKE', "%{$query}%")
            ->orWhere('location', 'LIKE', "%{$query}%")
            ->limit(5)
            ->get();

        foreach ($rooms as $room) {
            $results[] = [
                'id' => $room->id,
                'type' => 'room',
                'title' => "Ruang {$room->name}",
                'subtitle' => $room->full_name,
                'description' => "Lokasi: {$room->location} • Kapasitas: {$room->capacity} orang",
                'status' => $room->status,
                'url' => "/Rooms/{$room->id}",
                'icon' => 'building'
            ];
        }

        // Search borrowings (user-specific or all for admins)
        $borrowingsQuery = Borrowing::with(['room', 'user'])
            ->where(function ($q) use ($query) {
                $q->where('purpose', 'LIKE', "%{$query}%")
                  ->orWhere('borrower_name', 'LIKE', "%{$query}%")
                  ->orWhereHas('room', function ($roomQuery) use ($query) {
                      $roomQuery->where('name', 'LIKE', "%{$query}%")
                               ->orWhere('full_name', 'LIKE', "%{$query}%");
                  });
            });

        if ($user->role === 'user') {
            $borrowingsQuery->where('user_id', $user->id);
        }

        $borrowings = $borrowingsQuery->limit(3)->get();

        foreach ($borrowings as $borrowing) {
            $results[] = [
                'id' => $borrowing->id,
                'type' => 'borrowing',
                'title' => "Peminjaman {$borrowing->room->name}",
                'subtitle' => $borrowing->purpose,
                'description' => "Peminjam: {$borrowing->borrower_name} • Status: " . ucfirst($borrowing->status),
                'status' => $borrowing->status,
                'url' => "/Borrowings/{$borrowing->id}",
                'icon' => 'calendar'
            ];
        }

        // Search users (admin only)
        if (in_array($user->role, ['admin', 'super-admin'])) {
            $users = User::where('name', 'LIKE', "%{$query}%")
                ->orWhere('email', 'LIKE', "%{$query}%")
                ->orWhere('department', 'LIKE', "%{$query}%")
                ->limit(2)
                ->get();

            foreach ($users as $searchUser) {
                $results[] = [
                    'id' => $searchUser->id,
                    'type' => 'user',
                    'title' => $searchUser->name,
                    'subtitle' => $searchUser->email,
                    'description' => "Departemen: {$searchUser->department} • Role: " . ucfirst($searchUser->role),
                    'status' => $searchUser->is_active ? 'active' : 'inactive',
                    'url' => $user->role === 'super-admin' ? "/users/{$searchUser->id}" : null,
                    'icon' => 'user'
                ];
            }
        }

        return response()->json([
            'results' => array_slice($results, 0, 10)
        ]);
    }

    private function searchRooms($query)
    {
        $rooms = Room::where('name', 'LIKE', "%{$query}%")
            ->orWhere('full_name', 'LIKE', "%{$query}%")
            ->orWhere('location', 'LIKE', "%{$query}%")
            ->orWhere('description', 'LIKE', "%{$query}%")
            ->get();

        $results = [];
        foreach ($rooms as $room) {
            $results[] = [
                'id' => $room->id,
                'type' => 'room',
                'title' => "Ruang {$room->name}",
                'subtitle' => $room->full_name,
                'description' => "Lokasi: {$room->location} • Kapasitas: {$room->capacity} orang • Status: " . ucfirst($room->status),
                'url' => "/Rooms/{$room->id}",
                'icon' => 'building',
                'status' => $room->status
            ];
        }

        return $results;
    }

    private function searchBorrowings($query, $user)
    {
        $borrowingsQuery = Borrowing::with(['room', 'user'])
            ->where(function ($q) use ($query) {
                $q->where('purpose', 'LIKE', "%{$query}%")
                  ->orWhere('borrower_name', 'LIKE', "%{$query}%")
                  ->orWhere('notes', 'LIKE', "%{$query}%")
                  ->orWhereHas('room', function ($roomQuery) use ($query) {
                      $roomQuery->where('name', 'LIKE', "%{$query}%")
                               ->orWhere('full_name', 'LIKE', "%{$query}%");
                  });
            });

        // Regular users only see their own borrowings
        if ($user->role === 'user') {
            $borrowingsQuery->where('user_id', $user->id);
        }

        $borrowings = $borrowingsQuery->get();

        $results = [];
        foreach ($borrowings as $borrowing) {
            $results[] = [
                'id' => $borrowing->id,
                'type' => 'borrowing',
                'title' => "Peminjaman {$borrowing->room->name}",
                'subtitle' => $borrowing->purpose,
                'description' => "Peminjam: {$borrowing->borrower_name} • Tanggal: " . 
                               $borrowing->borrowed_at->format('d/m/Y H:i') . 
                               " • Status: " . ucfirst($borrowing->status),
                'url' => "/Borrowings/{$borrowing->id}",
                'icon' => 'calendar',
                'status' => $borrowing->status
            ];
        }

        return $results;
    }

    private function searchUsers($query)
    {
        $users = User::where('name', 'LIKE', "%{$query}%")
            ->orWhere('email', 'LIKE', "%{$query}%")
            ->orWhere('department', 'LIKE', "%{$query}%")
            ->orWhere('phone', 'LIKE', "%{$query}%")
            ->get();

        $results = [];
        foreach ($users as $user) {
            $results[] = [
                'id' => $user->id,
                'type' => 'user',
                'title' => $user->name,
                'subtitle' => $user->email,
                'description' => "Departemen: {$user->department} • Role: " . ucfirst($user->role) . 
                               " • Kategori: " . ucfirst($user->category),
                'url' => "/users/{$user->id}",
                'icon' => 'user',
                'status' => $user->is_active ? 'active' : 'inactive'
            ];
        }

        return $results;
    }
}