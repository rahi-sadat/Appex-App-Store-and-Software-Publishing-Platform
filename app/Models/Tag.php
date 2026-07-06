<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tag extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
    ];

    public function apps(): BelongsToMany
    {
        return $this->belongsToMany(MarketplaceApp::class, 'app_tag', 'tag_id', 'app_id')
            ->withTimestamps();
    }
}
