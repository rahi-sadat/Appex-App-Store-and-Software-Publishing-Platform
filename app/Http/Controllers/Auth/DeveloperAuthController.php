<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class DeveloperAuthController extends Controller
{
    public function login(Request $request): RedirectResponse
    {
        // Validate before touching Auth so bad input never reaches the guard.
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($credentials)) {
            return back()
                ->withErrors(['email' => 'Invalid developer email or password.'])
                ->onlyInput('email');
        }

        // Rotate the session after login to avoid reusing an old visitor session.
        $request->session()->regenerate();

        // A valid password is not enough; the workspace must match the account role.
        if ($request->user()->role !== 'developer') {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return back()
                ->withErrors(['email' => 'This account is not a developer account.'])
                ->onlyInput('email');
        }

        return redirect()->intended(route('developer'));
    }

    public function register(Request $request): RedirectResponse
    {
        // Registration owns the first real developer account creation path.
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', 'min:6'],
        ]);

        // Passwords are hashed here before the account is signed in.
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => 'developer',
        ]);

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('developer');
    }
}
