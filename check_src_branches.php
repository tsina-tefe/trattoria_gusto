<?php
require 'public/torta-sync/config.php';
try {
    $db = getDB(SRC_DB_HOST, SRC_DB_NAME, SRC_DB_USER, SRC_DB_PASS);
    $stmt = $db->query("DESCRIBE branches");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo $row['Field'] . PHP_EOL;
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
