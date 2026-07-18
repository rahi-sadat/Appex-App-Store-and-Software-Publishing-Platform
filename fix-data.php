<?php
$socialCat = \App\Models\Category::firstOrCreate(['slug' => 'social'], ['name' => 'Social', 'is_active' => true, 'sort_order' => 999]);
$prodCat = \App\Models\Category::where('name', 'Productivity')->first();
$musicCat = \App\Models\Category::where('name', 'Music')->first();
$eduCat = \App\Models\Category::where('name', 'Education')->first();
$designCat = \App\Models\Category::where('name', 'Design')->first();
$utilCat = \App\Models\Category::where('name', 'Utilities')->first();

\App\Models\MarketplaceApp::where('name', 'Grammarly: AI Writing App')->update([
    'platform' => 'mac',
    'category_id' => $prodCat->id
]);

\App\Models\MarketplaceApp::where('name', 'Pinterest')->update([
    'category_id' => $socialCat->id
]);

\App\Models\MarketplaceApp::where('name', 'Spotify: Music and Podcasts')->update([
    'category_id' => $musicCat->id
]);

\App\Models\MarketplaceApp::where('name', 'Moodle LMS')->update([
    'category_id' => $eduCat->id
]);

\App\Models\MarketplaceApp::where('name', 'Penpot')->update([
    'category_id' => $designCat->id
]);

\App\Models\MarketplaceApp::where('name', 'obs-studio')->update([
    'category_id' => $utilCat->id
]);

\App\Models\MarketplaceApp::where('name', 'Open WebUI')->update([
    'category_id' => $utilCat->id
]);

// Clear featured flags
\App\Models\MarketplaceApp::query()->update(['is_featured' => false]);

// Set new spotlight apps
\App\Models\MarketplaceApp::whereIn('name', ['Moodle LMS', 'Penpot', 'Open WebUI'])->update(['is_featured' => true]);

// Clear Cache
Cache::forget(\App\Models\MarketplaceApp::PUBLIC_CATALOG_CACHE_KEY);

echo "Data updated and cache cleared.\n";
