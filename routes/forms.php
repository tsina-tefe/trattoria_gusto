<?php

use App\Http\Controllers\FillFormController;
use App\Http\Controllers\FormController;
use App\Http\Controllers\FormPermissionController;
use App\Http\Controllers\FormSubmissionAdminController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Forms module routes (core)
|--------------------------------------------------------------------------
|
| Deferred: KPI Library, Evaluation Results, external Forms API.
|
*/

Route::middleware(['auth', 'verified'])->group(function () {
    // Fill
    Route::middleware('permission:fill forms')->group(function () {
        Route::get('available-forms', [FormController::class, 'available'])->name('forms.available');
        Route::get('fill-forms/{form}', [FillFormController::class, 'show'])->name('forms.fill');
        Route::post('fill-forms/{form}', [FillFormController::class, 'store'])->name('forms.fill.store');
    });

    // My submissions
    Route::middleware('permission:view my form submissions')->group(function () {
        Route::get('my-submissions', [FormSubmissionAdminController::class, 'my_submissions'])->name('forms.submissions.my');
        Route::get('my-submissions/{submission}', [FormSubmissionAdminController::class, 'show'])->name('forms.submissions.my_show');
    });

    // Shared show (fill path + admin) — auth only; controller enforces ownership/ACL
    Route::get('submissions/{submission}', [FormSubmissionAdminController::class, 'show'])->name('forms.submissions.show');

    // Builder
    Route::middleware('permission:view forms')->group(function () {
        Route::resource('forms', FormController::class)->except(['destroy', 'show']);
        Route::get('/forms/{form}/versions', [FormController::class, 'versions'])->name('forms.versions');
        Route::get('/forms/{form}/permissions', [FormPermissionController::class, 'index'])->name('forms.permissions');
        Route::post('/forms/{form}/permissions', [FormPermissionController::class, 'update'])->name('forms.permissions.update');
    });

    Route::middleware('permission:create forms')->group(function () {
        Route::post('forms/import', [FormController::class, 'import'])->name('forms.import');
        Route::post('forms/{form}/import', [FormController::class, 'importVersion'])->name('forms.import.version');
    });

    Route::middleware('permission:export form submissions')->group(function () {
        Route::get('/forms/{form}/export', [FormController::class, 'export'])->name('forms.export');
    });

    Route::middleware('permission:delete forms')->group(function () {
        Route::delete('/forms/{form}', [FormController::class, 'destroy'])->name('forms.destroy');
    });

    // Submission admin
    Route::middleware('permission:view form submissions')->group(function () {
        Route::get('submissions', [FormSubmissionAdminController::class, 'all_index'])->name('forms.submissions.index');
        Route::get('submissions/form/{form}', [FormSubmissionAdminController::class, 'form_submissions'])->name('forms.submissions.by_form');
        Route::get('submissions/form/{form}/tracking', [FormSubmissionAdminController::class, 'form_tracking'])->name('forms.submissions.tracking');
        Route::get('/submissions/{id}/edit', [FormSubmissionAdminController::class, 'edit'])->name('submissions.edit');
        Route::put('/submissions/{id}', [FormSubmissionAdminController::class, 'update'])->name('submissions.update');
        Route::patch('/submissions/{id}/status', [FormSubmissionAdminController::class, 'update_status'])->name('submissions.update_status');
    });

    Route::middleware('permission:export form submissions')->group(function () {
        Route::get('submissions/form/{form}/export', [FormSubmissionAdminController::class, 'export_csv'])->name('forms.submissions.export');
        Route::get('submissions/form/{form}/export-detail', [FormSubmissionAdminController::class, 'export_detail'])->name('forms.submissions.export_detail');
    });

    Route::middleware('permission:delete form submissions')->group(function () {
        Route::delete('/submissions/{id}', [FormSubmissionAdminController::class, 'destroy'])->name('submissions.destroy');
    });
});
