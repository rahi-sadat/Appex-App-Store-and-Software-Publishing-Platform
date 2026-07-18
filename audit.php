<?php
// Audit script - check actual state of everything
echo "=== APP CATEGORIES & PLATFORMS ===\n";
$apps = \App\Models\MarketplaceApp::with('category')->get();
foreach ($apps as $app) {
    echo "- {$app->name} | Category: {$app->category?->name} | Platform: {$app->platform} | Featured: " . ($app->is_featured ? 'YES' : 'no') . "\n";
}

echo "\n=== CATEGORIES IN DB ===\n";
foreach (\App\Models\Category::all() as $cat) {
    echo "- {$cat->name} (slug: {$cat->slug})\n";
}

echo "\n=== DASHBOARD ROUTE ===\n";
$routes = app('router')->getRoutes();
foreach ($routes as $route) {
    if (str_contains($route->uri(), 'dashboard') || str_contains($route->uri(), 'wishlist')) {
        echo "- [{$route->methods()[0]}] {$route->uri()} => {$route->getName()}\n";
    }
}

echo "\n=== NOTIFICATIONS TABLE ===\n";
try {
    $count = \Illuminate\Support\Facades\DB::table('notifications')->count();
    echo "- Notifications table exists, {$count} records\n";
} catch (\Exception $e) {
    echo "- ERROR: " . $e->getMessage() . "\n";
}

echo "\n=== USER DASHBOARD VIEW ===\n";
if (file_exists(base_path('resources/views/pages/user-dashboard.blade.php'))) {
    echo "- user-dashboard.blade.php EXISTS\n";
} else {
    echo "- user-dashboard.blade.php MISSING!\n";
}

echo "\n=== PROFILE WIDGET LINK ===\n";
$content = file_get_contents(base_path('resources/views/components/profile-widget.blade.php'));
if (str_contains($content, 'user.dashboard')) {
    echo "- Dashboard link EXISTS in profile-widget\n";
} else {
    echo "- Dashboard link MISSING from profile-widget!\n";
}
