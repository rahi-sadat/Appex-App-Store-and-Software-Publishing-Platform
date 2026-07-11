<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BugReport;
use App\Models\Download;
use App\Models\MarketplaceApp;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;

class AppController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = MarketplaceApp::where('status', 'approved')
            ->with(['developer:id,name', 'category', 'tags', 'screenshots', 'latestRelease.assets'])
            ->withCount(['downloads', 'reviews']);

        if ($request->filled('category')) {
            $categorySlug = $request->input('category');

            $query->whereHas('category', function ($categoryQuery) use ($categorySlug) {
                $categoryQuery->where('slug', $categorySlug);
            });
        }

        if ($request->filled('tag')) {
            $tagSlug = $request->input('tag');

            $query->whereHas('tags', function ($tagQuery) use ($tagSlug) {
                $tagQuery->where('slug', $tagSlug);
            });
        }

        if ($request->filled('search')) {
            $search = '%'.trim($request->input('search')).'%';

            $query->where(function ($searchQuery) use ($search) {
                $searchQuery->where('name', 'like', $search)
                    ->orWhere('tagline', 'like', $search)
                    ->orWhere('description', 'like', $search);
            });
        }

        $apps = $query->orderByDesc('is_featured')
            ->latest('published_at')
            ->paginate($request->integer('per_page', 12));

        return response()->json($apps);
    }

    public function show(string $app): JsonResponse
    {
        $marketplaceApp = $this->findPublishedApp($app);

        $marketplaceApp->load([
            'developer:id,name',
            'category',
            'tags',
            'screenshots',
            'latestRelease.assets',
            'releases' => function ($query) {
                $query->with('assets')->latest('created_at');
            },
            'assets',
            'reviews' => function ($query) {
                $query->with('user')->where('status', 'published')->latest();
            },
            'bugReports' => function ($query) {
                $query->with('user')->latest();
            },
        ]);

        $marketplaceApp->loadCount(['downloads', 'reviews', 'bugReports']);

        return response()->json($marketplaceApp);
    }

    public function download(Request $request, string $app): JsonResponse
    {
        $this->requireUserRole($request);
        $marketplaceApp = $this->findPublishedApp($app);
        $marketplaceApp->load('latestRelease.assets');

        $releaseId = null;

        if ($marketplaceApp->latestRelease) {
            $releaseId = $marketplaceApp->latestRelease->id;
        }

        $asset = $marketplaceApp->latestRelease?->assets->first(fn ($item) => $item->type === 'download')
            ?? $marketplaceApp->latestRelease?->assets->first();

        if (! $asset || (! $asset->file_path && ! $asset->external_url)) {
            return response()->json(['message' => 'No downloadable file has been configured for this app yet.'], 422);
        }

        $downloadUrl = $asset->external_url ?: Storage::disk('public')->url($asset->file_path);

        $userId = null;

        if ($request->user()) {
            $userId = $request->user()->id;
        }

        // Download rows are lightweight analytics events; no private IP is stored.
        Download::create([
            'app_id' => $marketplaceApp->id,
            'app_release_id' => $releaseId,
            'user_id' => $userId,
            'source' => 'web',
            'ip_hash' => hash('sha256', (string) $request->ip()),
            'user_agent' => substr((string) $request->userAgent(), 0, 1000),
            'downloaded_at' => now(),
        ]);

        Cache::forget(MarketplaceApp::PUBLIC_CATALOG_CACHE_KEY);

        return response()->json([
            'message' => 'Download recorded.',
            'downloads_count' => $marketplaceApp->downloads()->count(),
            'download_url' => $downloadUrl,
            'filename' => $asset->name,
        ]);
    }

    public function review(Request $request, string $app): JsonResponse
    {
        $this->requireUserRole($request);
        $marketplaceApp = $this->findPublishedApp($app);

        $data = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'title' => ['required', 'string', 'max:120'],
            'body' => ['required', 'string', 'max:3000'],
        ]);

        $review = Review::create([
            'app_id' => $marketplaceApp->id,
            'user_id' => $request->user() ? $request->user()->id : null,
            'rating' => $data['rating'],
            'title' => $data['title'],
            'body' => $data['body'],
            'status' => 'published',
        ]);

        Cache::forget(MarketplaceApp::PUBLIC_CATALOG_CACHE_KEY);

        return response()->json($review, 201);
    }

    public function bugReport(Request $request, string $app): JsonResponse
    {
        $this->requireUserRole($request);
        $marketplaceApp = $this->findPublishedApp($app);
        $marketplaceApp->load('latestRelease');

        $data = $request->validate([
            'title' => ['required', 'string', 'max:160'],
            'description' => ['required', 'string', 'max:5000'],
            'severity' => ['required', 'in:low,medium,high,critical'],
            'environment' => ['nullable', 'array'],
        ]);

        $releaseId = null;

        if ($marketplaceApp->latestRelease) {
            $releaseId = $marketplaceApp->latestRelease->id;
        }

        $userId = null;

        if ($request->user()) {
            $userId = $request->user()->id;
        }

        $bugReport = BugReport::create([
            'app_id' => $marketplaceApp->id,
            'app_release_id' => $releaseId,
            'user_id' => $userId,
            'title' => $data['title'],
            'description' => $data['description'],
            'severity' => $data['severity'],
            'environment' => $data['environment'] ?? null,
            'status' => 'open',
        ]);

        return response()->json($bugReport, 201);
    }

    private function findPublishedApp(string $app): MarketplaceApp
    {
        return MarketplaceApp::where('status', 'approved')
            ->where(function ($query) use ($app) {
                $query->where('slug', $app)
                    ->orWhere('id', $app);
            })
            ->firstOrFail();
    }

    private function requireUserRole(Request $request): void
    {
        if (! $request->user() || $request->user()->role !== 'user') {
            abort(403, 'A user account is required for this action.');
        }
    }
}
