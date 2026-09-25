<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== Checking Pre-Orders ===\n";

// Check all pre-orders
$orders = DB::table('pre_orders')
    ->select('id', 'collection_branch_id', 'total_amount', 'status', 'created_at')
    ->orderBy('id')
    ->get();

echo "Total Pre-Orders: " . count($orders) . "\n\n";

foreach ($orders as $order) {
    echo "ID: {$order->id} | Branch: " . ($order->collection_branch_id ?? 'NULL') . " | Amount: {$order->total_amount} | Status: {$order->status}\n";
}

echo "\n=== Checking Branches ===\n";

// Check all branches
$branches = DB::table('branches')
    ->select('id', 'name')
    ->orderBy('name')
    ->get();

echo "Total Branches: " . count($branches) . "\n\n";

foreach ($branches as $branch) {
    echo "ID: {$branch->id} | Name: {$branch->name}\n";
}

echo "\n=== Checking Orders by Branch ===\n";

// Check orders grouped by branch
$ordersByBranch = DB::table('pre_orders')
    ->select('collection_branch_id', DB::raw('COUNT(*) as order_count'), DB::raw('SUM(total_amount) as total_amount'))
    ->groupBy('collection_branch_id')
    ->get();

foreach ($ordersByBranch as $branch) {
    echo "Branch ID: " . ($branch->collection_branch_id ?? 'NULL') . " | Orders: {$branch->order_count} | Amount: {$branch->total_amount}\n";
}

echo "\n=== Checking Pre-Order Items ===\n";

// Check pre_order_items table
$items = DB::table('pre_order_items')
    ->select('pre_order_id', 'pre_order_product_id', 'quantity', 'subtotal')
    ->limit(10)  // Just first 10 to see structure
    ->get();

echo "Total Items in first 10: " . count($items) . "\n\n";

foreach ($items as $item) {
    echo "Pre-Order ID: {$item->pre_order_id} | Product ID: {$item->pre_order_product_id} | Qty: {$item->quantity} | Subtotal: {$item->subtotal}\n";
}

echo "\n=== Checking Items for Each Order ===\n";

// Check items for order ID 5 (Lancha)
$order5Items = DB::table('pre_order_items')
    ->select('pre_order_id', 'pre_order_product_id', 'quantity', 'subtotal')
    ->where('pre_order_id', 5)
    ->get();

echo "Order ID 5 (Lancha) items: " . count($order5Items) . "\n";
foreach ($order5Items as $item) {
    echo "  Qty: {$item->quantity} | Subtotal: {$item->subtotal}\n";
}

// Check items for order ID 6 (Semen Hotel)  
$order6Items = DB::table('pre_order_items')
    ->select('pre_order_id', 'pre_order_product_id', 'quantity', 'subtotal')
    ->where('pre_order_id', 6)
    ->get();

echo "Order ID 6 (Semen Hotel) items: " . count($order6Items) . "\n";
foreach ($order6Items as $item) {
    echo "  Qty: {$item->quantity} | Subtotal: {$item->subtotal}\n";
}

echo "\n=== Checking Dashboard Query Result ===\n";

// Simulate the dashboard query
$dashboardQuery = DB::table('pre_orders')
    ->selectRaw("
        collection_branch_id,
        SUM(pre_order_items.quantity) as total_quantity,
        SUM(pre_order_items.subtotal) as total_amount,
        COUNT(DISTINCT pre_orders.id) as total_orders
    ")
    ->join('pre_order_items', 'pre_orders.id', '=', 'pre_order_items.pre_order_id')
    ->whereNotNull('collection_branch_id')
    ->groupBy('collection_branch_id')
    ->orderByDesc('total_amount')
    ->get();

echo "Dashboard Query Results:\n";
foreach ($dashboardQuery as $branch) {
    echo "Branch ID: {$branch->collection_branch_id} | Orders: {$branch->total_orders} | Qty: {$branch->total_quantity} | Amount: {$branch->total_amount}\n";
}

echo "\n=== Testing Dashboard Query with Relationship ===\n";

// Test the exact query as the dashboard runs it
$dashboardData = DB::table('pre_orders')
    ->with(['collectionBranch:id,name'])
    ->selectRaw("
        collection_branch_id,
        SUM(pre_order_items.quantity) as total_quantity,
        SUM(pre_order_items.subtotal) as total_amount,
        COUNT(DISTINCT pre_orders.id) as total_orders
    ")
    ->join('pre_order_items', 'pre_orders.id', '=', 'pre_order_items.pre_order_id')
    ->whereNotNull('collection_branch_id')
    ->groupBy('collection_branch_id')
    ->orderByDesc('total_amount')
    ->get();

echo "Dashboard Query with Relationship:\n";
foreach ($dashboardData as $branch) {
    $branchName = $branch->collectionBranch ? $branch->collectionBranch->name : 'Missing';
    echo "Branch Name: {$branchName} | Orders: {$branch->total_orders} | Qty: {$branch->total_quantity} | Amount: {$branch->total_amount}\n";
    echo "  collectionBranch object: " . ($branch->collectionBranch ? 'YES' : 'NO') . "\n";
    if ($branch->collectionBranch) {
        echo "  Branch ID: {$branch->collectionBranch->id} | Branch Name: '{$branch->collectionBranch->name}'\n";
    }
}

echo "\n=== Testing FIXED Dashboard Query ===\n";

// Test the fixed query with JOIN
$fixedQuery = DB::table('pre_orders')
    ->selectRaw("
        pre_orders.collection_branch_id,
        branches.name as branch_name,
        SUM(pre_order_items.quantity) as total_quantity,
        SUM(pre_order_items.subtotal) as total_amount,
        COUNT(DISTINCT pre_orders.id) as total_orders
    ")
    ->join('pre_order_items', 'pre_orders.id', '=', 'pre_order_items.pre_order_id')
    ->join('branches', 'pre_orders.collection_branch_id', '=', 'branches.id')
    ->whereNotNull('pre_orders.collection_branch_id')
    ->groupBy('pre_orders.collection_branch_id', 'branches.name')
    ->orderByDesc('total_amount')
    ->get();

echo "Fixed Query Results:\n";
foreach ($fixedQuery as $branch) {
    echo "Branch Name: '{$branch->branch_name}' | Orders: {$branch->total_orders} | Qty: {$branch->total_quantity} | Amount: {$branch->total_amount}\n";
}

echo "\nDone.\n";
