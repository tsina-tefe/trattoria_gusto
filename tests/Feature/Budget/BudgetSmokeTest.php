<?php

namespace Tests\Feature\Budget;

use App\Models\User;
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
     * @return array<string, array{0: string, 1: list<string>}>
     */
    public static function budgetPages(): array
    {
        return [
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

    public function test_pages_require_authentication(): void
    {
        foreach (array_keys(static::budgetPages()) as $key) {
            [$url] = static::budgetPages()[$key];

            $this->get($url)->assertRedirect('/login');
        }
    }
}
