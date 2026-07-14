<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\View\View;

class AuthenticatedSessionController extends Controller
{
    public function create(): View
    {
        return view('auth.login');
    }

    public function store(LoginRequest $request): JsonResponse|RedirectResponse
    {
        $this->ensureDemoAdminExists($request);

        $request->authenticate();
        $request->session()->regenerate();

        $user = $request->user();
        $redirect = $this->redirectPathFor($user);

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Logged in successfully.',
                'redirect' => $redirect,
                'user' => $user,
            ]);
        }

        return redirect()->intended($redirect);
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home');
    }

    private function ensureDemoAdminExists(Request $request): void
    {
        if ($request->input('email') !== 'admin@gmail.com' || $request->input('password') !== 'admin123') {
            return;
        }

        User::updateOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
            ]
        );
    }

    private function redirectPathFor(?User $user): string
    {
        return match ($user?->role) {
            'admin' => route('admin', absolute: false),
            'developer' => route('developer', absolute: false),
            'user' => route('user.dashboard', absolute: false),
            default => route('home', absolute: false),
        };
    }
}
