<?php

namespace App\Providers;

use App\Models\Room;
use App\Models\Borrowing;
use App\Models\User;
use App\Policies\RoomPolicy;
use App\Policies\BorrowingPolicy;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Room::class => RoomPolicy::class,
        Borrowing::class => BorrowingPolicy::class,
        User::class => UserPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        // Define custom gates
        Gate::define('manage-users', function (User $user) {
            return $user->canManageUsers();
        });

        Gate::define('approve-rejects', function (User $user) {
            return $user->canApproveRejects();
        });

        Gate::define('manage-rooms', function (User $user) {
            return $user->canManageRooms();
        });
    }
}