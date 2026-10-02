<?php

namespace App\Http\Controllers;

use App\Models\ExpenseItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExpenseItemController extends Controller
{
    public function index(Request $request)
    {
        $expenseItems = ExpenseItem::query()
            ->when($request->search, function ($query, $search) {
                $query->where('expense_type', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%");
            })
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('expense-items/index', [
            'expenseItems' => $expenseItems,
            'request' => $request->only('search'),
        ]);
    }

    public function create()
    {
        return Inertia::render('expense-items/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'expense_parent_acc_code' => 'required|integer',
            'code' => 'required|integer',
            'expense_type' => 'required|string|max:100',
            'frequent_expense' => 'boolean',
            'is_expense' => 'boolean',
        ]);

        ExpenseItem::create($validated);

        return redirect()->route('expense-items.index')
            ->with('message', 'Expense Item created successfully!');
    }

    public function edit(ExpenseItem $expenseItem)
    {
        return Inertia::render('expense-items/edit', [
            'expenseItem' => $expenseItem,
        ]);
    }

    public function update(Request $request, ExpenseItem $expenseItem)
    {
        $validated = $request->validate([
            'expense_parent_acc_code' => 'required|integer',
            'code' => 'required|integer',
            'expense_type' => 'required|string|max:100',
            'frequent_expense' => 'boolean',
            'is_expense' => 'boolean',
        ]);

        $expenseItem->update($validated);

        return redirect()->route('expense-items.index')
            ->with('message', 'Expense Item updated successfully!');
    }

    public function destroy(ExpenseItem $expenseItem)
    {
        $expenseItem->delete();

        return redirect()->route('expense-items.index')
            ->with('message', 'Expense Item deleted successfully!');
    }
}
