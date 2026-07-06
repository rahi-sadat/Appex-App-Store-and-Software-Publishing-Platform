<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AppScreenshot extends Model
{
    use HasFactory;

    protected $fillable = [
        'app_id',
        'app_release_id',
        'image_path',
        'caption',
        'sort_order',
        'is_cover',
    ];

    protected function casts(): array
    {
        return [
            'is_cover' => 'boolean',
        ];
    }

    public function app(): BelongsTo
    {
        return $this->belongsTo(MarketplaceApp::class, 'app_id');
    }

    public function release(): BelongsTo
    {
        return $this->belongsTo(AppRelease::class, 'app_release_id');
    }
}
