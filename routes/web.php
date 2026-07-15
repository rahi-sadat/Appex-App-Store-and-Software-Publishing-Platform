<?php


use App\Http\Controllers\Auth\DeveloperAuthController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\PublicStore\MarketplacePageController;
use App\Models\Category;
use Illuminate\Support\Facades\Route;

// Public marketplace pages stay open so visitors can explore before signing in.
Route::get('/', [MarketplacePageController::class, 'home'])->name('home');
Route::get('/discover', [MarketplacePageController::class, 'discover'])->name('discover');
Route::view('/about', 'pages.about')->name('about');
Route::get('/contact', function () {
    return view('pages.info', [
        'pageKey' => 'contact',
        'title' => 'Contact Us',
        'eyebrow' => 'Support',
        'intro' => 'Reach the Appex team for account help, marketplace questions, developer publishing support, and security concerns.',
        'sections' => [
            [
                'heading' => 'Email support',
                'body' => 'Send marketplace and account questions to support@appex.dev. Include your account email, app name, and any error message so the team can help faster.',
            ],
            [
                'heading' => 'Developer help',
                'body' => 'For publishing, app reviews, version uploads, and API access, open the developer console or email the support team with your app slug.',
            ],
            [
                'heading' => 'Security reports',
                'body' => 'For suspected abuse, malware, credential exposure, or a platform vulnerability, use the security page and mark your message as urgent.',
            ],
        ],
    ]);
})->name('contact');
Route::get('/user-guide', function () {
    return view('pages.info', [
        'pageKey' => 'user-guide',
        'title' => 'User Guide',
        'eyebrow' => 'Help Center',
        'intro' => 'A quick guide to browsing Appex, saving apps, downloading releases, and using the marketplace safely.',
        'sections' => [
            [
                'heading' => 'Find software',
                'body' => 'Use Discover to filter by platform or category, open an app detail page, review screenshots, and compare version, size, license, rating, and release notes.',
            ],
            [
                'heading' => 'Download and save',
                'body' => 'Use the GET action to open the release source. Signed-in users can save apps to their dashboard and return to downloads or notifications later.',
            ],
            [
                'heading' => 'Publish apps',
                'body' => 'Developers can create a publisher account, submit software, attach images, add release files, and monitor review status from the developer console.',
            ],
        ],
    ]);
})->name('user.guide');
Route::get('/privacy-policy', function () {
    return view('pages.info', [
        'pageKey' => 'privacy',
        'title' => 'Privacy Policy',
        'eyebrow' => 'Legal',
        'intro' => 'Appex keeps marketplace data focused on accounts, app submissions, downloads, reviews, bug reports, and platform security.',
        'sections' => [
            [
                'heading' => 'Information we use',
                'body' => 'We use account details, marketplace activity, app metadata, review content, and operational logs to run core platform features and protect the marketplace.',
            ],
            [
                'heading' => 'How data helps Appex',
                'body' => 'Data supports sign-in, app publishing, moderation, notifications, saved apps, download history, analytics, and abuse prevention.',
            ],
            [
                'heading' => 'Your choices',
                'body' => 'You can update your account, manage saved apps, request support, and ask for account or listing help through the contact page.',
            ],
        ],
    ]);
})->name('privacy');
Route::get('/terms', function () {
    return view('pages.info', [
        'pageKey' => 'terms',
        'title' => 'Terms of Service',
        'eyebrow' => 'Legal',
        'intro' => 'These marketplace terms outline responsible use for visitors, registered users, developers, and admins.',
        'sections' => [
            [
                'heading' => 'Marketplace use',
                'body' => 'Use Appex to discover, download, review, and report software responsibly. Do not abuse ratings, submit harmful content, or misrepresent app ownership.',
            ],
            [
                'heading' => 'Developer publishing',
                'body' => 'Developers are responsible for accurate app metadata, safe release files, valid licenses, and timely responses to review or moderation requests.',
            ],
            [
                'heading' => 'Platform moderation',
                'body' => 'Appex may review, reject, hide, or remove listings that violate marketplace rules, create security risk, or mislead users.',
            ],
        ],
    ]);
})->name('terms');
Route::get('/security', function () {
    return view('pages.info', [
        'pageKey' => 'security',
        'title' => 'Security',
        'eyebrow' => 'Trust',
        'intro' => 'Appex combines app review, role-based access, release history, and user reporting to keep marketplace activity safer.',
        'sections' => [
            [
                'heading' => 'App review',
                'body' => 'Submitted apps can be reviewed before appearing in public discovery. Admin tools support approval, rejection, and deletion-request workflows.',
            ],
            [
                'heading' => 'Account separation',
                'body' => 'Visitor, developer, and admin capabilities are separated so publishing and moderation actions stay behind the right access controls.',
            ],
            [
                'heading' => 'Report concerns',
                'body' => 'Email support@appex.dev with security concerns, suspicious listings, malware reports, or account-safety issues.',
            ],
        ],
    ]);
})->name('security');

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

Route::middleware('role:developer')->group(function () {
    Route::get('/developer/import/apple', [\App\Http\Controllers\Developer\AppImportController::class, 'importAppleStore'])->name('developer.import.apple');
    Route::get('/developer/import/apple-search', [\App\Http\Controllers\Developer\AppImportController::class, 'searchAppleStore'])->name('developer.import.apple.search');
    Route::get('/developer/import/proxy-image', [\App\Http\Controllers\Developer\AppImportController::class, 'proxyImage'])->name('developer.import.proxy-image');
    Route::get('/developer/import/github', [\App\Http\Controllers\Developer\AppImportController::class, 'importGitHub'])->name('developer.import.github');
    Route::get('/developer/import/github-search', [\App\Http\Controllers\Developer\AppImportController::class, 'searchGitHub'])->name('developer.import.github.search');
});

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

// Let long-lived pages refresh an expired/stale CSRF value before retrying a write.
Route::get('/csrf-token', function () {
    return response()->json(['token' => csrf_token()]);
})->name('csrf-token');

require __DIR__.'/auth.php';

// Backward-compatible aliases for older Appex modal JavaScript.
Route::middleware('guest')->group(function () {
    Route::post('/user/login', [AuthenticatedSessionController::class, 'store'])->name('user.login');
    Route::post('/user/register', [RegisteredUserController::class, 'store'])->name('user.register');
});

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\User\UserDashboardController::class, 'index'])->name('user.dashboard');
    Route::post('/wishlist/toggle', [\App\Http\Controllers\User\UserDashboardController::class, 'toggleWishlist'])->name('wishlist.toggle');
});
