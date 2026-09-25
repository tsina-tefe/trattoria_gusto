<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// List of migrations that might already be applied to the DB structure
$syncMigrations = [
    '2025_12_17_141538_create_order_types_table' => 'order_types',
    '2025_12_17_141538_create_pre_order_products_table' => 'pre_order_products',
    '2025_12_17_141539_create_collection_days_table' => 'collection_days',
    '2025_12_17_141540_create_pre_order_items_table' => 'pre_order_items',
    '2025_12_17_141540_create_pre_orders_table' => 'pre_orders',
];

// Special checks for migrations that modify columns (not create tables)
$columnChecks = [
    '2025_12_17_131453_add_unit_price_to_inventory_counts_table' => ['inventory_counts', 'unit_price'],
];

$batch = DB::table('migrations')->max('batch') + 1;
$synced = [];

foreach ($syncMigrations as $migration => $table) {
    if (Schema::hasTable($table)) {
        if (!DB::table('migrations')->where('migration', $migration)->exists()) {
            DB::table('migrations')->insert([
                'migration' => $migration,
                'batch' => $batch
            ]);
            $synced[] = $migration;
        }
    }
}

foreach ($columnChecks as $migration => $info) {
    list($table, $column) = $info;
    if (Schema::hasTable($table) && Schema::hasColumn($table, $column)) {
        if (!DB::table('migrations')->where('migration', $migration)->exists()) {
            DB::table('migrations')->insert([
                'migration' => $migration,
                'batch' => $batch
            ]);
            $synced[] = $migration;
        }
    }
}

if (empty($synced)) {
    echo "No migrations needed synchronization." . PHP_EOL;
} else {
    echo "Successfully synchronized " . count($synced) . " migrations:" . PHP_EOL;
    foreach ($synced as $m) {
        echo "- $m" . PHP_EOL;
    }
}
