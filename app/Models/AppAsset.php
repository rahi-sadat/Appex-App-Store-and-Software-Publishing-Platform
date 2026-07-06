<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AppAsset extends Model
{
    use HasFactory;

    protected $fillable = [
        'app_id',
        'app_release_id',
        'name',
        'type',
        'file_path',
        'external_url',
        'size_bytes',
        'checksum_sha256',
        'platform',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
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
