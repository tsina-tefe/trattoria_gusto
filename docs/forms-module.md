# Forms module (trattoria_gusto)

Forms-core ship: builder, fill, my submissions, all submissions, Evaluation Results (scores only).  
**Deferred:** KPI Library, Next action / Training type overrides, external Forms API.

## Safety rules

- Additive migrations only — never `migrate:fresh` on shared/prod DBs.
- Forms lives under `routes/forms.php` and `resources/js/pages/Forms/`.
- Do not edit Budget files or `evaluator/evaluation-form.tsx`.
- Sidebar Form section is permission-gated (hidden without Form perms).
- Role name is `Administrator` (not company's Super Admin / Admin).

## Status (branch `feature/forms-module`)

| Phase | Status |
|-------|--------|
| 0 Baseline | Done |
| 1 Schema + permissions | Done |
| 2 Builder | Done |
| 3 Fill + my submissions | Done |
| 4 Submission admin | Done |
| 4b Evaluation Results | Done (no Next action / Training / KPI) |
| 5 KPI | Deferred |
| 6 Forms API | Deferred |
| 7 Hardening | Smoke tests in place |

## Permissions (core)

- `view forms`, `create forms`, `update forms`, `delete forms`
- `fill forms`
- `view my form submissions`
- `view form submissions`, `delete form submissions`, `export form submissions`

## Tables (core)

`form_input_types` (17 seeded identifiers), `forms`, `form_versions`, `form_sections`, `form_questions`, `form_choices`, `form_submissions`, `form_submission_answers`, `form_user_permissions`

## Sidebar

- All Forms → `/forms`
- Fill Forms → `/available-forms`
- My Submissions → `/my-submissions`
- All Submissions → `/submissions`
- Evaluation Results → `/forms/evaluation-results`

## Deploy checklist

1. `php artisan migrate`
2. `php artisan db:seed --class=PermissionSeeder`
3. Sync `Administrator` with all permissions (or assign Form perms to roles as needed)
4. `npm ci && npm run build`
5. Verify Budget + Performance Evaluation still work
6. Smoke: create form → grant fill → submit → view submissions

## Tests

```bash
php artisan test --filter=FormSmokeTest
php artisan test --filter=BudgetSmokeTest
```
