<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CollectionDay extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'display_order',
        'status',
        'holiday_id',
    ];

    protected $casts = [
        'display_order' => 'integer',
        'holiday_id' => 'integer',
    ];

    public function preOrders()
    {
        return $this->hasMany(PreOrder::class);
    }

    public function holiday()
    {
        return $this->belongsTo(Holiday::class);
    }
}
