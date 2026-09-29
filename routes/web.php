<?php

use App\Http\Controllers\BranchController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\EmployeeDirectoryController;
use App\Http\Controllers\EvaluatesGroupController;
use App\Http\Controllers\EvaluationCategoryController;
use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\EvaluationPeriodController;
use App\Http\Controllers\EvaluationTypeController;
use App\Http\Controllers\EvaluatorCompletionController;
use App\Http\Controllers\EvaluatorGroupController;
use App\Http\Controllers\ExternalLinkController;
use App\Http\Controllers\ExternalLinkSectionController;
use App\Http\Controllers\FiscalMonthController;
use App\Http\Controllers\FiscalYearController;
use App\Http\Controllers\ManagerController;
use App\Http\Controllers\MyEvaluationController;
use App\Http\Controllers\OtherEvaluableController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\PositionController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\QuestionGroupController;
use App\Http\Controllers\RejectedEvaluationsController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SyncController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', [PageController::class, 'home'])->name('home');

// Offline fallback page for PWA
Route::get('/offline', [PageController::class, 'offline'])->name('offline');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [PageController::class, 'dashboard'])->name('dashboard');

    // Offline Sync API Endpoints
    Route::post('sync/evaluations', [SyncController::class, 'syncEvaluation'])->name('sync.evaluations');
    Route::get('sync/pending-count', [SyncController::class, 'getPendingCount'])->name('sync.pending-count');

    // Permissions
    Route::resource('permissions', PermissionController::class)->except(['show', 'create', 'edit'])
        ->middleware([
            'can:view permissions',
            'can:create permissions',
            'can:update permissions',
            'can:delete permissions',
        ]);

    // Roles
    Route::resource('roles', RoleController::class)->except(['show']);

    Route::get('users/export', [UserController::class, 'export'])->name('users.export');
    Route::resource('users', UserController::class)->except(['show']);
    Route::resource('departments', DepartmentController::class)->except(['show']);
    Route::get('employees/export', [EmployeeController::class, 'export'])->name('employees.export');
    Route::resources([
        'branches' => BranchController::class,
        'positions' => PositionController::class,
        'departments' => DepartmentController::class,
        'employees' => EmployeeController::class,
    ]);

    Route::get('directory', [EmployeeDirectoryController::class, 'index'])
        ->name('employee-directory.index')
        ->middleware('permission:view employee directory');

    Route::resource('managers', ManagerController::class)->except(['show']);
    Route::resource('evaluation-types', EvaluationTypeController::class)->except(['show']);
    Route::resource('question-groups', QuestionGroupController::class)->except(['show']);
    Route::resource('questions', QuestionController::class)->except(['show']);
    Route::resource('evaluator-groups', EvaluatorGroupController::class)->except(['show']);
    Route::resource('evaluates-groups', EvaluatesGroupController::class)->except(['show']);
    Route::resource('other-evaluables', OtherEvaluableController::class)->except(['show']);
    Route::resource('evaluations', EvaluationController::class)->except(['show']);

    // Additional Evaluation endpoints compiled previously
    if (file_exists(__DIR__.'/evaluations.php')) {
        require __DIR__.'/evaluations.php';
    }

    Route::resource('fiscal-years', FiscalYearController::class)->except(['show']);
    Route::resource('fiscal-months', FiscalMonthController::class)->except(['show']);
    Route::resource('evaluation-periods', EvaluationPeriodController::class)->except(['show']);
    Route::resource('evaluation-categories', EvaluationCategoryController::class)->except(['show']);

    Route::get('my-evaluation', [MyEvaluationController::class, 'index'])->name('my-evaluation.index');
    Route::get('my-evaluation/history', [MyEvaluationController::class, 'history'])->name('my-evaluation.history');
    Route::get('my-evaluation/response/{evaluationResponse}/view', [MyEvaluationController::class, 'showResponse'])->name('my-evaluation.response.view');
    Route::get('my-evaluation/response/{evaluationResponse}/edit', [MyEvaluationController::class, 'editResponse'])->name('my-evaluation.response.edit');
    Route::put('my-evaluation/response/{evaluationResponse}', [MyEvaluationController::class, 'updateResponse'])->name('my-evaluation.response.update');
    Route::delete('my-evaluation/response/{evaluationResponse}', [MyEvaluationController::class, 'destroyResponse'])->name('my-evaluation.response.destroy');
    Route::get('my-evaluation/{evaluation}', [MyEvaluationController::class, 'show'])->whereNumber('evaluation')->name('my-evaluation.show');
    Route::post('my-evaluation/{evaluation}', [MyEvaluationController::class, 'store'])->whereNumber('evaluation')->name('my-evaluation.store');

    Route::get('my-results', [\App\Http\Controllers\MyEvaluationResultsController::class, 'index'])->name('my-results.index');
    Route::get('my-results/{evaluationResponse}', [\App\Http\Controllers\MyEvaluationResultsController::class, 'show'])->name('my-results.show');
    Route::post('my-results/{evaluationResponse}/accept', [\App\Http\Controllers\MyEvaluationResultsController::class, 'accept'])->name('my-results.accept');
    Route::post('my-results/{evaluationResponse}/reject', [\App\Http\Controllers\MyEvaluationResultsController::class, 'reject'])->name('my-results.reject');

    Route::get('rejected-evaluations', [RejectedEvaluationsController::class, 'index'])->name('rejected-evaluations.index');
    Route::post('rejected-evaluations/{evaluationResponse}/approve', [RejectedEvaluationsController::class, 'approve'])->name('rejected-evaluations.approve');
    Route::delete('rejected-evaluations/{evaluationResponse}', [RejectedEvaluationsController::class, 'cancel'])->name('rejected-evaluations.cancel');

    Route::get('evaluator-completion', [EvaluatorCompletionController::class, 'index'])->name('evaluator-completion.index');

    Route::middleware('permission:view evaluation records')->group(function () {
        Route::resource('evaluation-records', \App\Http\Controllers\EvaluationResponseController::class)
            ->only(['index', 'edit', 'update', 'destroy'])
            ->names([
                'index' => 'evaluation-records.index',
                'edit' => 'evaluation-records.edit',
                'update' => 'evaluation-records.update',
                'destroy' => 'evaluation-records.destroy',
            ]);
    });

    Route::middleware('permission:manage external links')->group(function () {
        Route::get('external-links', [ExternalLinkController::class, 'index'])->name('external-links.index');
        Route::post('external-links', [ExternalLinkController::class, 'store'])->name('external-links.store');
        Route::put('external-links/{external_link}', [ExternalLinkController::class, 'update'])->name('external-links.update');
        Route::delete('external-links/{external_link}', [ExternalLinkController::class, 'destroy'])->name('external-links.destroy');

        Route::post('external-link-sections', [ExternalLinkSectionController::class, 'store'])->name('external-link-sections.store');
        Route::put('external-link-sections/{external_link_section}', [ExternalLinkSectionController::class, 'update'])->name('external-link-sections.update');
        Route::delete('external-link-sections/{external_link_section}', [ExternalLinkSectionController::class, 'destroy'])->name('external-link-sections.destroy');
    });

    Route::middleware('permission:view deleted evaluations')->group(function () {
        Route::get('deleted-evaluations', [\App\Http\Controllers\DeletedEvaluationsController::class, 'index'])
            ->name('deleted-evaluations.index');
        Route::post('deleted-evaluations/{deleted_evaluation}/restore', [\App\Http\Controllers\DeletedEvaluationsController::class, 'restore'])
            ->name('deleted-evaluations.restore')
            ->middleware('permission:restore deleted evaluations');
    });
});

require __DIR__.'/budget.php';

require __DIR__.'/auth.php';

require __DIR__.'/settings.php';
