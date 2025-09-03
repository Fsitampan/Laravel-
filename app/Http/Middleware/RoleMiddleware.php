<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!auth()->check()) {
            return redirect('/login');
        }

        $user = auth()->user();
        
        // Convert user role to string for comparison
        $userRole = $user->role instanceof \BackedEnum ? $user->role->value : $user->role;
        
        // Log for debugging
        \Log::info('RoleMiddleware Check', [
            'user_id' => $user->id,
            'user_role' => $userRole,
            'user_role_type' => gettype($user->role),
            'user_role_class' => get_class($user->role),
            'required_roles' => $roles,
            'request_url' => $request->url(),
            'user_can_manage_users' => method_exists($user, 'canManageUsers') ? $user->canManageUsers() : 'method not found'
        ]);
        
        // Check if user's role is in the allowed roles
        if (!in_array($userRole, $roles)) {
            \Log::warning('Access Denied', [
                'user_role' => $userRole,
                'required_roles' => $roles,
                'url' => $request->url()
            ]);
            
            // For AJAX/API requests, return JSON error
            if ($request->expectsJson() || $request->is('api/*') || $request->is('Api/*')) {
                return response()->json([
                    'message' => 'Anda tidak memiliki izin untuk mengakses resource ini.',
                    'error' => 'Forbidden',
                    'required_roles' => $roles,
                    'user_role' => $userRole
                ], 403);
            }
            
            // For web requests, redirect with error message
            return redirect()->back()->with('error', 'Anda tidak memiliki izin untuk mengakses halaman ini.');
        }

        return $next($request);
    }
}