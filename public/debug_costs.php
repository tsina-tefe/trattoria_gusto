<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->handle(Illuminate\Http\Request::capture());

use App\Models\PreOrderCost;
use App\Models\Holiday;

$holiday = Holiday::where('name', 'Eid')->first();
if (!$holiday) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Holiday Eid not found']);
    exit;
}

$costs = PreOrderCost::with('category')
    ->where('holiday_id', $holiday->id)
    ->get()
    ->map(function($c) {
        return [
            'id' => $c->id,
            'category' => $c->category->name ?? 'Unknown',
            'amount' => (float)$c->amount,
            'is_variable' => $c->pre_order_product_id !== null,
            'notes' => $c->notes,
            'date' => $c->date->format('Y-m-d')
        ];
    });

header('Content-Type: application/json');
echo json_encode($costs, JSON_PRETTY_PRINT);
