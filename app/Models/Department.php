<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Department extends Model
{
    use HasFactory;

    protected static function booted(): void
    {
        static::saved(fn() => Cache::forget('departments_all_sorted'));
        static::deleted(fn() => Cache::forget('departments_all_sorted'));
    }

    protected $fillable = [
        'name',
        'description',
        'is_active',
        'is_active_on_weekly_budget',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_active_on_weekly_budget' => 'boolean',
    ];

    public function branches()
    {
        return $this->belongsToMany(Branch::class);
    }
}
