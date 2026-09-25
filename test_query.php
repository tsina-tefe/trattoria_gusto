<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== Testing FIXED Dashboard Query ===\n";

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

echo "Fixed Query Results (" . count($fixedQuery) . " records):\n";
foreach ($fixedQuery as $branch) {
    echo "Branch Name: '{$branch->branch_name}' | Orders: {$branch->total_orders} | Qty: {$branch->total_quantity} | Amount: {$branch->total_amount}\n";
}

echo "\nDone.\n";
