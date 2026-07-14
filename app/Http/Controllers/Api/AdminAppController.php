<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\MarketplaceApp;
use App\Models\ModerationAction;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminAppController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $admin = $this->admin($request);
        $data = $request->validate([
            'category_name' => ['required', 'string', 'max:80'],
            'name' => ['required', 'string', 'max:160', 'unique:marketplace_apps,name'],
            'platform' => ['nullable', 'string', 'in:desktop,ios,mac,android,web'],
            'tagline' => ['nullable', 'string', 'max:220'],
            'description' => ['nullable', 'string'],
            'repository_url' => ['nullable', 'url', 'max:255'],
            'demo_url' => ['nullable', 'url', 'max:255'],
            'license' => ['nullable', 'string', 'max:80'],
            'version' => ['required', 'string', 'max:80'],
            'install_command' => ['nullable', 'string', 'max:255'],
            'size_bytes' => ['nullable', 'integer', 'min:0'],
            'download_url' => ['nullable', 'url', 'max:2048'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:40'],
        ]);

        $categoryName = trim($data['category_name']);
        $category = Category::firstOrCreate(
            ['slug' => Str::slug($categoryName)],
            ['name' => $categoryName, 'is_active' => true, 'sort_order' => 999]
        );

        $app = DB::transaction(function () use ($admin, $data, $category) {
            $app = MarketplaceApp::create([
                'developer_id' => $admin->id,
                'category_id' => $category->id,
                'platform' => $data['platform'] ?? 'web',
                'name' => $data['name'],
                'slug' => $this->uniqueSlug($data['name']),
                'tagline' => $data['tagline'] ?? null,
                'description' => $data['description'] ?? null,
                'source' => empty($data['repository_url']) ? 'manual' : 'github',
                'status' => 'approved',
                'repository_url' => $data['repository_url'] ?? null,
                'demo_url' => $data['demo_url'] ?? null,
                'license' => $data['license'] ?? null,
                'submitted_at' => now(),
                'approved_at' => now(),
                'published_at' => now(),
            ]);

            $this->syncTags($app, $data['tags'] ?? []);
            $this->upsertRelease($app, $data);
            $this->recordAction($admin->id, 'published_app', $app, 'Published directly by an administrator.');

            return $app;
        });

        return response()->json([
            'message' => 'App published immediately.',
            'app' => $app->load(['category', 'tags', 'latestRelease.assets']),
        ], 201);
    }
    public function index(Request $request): JsonResponse
    {
        $this->admin($request);

        return response()->json(MarketplaceApp::where('status', 'approved')
            ->with(['developer:id,name,email', 'category', 'tags', 'screenshots', 'latestRelease.assets'])
            ->latest('updated_at')
            ->paginate($request->integer('per_page', 100)));
    }

    public function activities(Request $request): JsonResponse
    {
        $this->admin($request);
        $actions = ModerationAction::with('admin:id,name,email')->latest()->limit(50)->get();
        $appNames = MarketplaceApp::withTrashed()->whereIn('id', $actions->pluck('target_id'))->pluck('name', 'id');

        return response()->json($actions->map(fn (ModerationAction $action) => [
            'id' => $action->id,
            'time' => $action->created_at?->toIso8601String(),
            'admin' => $action->admin?->name ?? $action->admin?->email ?? 'Administrator',
            'action' => $action->action,
            'target' => $appNames[$action->target_id] ?? "App #{$action->target_id}",
            'note' => $action->note,
        ]));
    }

    public function pending(Request $request): JsonResponse
    {
        $this->admin($request);

        $apps = MarketplaceApp::where(function ($query) {
                $query->where('status', 'pending')
                      ->orWhereNotNull('pending_changes')
                      ->orWhere('is_deletion_requested', true);
            })
            ->with(['developer:id,name,email', 'category', 'tags', 'screenshots', 'latestRelease.assets'])
            ->oldest('submitted_at')
            ->paginate($request->integer('per_page', 20));

        return response()->json($apps);
    }

    public function approve(Request $request, int $app): JsonResponse
    {
        $admin = $this->admin($request);
        $marketplaceApp = MarketplaceApp::findOrFail($app);

        if ($marketplaceApp->pending_changes) {
            $changes = $marketplaceApp->pending_changes;
            $marketplaceApp->update($changes['attributes'] ?? []);
            if (array_key_exists('release', $changes)) {
                $this->upsertRelease($marketplaceApp, $changes['release']);
            }
            if (array_key_exists('tags', $changes)) {
                $this->syncTags($marketplaceApp, $changes['tags']);
            }
        }

        $publishedAt = $marketplaceApp->published_at;

        if (! $publishedAt) {
            $publishedAt = now();
        }

        // Approval publishes the listing, but future GitHub sync can still use pending updates.
        $marketplaceApp->update([
            'status' => 'approved',
            'approved_at' => now(),
            'published_at' => $publishedAt,
            'pending_changes' => null,
            'pending_changes_submitted_at' => null,
        ]);

        $marketplaceApp->latestRelease?->update([
            'status' => 'published',
            'published_at' => $marketplaceApp->latestRelease->published_at ?: now(),
        ]);

        $this->recordAction($admin->id, 'approved_app', $marketplaceApp, $request->input('note'));

        // Notify developer
        $marketplaceApp->developer->notify(new \App\Notifications\AppStatusNotification($marketplaceApp, 'approved'));

        // Notify users who downloaded the app about the update (if it's a new release)
        if ($marketplaceApp->latestRelease) {
            $version = $marketplaceApp->latestRelease->version;
            $downloaders = \App\Models\Download::where('app_id', $marketplaceApp->id)
                ->where('app_release_id', '!=', $marketplaceApp->latestRelease->id)
                ->with('user')
                ->get()
                ->pluck('user')
                ->unique();
                
            foreach ($downloaders as $downloader) {
                if ($downloader) {
                    $downloader->notify(new \App\Notifications\AppUpdateNotification($marketplaceApp, $version));
                }
            }
        }

        return response()->json([
            'message' => 'App approved.',
            'app' => $marketplaceApp,
        ]);
    }

    public function approveDeletion(Request $request, int $app): JsonResponse
    {
        $admin = $this->admin($request);
        $marketplaceApp = MarketplaceApp::findOrFail($app);

        if ($marketplaceApp->is_deletion_requested) {
            $marketplaceApp->delete(); // Soft delete
            $this->recordAction($admin->id, 'approved_deletion', $marketplaceApp, 'Approved developer deletion request.');
            
            // Notify developer
            $marketplaceApp->developer->notify(new \App\Notifications\AppStatusNotification($marketplaceApp, 'deleted', 'Approved developer deletion request.'));

            return response()->json([
                'message' => 'Deletion request approved. App deleted.',
            ]);
        }

        return response()->json(['error' => 'App has not requested deletion.'], 400);
    }

    public function rejectDeletion(Request $request, int $app): JsonResponse
    {
        $admin = $this->admin($request);
        $marketplaceApp = MarketplaceApp::findOrFail($app);

        if ($marketplaceApp->is_deletion_requested) {
            $marketplaceApp->is_deletion_requested = false;
            $marketplaceApp->deletion_reason = null;
            $marketplaceApp->save();

            $this->recordAction($admin->id, 'rejected_deletion', $marketplaceApp, 'Rejected developer deletion request.');
            
            // Notify developer
            $marketplaceApp->developer->notify(new \App\Notifications\AppStatusNotification($marketplaceApp, 'deletion rejected', 'Rejected developer deletion request.'));
            
            return response()->json([
                'message' => 'Deletion request rejected.',
            ]);
        }

        return response()->json(['error' => 'App has not requested deletion.'], 400);
    }

    public function update(Request $request, int $app): JsonResponse
    {
        $admin = $this->admin($request);
        $marketplaceApp = MarketplaceApp::findOrFail($app);
        $data = $request->validate([
            'category_id' => ['nullable', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:160'],
            'platform' => ['nullable', 'string', 'in:desktop,ios,mac,android,web'],
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
        $tags = $data['tags'] ?? [];
        $version = $data['version'] ?? null;
        $releaseNotes = $data['release_notes'] ?? null;
        $installCommand = $data['install_command'] ?? null;
        $sizeBytes = $data['size_bytes'] ?? null;
        $downloadUrl = $data['download_url'] ?? null;
        unset($data['tags'], $data['version'], $data['release_notes'], $data['install_command'], $data['size_bytes'], $data['download_url']);
        $marketplaceApp->update($data);

        $this->upsertRelease($marketplaceApp, [
            'version' => $version,
            'release_notes' => $releaseNotes,
            'install_command' => $installCommand,
            'size_bytes' => $sizeBytes,
            'download_url' => $downloadUrl,
        ]);
        $tagIds = collect($tags)->map(function (string $name) {
            $name = trim($name);
            if ($name === '') {
                return null;
            }
            return Tag::firstOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => Str::headline($name)]
            )->id;
        })->filter();
        $marketplaceApp->tags()->sync($tagIds);
        $this->recordAction($admin->id, 'updated_app', $marketplaceApp, 'App information updated by an administrator.');

        return response()->json(['message' => 'App information updated.', 'app' => $marketplaceApp->load(['developer:id,name,email', 'category', 'tags', 'screenshots', 'latestRelease.assets'])]);
    }

    public function reject(Request $request, int $app): JsonResponse
    {
        $admin = $this->admin($request);
        $marketplaceApp = MarketplaceApp::findOrFail($app);

        $data = $request->validate([
            'note' => ['required', 'string', 'max:1000'],
        ]);

        $marketplaceApp->update($marketplaceApp->pending_changes ? [
            'pending_changes' => null,
            'pending_changes_submitted_at' => null,
        ] : ['status' => 'rejected']);

        $this->recordAction($admin->id, 'rejected_app', $marketplaceApp, $data['note'] ?? null);

        // Notify developer
        $marketplaceApp->developer->notify(new \App\Notifications\AppStatusNotification($marketplaceApp, 'rejected', $data['note'] ?? null));

        return response()->json([
            'message' => 'App rejected.',
            'app' => $marketplaceApp,
        ]);
    }

    public function reorderScreenshots(Request $request, int $app): JsonResponse
    {
        $this->admin($request);
        $marketplaceApp = MarketplaceApp::findOrFail($app);
        $data = $request->validate([
            'screenshot_ids' => ['required', 'array'],
            'screenshot_ids.*' => ['required', 'integer', 'distinct'],
        ]);

        $currentIds = $marketplaceApp->screenshots()->pluck('id')->sort()->values();
        $submittedIds = collect($data['screenshot_ids'])->sort()->values();

        if ($currentIds->all() !== $submittedIds->all()) {
            return response()->json([
                'message' => 'The image order must include every image for this app exactly once.',
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
            'message' => 'Image order updated.',
            'screenshots' => $marketplaceApp->screenshots()->get(),
        ]);
    }

    public function feature(Request $request, int $app): JsonResponse
    {
        $admin = $this->admin($request);
        $marketplaceApp = MarketplaceApp::findOrFail($app);

        $data = $request->validate([
            'featured' => ['required', 'boolean'],
        ]);

        $marketplaceApp->update([
            'is_featured' => $data['featured'],
        ]);

        $action = 'unfeatured_app';
        $message = 'App removed from featured list.';

        if ($data['featured']) {
            $action = 'featured_app';
            $message = 'App featured.';
        }

        $this->recordAction($admin->id, $action, $marketplaceApp);

        return response()->json([
            'message' => $message,
            'app' => $marketplaceApp,
        ]);
    }

    public function destroy(Request $request, int $app): JsonResponse
    {
        $admin = $this->admin($request);
        $marketplaceApp = MarketplaceApp::findOrFail($app);
        $data = $request->validate([
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $this->recordAction($admin->id, 'deleted_app', $marketplaceApp, $data['note'] ?? 'Removed from the marketplace by an administrator.');
        $marketplaceApp->delete();

        return response()->json(['message' => 'App removed. Its record and uploaded files were retained for recovery.']);
    }

    private function admin(Request $request)
    {
        $user = $request->user();

        if (! $user || $user->role !== 'admin') {
            abort(403, 'Admin access required.');
        }

        return $user;
    }

    private function recordAction(?int $adminId, string $action, MarketplaceApp $app, ?string $note = null): void
    {
        ModerationAction::create([
            'admin_id' => $adminId,
            'action' => $action,
            'target_type' => MarketplaceApp::class,
            'target_id' => $app->id,
            'note' => $note,
        ]);
    }

    private function syncTags(MarketplaceApp $app, array $names): void
    {
        $ids = collect($names)->map(function ($name) {
            $name = trim((string) $name);
            return $name === '' ? null : Tag::firstOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => Str::headline($name)]
            )->id;
        })->filter()->unique();

        $app->tags()->sync($ids);
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $suffix = 2;

        while (MarketplaceApp::withTrashed()->where('slug', $slug)->exists()) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
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
            'status' => 'published',
            'published_at' => now(),
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

    public function dashboard(Request $request): JsonResponse
    {
        $this->admin($request);

        $approvedApps = MarketplaceApp::where('status', 'approved')
            ->with(['developer:id,name,email', 'category', 'tags', 'screenshots', 'latestRelease.assets'])
            ->latest('updated_at')
            ->get();

        $pendingApps = MarketplaceApp::where(function ($query) {
                $query->where('status', 'pending')->orWhereNotNull('pending_changes');
            })
            ->with(['developer:id,name,email', 'category', 'tags', 'screenshots', 'latestRelease.assets'])
            ->oldest('submitted_at')
            ->get();

        $actions = ModerationAction::with('admin:id,name,email')->latest()->limit(50)->get();
        $appNames = MarketplaceApp::withTrashed()->whereIn('id', $actions->pluck('target_id'))->pluck('name', 'id');
        $activities = $actions->map(fn (ModerationAction $action) => [
            'id' => $action->id,
            'time' => $action->created_at?->toIso8601String(),
            'admin' => $action->admin?->name ?? $action->admin?->email ?? 'Administrator',
            'action' => $action->action,
            'target' => $appNames[$action->target_id] ?? "App #{$action->target_id}",
            'note' => $action->note,
        ]);

        return response()->json([
            'apps' => [
                'data' => $approvedApps
            ],
            'pending' => [
                'data' => $pendingApps
            ],
            'activities' => $activities
        ]);
    }
}
