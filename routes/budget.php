<?php

use App\Http\Controllers\BankBalanceController;
use App\Http\Controllers\BankBranchController;
use App\Http\Controllers\BankController;
use App\Http\Controllers\ExpenseBudgetController;
use App\Http\Controllers\ExpenseBudgetPeriodController;
use App\Http\Controllers\SalesBudgetController;
use App\Http\Controllers\WeeklyBudgetController;
use App\Http\Controllers\WeeklyBudgetPeriodController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    $expenseBudgetViewPermissions = implode('|', [
        config('expense_budget.permissions.view_own_department'),
        config('expense_budget.permissions.view_own_branch'),
        config('expense_budget.permissions.view_all_except_ho'),
    ]);

    Route::middleware("permission:{$expenseBudgetViewPermissions}")->group(function () {
        Route::get('budget/expense-budget/export', [ExpenseBudgetController::class, 'export'])->name('expense-budget.export');
        Route::get('budget/expense-budget', [ExpenseBudgetController::class, 'index'])->name('expense-budget.index');
        Route::get('budget/expense-budget/submission-tracker', [ExpenseBudgetController::class, 'submissionTracker'])->name('expense-budget.submission-tracker');
        Route::get('budget/expense-budget/items/{expenseBudget}/activity-logs', [ExpenseBudgetController::class, 'itemActivityLogs'])->name('expense-budget.items.activity-logs');
        Route::get('budget/expense-budget/create', [ExpenseBudgetController::class, 'create'])->name('expense-budget.create');
        Route::post('budget/expense-budget', [ExpenseBudgetController::class, 'store'])->name('expense-budget.store');
        Route::get('budget/expense-budget/prev-budget', [ExpenseBudgetController::class, 'getPrevBudget'])->name('expense-budget.prev-budget');
        Route::get('budget/expense-budget/budgeted-items', [ExpenseBudgetController::class, 'getBudgetedExpenseItems'])->name('expense-budget.budgeted-items');
    });

    Route::middleware('expense_budget.manage_window')->group(function () {
        Route::patch('budget/expense-budget/items/{expenseBudget}', [ExpenseBudgetController::class, 'updateItem'])->name('expense-budget.items.update');
        Route::delete('budget/expense-budget/items/{expenseBudget}', [ExpenseBudgetController::class, 'destroyItem'])->name('expense-budget.items.destroy');
    });

    // The company system leaves these open to any authenticated user. Opening
    // and closing a budget period is an administrative action, so it is gated
    // on the same permissions that allow editing budgets.
    $expenseBudgetManagePermissions = implode('|', [
        config('expense_budget.permissions.manage_anytime'),
        config('expense_budget.permissions.manage_windowed'),
    ]);

    Route::middleware("permission:{$expenseBudgetManagePermissions}")->group(function () {
        Route::resource('expense-budget-periods', ExpenseBudgetPeriodController::class)->except(['show']);
    });

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

    Route::middleware('permission:manage banks|view bank balance|manage bank branches|manage bank balance')->group(function () {
        Route::apiResource('budget/banks', BankController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->names('banks');

        Route::apiResource('budget/bank-branches', BankBranchController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->names('bank-branches');

        Route::apiResource('budget/bank-balances', BankBalanceController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->names('bank-balances');
    });

    Route::middleware('permission:manage bank balance|view bank balance|view ceo budgets')->group(function () {
        Route::get('budget/bank-balances/{bank_balance}', [BankBalanceController::class, 'show'])
            ->name('bank-balances.show');
    });

    // Weekly Budget. A request is reviewed in three places, so the routes are
    // grouped by reviewer rather than by verb.
    Route::middleware('permission:view finance budgets')->group(function () {
        Route::get('budget/weekly-budget/finance/export', [WeeklyBudgetController::class, 'exportFinance'])->name('weekly-budget.finance.export');
        Route::get('budget/weekly-budget/finance', [WeeklyBudgetController::class, 'financeView'])->name('weekly-budget.finance');
        Route::post('budget/weekly-budget/finance/send-to-ceo', [WeeklyBudgetController::class, 'sendToCeo'])->name('weekly-budget.finance.send-to-ceo');
    });

    Route::middleware('permission:manage finance budgets')->group(function () {
        Route::patch('budget/weekly-budget/{weeklyBudget}/finance-status', [WeeklyBudgetController::class, 'updateFinance'])->name('weekly-budget.update-finance');
        Route::patch('budget/weekly-budget/finance/bulk', [WeeklyBudgetController::class, 'bulkUpdateFinance'])->name('weekly-budget.bulk-update-finance');
        Route::post('budget/weekly-budget/finance/override-paid', [WeeklyBudgetController::class, 'overridePaid'])->name('weekly-budget.override-paid');
    });

    Route::middleware('permission:view department budgets')->group(function () {
        Route::get('budget/weekly-budget/department/export', [WeeklyBudgetController::class, 'exportDepartment'])->name('weekly-budget.department.export');
        Route::get('budget/weekly-budget/department', [WeeklyBudgetController::class, 'departmentView'])->name('weekly-budget.department');
        Route::patch('budget/weekly-budget/{weeklyBudget}/department-status', [WeeklyBudgetController::class, 'updateDepartment'])->name('weekly-budget.update-department');
        Route::delete('budget/weekly-budget/{weeklyBudget}/department-delete', [WeeklyBudgetController::class, 'departmentDelete'])->name('weekly-budget.department-delete');
    });

    Route::middleware('permission:manage department budgets')->group(function () {
        Route::patch('budget/weekly-budget/department/bulk', [WeeklyBudgetController::class, 'bulkUpdateDepartment'])->name('weekly-budget.bulk-update-department');
    });

    Route::middleware('permission:view ceo budgets')->group(function () {
        Route::get('budget/weekly-budget/ceo/export', [WeeklyBudgetController::class, 'exportCeo'])->name('weekly-budget.ceo.export');
        Route::get('budget/weekly-budget/ceo', [WeeklyBudgetController::class, 'ceoView'])->name('weekly-budget.ceo');
    });

    Route::middleware('permission:manage ceo budgets')->group(function () {
        Route::patch('budget/weekly-budget/{weeklyBudget}/ceo-status', [WeeklyBudgetController::class, 'updateCeo'])->name('weekly-budget.update-ceo');
        Route::patch('budget/weekly-budget/ceo/bulk', [WeeklyBudgetController::class, 'bulkUpdateCeo'])->name('weekly-budget.bulk-update-ceo');
    });

    Route::middleware('permission:view weekly budgets')->group(function () {
        Route::get('budget/weekly-budget/export', [WeeklyBudgetController::class, 'exportIndex'])->name('weekly-budget.index.export');
        Route::get('budget/weekly-budget', [WeeklyBudgetController::class, 'index'])->name('weekly-budget.index');
        Route::get('budget/weekly-budget/{weeklyBudget}/activity-logs', [WeeklyBudgetController::class, 'activityLogs'])->name('weekly-budget.activity-logs');
    });

    Route::middleware('permission:view weekly budget summary')->group(function () {
        Route::get('budget/weekly-budget/analytics', [WeeklyBudgetController::class, 'analytics'])->name('weekly-budget.analytics');
    });

    Route::middleware('permission:manage weekly budgets')->group(function () {
        Route::get('budget/weekly-budget/create', [WeeklyBudgetController::class, 'create'])->name('weekly-budget.create');
        Route::post('budget/weekly-budget', [WeeklyBudgetController::class, 'store'])->name('weekly-budget.store');
        Route::put('budget/weekly-budget/{weeklyBudget}', [WeeklyBudgetController::class, 'update'])->name('weekly-budget.update');
        Route::delete('budget/weekly-budget/{weeklyBudget}', [WeeklyBudgetController::class, 'destroy'])->name('weekly-budget.destroy');
    });

    Route::middleware('permission:manage weekly budget periods')->group(function () {
        Route::get('weekly-budget-periods', [WeeklyBudgetPeriodController::class, 'index'])->name('weekly-budget-periods.index');
        Route::post('weekly-budget-periods', [WeeklyBudgetPeriodController::class, 'store'])->name('weekly-budget-periods.store');
    });
});
