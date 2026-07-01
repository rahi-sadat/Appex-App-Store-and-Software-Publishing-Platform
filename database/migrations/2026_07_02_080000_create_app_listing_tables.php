<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('apps', function (Blueprint $table) {
            $table->id();

            // Developer ownership decides who can edit and publish the app later.
            $table->foreignId('developer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();

            $table->string('name');
            $table->string('slug')->unique();
            $table->string('tagline')->nullable();
            $table->longText('description')->nullable();
            $table->enum('source', ['manual', 'github'])->default('manual');
            $table->enum('status', ['draft', 'pending', 'approved', 'rejected', 'suspended'])->default('draft');
            $table->string('repository_url')->nullable();
            $table->string('demo_url')->nullable();
            $table->string('license')->nullable();
            $table->string('primary_language')->nullable();
            $table->unsignedTinyInteger('trust_score')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'is_featured']);
            $table->index(['developer_id', 'status']);
        });

        Schema::create('app_tag', function (Blueprint $table) {
            // This pivot lets one app appear under many searchable tags.
            $table->foreignId('app_id')->constrained('apps')->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained('tags')->cascadeOnDelete();
            $table->timestamps();

            $table->primary(['app_id', 'tag_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_tag');
        Schema::dropIfExists('apps');
    }
};
