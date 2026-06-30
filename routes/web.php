<?php

use App\Http\Controllers\Auth\AdminAuthController;
use App\Http\Controllers\Auth\DeveloperAuthController;
use App\Http\Controllers\Auth\LogoutController;
use Illuminate\Support\Facades\Route;

// Public marketplace pages stay open so visitors can explore before signing in.
Route::view('/', 'pages.home')->name('home');
Route::redirect('/login', '/developer-login')->name('login');
Route::view('/discover', 'pages.discover')->name('discover');
Route::view('/about', 'pages.about')->name('about');

// Developer access is checked before showing the publisher workspace.
Route::get('/developer-login', function () {
    if (auth()->check() && auth()->user()->role === 'developer') {
        return redirect()->route('developer');
    }

    return view('pages.developer-login');
})->name('developer.login');
Route::post('/developer-login', [DeveloperAuthController::class, 'login'])->name('developer.login.submit');
Route::post('/developer/register', [DeveloperAuthController::class, 'register'])->name('developer.register');
Route::view('/developer', 'pages.developer')->middleware('role:developer')->name('developer');

// Admin access is intentionally separate from developer sign-in.
Route::get('/admin-login', function () {
    if (auth()->check() && auth()->user()->role === 'admin') {
        return redirect()->route('admin');
    }

    return view('pages.admin-login');
})->name('admin.login');
Route::post('/admin-login', [AdminAuthController::class, 'login'])->name('admin.login.submit');
Route::view('/admin', 'pages.admin')->middleware('role:admin')->name('admin');
Route::view('/api-docs', 'pages.api')->name('api.docs');

// Logout clears the Laravel session instead of only redirecting the user.
Route::post('/logout', LogoutController::class)->name('logout');
