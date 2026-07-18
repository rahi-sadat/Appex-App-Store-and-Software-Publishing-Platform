<?php
// Fix duplicate Moodle entries - keep only the one with screenshots/releases
$moodles = \App\Models\MarketplaceApp::where('name', 'Moodle LMS')->orderBy('id')->get();
echo "Found " . $moodles->count() . " Moodle entries\n";

// Keep the one with most data (highest id = most recently updated)
$keep = null;
foreach ($moodles as $m) {
    $sc = \App\Models\AppScreenshot::where('app_id', $m->id)->count();
    $rel = \App\Models\AppRelease::where('app_id', $m->id)->count();
    echo "  ID {$m->id}: screenshots={$sc}, releases={$rel}\n";
    if ($rel > 0 || $sc > 0) {
        $keep = $m;
    }
}
if (!$keep) $keep = $moodles->last();

echo "Keeping ID: {$keep->id}\n";

// Delete duplicates
foreach ($moodles as $m) {
    if ($m->id !== $keep->id) {
        // Remove related screenshots and releases first
        \App\Models\AppScreenshot::where('app_id', $m->id)->delete();
        \App\Models\AppRelease::where('app_id', $m->id)->delete();
        \Illuminate\Support\Facades\DB::table('app_tag')->where('app_id', $m->id)->delete();
        $m->forceDelete();
        echo "Deleted duplicate ID {$m->id}\n";
    }
}

// Fix platform assignments properly
\App\Models\MarketplaceApp::where('name', 'Moodle LMS')->update(['platform' => 'web']);
\App\Models\MarketplaceApp::where('name', 'Penpot')->update(['platform' => 'web']);
\App\Models\MarketplaceApp::where('name', 'Open WebUI')->update(['platform' => 'web']);
\App\Models\MarketplaceApp::where('name', 'obs-studio')->update(['platform' => 'desktop']);
\App\Models\MarketplaceApp::where('name', 'Pinterest')->update(['platform' => 'ios']);
\App\Models\MarketplaceApp::where('name', 'Spotify: Music and Podcasts')->update(['platform' => 'ios']);
\App\Models\MarketplaceApp::where('name', 'Grammarly: AI Writing App')->update(['platform' => 'mac']);
\App\Models\MarketplaceApp::where('name', 'WhatsApp Messenger')->update(['platform' => 'ios']);

// Set correct spotlight apps
\App\Models\MarketplaceApp::query()->update(['is_featured' => false]);
\App\Models\MarketplaceApp::whereIn('name', ['Moodle LMS', 'Penpot', 'Open WebUI'])->update(['is_featured' => true]);

// Clear cache
\Illuminate\Support\Facades\Cache::forget(\App\Models\MarketplaceApp::PUBLIC_CATALOG_CACHE_KEY);

echo "\nDone! Final state:\n";
foreach (\App\Models\MarketplaceApp::with('category')->get() as $a) {
    echo "- {$a->name} | {$a->category?->name} | {$a->platform} | featured=" . ($a->is_featured ? 'YES' : 'no') . "\n";
}
