<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require __DIR__ . '/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Spatie\Permission\Models\Role;

$roleName = $argv[1] ?? (getenv('ROLE') ?: 'Admin');

try {
	$role = Role::findByName($roleName);
} catch (Exception $e) {
	fwrite(STDERR, "Role {$roleName} not found\n");
	exit(1);
}

$permissions = [
	'view child categories',
	'create child categories',
	'update child categories',
	'delete child categories',
	'view products',
	'create products',
	'update products',
	'delete products',
	'view inventory periods',
	'create inventory periods',
	'update inventory periods',
	'delete inventory periods',
	'view inventory counts',
	'create inventory counts',
	'update inventory counts',
	'delete inventory counts',
];

$role->givePermissionTo($permissions);

echo "Assigned permissions to role: {$roleName}\n";


