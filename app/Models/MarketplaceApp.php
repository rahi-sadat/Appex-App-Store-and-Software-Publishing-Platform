<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class MarketplaceApp extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'apps';

    protected $fillable = [
        'developer_id',
        'category_id',
        'name',
        'slug',
        'tagline',
        'description',
        'source',
        'status',
        'pending_changes',
        'pending_changes_submitted_at',
        'repository_url',
        'demo_url',
        'license',
        'primary_language',
        'icon_path',
        'trust_score',
        'is_featured',
        'submitted_at',
        'approved_at',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'is_featured' => 'boolean',
            'submitted_at' => 'datetime',
            'approved_at' => 'datetime',
            'published_at' => 'datetime',
            'pending_changes' => 'array',
            'pending_changes_submitted_at' => 'datetime',
        ];
    }

    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('status', 'approved');
    }

    public function developer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'developer_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'app_tag', 'app_id', 'tag_id')
            ->withTimestamps();
    }

    public function releases(): HasMany
    {
        return $this->hasMany(AppRelease::class, 'app_id');
    }

    public function latestRelease(): HasOne
    {
        return $this->hasOne(AppRelease::class, 'app_id')->latestOfMany();
    }

    public function assets(): HasMany
    {
        return $this->hasMany(AppAsset::class, 'app_id');
    }

    public function screenshots(): HasMany
    {
        return $this->hasMany(AppScreenshot::class, 'app_id')->orderBy('sort_order');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'app_id');
    }

    public function bugReports(): HasMany
    {
        return $this->hasMany(BugReport::class, 'app_id');
    }

    public function downloads(): HasMany
    {
        return $this->hasMany(Download::class, 'app_id');
    }

    public function reports(): HasMany
    {
        return $this->hasMany(AppReport::class, 'app_id');
    }
}
