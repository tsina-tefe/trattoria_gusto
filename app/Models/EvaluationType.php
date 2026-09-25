<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EvaluationType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'evaluation_type',
    ];

    public function evaluationResponses(): HasMany
    {
        return $this->hasMany(EvaluationResponse::class);
    }
}