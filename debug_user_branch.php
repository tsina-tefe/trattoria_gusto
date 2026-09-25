<?php

// This script helps debug which user is logged in and their branch
// Run it by accessing it in your browser: http://127.0.0.1:8000/debug_user_branch.php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Http\Kernel');
$request = \Illuminate\Http\Request::capture();
$response = $kernel->handle($request);

// Get the authenticated user
$user = auth()->user();

if (!$user) {
    echo "No user is currently logged in. Please log in first.\n";
    exit;
}

echo "=== Current User Information ===\n\n";
echo "User ID: {$user->id}\n";
echo "User Name: {$user->name}\n";
echo "User Email: {$user->email}\n";
echo "Employee ID: {$user->employee_id}\n\n";

if ($user->employee_id) {
    $employee = $user->employee;
    if ($employee) {
        echo "=== Employee Information ===\n";
        echo "Employee ID: {$employee->id}\n";
        echo "Employee Name: {$employee->first_name} {$employee->last_name}\n";
        echo "Branch ID: {$employee->branch_id}\n";
        
        if ($employee->branch) {
            echo "Branch Name: {$employee->branch->name}\n";
        } else {
            echo "Branch: NULL (no branch assigned)\n";
        }
    } else {
        echo "Employee record not found for employee_id: {$user->employee_id}\n";
    }
} else {
    echo "User has no employee_id assigned.\n";
}

echo "\n=== Paid Orders by Collection Branch ===\n\n";

$ordersByBranch = \App\Models\PreOrder::where('status', 'Paid')
    ->select('collection_branch_id', \DB::raw('COUNT(*) as count'))
    ->groupBy('collection_branch_id')
    ->with('collectionBranch')
    ->get();

foreach ($ordersByBranch as $row) {
    $branchName = $row->collectionBranch ? $row->collectionBranch->name : 'NULL';
    echo "Branch ID {$row->collection_branch_id} ({$branchName}): {$row->count} orders\n";
}

echo "\n=== Can User Access My Branch Orders? ===\n";
$userBranch = $user->employee?->branch_id;
if ($userBranch) {
    $matchingOrders = \App\Models\PreOrder::where('status', 'Paid')
        ->where('collection_branch_id', $userBranch)
        ->count();
    echo "User's branch ID: {$userBranch}\n";
    echo "Orders for user's branch: {$matchingOrders}\n";
} else {
    echo "User has no branch assigned (through employee).\n";
}
