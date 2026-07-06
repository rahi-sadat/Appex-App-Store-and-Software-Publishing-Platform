<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AppRelease extends Model
{
    use HasFactory;

    protected $fillable = [
        'app_id',
        'version',
        'title',
        'release_notes',
        'install_command',
        'source',
        'status',
        'github_release_id',
        'github_tag_name',
        'changelog_url',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
        ];
    }

    public function app(): BelongsTo
    {
        return $this->belongsTo(MarketplaceApp::class, 'app_id');
    }

    public function assets(): HasMany
    {
        return $this->hasMany(AppAsset::class, 'app_release_id');
    }

    public function screenshots(): HasMany
    {
        return $this->hasMany(AppScreenshot::class, 'app_release_id');
    }
}
