<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Cache;

class ChildCategory extends Model
{
    use HasFactory;

    protected static function booted(): void
    {
        static::saved(function () {
            Cache::forget('child_categories_active');
            Cache::forget('child_categories_all_sorted');
            Cache::forget('child_categories_count');
        });
        static::deleted(function () {
            Cache::forget('child_categories_active');
            Cache::forget('child_categories_all_sorted');
            Cache::forget('child_categories_count');
        });
    }

    protected $fillable = [
        'child_name',
        'status',
    ];

    /**
     * @return HasMany<Product>
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}


