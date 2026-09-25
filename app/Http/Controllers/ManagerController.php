<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Manager;
use App\Models\Branch;
use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ManagerController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search', '');

        $managers = Manager::with('employee')
            ->when($search, function ($query, $search) {
                $query->whereHas('employee', function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%");
                });
            })
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Managers/Index', [
            'managers' => $managers,
            'request' => $request->all(),
        ]);
    }

    public function create()
    {
        $employees = Employee::select('id', 'first_name', 'last_name', 'branch_id', 'department_id')
            ->with(['branch', 'department'])
            ->get()
            ->map(function ($employee) {
                return [
                    'id' => $employee->id,
                    'name' => $employee->first_name . ' ' . $employee->last_name,
                    'branch_id' => $employee->branch_id,
                    'department_id' => $employee->department_id,
                ];
            });

        $branches = Branch::with('departments')
            ->get()
            ->map(function ($branch) {
                return [
                    'id' => $branch->id,
                    'name' => $branch->name,
                    'departments' => $branch->departments->map(function ($department) {
                        return [
                            'id' => $department->id,
                            'name' => $department->name,
                        ];
                    })->toArray(),
                ];
            });

        $departments = Department::select('id', 'name')->get();

        return Inertia::render('Managers/Create', [
            'employees' => $employees,
            'branches' => $branches,
            'departments' => $departments,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'team_members' => 'nullable|array',
            'team_members.*' => 'exists:employees,id',
            'branch_id' => 'nullable|exists:branches,id',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        $manager = Manager::create([
            'employee_id' => $validated['employee_id'],
        ]);

        if (!empty($validated['team_members'])) {
            $manager->teamMembers()->sync($validated['team_members']);
        }

        return redirect()->route('managers.index')->with('message', 'Manager created successfully.');
    }

    public function edit(Manager $manager)
    {
        $employees = Employee::select('id', 'first_name', 'last_name', 'branch_id', 'department_id')
            ->with(['branch', 'department'])
            ->get()
            ->map(function ($employee) {
                return [
                    'id' => $employee->id,
                    'name' => $employee->first_name . ' ' . $employee->last_name,
                    'branch_id' => $employee->branch_id,
                    'department_id' => $employee->department_id,
                ];
            });

        $branches = Branch::with('departments')
            ->get()
            ->map(function ($branch) {
                return [
                    'id' => $branch->id,
                    'name' => $branch->name,
                    'departments' => $branch->departments->map(function ($department) {
                        return [
                            'id' => $department->id,
                            'name' => $department->name,
                        ];
                    })->toArray(),
                ];
            });

        $departments = Department::select('id', 'name')->get();

        return Inertia::render('Managers/Edit', [
            'manager' => [
                'id' => $manager->id,
                'employee_id' => $manager->employee_id,
                'employee_name' => $manager->employee->first_name . ' ' . $manager->employee->last_name,
                'team_members' => $manager->teamMembers->pluck('id')->toArray(),
            ],
            'employees' => $employees,
            'branches' => $branches,
            'departments' => $departments,
        ]);
    }

    public function update(Request $request, Manager $manager)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'team_members' => 'nullable|array',
            'team_members.*' => 'exists:employees,id',
            'branch_id' => 'nullable|exists:branches,id',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        $manager->update([
            'employee_id' => $validated['employee_id'],
        ]);

        $manager->teamMembers()->sync($validated['team_members'] ?? []);

        return redirect()->route('managers.index')->with('message', 'Manager updated successfully.');
    }

    public function destroy(Manager $manager)
    {
        $manager->delete();
        return redirect()->route('managers.index')->with('message', 'Manager deleted successfully.');
    }

    /**
     * Get departments by branch ID (API endpoint for dynamic dropdowns)
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function departmentsByBranch(Request $request)
    {
        $branchId = $request->query('branch_id');
        
        if (!$branchId) {
            return response()->json([]);
        }

        $branch = Branch::with('departments')->find($branchId);
        
        if (!$branch) {
            return response()->json([]);
        }

        $departments = $branch->departments->map(function ($department) {
            return [
                'id' => $department->id,
                'name' => $department->name,
            ];
        });

        return response()->json($departments);
    }
}