<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

$columns = Schema::getColumnListing('pre_orders');
echo "Columns: " . implode(', ', $columns) . "\n\n";

$sample = DB::table('pre_orders')->whereNotNull('transaction_reference')->where('transaction_reference', '!=', '')->take(5)->get();
foreach ($sample as $row) {
    echo "ID: " . $row->id . " | Ref: " . $row->transaction_reference . "\n";
}
