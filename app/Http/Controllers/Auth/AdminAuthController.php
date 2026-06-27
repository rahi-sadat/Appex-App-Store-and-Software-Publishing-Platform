<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AdminAuthController extends Controller
{
    public function login(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if ($data['email'] !== 'admin@gmail.com' || $data['password'] !== 'admin123') {
            return back()
                ->withErrors(['email' => 'Invalid admin credentials.'])
                ->onlyInput('email');
        }

        $admin = User::updateOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
            ]
        );

        Auth::login($admin);
        $request->session()->regenerate();

        return redirect()->route('admin');
    }
}
