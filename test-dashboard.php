<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = \App\Models\User::firstOrCreate(
    ['email' => 'test@example.com'], 
    ['name' => 'Test User', 'password' => bcrypt('password'), 'role' => 'user']
);
Auth::login($user);

$app = \App\Models\MarketplaceApp::first();
if ($app) {
    \App\Models\Wishlist::firstOrCreate(['user_id' => $user->id, 'app_id' => $app->id]);
    $user->notify(new \App\Notifications\AppStatusNotification($app, 'approved', 'Looking good.'));
}

$controller = new \App\Http\Controllers\User\UserDashboardController();
try {
    $view = $controller->index();
    echo 'View generated successfully. Type: ' . get_class($view) . "\n";
    echo "Dashboard works!\n";
} catch (\Exception $e) {
    echo 'Error: ' . $e->getMessage() . "\n" . $e->getTraceAsString();
}
