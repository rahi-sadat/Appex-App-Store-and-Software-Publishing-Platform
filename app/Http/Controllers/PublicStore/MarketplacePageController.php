<?php

namespace App\Http\Controllers\PublicStore;

use App\Http\Controllers\Controller;
use App\Models\MarketplaceApp;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Facades\Cache;

class MarketplacePageController extends Controller
{
    public function home(): View
    {
        return view('pages.home', ['marketplaceApps' => $this->apps()]);
    }

    public function discover(): View
    {
        $categories = \App\Models\Category::where('is_active', true)->orderBy('sort_order')->get();
        return view('pages.discover', [
            'marketplaceApps' => $this->apps(),
            'categories' => $categories
        ]);
    }

    private function apps()
    {
        return Cache::rememberForever(MarketplaceApp::PUBLIC_CATALOG_CACHE_KEY, function () {
            return MarketplaceApp::approved()
                ->with(['developer:id,name', 'category', 'tags', 'screenshots', 'latestRelease.assets'])
                ->withCount(['downloads', 'reviews'])
                ->orderByDesc('is_featured')
                ->latest('published_at')
                ->get();
        });
    }
}
