<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('app_releases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('app_id')->constrained('apps')->cascadeOnDelete();
            $table->string('version');
            $table->string('title')->nullable();
            $table->longText('release_notes')->nullable();
            $table->string('install_command')->nullable();
            $table->enum('source', ['manual', 'github'])->default('manual');
            $table->enum('status', ['draft', 'pending', 'published', 'rejected', 'archived'])->default('draft');

            // These fields let GitHub sync map a release back to the original repo event.
            $table->string('github_release_id')->nullable();
            $table->string('github_tag_name')->nullable();
            $table->string('changelog_url')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->unique(['app_id', 'version']);
            $table->index(['app_id', 'status']);
        });

        Schema::create('app_assets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('app_id')->constrained('apps')->cascadeOnDelete();
            $table->foreignId('app_release_id')->nullable()->constrained('app_releases')->cascadeOnDelete();
            $table->string('name');
            $table->enum('type', ['download', 'source', 'apk', 'zip', 'installer', 'package', 'other'])->default('download');
            $table->string('file_path')->nullable();
            $table->string('external_url')->nullable();
            $table->unsignedBigInteger('size_bytes')->nullable();
            $table->string('checksum_sha256')->nullable();
            $table->string('platform')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['app_id', 'type']);
        });

        Schema::create('app_screenshots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('app_id')->constrained('apps')->cascadeOnDelete();
            $table->foreignId('app_release_id')->nullable()->constrained('app_releases')->nullOnDelete();
            $table->string('image_path');
            $table->string('caption')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_cover')->default(false);
            $table->timestamps();

            $table->index(['app_id', 'is_cover']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_screenshots');
        Schema::dropIfExists('app_assets');
        Schema::dropIfExists('app_releases');
    }
};
