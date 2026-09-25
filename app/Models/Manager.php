<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Manager extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
    ];

    /**
     * The employee who is the manager.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * The employees managed by this manager (team members).
     */
    public function teamMembers(): BelongsToMany
    {
        return $this->belongsToMany(Employee::class, 'manager_team', 'manager_id', 'employee_id');
    }
}