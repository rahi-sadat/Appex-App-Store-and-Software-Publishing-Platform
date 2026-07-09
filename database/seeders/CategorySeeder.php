<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Developer Tools', 'slug' => 'developer-tools', 'description' => 'Tools that help teams build, test, and ship software.', 'icon' => 'code', 'sort_order' => 10],
            ['name' => 'Productivity', 'slug' => 'productivity', 'description' => 'Apps for planning work, managing time, and staying focused.', 'icon' => 'check-square', 'sort_order' => 20],
            ['name' => 'Design', 'slug' => 'design', 'description' => 'Creative tools, UI kits, and resources for designers.', 'icon' => 'palette', 'sort_order' => 30],
            ['name' => 'Education', 'slug' => 'education', 'description' => 'Learning, teaching, and study companion apps.', 'icon' => 'graduation-cap', 'sort_order' => 40],
            ['name' => 'Business', 'slug' => 'business', 'description' => 'Software for customers, sales, operations, and small businesses.', 'icon' => 'briefcase', 'sort_order' => 50],
            ['name' => 'Utilities', 'slug' => 'utilities', 'description' => 'Focused tools that solve useful everyday problems.', 'icon' => 'wrench', 'sort_order' => 60],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(['slug' => $category['slug']], $category + ['is_active' => true]);
        }
    }
}
