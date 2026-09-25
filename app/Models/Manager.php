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
        'manager_type',
        'branch_id',
        'department_id',
        'status',
        'effective_from',
        'effective_to',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * The employees managed by this manager (team members).
     */
    public function teamMembers(): BelongsToMany
    {
        return $this->belongsToMany(Employee::class, 'manager_team', 'manager_id', 'employee_id');
    }
}