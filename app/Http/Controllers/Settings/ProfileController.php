<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $data = $request->validated();

        // Handle avatar removal first
       if ($request->has('remove_avatar') && $request->boolean('remove_avatar')) {
        if ($user->avatar) {
            // user->avatar menyimpan path relatif seperti 'avatars/namafile.jpg'
            Storage::disk('public')->delete($user->avatar);
        }
        $data['avatar'] = null;
    }
        // Then handle new avatar upload
     else if ($request->hasFile('avatar')) {
        // Delete old avatar if it exists
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }
        // HANYA simpan path relatif ke file
        $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
    }
        // If neither a new file is uploaded nor removal is requested, keep the existing avatar
        else {
            $data['avatar'] = $user->avatar;
        }

        $user->fill($data);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        // Redirect with updated user data and a status message.
        // This is key for Inertia.js to update the `auth` prop in the layout.
        return Redirect::route('profile.edit')->with([
            'status' => 'profile-updated',
            'user' => $user->only(['id', 'name', 'email', 'avatar', 'is_active', 'role', 'category', 'department', 'phone', 'created_at', 'updated_at']),
        ]);
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        // Delete user's avatar
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}