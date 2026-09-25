<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

function getStatus($migration, $table = null, $column = null)
{
    try {
        $applied = DB::table('migrations')->where('migration', $migration)->exists();
        $structure = false;
        if ($table && Schema::hasTable($table)) {
            if ($column) {
                $structure = Schema::hasColumn($table, $column);
            } else {
                $structure = true;
            }
        }
    } catch (\Exception $e) {
        return ['applied' => 'ERROR', 'structure' => 'ERROR', 'error' => $e->getMessage()];
    }

    return [
        'applied' => $applied ? 'YES' : 'NO',
        'structure' => $structure ? 'YES' : 'NO'
    ];
}

$pendingFiles = [
    '2025_12_17_131453_add_unit_price_to_inventory_counts_table' => ['inventory_counts', 'unit_price'],
    '2025_12_17_141538_create_order_types_table' => ['order_types'],
    '2025_12_17_141538_create_pre_order_products_table' => ['pre_order_products'],
    '2025_12_17_141539_create_collection_days_table' => ['collection_days'],
    '2025_12_17_141540_create_pre_order_items_table' => ['pre_order_items'],
    '2025_12_17_141540_create_pre_orders_table' => ['pre_orders'],
    '2025_12_17_145408_remove_notes_from_pre_orders_table' => ['pre_orders'], // Schema::hasColumn would return true for notes if migration NOT applied
    '2025_12_18_143022_add_voucher_code_and_registering_branch_to_pre_orders_table' => ['pre_orders', 'voucher_code'],
    '2025_12_18_170000_update_phone_number_column_for_ethiopian_format' => null,
    '2025_12_18_170500_update_pre_orders_phone_column_length' => null,
    '2025_12_22_121910_add_transaction_reference_to_pre_orders_table' => ['pre_orders', 'transaction_reference'],
    '2025_12_22_141158_create_sms_settings_table' => ['sms_settings'],
    '2025_12_22_144526_add_collection_tracking_to_pre_orders_table' => ['pre_orders', 'collected_at'],
];

$results = [];
foreach ($pendingFiles as $migration => $info) {
    $table = $info[0] ?? null;
    $column = $info[1] ?? null;
    $results[$migration] = getStatus($migration, $table, $column);
}

echo json_encode($results, JSON_PRETTY_PRINT);
