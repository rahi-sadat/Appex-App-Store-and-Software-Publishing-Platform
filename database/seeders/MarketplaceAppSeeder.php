<?php

namespace Database\Seeders;

use App\Models\AppRelease;
use App\Models\Category;
use App\Models\MarketplaceApp;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class MarketplaceAppSeeder extends Seeder
{
    public function run(): void
    {
        $developer = User::updateOrCreate(
            ['email' => 'developer@appex.test'],
            ['name' => 'Appex Demo Studio', 'password' => Hash::make('password'), 'role' => 'developer']
        );

        foreach ($this->apps() as $position => $data) {
            $category = Category::where('slug', $data['category'])->firstOrFail();
            $slug = Str::slug($data['name']);
            $app = MarketplaceApp::updateOrCreate(['slug' => $slug], [
                'developer_id' => $developer->id, 'category_id' => $category->id, 'name' => $data['name'],
                'tagline' => $data['tagline'], 'description' => $data['description'], 'source' => $data['source'],
                'status' => 'approved', 'repository_url' => $data['repository_url'], 'demo_url' => $data['demo_url'],
                'license' => $data['license'], 'primary_language' => $data['language'], 'trust_score' => $data['trust_score'],
                'is_featured' => $position < 3, 'submitted_at' => now()->subDays(20 - $position),
                'approved_at' => now()->subDays(18 - $position), 'published_at' => now()->subDays(18 - $position),
            ]);

            $tagIds = collect($data['tags'])->map(fn (string $name) => Tag::firstOrCreate(
                ['slug' => Str::slug($name)], ['name' => $name]
            )->id);
            $app->tags()->sync($tagIds);

            $release = AppRelease::updateOrCreate(['app_id' => $app->id, 'version' => $data['version']], [
                'title' => $data['name'].' '.$data['version'], 'release_notes' => $data['release_notes'],
                'install_command' => $data['install_command'], 'source' => $data['source'],
                'status' => 'published', 'published_at' => now()->subDays(10 - $position),
            ]);
        }
    }

    private function apps(): array
    {
        $rows = [
            ['Pulseboard', 'business', 'A calm, real-time dashboard for small product teams.', 'Bring revenue, support, and product signals into one readable workspace.', 'manual', null, 'https://demo.example.com/pulseboard', 'Commercial', 'PHP', 92, ['Analytics', 'Dashboard', 'SaaS'], '2.4.1', 'Adds weekly summaries and faster CSV imports.', null, 'Team metrics overview'],
            ['Commit Canvas', 'developer-tools', 'Turn Git history into a clear visual release story.', 'Compare releases and create stakeholder-friendly changelogs.', 'github', 'https://github.com/appex-demo/commit-canvas', 'https://commit-canvas.example.com', 'MIT', 'TypeScript', 95, ['Git', 'Changelog', 'Open Source'], '1.8.0', 'Adds branch comparison and Markdown export.', 'npx commit-canvas', 'Visual branch comparison'],
            ['Focus Harbor', 'productivity', 'Private focus sessions with gentle daily planning.', 'Plan meaningful tasks and run distraction-free timers locally.', 'github', 'https://github.com/appex-demo/focus-harbor', 'https://focus-harbor.example.com', 'AGPL-3.0', 'Vue', 90, ['Pomodoro', 'Privacy', 'Planning'], '3.2.0', 'Adds offline mode and daily reflection.', 'npm install && npm run dev', 'Today plan and focus timer'],
            ['Palette Pilot', 'design', 'Build accessible color systems from one brand color.', 'Generate color scales, check contrast, and export design tokens.', 'github', 'https://github.com/appex-demo/palette-pilot', 'https://palette-pilot.example.com', 'Apache-2.0', 'React', 94, ['Accessibility', 'Color', 'Design Tokens'], '1.5.2', 'Adds OKLCH scales and Tailwind v4 export.', 'npm create palette-pilot', 'Accessible color scale builder'],
            ['Study Sprout', 'education', 'Spaced repetition that grows around your class notes.', 'Convert notes into cards and schedule short review sessions.', 'manual', null, 'https://demo.example.com/study-sprout', 'Commercial', 'Laravel', 87, ['Study', 'Flashcards', 'Students'], '2.1.0', 'Adds bulk note import and progress charts.', null, 'Upcoming study review queue'],
            ['Invoice Nest', 'business', 'Simple invoicing for independent professionals.', 'Create branded invoices and track payment status without clutter.', 'manual', null, 'https://demo.example.com/invoice-nest', 'Commercial', 'PHP', 89, ['Invoices', 'Freelance', 'Finance'], '4.0.3', 'Adds recurring drafts and multi-currency totals.', null, 'Invoice list and payment status'],
            ['JSON Lantern', 'developer-tools', 'Inspect and reshape large JSON files.', 'A fast JSON viewer with schema hints, diffing, and filters.', 'github', 'https://github.com/appex-demo/json-lantern', 'https://json-lantern.example.com', 'MIT', 'Rust', 96, ['JSON', 'Data', 'CLI'], '0.9.4', 'Adds JSON Lines support and lower memory use.', 'cargo install json-lantern', 'Large JSON document inspector'],
            ['Clipkeep', 'utilities', 'Searchable clipboard history that stays on your machine.', 'Organize snippets with expiry, navigation, and local encryption.', 'github', 'https://github.com/appex-demo/clipkeep', null, 'GPL-3.0', 'Go', 91, ['Clipboard', 'Privacy', 'Desktop'], '1.3.1', 'Adds encrypted backups and retention settings.', 'go install example.com/clipkeep@latest', 'Searchable clipboard history'],
            ['Form Finch', 'developer-tools', 'Test forms and webhooks before your backend is ready.', 'Inspect payloads, replay webhooks, and share temporary endpoints.', 'github', 'https://github.com/appex-demo/form-finch', 'https://form-finch.example.com', 'MPL-2.0', 'TypeScript', 93, ['Webhooks', 'Testing', 'Forms'], '2.0.0', 'Adds request replay and team inboxes.', 'docker run -p 8080:8080 appexdemo/form-finch', 'Captured webhook details'],
        ];

        $keys = ['name', 'category', 'tagline', 'description', 'source', 'repository_url', 'demo_url', 'license', 'language', 'trust_score', 'tags', 'version', 'release_notes', 'install_command', 'caption'];

        return array_map(fn (array $row) => array_combine($keys, $row), $rows);
    }
}
