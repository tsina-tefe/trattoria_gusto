<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PreOrderCostPermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Create Permission
        $permission = Permission::updateOrCreate(
            ['name' => 'manage pre-order costs', 'guard_name' => 'web']
        );

        // Assign to Admin role if it exists
        $adminRole = Role::where('name', 'Admin')->first();
        if ($adminRole) {
            $adminRole->givePermissionTo($permission);
        }

        // Create Cost Manager role
        $costManagerRole = Role::updateOrCreate(
            ['name' => 'Cost Manager', 'guard_name' => 'web']
        );
        $costManagerRole->givePermissionTo($permission);
    }
}
