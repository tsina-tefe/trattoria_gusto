<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('managers', function (Blueprint $table) {
            $table->enum('manager_type', ['branch', 'department'])->default('branch')->after('employee_id');
            $table->foreignId('branch_id')->nullable()->after('manager_type')->constrained('branches')->nullOnDelete();
            $table->foreignId('department_id')->nullable()->after('branch_id')->constrained('departments')->nullOnDelete();
            $table->enum('status', ['active', 'inactive'])->default('active')->after('department_id');
            $table->date('effective_from')->nullable()->after('status');
            $table->date('effective_to')->nullable()->after('effective_from');
        });

        $this->backfillManagerScopeFromEmployees();

        Schema::table('managers', function (Blueprint $table) {
            $table->unique(
                ['employee_id', 'manager_type', 'branch_id', 'department_id'],
                'managers_scope_unique',
            );
        });
    }

    public function down(): void
    {
        Schema::table('managers', function (Blueprint $table) {
            $table->dropUnique('managers_scope_unique');
            $table->dropConstrainedForeignId('department_id');
            $table->dropConstrainedForeignId('branch_id');
            $table->dropColumn([
                'manager_type',
                'status',
                'effective_from',
                'effective_to',
            ]);
        });
    }

    private function backfillManagerScopeFromEmployees(): void
    {
        if (! Schema::hasTable('managers') || ! Schema::hasTable('employees')) {
            return;
        }

        $headOfficeBranchIds = DB::table('branches')
            ->where(function ($query) {
                $query->whereRaw('UPPER(branch_code) = ?', ['HO'])
                    ->orWhere('name', 'like', '%Head Office%');
            })
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->all();

        $managers = DB::table('managers')->select('id', 'employee_id')->get();

        foreach ($managers as $manager) {
            $employee = DB::table('employees')
                ->select('branch_id', 'department_id')
                ->where('id', $manager->employee_id)
                ->first();

            if (! $employee) {
                DB::table('managers')->where('id', $manager->id)->update([
                    'manager_type' => 'branch',
                    'status' => 'active',
                ]);

                continue;
            }

            $branchId = $employee->branch_id ? (int) $employee->branch_id : null;
            $departmentId = $employee->department_id ? (int) $employee->department_id : null;
            $isHeadOffice = $branchId && in_array($branchId, $headOfficeBranchIds, true);

            if ($isHeadOffice && $departmentId) {
                DB::table('managers')->where('id', $manager->id)->update([
                    'manager_type' => 'department',
                    'branch_id' => $branchId,
                    'department_id' => $departmentId,
                    'status' => 'active',
                ]);

                continue;
            }

            DB::table('managers')->where('id', $manager->id)->update([
                'manager_type' => 'branch',
                'branch_id' => $branchId,
                'department_id' => null,
                'status' => 'active',
            ]);
        }
    }
};
