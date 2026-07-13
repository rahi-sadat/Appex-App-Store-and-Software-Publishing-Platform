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
            // Fake apps removed as requested
        ];

        $keys = ['name', 'category', 'tagline', 'description', 'source', 'repository_url', 'demo_url', 'license', 'language', 'trust_score', 'tags', 'version', 'release_notes', 'install_command', 'caption'];

        return array_map(fn (array $row) => array_combine($keys, $row), $rows);
    }
}
