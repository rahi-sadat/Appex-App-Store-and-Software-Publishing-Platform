<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class UserAuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        // Check for admin demo credentials
        if ($credentials['email'] === 'admin@gmail.com' && $credentials['password'] === 'admin123') {
            // Seed or refresh the demo admin
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
            
            return response()->json([
                'message' => 'Logged in successfully as Admin.',
                'user' => $admin
            ]);
        }

        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();
            return response()->json([
                'message' => 'Logged in successfully.',
                'user' => Auth::user()
            ]);
        }

        return response()->json([
            'message' => 'Invalid email or password.'
        ], 422);
    }

    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:6|confirmed'
        ]);

        $user = User::create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'password' => Hash::make($request->input('password')),
            'role' => 'user'
        ]);

        Auth::login($user);
        $request->session()->regenerate();

        return response()->json([
            'message' => 'Account registered successfully.',
            'user' => $user
        ], 201);
    }
}
