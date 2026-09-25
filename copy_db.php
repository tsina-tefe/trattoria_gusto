<?php

// Boot Laravel
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

$newDb = 'trattoria_gusto_db';
$oldDb = 'company_system';

// Get all tables in new DB
$rawTables = DB::select('SHOW TABLES');
$tables = [];
foreach ($rawTables as $row) {
    $tables[] = array_values((array) $row)[0];
}

DB::statement('SET FOREIGN_KEY_CHECKS=0;');

foreach ($tables as $table) {
    if ($table == 'migrations')
        continue;

    echo "Copying data for table: {$table}...\n";
    try {
        // Truncate new table
        DB::table($table)->truncate();

        // Copy data
        DB::statement("INSERT INTO {$newDb}.{$table} SELECT * FROM {$oldDb}.{$table}");
        echo " - Success!\n";
    } catch (\Exception $e) {
        echo " - Failed: " . $e->getMessage() . "\n";
    }
}

DB::statement('SET FOREIGN_KEY_CHECKS=1;');
echo "Data migration complete.\n";
