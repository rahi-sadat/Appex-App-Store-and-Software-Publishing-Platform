<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\MarketplaceApp;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DeveloperAppController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $this->developer($request);

        $apps = MarketplaceApp::where('developer_id', $user->id)
            ->with(['category', 'tags', 'screenshots', 'latestRelease'])
            ->latest()
            ->paginate($request->integer('per_page', 12));

        return response()->json($apps);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $this->developer($request);

        $data = $request->validate([
            'category_id' => ['nullable', 'exists:categories,id'],
            'category_slug' => ['nullable', 'exists:categories,slug'],
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

        $categoryId = $data['category_id'] ?? null;

        if (! $categoryId && isset($data['category_slug'])) {
            $category = Category::where('slug', $data['category_slug'])->first();

            if ($category) {
                $categoryId = $category->id;
            }
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

        $this->syncTags($app, $data['tags'] ?? []);

        return response()->json($app->load(['category', 'tags']), 201);
    }

    public function update(Request $request, int $app): JsonResponse
    {
        $user = $this->developer($request);
        $marketplaceApp = MarketplaceApp::where('developer_id', $user->id)->findOrFail($app);

        $data = $request->validate([
            'category_id' => ['nullable', 'exists:categories,id'],
            'name' => ['sometimes', 'required', 'string', 'max:160'],
            'tagline' => ['nullable', 'string', 'max:220'],
            'description' => ['nullable', 'string'],
            'repository_url' => ['nullable', 'url', 'max:255'],
            'demo_url' => ['nullable', 'url', 'max:255'],
            'license' => ['nullable', 'string', 'max:80'],
            'primary_language' => ['nullable', 'string', 'max:80'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:40'],
        ]);

        if (isset($data['name']) && $data['name'] !== $marketplaceApp->name) {
            $data['slug'] = $this->uniqueSlug($data['name'], $marketplaceApp->id);
        }

        $updateData = $data;
        unset($updateData['tags']);

        $marketplaceApp->update($updateData);

        if (array_key_exists('tags', $data)) {
            $this->syncTags($marketplaceApp, $data['tags'] ?? []);
        }

        return response()->json($marketplaceApp->load(['category', 'tags']));
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

    private function developer(Request $request)
    {
        $user = $request->user();

        if (! $user || $user->role !== 'developer') {
            abort(403, 'Developer access required.');
        }

        return $user;
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
}
