<?php
require 'public/torta-sync/config.php';
try {
    $s=getDB(SRC_DB_HOST, SRC_DB_NAME, SRC_DB_USER, SRC_DB_PASS);
    $d=getDB(DEST_DB_HOST, DEST_DB_NAME, DEST_DB_USER, DEST_DB_PASS);
    echo "Source branches:\n";
    foreach($s->query("SELECT name, branch_code FROM branches")->fetchAll() as $r) echo "{$r['name']}: {$r['branch_code']}\n";
    echo "\nDest branches:\n";
    foreach($d->query("SELECT name, branch_code FROM branches")->fetchAll() as $r) echo "{$r['name']}: {$r['branch_code']}\n";
} catch (Exception $e) { echo $e->getMessage(); }
