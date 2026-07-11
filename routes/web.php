<?php


use App\Http\Controllers\Auth\DeveloperAuthController;
use App\Http\Controllers\Auth\UserAuthController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\PublicStore\MarketplacePageController;
use App\Models\Category;
use Illuminate\Support\Facades\Route;

// Public marketplace pages stay open so visitors can explore before signing in.
Route::get('/', [MarketplacePageController::class, 'home'])->name('home');
Route::redirect('/login', '/developer-login')->name('login');
Route::get('/discover', [MarketplacePageController::class, 'discover'])->name('discover');
Route::view('/about', 'pages.about')->name('about');

// Developer access is checked before showing the publisher workspace.
Route::get('/developer-login', function () {
    if (auth()->check()) {
        return match (auth()->user()->role) {
            'developer' => redirect()->route('developer'),
            'admin' => redirect()->route('admin'),
            default => redirect()->route('home'),
        };
    }

    return view('pages.developer-login');
})->name('developer.login');
Route::post('/developer-login', [DeveloperAuthController::class, 'login'])->name('developer.login.submit');
Route::post('/developer/register', [DeveloperAuthController::class, 'register'])->name('developer.register');
Route::get('/developer', function () {
    return view('pages.developer', [
        'categories' => Category::where('is_active', true)->orderBy('sort_order')->orderBy('name')->get(),
    ]);
})->middleware('role:developer')->name('developer');

// Admin access is intentionally separate from developer sign-in.
// The shared account modal now handles admin authentication. Keep a named
// entrance for navigation links and role middleware that still target it.
Route::redirect('/admin-login', '/?login=admin')->name('admin.login');
Route::get('/admin', function () {
    return view('pages.admin', [
        'pendingApps' => \App\Models\MarketplaceApp::where('status', 'pending')
            ->with(['developer:id,name,email', 'category', 'tags', 'screenshots', 'latestRelease'])
            ->oldest('submitted_at')
            ->get(),
    ]);
})->middleware('role:admin')->name('admin');
Route::view('/api-docs', 'pages.api')->name('api.docs');

// Logout clears the Laravel session instead of only redirecting the user.
Route::post('/logout', LogoutController::class)->name('logout');

// User Login & Registration routes
Route::post('/user/login', [UserAuthController::class, 'login'])->name('user.login');
Route::post('/user/register', [UserAuthController::class, 'register'])->name('user.register');
