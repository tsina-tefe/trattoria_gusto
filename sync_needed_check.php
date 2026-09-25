<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

$pendingFiles = [
    '2025_12_17_131453_add_unit_price_to_inventory_counts_table' => ['inventory_counts', 'unit_price'],
    '2025_12_17_141538_create_order_types_table' => ['order_types'],
    '2025_12_17_141538_create_pre_order_products_table' => ['pre_order_products'],
    '2025_12_17_141539_create_collection_days_table' => ['collection_days'],
    '2025_12_17_141540_create_pre_order_items_table' => ['pre_order_items'],
    '2025_12_17_141540_create_pre_orders_table' => ['pre_orders'],
    '2025_12_18_143022_add_voucher_code_and_registering_branch_to_pre_orders_table' => ['pre_orders', 'voucher_code'],
    '2025_12_22_121910_add_transaction_reference_to_pre_orders_table' => ['pre_orders', 'transaction_reference'],
    '2025_12_22_141158_create_sms_settings_table' => ['sms_settings'],
    '2025_12_22_144526_add_collection_tracking_to_pre_orders_table' => ['pre_orders', 'collected_at'],
];

foreach ($pendingFiles as $migration => $info) {
    if (DB::table('migrations')->where('migration', $migration)->exists())
        continue;

    $table = $info[0] ?? null;
    $column = $info[1] ?? null;
    $exists = false;
    if ($table && Schema::hasTable($table)) {
        if ($column) {
            $exists = Schema::hasColumn($table, $column);
        } else {
            $exists = true;
        }
    }

    if ($exists) {
        echo "SYNC_NEEDED:$migration\n";
    }
}
