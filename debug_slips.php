<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$withSlip = DB::table('pre_orders')->whereNotNull('payment_slip')->where('payment_slip', '!=', '')->count();
echo "Orders with payment_slip: " . $withSlip . "\n";

if ($withSlip > 0) {
    $samples = DB::table('pre_orders')->whereNotNull('payment_slip')->where('payment_slip', '!=', '')->take(5)->get();
    foreach ($samples as $s) {
        echo "ID: " . $s->id . " | Slip: " . $s->payment_slip . "\n";
    }
}
