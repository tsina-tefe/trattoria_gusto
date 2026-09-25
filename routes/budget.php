<?php

use App\Http\Controllers\SalesBudgetController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::middleware('permission:view sales budget|manage sales budget')->group(function () {
        Route::get('budget/sales-budget/export', [SalesBudgetController::class, 'export'])->name('sales-budget.export');
        Route::get('budget/sales-budget', [SalesBudgetController::class, 'index'])->name('sales-budget.index');
    });

    Route::middleware('permission:manage sales budget')->group(function () {
        Route::get('budget/sales-budget/create', [SalesBudgetController::class, 'create'])->name('sales-budget.create');
        Route::post('budget/sales-budget', [SalesBudgetController::class, 'store'])->name('sales-budget.store');
        Route::get('budget/sales-budget/check', [SalesBudgetController::class, 'check'])->name('sales-budget.check');
        Route::get('budget/sales-budget/period-data', [SalesBudgetController::class, 'getPeriodData'])->name('sales-budget.period-data');
        Route::get('budget/sales-budget/logs', [SalesBudgetController::class, 'logs'])->name('sales-budget.logs');
        Route::get('budget/sales-budget/prev-expense', [SalesBudgetController::class, 'getPrevExpense'])->name('sales-budget.prev-expense');
        Route::get('budget/sales-budget/{salesBudget}/edit', [SalesBudgetController::class, 'edit'])->name('sales-budget.edit');
        Route::put('budget/sales-budget/{salesBudget}', [SalesBudgetController::class, 'update'])->name('sales-budget.update');
        Route::delete('budget/sales-budget/{salesBudget}', [SalesBudgetController::class, 'destroy'])->name('sales-budget.destroy');
    });
});
