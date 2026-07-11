<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Download;
use App\Models\MarketplaceApp;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Validation\Rule;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\Laravel\Facades\Image;

class DeveloperAppController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $this->developer($request);

        $allApps = MarketplaceApp::where('developer_id', $user->id)
            ->with(['category', 'tags', 'screenshots', 'latestRelease.assets', 'releases.assets', 'reviews', 'bugReports'])
            ->withCount(['downloads', 'bugReports'])
            ->orderByRaw("CASE status WHEN 'approved' THEN 0 WHEN 'pending' THEN 1 ELSE 2 END")
            ->latest('updated_at')
            ->get()
            ->unique(fn (MarketplaceApp $app) => Str::lower(trim($app->name)))
            ->values();

        $perPage = $request->integer('per_page', 12);
        $page = max(1, $request->integer('page', 1));
        $apps = new LengthAwarePaginator(
            $allApps->forPage($page, $perPage)->values(),
            $allApps->count(),
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        $trendStart = now()->startOfDay()->subDays(6);
        $downloadsByDate = Download::query()
            ->whereIn('app_id', $allApps->pluck('id'))
            ->where('downloaded_at', '>=', $trendStart)
            ->selectRaw('DATE(downloaded_at) as download_date, COUNT(*) as download_count')
            ->groupByRaw('DATE(downloaded_at)')
            ->pluck('download_count', 'download_date');

        $downloadTrend = collect(range(0, 6))->map(function (int $day) use ($trendStart, $downloadsByDate) {
            $date = $trendStart->copy()->addDays($day);

            return [
                'date' => $date->toDateString(),
                'label' => $date->format('D'),
                'count' => (int) ($downloadsByDate[$date->toDateString()] ?? 0),
            ];
        })->values();

        return response()->json(array_merge($apps->toArray(), [
            'download_trend' => $downloadTrend,
        ]));
    }

    public function store(Request $request): JsonResponse
    {
        $user = $this->developer($request);

        $data = $request->validate([
            'category_id' => ['nullable', 'exists:categories,id'],
            'category_slug' => ['nullable', 'exists:categories,slug'],
            'category_name' => ['nullable', 'string', 'max:80', 'required_without_all:category_id,category_slug'],
            'name' => ['required', 'string', 'max:160'],
            'tagline' => ['nullable', 'string', 'max:220'],
            'description' => ['nullable', 'string'],
            'repository_url' => ['nullable', 'url', 'max:255'],
            'demo_url' => ['nullable', 'url', 'max:255'],
            'license' => ['nullable', 'string', 'max:80'],
            'primary_language' => ['nullable', 'string', 'max:80'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:40'],
        ]);

        $duplicateExists = MarketplaceApp::where('developer_id', $user->id)
            ->whereRaw('LOWER(name) = ?', [Str::lower(trim($data['name']))])
            ->exists();

        if ($duplicateExists) {
            return response()->json([
                'message' => 'This software already exists. Use Modify on the existing app instead.',
            ], 422);
        }

        $categoryId = $data['category_id'] ?? null;

        if (! $categoryId && isset($data['category_slug'])) {
            $category = Category::where('slug', $data['category_slug'])->first();

            if ($category) {
                $categoryId = $category->id;
            }
        }

        if (! $categoryId && ! empty($data['category_name'])) {
            $categoryName = trim($data['category_name']);
            $category = Category::firstOrCreate(
                ['slug' => Str::slug($categoryName)],
                ['name' => $categoryName, 'is_active' => false, 'sort_order' => 999]
            );
            $categoryId = $category->id;
        }

        $source = 'manual';

        if (! empty($data['repository_url'])) {
            $source = 'github';
        }

        // New apps start as drafts so developers can finish screenshots/releases before review.
        $app = MarketplaceApp::create([
            'developer_id' => $user->id,
            'category_id' => $categoryId,
            'name' => $data['name'],
            'slug' => $this->uniqueSlug($data['name']),
            'tagline' => $data['tagline'] ?? null,
            'description' => $data['description'] ?? null,
            'source' => $source,
            'status' => 'draft',
            'repository_url' => $data['repository_url'] ?? null,
            'demo_url' => $data['demo_url'] ?? null,
            'license' => $data['license'] ?? null,
            'primary_language' => $data['primary_language'] ?? null,
        ]);

        // Create a stable, human-readable media folder as soon as the app exists.
        Storage::disk('public')->makeDirectory("apps/{$app->slug}");

        $this->syncTags($app, $data['tags'] ?? []);

        return response()->json($app->load(['category', 'tags']), 201);
    }

    public function update(Request $request, int $app): JsonResponse
    {
        $user = $this->developer($request);
        $marketplaceApp = MarketplaceApp::where('developer_id', $user->id)->findOrFail($app);

        $data = $request->validate([
            'category_id' => ['nullable', 'exists:categories,id'],
            'category_slug' => ['nullable', 'exists:categories,slug'],
            'category_name' => ['nullable', 'string', 'max:80'],
            'name' => ['sometimes', 'required', 'string', 'max:160'],
            'tagline' => ['nullable', 'string', 'max:220'],
            'description' => ['nullable', 'string'],
            'repository_url' => ['nullable', 'url', 'max:255'],
            'demo_url' => ['nullable', 'url', 'max:255'],
            'license' => ['nullable', 'string', 'max:80'],
            'primary_language' => ['nullable', 'string', 'max:80'],
            'version' => ['nullable', 'string', 'max:80'],
            'release_notes' => ['nullable', 'string'],
            'install_command' => ['nullable', 'string', 'max:255'],
            'size_bytes' => ['nullable', 'integer', 'min:0'],
            'download_url' => ['nullable', 'url', 'max:2048'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:40'],
        ]);

        $updateData = $data;
        $releaseData = collect($data)->only([
            'version',
            'release_notes',
            'install_command',
            'size_bytes',
            'download_url',
        ])->all();
        unset($updateData['tags'], $updateData['version'], $updateData['release_notes'], $updateData['install_command'], $updateData['size_bytes'], $updateData['download_url']);

        if (! empty($updateData['category_slug'])) {
            $updateData['category_id'] = Category::where('slug', $updateData['category_slug'])->value('id');
        }
        if (! empty($updateData['category_name'])) {
            $categoryName = trim($updateData['category_name']);
            $category = Category::firstOrCreate(
                ['slug' => Str::slug($categoryName)],
                ['name' => $categoryName, 'is_active' => false, 'sort_order' => 999]
            );
            $updateData['category_id'] = $category->id;
        }
        unset($updateData['category_slug'], $updateData['category_name']);

        if ($marketplaceApp->status === 'approved') {
            $marketplaceApp->update([
                'pending_changes' => [
                    'attributes' => $updateData,
                    'release' => $releaseData,
                    'tags' => $data['tags'] ?? $marketplaceApp->tags()->pluck('name')->all(),
                ],
                'pending_changes_submitted_at' => now(),
            ]);

            return response()->json([
                'message' => 'Your modifications were submitted for admin approval. The published version remains unchanged.',
                'app' => $marketplaceApp->fresh()->load(['category', 'tags']),
            ], 202);
        }

        $marketplaceApp->update($updateData);

        if (array_key_exists('tags', $data)) {
            $this->syncTags($marketplaceApp, $data['tags'] ?? []);
        }

        $this->upsertRelease($marketplaceApp, $releaseData);

        return response()->json($marketplaceApp->load(['category', 'tags', 'latestRelease.assets']));
    }

    public function submit(Request $request, int $app): JsonResponse
    {
        $user = $this->developer($request);
        $marketplaceApp = MarketplaceApp::where('developer_id', $user->id)->findOrFail($app);

        $marketplaceApp->update([
            'status' => 'pending',
            'submitted_at' => now(),
        ]);

        return response()->json([
            'message' => 'App submitted for admin review.',
            'app' => $marketplaceApp,
        ]);
    }

    public function storeRelease(Request $request, int $app): JsonResponse
    {
        $marketplaceApp = $this->ownedApp($request, $app);

        $data = $request->validate([
            'version' => [
                'required',
                'string',
                'max:80',
                Rule::unique('app_releases')->where('app_id', $marketplaceApp->id),
            ],
            'title' => ['nullable', 'string', 'max:255'],
            'release_notes' => ['nullable', 'string'],
            'install_command' => ['nullable', 'string', 'max:255'],
            'changelog_url' => ['nullable', 'url', 'max:255'],
            'size_bytes' => ['nullable', 'integer', 'min:0'],
            'download_url' => ['nullable', 'url', 'max:2048'],
        ]);

        $sizeBytes = $data['size_bytes'] ?? null;
        $downloadUrl = $data['download_url'] ?? null;
        unset($data['size_bytes'], $data['download_url']);

        // A developer creates a draft first; publishing remains part of the review flow.
        $release = $marketplaceApp->releases()->create($data + [
            'source' => 'manual',
            'status' => 'draft',
        ]);

        if ($sizeBytes !== null || $downloadUrl !== null) {
            $release->assets()->create([
                'app_id' => $marketplaceApp->id,
                'name' => "{$marketplaceApp->name} {$release->version}",
                'type' => 'download',
                'size_bytes' => $sizeBytes,
                'external_url' => $downloadUrl,
            ]);
        }

        return response()->json([
            'message' => 'Release draft created.',
            'release' => $release,
        ], 201);
    }

    public function storeScreenshot(Request $request, int $app): JsonResponse
    {
        $marketplaceApp = $this->ownedApp($request, $app);

        $data = $request->validate([
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'app_release_id' => [
                'nullable',
                Rule::exists('app_releases', 'id')->where('app_id', $marketplaceApp->id),
            ],
            'caption' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_cover' => ['nullable', 'boolean'],
        ]);

        $path = $request->file('image')->store("apps/{$marketplaceApp->slug}/screenshots", 'public');

        try {
            $screenshot = DB::transaction(function () use ($marketplaceApp, $data, $path) {
                $isCover = (bool) ($data['is_cover'] ?? false);

                if ($isCover) {
                    $marketplaceApp->screenshots()->update(['is_cover' => false]);
                }

                $sortOrder = $data['sort_order'] ?? (($marketplaceApp->screenshots()->max('sort_order') ?? -1) + 1);

                return $marketplaceApp->screenshots()->create([
                    'app_release_id' => $data['app_release_id'] ?? null,
                    'image_path' => $path,
                    'caption' => $data['caption'] ?? null,
                    'sort_order' => $sortOrder,
                    'is_cover' => $isCover,
                ]);
            });
        } catch (\Throwable $exception) {
            // Do not leave an unused file behind when the database write fails.
            Storage::disk('public')->delete($path);
            throw $exception;
        }

        return response()->json([
            'message' => 'Screenshot uploaded.',
            'screenshot' => $screenshot,
            'url' => Storage::disk('public')->url($path),
        ], 201);
    }

    public function storeIcon(Request $request, int $app): JsonResponse
    {
        $marketplaceApp = $this->ownedApp($request, $app);

        $request->validate([
            'icon' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $path = "apps/{$marketplaceApp->slug}/icon/icon.webp";
        $icon = Image::read($request->file('icon'))
            ->cover(512, 512)
            ->encode(new WebpEncoder(quality: 85));

        Storage::disk('public')->put($path, (string) $icon);
        $marketplaceApp->update(['icon_path' => $path]);

        return response()->json([
            'message' => 'App icon resized to 512x512 and uploaded.',
            'icon_url' => Storage::disk('public')->url($path),
        ], 201);
    }

    public function reorderScreenshots(Request $request, int $app): JsonResponse
    {
        $marketplaceApp = $this->ownedApp($request, $app);
        $data = $request->validate([
            'screenshot_ids' => ['required', 'array'],
            'screenshot_ids.*' => ['required', 'integer', 'distinct'],
        ]);

        $currentIds = $marketplaceApp->screenshots()->pluck('id')->sort()->values();
        $submittedIds = collect($data['screenshot_ids'])->sort()->values();

        if ($currentIds->all() !== $submittedIds->all()) {
            return response()->json([
                'message' => 'The screenshot order must include every screenshot for this app exactly once.',
            ], 422);
        }

        DB::transaction(function () use ($marketplaceApp, $data) {
            foreach ($data['screenshot_ids'] as $position => $screenshotId) {
                $marketplaceApp->screenshots()->whereKey($screenshotId)->update([
                    'sort_order' => $position,
                    'is_cover' => $position === 0,
                ]);
            }
        });

        return response()->json([
            'message' => 'Screenshot order updated.',
            'screenshots' => $marketplaceApp->screenshots()->get(),
        ]);
    }

    private function developer(Request $request)
    {
        $user = $request->user();

        if (! $user || $user->role !== 'developer') {
            abort(403, 'Developer access required.');
        }

        return $user;
    }

    private function ownedApp(Request $request, int $app): MarketplaceApp
    {
        $user = $this->developer($request);

        return MarketplaceApp::where('developer_id', $user->id)->findOrFail($app);
    }

    private function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $baseSlug = Str::slug($name);
        $slug = $baseSlug;
        $count = 2;

        while ($this->slugExists($slug, $ignoreId)) {
            $slug = "{$baseSlug}-{$count}";
            $count++;
        }

        return $slug;
    }

    private function slugExists(string $slug, ?int $ignoreId = null): bool
    {
        $query = MarketplaceApp::where('slug', $slug);

        if ($ignoreId) {
            $query->where('id', '!=', $ignoreId);
        }

        return $query->exists();
    }

    private function syncTags(MarketplaceApp $app, array $tagNames): void
    {
        $tagIds = [];

        foreach ($tagNames as $tagName) {
            $tagName = trim((string) $tagName);

            if ($tagName === '') {
                continue;
            }

            $tag = Tag::firstOrCreate(
                ['slug' => Str::slug($tagName)],
                ['name' => Str::headline($tagName)]
            );

            $tagIds[] = $tag->id;
        }

        $tagIds = array_unique($tagIds);

        $app->tags()->sync($tagIds);
    }

    private function upsertRelease(MarketplaceApp $app, array $releaseData): void
    {
        $hasReleaseChange = collect($releaseData)->contains(fn ($value) => $value !== null && $value !== '');

        if (! $hasReleaseChange) {
            return;
        }

        $version = $releaseData['version'] ?? $app->latestRelease?->version ?? '1.0.0';
        $release = $app->latestRelease ?: $app->releases()->create([
            'version' => $version,
            'title' => "{$app->name} {$version}",
            'source' => 'manual',
            'status' => $app->status === 'approved' ? 'published' : 'draft',
            'published_at' => $app->status === 'approved' ? now() : null,
        ]);

        $release->update([
            'version' => $version,
            'title' => "{$app->name} {$version}",
            'release_notes' => $releaseData['release_notes'] ?? $release->release_notes,
            'install_command' => $releaseData['install_command'] ?? $release->install_command,
        ]);

        if (($releaseData['size_bytes'] ?? null) !== null || ($releaseData['download_url'] ?? null) !== null) {
            $release->assets()->updateOrCreate(
                ['type' => 'download'],
                [
                    'app_id' => $app->id,
                    'name' => "{$app->name} {$version}",
                    'size_bytes' => $releaseData['size_bytes'] ?? $release->assets()->where('type', 'download')->value('size_bytes'),
                    'external_url' => $releaseData['download_url'] ?? $release->assets()->where('type', 'download')->value('external_url'),
                ]
            );
        }
    }

    public function updateBugStatus(Request $request, int $app, int $bug): JsonResponse
    {
        $marketplaceApp = $this->ownedApp($request, $app);
        $bugReport = $marketplaceApp->bugReports()->findOrFail($bug);

        $data = $request->validate([
            'status' => ['required', 'in:open,in_progress,resolved,closed'],
        ]);

        $bugReport->update([
            'status' => $data['status'],
        ]);

        return response()->json([
            'message' => 'Bug report status updated.',
            'bug' => $bugReport,
        ]);
    }
}
