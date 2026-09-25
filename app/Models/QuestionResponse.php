<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuestionResponse extends Model
{
    use HasFactory;

    protected $fillable = [
        'question_id',
        'evaluation_response_id',
        'score',
    ];

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    public function evaluationResponse(): BelongsTo
    {
        return $this->belongsTo(EvaluationResponse::class);
    }
}
