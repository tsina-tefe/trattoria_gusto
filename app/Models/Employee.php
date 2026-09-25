<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_code',
        'first_name',
        'last_name',
        'phone',
        'gender',
        'date_of_birth',
        'email',
        'hire_date',
        'image_id',
        'branch_id',
        'department_id',
        'position_id',
        'status',
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class);
    }

    public function image(): BelongsTo
    {
        return $this->belongsTo(Image::class);
    }

    public function user(): HasOne
    {
        return $this->hasOne(User::class);
    }

    /**
     * The manager record if this employee is a manager.
     */
    public function manager(): HasOne
    {
        return $this->hasOne(Manager::class);
    }

    /**
     * The managers this employee is managed by.
     */
    public function managers(): BelongsToMany
    {
        return $this->belongsToMany(Manager::class, 'manager_team', 'employee_id', 'manager_id');
    }

    /**
     * Evaluator groups this employee belongs to as an evaluator.
     */
    public function evaluatorGroups(): BelongsToMany
    {
        return $this->belongsToMany(EvaluatorGroup::class, 'evaluator_group_employee', 'employee_id', 'evaluator_group_id');
    }

    /**
     * Evaluates groups where this employee is an evaluatee (selected by employee type).
     */
    public function evaluatesGroups(): BelongsToMany
    {
        return $this->belongsToMany(EvaluatesGroup::class, 'evaluates_group_employee', 'employee_id', 'evaluates_group_id');
    }
}