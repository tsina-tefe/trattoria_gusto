<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

$tables = ['order_types', 'pre_orders', 'pre_order_products', 'collection_days', 'pre_order_items'];
foreach ($tables as $table) {
    if (Schema::hasTable($table)) {
        echo "$table: " . DB::table($table)->count() . PHP_EOL;
    } else {
        echo "$table: Does not exist" . PHP_EOL;
    }
}
