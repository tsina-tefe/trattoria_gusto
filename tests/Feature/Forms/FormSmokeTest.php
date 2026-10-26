<?php

namespace Tests\Feature\Forms;

use App\Models\Form;
use App\Models\FormInputType;
use App\Models\FormVersion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

/**
 * Forms-core pages: render with permission, forbidden without.
 * Expanded as fill / submissions phases land.
 */
class FormSmokeTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array<string, array{0: string, 1: list<string>}>
     */
    public static function formPages(): array
    {
        return [
            'forms index' => ['/forms', ['view forms']],
            'forms create' => ['/forms/create', ['view forms', 'create forms']],
            'available forms' => ['/available-forms', ['fill forms']],
            'my submissions' => ['/my-submissions', ['view my form submissions']],
            'all submissions' => ['/submissions', ['view form submissions']],
            'evaluation results' => ['/forms/evaluation-results', ['view form submissions']],
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

    #[DataProvider('formPages')]
    public function test_page_renders_for_a_permitted_user(string $url, array $permissions): void
    {
        $this->actingAs($this->userWith($permissions));

        $this->get($url)->assertSuccessful();
    }

    #[DataProvider('formPages')]
    public function test_page_is_forbidden_without_permission(string $url, array $permissions): void
    {
        $this->actingAs(User::factory()->create());

        $this->get($url)->assertForbidden();
    }

    public function test_pages_require_authentication(): void
    {
        foreach (array_keys(static::formPages()) as $key) {
            [$url] = static::formPages()[$key];

            $this->get($url)->assertRedirect('/login');
        }
    }

    public function test_creator_can_store_a_form_with_a_section_and_question(): void
    {
        $this->seed(\Database\Seeders\PermissionSeeder::class);

        $user = $this->userWith(['view forms', 'create forms']);
        $textType = FormInputType::where('type_identifier', 'text')->firstOrFail();

        $this->actingAs($user);

        $response = $this->post('/forms', [
            'title' => 'Smoke Form',
            'description' => 'Phase 2 gate',
            'status' => 'draft',
            'sections' => [
                [
                    'title' => 'Section A',
                    'questions' => [
                        [
                            'label' => 'Name',
                            'form_input_type_id' => $textType->id,
                            'is_required' => true,
                            '_id' => 'q1',
                        ],
                    ],
                ],
            ],
        ]);

        $response->assertRedirect(route('forms.index'));
        $this->assertDatabaseHas('forms', [
            'title' => 'Smoke Form',
            'created_by' => $user->id,
            'status' => 'draft',
        ]);
        $this->assertDatabaseHas('form_versions', [
            'version_number' => 1,
            'status' => 'draft',
        ]);
        $this->assertDatabaseHas('form_questions', [
            'label' => 'Name',
            'form_input_type_id' => $textType->id,
        ]);
    }

    public function test_creator_can_open_edit_and_permissions_pages(): void
    {
        $user = $this->userWith(['view forms', 'update forms']);
        $form = Form::create([
            'title' => 'Edit Me',
            'status' => 'draft',
            'created_by' => $user->id,
        ]);
        FormVersion::create([
            'form_id' => $form->id,
            'version_number' => 1,
            'status' => 'draft',
        ]);

        $this->actingAs($user);

        $this->get("/forms/{$form->id}/edit")->assertSuccessful();
        $this->get("/forms/{$form->id}/versions")->assertSuccessful();
        $this->get("/forms/{$form->id}/permissions")->assertSuccessful();
    }

    public function test_creator_can_fill_and_submit_own_form(): void
    {
        $user = $this->userWith(['fill forms', 'view my form submissions']);
        $textType = FormInputType::where('type_identifier', 'text')->firstOrFail();

        $form = Form::create([
            'title' => 'Fillable',
            'status' => 'active',
            'created_by' => $user->id,
        ]);
        $version = FormVersion::create([
            'form_id' => $form->id,
            'version_number' => 1,
            'status' => 'draft',
        ]);
        $section = \App\Models\FormSection::create([
            'form_version_id' => $version->id,
            'title' => 'Main',
            'order_index' => 0,
        ]);
        $question = \App\Models\FormQuestion::create([
            'form_section_id' => $section->id,
            'form_input_type_id' => $textType->id,
            'label' => 'Comment',
            'is_required' => true,
            'order_index' => 0,
            'local_id' => 'q1',
        ]);

        $this->actingAs($user);

        $this->get("/fill-forms/{$form->id}")->assertSuccessful();

        $response = $this->post("/fill-forms/{$form->id}", [
            'answers' => [
                (string) $question->id => 'Hello',
            ],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('form_submissions', [
            'form_version_id' => $version->id,
            'user_id' => $user->id,
        ]);
        $this->assertDatabaseHas('form_submission_answers', [
            'form_question_id' => $question->id,
            'value_text' => 'Hello',
        ]);
    }
}
