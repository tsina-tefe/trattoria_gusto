<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Chart of accounts the Expense Budget module budgets against.
 *
 * Carried over from the company system so the module is usable immediately.
 * `expense_parent_acc_code` is the finance account code and doubles as the
 * primary key, so rows are upserted rather than inserted.
 */
class ExpenseItemSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            ['expense_parent_acc_code' => 6889, 'code' => 5101, 'expense_type' => 'Pastry', 'frequent_expense' => false, 'is_expense' => false],
            ['expense_parent_acc_code' => 6890, 'code' => 5102, 'expense_type' => 'Food', 'frequent_expense' => false, 'is_expense' => false],
            ['expense_parent_acc_code' => 6891, 'code' => 5104, 'expense_type' => 'Juice', 'frequent_expense' => false, 'is_expense' => false],
            ['expense_parent_acc_code' => 6892, 'code' => 5105, 'expense_type' => 'Hot Beverage', 'frequent_expense' => false, 'is_expense' => false],
            ['expense_parent_acc_code' => 6893, 'code' => 5105, 'expense_type' => 'Coffee rosted', 'frequent_expense' => false, 'is_expense' => false],
            ['expense_parent_acc_code' => 6894, 'code' => 5106, 'expense_type' => 'Bottle Beverage', 'frequent_expense' => false, 'is_expense' => false],
            ['expense_parent_acc_code' => 6895, 'code' => 5106, 'expense_type' => 'Beer', 'frequent_expense' => false, 'is_expense' => false],
            ['expense_parent_acc_code' => 6896, 'code' => 5106, 'expense_type' => 'Alchol', 'frequent_expense' => false, 'is_expense' => false],
            ['expense_parent_acc_code' => 6897, 'code' => 5106, 'expense_type' => 'Wine', 'frequent_expense' => false, 'is_expense' => false],
            ['expense_parent_acc_code' => 6898, 'code' => 5107, 'expense_type' => 'Cup', 'frequent_expense' => false, 'is_expense' => false],
            ['expense_parent_acc_code' => 6899, 'code' => 5108, 'expense_type' => 'yogurt', 'frequent_expense' => false, 'is_expense' => false],
            ['expense_parent_acc_code' => 6900, 'code' => 5108, 'expense_type' => 'Pouch Milk', 'frequent_expense' => false, 'is_expense' => false],
            ['expense_parent_acc_code' => 6901, 'code' => 5109, 'expense_type' => 'Supplies', 'frequent_expense' => false, 'is_expense' => false],
            ['expense_parent_acc_code' => 6902, 'code' => 5110, 'expense_type' => 'Packing Material', 'frequent_expense' => false, 'is_expense' => false],
            ['expense_parent_acc_code' => 6903, 'code' => 5111, 'expense_type' => 'Cleaning material', 'frequent_expense' => false, 'is_expense' => false],
            ['expense_parent_acc_code' => 6904, 'code' => 5112, 'expense_type' => 'Stationary Material', 'frequent_expense' => false, 'is_expense' => false],
            ['expense_parent_acc_code' => 6905, 'code' => 5113, 'expense_type' => 'Uniform', 'frequent_expense' => false, 'is_expense' => false],
            ['expense_parent_acc_code' => 6906, 'code' => 5114, 'expense_type' => 'Staff', 'frequent_expense' => false, 'is_expense' => false],
            ['expense_parent_acc_code' => 6907, 'code' => 5115, 'expense_type' => 'Production', 'frequent_expense' => false, 'is_expense' => false],
            ['expense_parent_acc_code' => 6908, 'code' => 5116, 'expense_type' => 'Spare Part & Others Material', 'frequent_expense' => false, 'is_expense' => false],
            ['expense_parent_acc_code' => 6909, 'code' => 5117, 'expense_type' => 'Sales Discount', 'frequent_expense' => false, 'is_expense' => false],
            ['expense_parent_acc_code' => 6910, 'code' => 5118, 'expense_type' => 'Sales Commision', 'frequent_expense' => false, 'is_expense' => false],
            ['expense_parent_acc_code' => 6911, 'code' => 8101, 'expense_type' => 'Rent Expense', 'frequent_expense' => true, 'is_expense' => true],
            ['expense_parent_acc_code' => 6912, 'code' => 8102, 'expense_type' => 'Staff Salary', 'frequent_expense' => true, 'is_expense' => true],
            ['expense_parent_acc_code' => 6913, 'code' => 8103, 'expense_type' => 'Transportation Allowance', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 6914, 'code' => 8104, 'expense_type' => 'Over Time expense', 'frequent_expense' => true, 'is_expense' => true],
            ['expense_parent_acc_code' => 6915, 'code' => 8105, 'expense_type' => 'Position Allowance', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 6916, 'code' => 8106, 'expense_type' => 'Bank Service Charge', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 6917, 'code' => 8107, 'expense_type' => 'Repair & Maintenance', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 6918, 'code' => 8108, 'expense_type' => 'Fuel and Lubricance', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 6919, 'code' => 8109, 'expense_type' => 'Advertising & Promot.Expense', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 6920, 'code' => 8110, 'expense_type' => 'Telephone & Postage', 'frequent_expense' => true, 'is_expense' => true],
            ['expense_parent_acc_code' => 6921, 'code' => 8111, 'expense_type' => 'Interest Expense', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 6922, 'code' => 8112, 'expense_type' => 'Electric & Water Material', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 6923, 'code' => 8113, 'expense_type' => 'Computer Accessory', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 6924, 'code' => 8114, 'expense_type' => 'Printing & Stationary Expense', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 6925, 'code' => 8115, 'expense_type' => 'Parking Expense', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 6926, 'code' => 8116, 'expense_type' => 'Tuition Fee', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 6927, 'code' => 8117, 'expense_type' => 'Labour Charge', 'frequent_expense' => true, 'is_expense' => true],
            ['expense_parent_acc_code' => 6928, 'code' => 8118, 'expense_type' => 'Generator Fuel', 'frequent_expense' => true, 'is_expense' => true],
            ['expense_parent_acc_code' => 6929, 'code' => 8119, 'expense_type' => 'Medical Expense', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 6930, 'code' => 8120, 'expense_type' => 'Lagal Adviser and P.Fee', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 6931, 'code' => 8121, 'expense_type' => 'Indeminity Expense', 'frequent_expense' => true, 'is_expense' => true],
            ['expense_parent_acc_code' => 6933, 'code' => 8122, 'expense_type' => 'Transportation Expense', 'frequent_expense' => true, 'is_expense' => true],
            ['expense_parent_acc_code' => 6934, 'code' => 8123, 'expense_type' => 'Entertainment Expense', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 6935, 'code' => 8124, 'expense_type' => 'Severance Expense', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 6936, 'code' => 8125, 'expense_type' => 'Repair & Maintenance Building', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 6937, 'code' => 8126, 'expense_type' => 'Cleaning & Sanitation', 'frequent_expense' => true, 'is_expense' => true],
            ['expense_parent_acc_code' => 6938, 'code' => 8127, 'expense_type' => 'Docmentaion License & Registration Fee', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 6939, 'code' => 8128, 'expense_type' => 'Insurance Expense', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 6940, 'code' => 8129, 'expense_type' => 'Compensation Payment', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 6941, 'code' => 8130, 'expense_type' => 'Annual Leave Payment', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 6942, 'code' => 8131, 'expense_type' => 'Bonus Expense', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 6943, 'code' => 8132, 'expense_type' => 'Furniture & Fixture Expense', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 6944, 'code' => 8133, 'expense_type' => 'Kichien Equipment', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 6945, 'code' => 8134, 'expense_type' => 'Utitlity expense', 'frequent_expense' => true, 'is_expense' => true],
            ['expense_parent_acc_code' => 6946, 'code' => 8135, 'expense_type' => 'Supplies Expense', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 6947, 'code' => 8136, 'expense_type' => 'Travling Expense', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 6948, 'code' => 8137, 'expense_type' => 'Donation Expense', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 6949, 'code' => 8138, 'expense_type' => 'Uniform Expense', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 6950, 'code' => 8139, 'expense_type' => 'Miscellaneous Expense', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 6951, 'code' => 8140, 'expense_type' => 'Spare Part', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 6952, 'code' => 8141, 'expense_type' => 'Depreciation expense', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 6953, 'code' => 8142, 'expense_type' => 'Amortization Expense', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 6954, 'code' => 8201, 'expense_type' => 'Pension con.Expense 11%', 'frequent_expense' => true, 'is_expense' => true],
            ['expense_parent_acc_code' => 6955, 'code' => 8202, 'expense_type' => 'Saving Contribution', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 6956, 'code' => 8203, 'expense_type' => 'Per Diem expense', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 6957, 'code' => 8204, 'expense_type' => 'Tax Penality & Interest', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 6958, 'code' => 8205, 'expense_type' => 'Service Charge Expense', 'frequent_expense' => true, 'is_expense' => true],
            ['expense_parent_acc_code' => 6959, 'code' => 8206, 'expense_type' => 'Coffee Commision Expense', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 10153, 'code' => 8207, 'expense_type' => 'Disposal Expense', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 10154, 'code' => 8208, 'expense_type' => 'Professional Fee', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 10155, 'code' => 8209, 'expense_type' => 'Consultancy Fee', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 10156, 'code' => 8210, 'expense_type' => 'Research & Development', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 10157, 'code' => 8211, 'expense_type' => 'Tender Fee', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 10507, 'code' => 8212, 'expense_type' => 'Other Allowance Expense', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 10512, 'code' => 8213, 'expense_type' => 'Waiter Reward Expense', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 10513, 'code' => 8214, 'expense_type' => 'Display Allowances Expense', 'frequent_expense' => true, 'is_expense' => true],
            ['expense_parent_acc_code' => 10514, 'code' => 8215, 'expense_type' => 'Asarafi Allowance Expense', 'frequent_expense' => true, 'is_expense' => true],
            ['expense_parent_acc_code' => 10638, 'code' => 8216, 'expense_type' => 'Baresta Rewarde Expense', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 10677, 'code' => 8217, 'expense_type' => 'Material Rent Expense', 'frequent_expense' => false, 'is_expense' => true],
            ['expense_parent_acc_code' => 10684, 'code' => 8218, 'expense_type' => 'Reward', 'frequent_expense' => true, 'is_expense' => true],
            ['expense_parent_acc_code' => 11245, 'code' => 8219, 'expense_type' => 'National disater risk fund government', 'frequent_expense' => false, 'is_expense' => true],
        ];

        DB::table('expenses')->upsert(
            $items,
            ['expense_parent_acc_code'],
            ['code', 'expense_type', 'frequent_expense', 'is_expense']
        );
    }
}
