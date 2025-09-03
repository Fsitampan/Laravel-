<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;

class SettingsController extends Controller
{
    /**
     * Display the settings page.
     */
    public function index(): Response
    {
        $user = auth()->user();
        
        // Get system settings (public ones for all users)
        $systemSettings = SystemSetting::where('is_public', true)
            ->get()
            ->keyBy('key')
            ->map(fn($setting) => $setting->value);

        // Add admin-only settings if user has permission
        if ($user->canManageUsers()) {
            $adminSettings = SystemSetting::where('is_public', false)
                ->get()
                ->keyBy('key')
                ->map(fn($setting) => $setting->value);
            
            $systemSettings = $systemSettings->merge($adminSettings);
        }

        return Inertia::render('Settings/Index', [
            'user' => $user->toInertiaArray(),
            'systemSettings' => $systemSettings,
        ]);
    }

    /**
     * Update user profile.
     */
    public function updateProfile(Request $request): RedirectResponse
    {
        $user = auth()->user();
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'department' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'bio' => 'nullable|string|max:1000',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $data = $request->only(['name', 'email', 'department', 'phone', 'address', 'bio']);

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar
            if ($user->avatar) {
                Storage::disk('public')->delete(str_replace(asset('storage/'), '', $user->avatar));
            }
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $user->update($data);

        return back()->with('success', 'Profil berhasil diperbarui.');
    }

    /**
     * Update user password.
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $request->validate([
            'current_password' => 'required|current_password',
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        auth()->user()->update([
            'password' => Hash::make($request->password),
        ]);

        return back()->with('success', 'Password berhasil diperbarui.');
    }

    /**
     * Update system settings (admin only).
     */
    public function updateSystem(Request $request): RedirectResponse
    {
        $user = auth()->user();
        
        if (!$user->canManageUsers()) {
            abort(403, 'Unauthorized');
        }

        $settings = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'required|string',
        ]);

        foreach ($settings['settings'] as $setting) {
            SystemSetting::where('key', $setting['key'])
                ->update(['value' => $setting['value']]);
        }

        return back()->with('success', 'Pengaturan sistem berhasil diperbarui.');
    }
}