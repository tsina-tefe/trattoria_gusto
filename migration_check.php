<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

$files = glob('database/migrations/*.php');
$pending = [];
foreach ($files as $file) {
    $name = basename($file, '.php');
    if (!DB::table('migrations')->where('migration', $name)->exists()) {
        $pending[] = $name;
    }
}

echo implode("\n", $pending);
