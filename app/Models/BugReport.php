<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BugReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'app_id',
        'app_release_id',
        'user_id',
        'title',
        'description',
        'severity',
        'status',
        'environment',
    ];

    protected function casts(): array
    {
        return [
            'environment' => 'array',
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

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
