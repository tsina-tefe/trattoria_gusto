<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SmsTemplate extends Model
{
    protected $fillable = [
        'name',
        'content',
        'variables',
    ];

    protected $casts = [
        'variables' => 'array',
    ];
    //
}
