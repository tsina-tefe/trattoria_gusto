<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Checking Pre-Orders and Branches ===\n\n";

// Get all paid orders
$orders = \App\Models\PreOrder::where('status', 'Paid')->get();
echo "Total Paid Orders: " . $orders->count() . "\n\n";

if ($orders->count() > 0) {
    echo "Paid Orders:\n";
    foreach ($orders as $order) {
        echo "- Order #{$order->order_number} | Collection Branch ID: {$order->collection_branch_id} | Status: {$order->status}\n";
    }
    echo "\n";
}

// Get all branches
$branches = \App\Models\Branch::all();
echo "Total Branches: " . $branches->count() . "\n\n";

if ($branches->count() > 0) {
    echo "Branches:\n";
    foreach ($branches as $branch) {
        echo "- ID: {$branch->id} | Name: {$branch->name}\n";
    }
    echo "\n";
}

// Get all users with employee relationships
$users = \App\Models\User::whereNotNull('employee_id')->with('employee.branch')->get();
echo "Users with Employee/Branch: " . $users->count() . "\n\n";

if ($users->count() > 0) {
    echo "Users and their branches (through employee):\n";
    foreach ($users as $user) {
        $branchId = $user->employee?->branch_id;
        $branchName = $user->employee?->branch?->name;
        echo "- {$user->name} (ID: {$user->id}) | Employee ID: {$user->employee_id} | Branch: " . ($branchName ?? 'NULL') . " (ID: {$branchId})\n";
    }
}
