<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'status',
    ];

    public function preOrders()
    {
        return $this->hasMany(PreOrder::class);
    }
}
