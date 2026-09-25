<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Create Administrator role
        $adminRole = Role::firstOrCreate(['name' => 'Administrator']);
        
        // Optionally assign all permissions to Administrator
        $adminRole->syncPermissions(Permission::all());
    }
}
