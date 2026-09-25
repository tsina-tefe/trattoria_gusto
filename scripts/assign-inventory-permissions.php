<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require __DIR__ . '/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

echo "Available roles:\n";
$roles = Role::all();
foreach ($roles as $role) {
	echo "- {$role->name}\n";
}

$roleName = $argv[1] ?? null;

if (!$roleName) {
	echo "\nUsage: php scripts/assign-inventory-permissions.php <RoleName>\n";
	exit(1);
}

try {
	$role = Role::findByName($roleName);
} catch (Exception $e) {
	fwrite(STDERR, "Role {$roleName} not found\n");
	exit(1);
}

$permissions = [
	'view inventory periods',
	'create inventory periods',
	'update inventory periods',
	'delete inventory periods',
	'view inventory counts',
	'create inventory counts',
	'update inventory counts',
	'delete inventory counts',
];

echo "\nAssigning permissions to role: {$roleName}\n";
foreach ($permissions as $perm) {
	$permission = Permission::firstOrCreate(['name' => $perm]);
	echo "- {$perm}\n";
}

$role->givePermissionTo($permissions);

echo "\n✓ Successfully assigned all inventory permissions to {$roleName}\n";
