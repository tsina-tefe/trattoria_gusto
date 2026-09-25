<?php

namespace Tests\Feature\Budget;

use App\Models\ExpenseBudgetPeriod;
use App\Models\FiscalMonth;
use App\Models\FiscalYear;
use App\Models\User;
use App\Models\WeeklyBudgetNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

/**
 * Every Budget page should render for a user holding the module's
 * permissions, and stay out of reach for a user without them. Each phase
 * adds its own routes to the data providers below.
 */
class BudgetSmokeTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Several Budget pages redirect away when no fiscal period is open, which
     * is correct behaviour but hides whether the page itself renders. Give
     * every case an open period so the pages are exercised for real.
     */
    protected function setUp(): void
    {
        parent::setUp();

        $fiscalYear = FiscalYear::create([
            'name' => 'EFY 2018',
            'gregorian_start_date' => '2025-07-08',
            'gregorian_end_date' => '2026-07-07',
        ]);

        $fiscalMonth = FiscalMonth::create([
            'fiscal_year_id' => $fiscalYear->id,
            'name' => 'Hamle',
            'efy_month_number' => 1,
            'gregorian_start_date' => '2025-07-08',
            'gregorian_end_date' => '2025-08-06',
        ]);

        ExpenseBudgetPeriod::create([
            'period_name' => 'Hamle 2018',
            'fiscal_year_id' => $fiscalYear->id,
            'fiscal_month_id' => $fiscalMonth->id,
            'status' => 'active',
        ]);
    }

    /**
     * @return array<string, array{0: string, 1: list<string>}>
     */
    public static function budgetPages(): array
    {
        $viewExpenseBudgets = ['view all branches except HO expense budgets'];
        $manageExpenseBudgets = ['manage expense budget anytime'];

        return [
            'weekly budget index' => ['/budget/weekly-budget', ['view weekly budgets']],
            'weekly budget create' => ['/budget/weekly-budget/create', ['manage weekly budgets']],
            'weekly budget department view' => ['/budget/weekly-budget/department', ['view department budgets']],
            'weekly budget finance view' => ['/budget/weekly-budget/finance', ['view finance budgets']],
            'weekly budget ceo view' => ['/budget/weekly-budget/ceo', ['view ceo budgets']],
            'weekly budget analytics' => ['/budget/weekly-budget/analytics', ['view weekly budget summary']],
            'weekly budget periods index' => ['/weekly-budget-periods', ['manage weekly budget periods']],
            'weekly budget export' => ['/budget/weekly-budget/export', ['view weekly budgets']],
            'banks index' => ['/budget/banks', ['manage banks']],
            'bank branches index' => ['/budget/bank-branches', ['manage bank branches']],
            // The route middleware also admits 'view bank balance', but the
            // controller narrows the listing to holders of the manage right.
            'bank balances index' => ['/budget/bank-balances', ['manage bank balance']],
            'expense budget index' => ['/budget/expense-budget', $viewExpenseBudgets],
            'expense budget create' => ['/budget/expense-budget/create', $viewExpenseBudgets],
            'expense budget submission tracker' => ['/budget/expense-budget/submission-tracker', $viewExpenseBudgets],
            'expense budget export' => ['/budget/expense-budget/export', $viewExpenseBudgets],
            'expense budget periods index' => ['/expense-budget-periods', $manageExpenseBudgets],
            'expense budget periods create' => ['/expense-budget-periods/create', $manageExpenseBudgets],
            'sales budget index' => ['/budget/sales-budget', ['view sales budget']],
            'sales budget create' => ['/budget/sales-budget/create', ['manage sales budget']],
            'sales budget logs' => ['/budget/sales-budget/logs', ['manage sales budget']],
            'sales budget export' => ['/budget/sales-budget/export', ['view sales budget']],
        ];
    }

    private function userWith(array $permissions): User
    {
        $user = User::factory()->create();

        foreach ($permissions as $name) {
            Permission::findOrCreate($name, 'web');
        }

        $user->givePermissionTo($permissions);

        return $user;
    }

    #[DataProvider('budgetPages')]
    public function test_page_renders_for_a_permitted_user(string $url, array $permissions): void
    {
        $this->actingAs($this->userWith($permissions));

        $this->get($url)->assertSuccessful();
    }

    #[DataProvider('budgetPages')]
    public function test_page_is_forbidden_without_permission(string $url, array $permissions): void
    {
        $this->actingAs(User::factory()->create());

        $this->get($url)->assertForbidden();
    }

    public function test_notifications_are_reachable_by_any_authenticated_user(): void
    {
        $this->actingAs(User::factory()->create());

        $this->get('/weekly-budget-notifications')->assertSuccessful();
    }

    public function test_a_user_cannot_mark_another_users_notification_read(): void
    {
        $owner = User::factory()->create();
        $notification = WeeklyBudgetNotification::create([
            'user_id' => $owner->id,
            'type' => 'budget.ceo',
            'title' => 'Weekly Budgets Ready for Review',
        ]);

        $this->actingAs(User::factory()->create());

        $this->post("/weekly-budget-notifications/mark-read/{$notification->id}")->assertForbidden();

        $this->assertNull($notification->fresh()->read_at);
    }

    public function test_pages_require_authentication(): void
    {
        foreach (array_keys(static::budgetPages()) as $key) {
            [$url] = static::budgetPages()[$key];

            $this->get($url)->assertRedirect('/login');
        }
    }
}
