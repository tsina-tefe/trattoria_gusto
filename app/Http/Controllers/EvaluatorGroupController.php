<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Department;
use App\Models\Employee;
use App\Models\EvaluatorGroup;
use App\Models\QuestionGroup;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class EvaluatorGroupController extends Controller
{
    public function index(Request $request)
    {
        $query = EvaluatorGroup::with(['questionGroup', 'employees']);

        if ($request->has('search') && $request->search) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhereHas('questionGroup', function ($q) use ($request) {
                      $q->where('name', 'like', '%' . $request->search . '%');
                  });
        }

        $evaluatorGroups = $query->withCount('employees')->latest()->paginate(10)->withQueryString();

        return Inertia::render('EvaluatorGroups/Index', [
            'evaluatorGroups' => $evaluatorGroups,
            'request' => $request->only('search'),
        ]);
    }

    public function create()
    {
        $questionGroups = QuestionGroup::select('id', 'name')->orderBy('name')->get();
        $employees = Employee::with(['branch:id,name', 'department:id,name'])
            ->select('id', 'first_name', 'last_name', 'email', 'branch_id', 'department_id')
            ->orderBy('first_name')
            ->get();
        $branches = Branch::select('id', 'name')->orderBy('name')->get();
        $departments = Department::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('EvaluatorGroups/Create', [
            'questionGroups' => $questionGroups,
            'employees' => $employees,
            'branches' => $branches,
            'departments' => $departments,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'question_group_id' => 'required|exists:question_groups,id',
            'employee_ids' => 'array',
            'employee_ids.*' => 'integer|exists:employees,id',
        ]);

        $evaluatorGroup = EvaluatorGroup::create([
            'name' => $validated['name'],
            'question_group_id' => $validated['question_group_id'],
        ]);

        if (!empty($validated['employee_ids'])) {
            $evaluatorGroup->employees()->sync($validated['employee_ids']);
        }

        return Redirect::route('evaluator-groups.index')->with('flash.message', 'Evaluator Group created successfully!');
    }

    public function edit(EvaluatorGroup $evaluatorGroup)
    {
        $questionGroups = QuestionGroup::select('id', 'name')->orderBy('name')->get();
        $employees = Employee::with(['branch:id,name', 'department:id,name'])
            ->select('id', 'first_name', 'last_name', 'email', 'branch_id', 'department_id')
            ->orderBy('first_name')
            ->get();
        $branches = Branch::select('id', 'name')->orderBy('name')->get();
        $departments = Department::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('EvaluatorGroups/Edit', [
            'evaluatorGroup' => $evaluatorGroup->load('questionGroup', 'employees:id,first_name,last_name,email'),
            'questionGroups' => $questionGroups,
            'employees' => $employees,
            'branches' => $branches,
            'departments' => $departments,
        ]);
    }

    public function update(Request $request, EvaluatorGroup $evaluatorGroup)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'question_group_id' => 'required|exists:question_groups,id',
            'employee_ids' => 'array',
            'employee_ids.*' => 'integer|exists:employees,id',
        ]);

        $evaluatorGroup->update([
            'name' => $validated['name'],
            'question_group_id' => $validated['question_group_id'],
        ]);

        $evaluatorGroup->employees()->sync($validated['employee_ids'] ?? []);

        return Redirect::route('evaluator-groups.index')->with('flash.message', 'Evaluator Group updated successfully!');
    }

    public function destroy(EvaluatorGroup $evaluatorGroup)
    {
        $evaluatorGroup->delete();

        return Redirect::route('evaluator-groups.index')->with('flash.message', 'Evaluator Group deleted successfully!');
    }
}

