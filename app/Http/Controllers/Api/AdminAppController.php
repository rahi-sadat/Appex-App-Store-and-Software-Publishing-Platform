<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MarketplaceApp;
use App\Models\ModerationAction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminAppController extends Controller
{
    public function pending(Request $request): JsonResponse
    {
        $this->admin($request);

        $apps = MarketplaceApp::where('status', 'pending')
            ->with(['developer:id,name,email', 'category', 'tags', 'latestRelease'])
            ->oldest('submitted_at')
            ->paginate($request->integer('per_page', 20));

        return response()->json($apps);
    }

    public function approve(Request $request, int $app): JsonResponse
    {
        $admin = $this->admin($request);
        $marketplaceApp = MarketplaceApp::findOrFail($app);

        $publishedAt = $marketplaceApp->published_at;

        if (! $publishedAt) {
            $publishedAt = now();
        }

        // Approval publishes the listing, but future GitHub sync can still use pending updates.
        $marketplaceApp->update([
            'status' => 'approved',
            'approved_at' => now(),
            'published_at' => $publishedAt,
        ]);

        $this->recordAction($admin->id, 'approved_app', $marketplaceApp, $request->input('note'));

        return response()->json([
            'message' => 'App approved.',
            'app' => $marketplaceApp,
        ]);
    }

    public function reject(Request $request, int $app): JsonResponse
    {
        $admin = $this->admin($request);
        $marketplaceApp = MarketplaceApp::findOrFail($app);

        $data = $request->validate([
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $marketplaceApp->update([
            'status' => 'rejected',
        ]);

        $this->recordAction($admin->id, 'rejected_app', $marketplaceApp, $data['note'] ?? null);

        return response()->json([
            'message' => 'App rejected.',
            'app' => $marketplaceApp,
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
}
