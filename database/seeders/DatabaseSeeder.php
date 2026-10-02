<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Position;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            PermissionSeeder::class,
            RoleSeeder::class,
            EvaluationCategorySeeder::class,
        ]);

        $branch = Branch::firstOrCreate(
            ['branch_code' => 'HQ-001'],
            [
                'name' => 'Head Office',
                'status' => 'active',
                'is_sales_generating' => false,
            ]
        );

        $department = Department::firstOrCreate(
            ['name' => 'Administration'],
            [
                'is_active' => true,
                'is_active_on_weekly_budget' => false,
            ]
        );

        $position = Position::firstOrCreate(
            ['title' => 'System Administrator'],
            ['level' => 'Team']
        );

        $employee = Employee::firstOrCreate(
            ['employee_code' => 'EMP-0001'],
            [
                'first_name' => 'Admin',
                'last_name' => 'User',
                'email' => 'admin@example.com',
                'gender' => 'male',
                'hire_date' => now()->toDateString(),
                'branch_id' => $branch->id,
                'department_id' => $department->id,
                'position_id' => $position->id,
                'status' => 'active',
            ]
        );

        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'employee_id' => $employee->id,
                'password' => bcrypt('password'),
            ]
        );

        $admin->assignRole('Administrator');
    }
}
