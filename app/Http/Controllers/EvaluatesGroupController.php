<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Department;
use App\Models\Employee;
use App\Models\EvaluatesGroup;
use App\Models\OtherEvaluable;
use App\Models\QuestionGroup;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class EvaluatesGroupController extends Controller
{
    public function index(Request $request)
    {
        $query = EvaluatesGroup::with(['questionGroup', 'employees', 'departments', 'branches', 'otherEvaluables']);

        if ($request->has('search') && $request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $evaluatesGroups = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('EvaluatesGroups/Index', [
            'evaluatesGroups' => $evaluatesGroups,
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
        $departments = Department::with('branches:id,name')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();
        $otherEvaluables = OtherEvaluable::select('id', 'name', 'description')->orderBy('name')->get();

        return Inertia::render('EvaluatesGroups/Create', [
            'questionGroups' => $questionGroups,
            'employees' => $employees,
            'branches' => $branches,
            'departments' => $departments,
            'otherEvaluables' => $otherEvaluables,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'question_group_id' => 'required|exists:question_groups,id',
            'evaluable_type' => 'required|in:employee,department,branch,other',
            'entity_ids' => 'required|array|min:1',
            'entity_ids.*' => 'required|integer',
        ]);

        $evaluatesGroup = EvaluatesGroup::create([
            'name' => $validated['name'],
            'question_group_id' => $validated['question_group_id'],
            'evaluable_type' => $validated['evaluable_type'],
        ]);

        // Sync the appropriate relationship based on type
        switch ($validated['evaluable_type']) {
            case 'employee':
                $evaluatesGroup->employees()->sync($validated['entity_ids']);
                break;
            case 'department':
                $evaluatesGroup->departments()->sync($validated['entity_ids']);
                break;
            case 'branch':
                $evaluatesGroup->branches()->sync($validated['entity_ids']);
                break;
            case 'other':
                $evaluatesGroup->otherEvaluables()->sync($validated['entity_ids']);
                break;
        }

        return Redirect::route('evaluates-groups.index')->with('flash.message', 'Evaluates Group created successfully!');
    }

    public function edit(EvaluatesGroup $evaluatesGroup)
    {
        $questionGroups = QuestionGroup::select('id', 'name')->orderBy('name')->get();
        $employees = Employee::with(['branch:id,name', 'department:id,name'])
            ->select('id', 'first_name', 'last_name', 'email', 'branch_id', 'department_id')
            ->orderBy('first_name')
            ->get();
        $branches = Branch::select('id', 'name')->orderBy('name')->get();
        $departments = Department::with('branches:id,name')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();
        $otherEvaluables = OtherEvaluable::select('id', 'name', 'description')->orderBy('name')->get();

        // Load the appropriate relationship based on type
        $evaluatesGroupData = $evaluatesGroup->load(['questionGroup'])->toArray();
        
        switch ($evaluatesGroup->evaluable_type) {
            case 'employee':
                $evaluatesGroupData['selected_entities'] = $evaluatesGroup->employees()->pluck('employees.id')->toArray();
                break;
            case 'department':
                $evaluatesGroupData['selected_entities'] = $evaluatesGroup->departments()->pluck('departments.id')->toArray();
                break;
            case 'branch':
                $evaluatesGroupData['selected_entities'] = $evaluatesGroup->branches()->pluck('branches.id')->toArray();
                break;
            case 'other':
                $evaluatesGroupData['selected_entities'] = $evaluatesGroup->otherEvaluables()->pluck('other_evaluables.id')->toArray();
                break;
        }

        return Inertia::render('EvaluatesGroups/Edit', [
            'evaluatesGroup' => $evaluatesGroupData,
            'questionGroups' => $questionGroups,
            'employees' => $employees,
            'branches' => $branches,
            'departments' => $departments,
            'otherEvaluables' => $otherEvaluables,
        ]);
    }

    public function update(Request $request, EvaluatesGroup $evaluatesGroup)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'question_group_id' => 'required|exists:question_groups,id',
            'evaluable_type' => 'required|in:employee,department,branch,other',
            'entity_ids' => 'required|array|min:1',
            'entity_ids.*' => 'required|integer',
        ]);

        $evaluatesGroup->update([
            'name' => $validated['name'],
            'question_group_id' => $validated['question_group_id'],
            'evaluable_type' => $validated['evaluable_type'],
        ]);

        // Clear old relationships
        $evaluatesGroup->employees()->sync([]);
        $evaluatesGroup->departments()->sync([]);
        $evaluatesGroup->branches()->sync([]);
        $evaluatesGroup->otherEvaluables()->sync([]);

        // Sync the appropriate relationship based on type
        switch ($validated['evaluable_type']) {
            case 'employee':
                $evaluatesGroup->employees()->sync($validated['entity_ids']);
                break;
            case 'department':
                $evaluatesGroup->departments()->sync($validated['entity_ids']);
                break;
            case 'branch':
                $evaluatesGroup->branches()->sync($validated['entity_ids']);
                break;
            case 'other':
                $evaluatesGroup->otherEvaluables()->sync($validated['entity_ids']);
                break;
        }

        return Redirect::route('evaluates-groups.index')->with('flash.message', 'Evaluates Group updated successfully!');
    }

    public function destroy(EvaluatesGroup $evaluatesGroup)
    {
        $evaluatesGroup->delete();

        return Redirect::route('evaluates-groups.index')->with('flash.message', 'Evaluates Group deleted successfully!');
    }
}
