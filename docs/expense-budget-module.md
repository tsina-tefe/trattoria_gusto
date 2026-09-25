# Expense Budget Module Documentation

## 1) Module Overview

The Expense Budget module is a sub-module under `Budget` that manages branch/department monthly planned expense budgets using fiscal periods.

Main user-facing pages:
- `Add Expense Budget` (`/budget/expense-budget/create`)
- `View Expense Budget` (`/budget/expense-budget`)
- `Expense Submission Tracker` (`/budget/expense-budget/submission-tracker`)

Main backend responsibilities:
- Create and maintain budget scopes (branch/department + fiscal year/month)
- Create/update/delete budget line items
- Track submission status per item
- Record activity logs for audit/history
- Enforce role and date-window access rules

---

## 2) Database Tables Used by the Module

## A. Tables Created by this Module

1. `expense_budgets`
- Created by migration: `2026_06_28_100001_create_expense_budgets_table.php`
- Holds budget scope and total amount for a fiscal month/year + branch/department.
- Later updated to use `fiscal_year_id` and `fiscal_month_id`.

2. `expense_budget_items`
- Created by migration: `2026_06_28_100002_create_expense_budget_items_table.php`
- Holds item-level budget entries per `expense_budget_id`.

3. `expense_budget_activity_logs`
- Created by migration: `2026_06_30_150000_create_expense_budget_activity_logs_table.php`
- Stores audit trail entries for create/update/delete events on budget scopes and items.

## B. Existing Tables Modified by this Module

1. `expense_budgets`
- `2026_06_28_120000_add_expense_code_and_budget_amount_to_expense_budgets_table.php`
- `2026_06_29_130000_drop_expense_code_from_expense_budgets_table.php`
- `2026_06_30_120000_move_status_from_expense_budgets_to_expense_budget_items_table.php` (status moved out)
- `2026_06_30_140000_replace_month_year_with_fiscal_period_on_expense_budgets_table.php` (month/year replaced with fiscal foreign keys)

2. `expense_budget_items`
- `2026_06_29_120000_make_planned_budget_nullable_on_expense_budget_items_table.php`
- `2026_06_30_120000_move_status_from_expense_budgets_to_expense_budget_items_table.php` (status added at item level)

3. Permission tables (Spatie)
- `permissions`, `role_has_permissions`, `roles` are affected by:
  - `2026_06_28_100003_add_expense_budget_permissions.php`
  - `database/seeders/ExpenseBudgetPermissionSeeder.php`

## C. Existing Tables Accessed (Read/Lookup/Validation)

- `branches`
- `departments`
- `expenses` (via `expense_parent_acc_code`)
- `fiscal_years`
- `fiscal_months`
- `users`

These are used for scope selection, validation, display, relationships, and history metadata.

---

## 3) Module Folder/File Structure

```text
app/
  Http/
    Controllers/
      ExpenseBudgetController.php
    Middleware/
      EnsureExpenseBudgetManageWindow.php
  Models/
    ExpenseBudget.php
    ExpenseBudgetItem.php
    ExpenseBudgetActivityLog.php
  Services/
    ExpenseBudgetActivityLogger.php
  Support/
    ExpenseBudgetAccess.php

config/
  expense_budget.php

database/
  migrations/
    2026_06_28_100001_create_expense_budgets_table.php
    2026_06_28_100002_create_expense_budget_items_table.php
    2026_06_28_100003_add_expense_budget_permissions.php
    2026_06_28_120000_add_expense_code_and_budget_amount_to_expense_budgets_table.php
    2026_06_29_120000_make_planned_budget_nullable_on_expense_budget_items_table.php
    2026_06_29_130000_drop_expense_code_from_expense_budgets_table.php
    2026_06_30_120000_move_status_from_expense_budgets_to_expense_budget_items_table.php
    2026_06_30_140000_replace_month_year_with_fiscal_period_on_expense_budgets_table.php
    2026_06_30_150000_create_expense_budget_activity_logs_table.php
    2026_06_30_150100_add_indexes_to_expense_budget_activity_logs_table.php
  seeders/
    ExpenseBudgetPermissionSeeder.php

resources/
  js/
    pages/
      Budget/
        ExpenseBudget/
          Create.tsx
          Index.tsx
          SubmissionTracker.tsx
    components/
      app-sidebar.tsx   (Budget > Expense Budget navigation entries)

routes/
  budget.php
```

---

## 4) Safe Integration Plan for Live System (No Disturbance)

Use this rollout sequence to avoid impacting your running production system.

## Phase 0 - Pre-Integration Checklist

1. Confirm dependencies already exist in production schema:
- `branches`, `departments`, `expenses`, `fiscal_years`, `fiscal_months`, `users`

2. Confirm role/permission package is active (Spatie) and existing roles are consistent.

3. Confirm fiscal data is populated:
- At least one active fiscal year
- Fiscal months correctly linked to fiscal years

4. Take a full database backup and verify restore procedure.

## Phase 1 - Dry Run in Staging (Required)

1. Deploy the module branch to staging only.
2. Run migrations in staging:
- `php artisan migrate`
3. Run seeder:
- `php artisan db:seed --class=ExpenseBudgetPermissionSeeder`
4. Validate all workflows:
- Create budget (HO + non-HO branch behavior)
- Edit item, move item across scope
- Delete item and automatic budget deletion when last item is removed
- Submission Tracker filters
- Activity log history fetch
- Permission checks for Finance/Admin vs Branch/Department Manager

## Phase 2 - Controlled Production Rollout

1. Deploy code during a low-traffic window.
2. Put app in maintenance mode only if your operations policy requires it:
- `php artisan down` (optional, policy-based)
3. Run migrations:
- `php artisan migrate --force`
4. Seed permissions:
- `php artisan db:seed --class=ExpenseBudgetPermissionSeeder --force`
5. Clear and warm caches:
- `php artisan optimize:clear`
- `php artisan config:cache`
- `php artisan route:cache` (only if route caching is standard in your deployment)
6. Bring app up (if down mode was used):
- `php artisan up`

## Phase 3 - Post-Deployment Validation

1. Smoke test routes:
- `/budget/expense-budget`
- `/budget/expense-budget/create`
- `/budget/expense-budget/submission-tracker`

2. Validate authorization matrix with real users:
- Finance Manager/Director, Admin/Super Admin
- Branch Manager, Department Manager

3. Verify logs:
- Laravel app logs
- DB writes to `expense_budgets`, `expense_budget_items`, `expense_budget_activity_logs`

4. Monitor for at least one budget cycle day-window (5th-12th) to confirm date-window logic in production.

---

## 5) Rollback Guidance

If rollback is required:

1. Roll back application release to the previous stable tag.
2. Prefer leaving schema changes in place unless absolutely necessary (safer for data integrity).
3. If schema rollback is required, execute migration rollback only after validating data impact:
- `php artisan migrate:rollback --step=<N>`
4. Restore DB backup if data consistency cannot be guaranteed by rollback alone.

---

## 6) Notes / Operational Cautions

- This module depends on fiscal period tables and data quality.
- Head Office detection logic relies on branch code/name (`HO` or contains `Head Office`).
- Manage access for non-finance managers is restricted by date window (`config/expense_budget.php`).
- Activity logs are designed as an audit trail; avoid deleting from `expense_budget_activity_logs` in normal operations.
