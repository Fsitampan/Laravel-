<?php

namespace App\Policies;

use App\Models\Borrowing;
use App\Models\User;

class BorrowingPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true; // All authenticated users can view borrowings (filtered in controller)
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Borrowing $borrowing): bool
    {
        return $user->canManageBorrowers() || $borrowing->created_by === $user->id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->canCreateBorrowings();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Borrowing $borrowing): bool
    {
        // Admins can update any borrowing, users can only update their own pending borrowings
        return $user->canManageBorrowers() || 
               ($borrowing->created_by === $user->id && $borrowing->isPending());
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Borrowing $borrowing): bool
    {
        // Admins can delete any pending borrowing, users can only delete their own pending borrowings
        return ($user->canManageBorrowers() || $borrowing->created_by === $user->id) && 
               $borrowing->isPending();
    }

    /**
     * Determine whether the user can complete the borrowing.
     */
    public function complete(User $user, Borrowing $borrowing): bool
    {
        return $user->canManageBorrowers() || $borrowing->created_by === $user->id;
    }

    /**
     * Determine whether the user can approve borrowings.
     */
    public function approve(User $user): bool
    {
        return $user->canApproveRejects();
    }
}