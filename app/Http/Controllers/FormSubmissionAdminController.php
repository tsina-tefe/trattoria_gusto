<?php

namespace App\Http\Controllers;

use App\Models\Form;
use App\Models\FormSubmission;
use App\Services\SimpleXlsxWriter;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FormSubmissionAdminController extends Controller
{
    private function _calculateEmployeeScores($submission, $employeesCollection)
    {
        $rosterAnswer = $submission->answers->first(function ($a) {
            return ($a->question?->inputType?->type_identifier ?? '') === 'employee_attendance_roster';
        });

        $yesAnswers = 0;
        $totalBoolQuestions = 0;
        $employeeScoresMatrix = [];
        $presentEmployeeIds = [];

        if ($rosterAnswer && $rosterAnswer->value_text) {
            $decoded = json_decode($rosterAnswer->value_text, true);
            if (is_array($decoded)) {
                $presentEmployeeIds = $decoded;
            }
        }

        foreach ($presentEmployeeIds as $empId) {
            $emp = $employeesCollection->firstWhere('id', (int) $empId);
            if ($emp) {
                $employeeScoresMatrix[$empId] = [
                    'id' => $emp->id,
                    'name' => trim($emp->first_name . ' ' . $emp->last_name) ?: $emp->employee_code,
                    'department_id' => $emp->department_id,
                    'branch_id' => $emp->branch_id,
                    'total_points' => 0,
                    'earned_points' => 0,
                    'percentage' => null,
                ];
            }
        }

        foreach ($submission->answers as $ans) {
            $qType = $ans->question?->inputType?->type_identifier ?? 'text';
            if ($qType === 'select_one') {
                $isScored = false;
                $isYes = false;

                if ($ans->value_boolean !== null) {
                    $isScored = true;
                    $isYes = (bool) $ans->value_boolean;
                } elseif ($ans->value_text === '0' || $ans->value_text === '1') {
                    $isScored = true;
                    $isYes = ($ans->value_text === '1');
                } else {
                    $choice = $ans->question?->choices?->first(function ($c) use ($ans) {
                        return (string) $c->id === (string) $ans->value_text
                            || (string) $c->label === (string) $ans->value_text
                            || (string) $c->value === (string) $ans->value_text;
                    });
                    if ($choice && ($choice->value === '1' || $choice->value === '0')) {
                        $isScored = true;
                        $isYes = ($choice->value === '1');
                    }
                }

                if ($isScored) {
                    $totalBoolQuestions++;
                    if ($isYes) {
                        $yesAnswers++;
                    }

                    $targetDepts = $ans->question->department_targets ?? [];

                    foreach ($employeeScoresMatrix as $empId => &$empScore) {
                        if (empty($targetDepts) || in_array((string) $empScore['department_id'], $targetDepts, true)) {
                            $empScore['total_points']++;
                            if ($isYes) {
                                $empScore['earned_points']++;
                            }
                        }
                    }
                }
            }

            // Employee Evaluation Grid Scoring Map Integration
            if ($qType === 'employee_evaluation_grid') {
                $targets = $ans->targeted_employees;
                if (is_string($targets)) {
                    $targets = json_decode($targets, true);
                }
                if (!is_array($targets)) {
                    $targets = [];
                }

                $numVal = is_numeric($ans->value_text) ? (float) $ans->value_text : 0;

                foreach ($targets as $empIdStr) {
                    $empIdNum = (int) $empIdStr;
                    if (isset($employeeScoresMatrix[$empIdNum])) {
                        if ($numVal > 0) {
                            $employeeScoresMatrix[$empIdNum]['earned_points'] += $numVal;
                        }

                        // We increment total_points checking max option value ideally, but let's assume
                        // every evaluation token answered expects a ceiling.
                        // If value was '0' or '1' strictly, total is always 1 per token.
                        $employeeScoresMatrix[$empIdNum]['total_points'] += max(1, $numVal);
                    }
                }
            }
        }

        foreach ($employeeScoresMatrix as $empId => &$empScore) {
            if ($empScore['total_points'] > 0) {
                $empScore['percentage'] = round(($empScore['earned_points'] / $empScore['total_points']) * 100, 1);
            }
        }

        $submission->calculated_score = $totalBoolQuestions > 0 ? round(($yesAnswers / $totalBoolQuestions) * 100, 1) : null;
        $submission->employee_scores = array_values($employeeScoresMatrix);

        return $submission;
    }

    /**
     * List all form directories globally.
     */
    public function all_index()
    {
        $user = auth()->user();
        $user = auth()->user();
        $forms = Form::withCount('submissions')
            ->where(function ($query) use ($user) {
                $query->where('created_by', $user->id)
                    ->orWhereHas('user_permissions', function ($q) use ($user) {
                        $q->where('user_id', $user->id)->where('can_view_submissions', true);
                    });
            })
            ->orderBy('title')
            ->get();

        return Inertia::render('Forms/Submissions/Index', [
            'forms' => $forms
        ]);
    }

    /**
     * Show isolated submissions strictly bound to one Form (server-paginated, slim rows).
     */
    public function form_submissions(Request $request, Form $form)
    {
        $user = auth()->user();
        if ($form->created_by !== $user->id) {
            $hasAccess = $form->user_permissions()->where('user_id', $user->id)->where('can_view_submissions', true)->exists();
            if (!$hasAccess) {
                abort(403, 'You must be granted explicit form-level access to view submissions for this form.');
            }
        }

        $fiscalYears = \App\Models\FiscalYear::orderBy('gregorian_start_date')
            ->get(['id', 'name', 'gregorian_start_date', 'gregorian_end_date']);
        $fiscalMonths = \App\Models\FiscalMonth::orderBy('gregorian_start_date')
            ->get(['id', 'fiscal_year_id', 'name', 'gregorian_start_date', 'gregorian_end_date']);

        $today = Carbon::today();
        $currentFiscalYear = $fiscalYears->first(fn ($fy) => $today->between(
            Carbon::parse($fy->gregorian_start_date),
            Carbon::parse($fy->gregorian_end_date)
        ));
        $currentFiscalMonth = $fiscalMonths->first(fn ($fm) => $today->between(
            Carbon::parse($fm->gregorian_start_date),
            Carbon::parse($fm->gregorian_end_date)
        ));

        $lookupMeta = \App\Models\FormQuestion::query()
            ->whereHas('section.formVersion', fn ($q) => $q->where('form_id', $form->id))
            ->whereHas('inputType', fn ($q) => $q->whereIn('type_identifier', ['branch_lookup', 'employee_lookup']))
            ->with('inputType:id,type_identifier')
            ->get(['id', 'label', 'form_input_type_id']);

        $hasBranch = $lookupMeta->contains(fn ($q) => ($q->inputType->type_identifier ?? '') === 'branch_lookup');
        $hasEmployee = $lookupMeta->contains(fn ($q) => ($q->inputType->type_identifier ?? '') === 'employee_lookup');
        $branchLabel = $lookupMeta->first(fn ($q) => ($q->inputType->type_identifier ?? '') === 'branch_lookup')?->label ?? 'Branch';
        $employeeLabel = $lookupMeta->first(fn ($q) => ($q->inputType->type_identifier ?? '') === 'employee_lookup')?->label ?? 'Evaluated Employee';

        $statusFilter = $request->input('status', 'all');
        $submittedByFilter = $request->input('submitted_by', 'all');
        $branchFilter = $request->input('branch_id', 'all');
        $employeeFilter = $request->input('employee_id', 'all');
        // Default to current fiscal period only on first visit (no filter query params).
        $fiscalYearFilter = $request->has('fiscal_year_id')
            ? (string) $request->input('fiscal_year_id', 'all')
            : ($currentFiscalYear?->id ? (string) $currentFiscalYear->id : 'all');
        $fiscalMonthFilter = $request->has('fiscal_month_id')
            ? (string) $request->input('fiscal_month_id', 'all')
            : ($currentFiscalMonth?->id ? (string) $currentFiscalMonth->id : 'all');

        $query = FormSubmission::query()
            ->select(['id', 'form_version_id', 'user_id', 'status', 'created_at'])
            ->whereHas('formVersion', fn ($q) => $q->where('form_id', $form->id))
            ->with(['user:id,name'])
            ->orderByDesc('id');

        if ($statusFilter !== 'all') {
            $query->where('status', $statusFilter);
        }

        if ($submittedByFilter !== 'all' && ctype_digit($submittedByFilter)) {
            $query->where('user_id', (int) $submittedByFilter);
        }

        if ($fiscalMonthFilter !== 'all' && ctype_digit($fiscalMonthFilter)) {
            $month = $fiscalMonths->firstWhere('id', (int) $fiscalMonthFilter);
            if ($month) {
                $query->whereBetween('created_at', [
                    Carbon::parse($month->gregorian_start_date)->startOfDay(),
                    Carbon::parse($month->gregorian_end_date)->endOfDay(),
                ]);
            }
        } elseif ($fiscalYearFilter !== 'all' && ctype_digit($fiscalYearFilter)) {
            $year = $fiscalYears->firstWhere('id', (int) $fiscalYearFilter);
            if ($year) {
                $query->whereBetween('created_at', [
                    Carbon::parse($year->gregorian_start_date)->startOfDay(),
                    Carbon::parse($year->gregorian_end_date)->endOfDay(),
                ]);
            }
        }

        if ($hasBranch && $branchFilter !== 'all' && ctype_digit($branchFilter)) {
            $query->whereHas('answers', function ($q) use ($branchFilter) {
                $q->where('value_text', (string) $branchFilter)
                    ->whereHas('question.inputType', fn ($t) => $t->where('type_identifier', 'branch_lookup'));
            });
        }

        if ($hasEmployee && $employeeFilter !== 'all' && ctype_digit($employeeFilter)) {
            $query->whereHas('answers', function ($q) use ($employeeFilter) {
                $q->where('value_text', (string) $employeeFilter)
                    ->whereHas('question.inputType', fn ($t) => $t->where('type_identifier', 'employee_lookup'));
            });
        }

        $paginator = $query->paginate(25)->withQueryString();

        $pageIds = $paginator->getCollection()->pluck('id')->all();
        $lookupAnswers = collect();
        if ($pageIds !== [] && ($hasBranch || $hasEmployee)) {
            $types = array_values(array_filter([
                $hasBranch ? 'branch_lookup' : null,
                $hasEmployee ? 'employee_lookup' : null,
            ]));

            $lookupAnswers = \App\Models\FormSubmissionAnswer::query()
                ->whereIn('form_submission_id', $pageIds)
                ->whereHas('question.inputType', fn ($q) => $q->whereIn('type_identifier', $types))
                ->with(['question.inputType:id,type_identifier'])
                ->get(['id', 'form_submission_id', 'form_question_id', 'value_text'])
                ->groupBy('form_submission_id');
        }

        $pageBranchIds = [];
        $pageEmployeeIds = [];
        foreach ($lookupAnswers as $answers) {
            foreach ($answers as $answer) {
                $type = $answer->question?->inputType?->type_identifier ?? '';
                if ($type === 'branch_lookup' && is_numeric($answer->value_text)) {
                    $pageBranchIds[] = (int) $answer->value_text;
                }
                if ($type === 'employee_lookup' && is_numeric($answer->value_text)) {
                    $pageEmployeeIds[] = (int) $answer->value_text;
                }
            }
        }

        $branchNames = $pageBranchIds === []
            ? collect()
            : \App\Models\Branch::whereIn('id', array_unique($pageBranchIds))->pluck('name', 'id');
        $employeeNames = $pageEmployeeIds === []
            ? collect()
            : \App\Models\Employee::query()
                ->whereIn('id', array_unique($pageEmployeeIds))
                ->get(['id', 'first_name', 'last_name', 'employee_code'])
                ->mapWithKeys(fn ($e) => [
                    $e->id => trim($e->first_name . ' ' . $e->last_name) ?: $e->employee_code,
                ]);

        $rows = $paginator->getCollection()->map(function (FormSubmission $sub) use (
            $fiscalYears,
            $fiscalMonths,
            $lookupAnswers,
            $hasBranch,
            $hasEmployee,
            $branchNames,
            $employeeNames
        ) {
            $submittedAt = Carbon::parse($sub->created_at);
            $matchedYear = $fiscalYears->first(
                fn ($fy) => $submittedAt->between(
                    Carbon::parse($fy->gregorian_start_date),
                    Carbon::parse($fy->gregorian_end_date)
                )
            );
            $matchedMonth = $fiscalMonths->first(
                fn ($fm) => $submittedAt->between(
                    Carbon::parse($fm->gregorian_start_date),
                    Carbon::parse($fm->gregorian_end_date)
                )
            );

            $answers = $lookupAnswers->get($sub->id, collect());
            $branchAnswer = $hasBranch
                ? $answers->first(fn ($a) => ($a->question?->inputType?->type_identifier ?? '') === 'branch_lookup')
                : null;
            $employeeAnswer = $hasEmployee
                ? $answers->first(fn ($a) => ($a->question?->inputType?->type_identifier ?? '') === 'employee_lookup')
                : null;

            $branchId = $branchAnswer && is_numeric($branchAnswer->value_text) ? (int) $branchAnswer->value_text : null;
            $employeeId = $employeeAnswer && is_numeric($employeeAnswer->value_text) ? (int) $employeeAnswer->value_text : null;

            return [
                'id' => $sub->id,
                'status' => $sub->status ?? 'pending',
                'submitted_by' => $sub->user?->name ?? 'Unknown User',
                'created_at' => $sub->created_at?->toDateTimeString(),
                'branch_name' => $branchId ? ($branchNames[$branchId] ?? (string) $branchId) : null,
                'employee_name' => $employeeId ? ($employeeNames[$employeeId] ?? (string) $employeeId) : null,
                'fiscal_year_id' => $matchedYear?->id,
                'fiscal_month_id' => $matchedMonth?->id,
            ];
        });

        $paginator->setCollection($rows);

        $submitterOptions = FormSubmission::query()
            ->whereHas('formVersion', fn ($q) => $q->where('form_id', $form->id))
            ->with('user:id,name')
            ->select('user_id')
            ->distinct()
            ->get()
            ->map(fn ($s) => [
                'id' => $s->user_id,
                'name' => $s->user?->name ?? 'Unknown User',
            ])
            ->filter(fn ($s) => $s['id'])
            ->unique('id')
            ->sortBy('name', SORT_NATURAL | SORT_FLAG_CASE)
            ->values();

        $branchOptions = $hasBranch
            ? \App\Models\Branch::orderBy('name')->get(['id', 'name'])->map(fn ($b) => ['id' => $b->id, 'name' => $b->name])
            : collect();

        $employeeOptions = $hasEmployee
            ? \App\Models\Employee::query()
                ->where('status', 'active')
                ->orderBy('first_name')
                ->orderBy('last_name')
                ->get(['id', 'first_name', 'last_name', 'employee_code'])
                ->map(fn ($e) => [
                    'id' => $e->id,
                    'name' => trim($e->first_name . ' ' . $e->last_name) ?: $e->employee_code,
                ])
            : collect();

        return Inertia::render('Forms/Submissions/FormSubmissions', [
            'form' => ['id' => $form->id, 'title' => $form->title],
            'submissions' => $paginator,
            'hasBranch' => $hasBranch,
            'hasEmployee' => $hasEmployee,
            'branchLabel' => $branchLabel,
            'employeeLabel' => $employeeLabel,
            'branchOptions' => $branchOptions,
            'employeeOptions' => $employeeOptions,
            'submitterOptions' => $submitterOptions,
            'fiscalYears' => $fiscalYears->map(fn ($fy) => ['id' => $fy->id, 'name' => $fy->name])->values(),
            'fiscalMonths' => $fiscalMonths->map(fn ($fm) => [
                'id' => $fm->id,
                'fiscal_year_id' => $fm->fiscal_year_id,
                'name' => $fm->name,
            ])->values(),
            'currentFiscalYearId' => $currentFiscalYear?->id,
            'currentFiscalMonthId' => $currentFiscalMonth?->id,
            'filters' => [
                'status' => $statusFilter,
                'submitted_by' => $submittedByFilter,
                'branch_id' => $branchFilter,
                'employee_id' => $employeeFilter,
                'fiscal_year_id' => (string) $fiscalYearFilter,
                'fiscal_month_id' => (string) $fiscalMonthFilter,
            ],
        ]);
    }

    /**
     * Submission tracking dashboard with branch visit metrics, charts, and fiscal & date filters.
     */
    public function form_tracking(Form $form)
    {
        $user = auth()->user();
        if ($form->created_by !== $user->id) {
            $hasAccess = $form->user_permissions()->where('user_id', $user->id)->where('can_view_submissions', true)->exists();
            if (!$hasAccess) {
                abort(403, 'You must be granted explicit form-level access to view tracking for this form.');
            }
        }

        $allBranches = \App\Models\Branch::where('is_sales_generating', true)->orderBy('name')->get(['id', 'name', 'branch_code', 'location']);
        $branchMap = $allBranches->keyBy('id');

        $submissions = FormSubmission::whereHas('formVersion', function ($q) use ($form) {
                $q->where('form_id', $form->id);
            })
            ->with([
                'user:id,name,email',
                'user.employee.branch:id,name',
                'answers.question.inputType:id,type_identifier'
            ])
            ->orderByDesc('created_at')
            ->get();

        $fiscalYears = \App\Models\FiscalYear::orderBy('gregorian_start_date')->get(['id', 'name', 'gregorian_start_date', 'gregorian_end_date']);
        $fiscalMonths = \App\Models\FiscalMonth::orderBy('gregorian_start_date')->get(['id', 'fiscal_year_id', 'name', 'gregorian_start_date', 'gregorian_end_date']);

        $today = \Carbon\Carbon::today();
        $currentFiscalYear = $fiscalYears->first(fn($fy) => $today->between(
            \Carbon\Carbon::parse($fy->gregorian_start_date),
            \Carbon\Carbon::parse($fy->gregorian_end_date)
        ));
        $currentFiscalMonth = $fiscalMonths->first(fn($fm) => $today->between(
            \Carbon\Carbon::parse($fm->gregorian_start_date),
            \Carbon\Carbon::parse($fm->gregorian_end_date)
        ));

        $resolvedSubmissions = $submissions->map(function ($sub) use ($branchMap, $allBranches, $fiscalYears, $fiscalMonths) {
            $branchAns = $sub->answers->first(function ($a) {
                return ($a->question?->inputType?->type_identifier ?? '') === 'branch_lookup';
            });

            $branchId = null;
            $branchName = null;

            if ($branchAns && $branchAns->value_text) {
                $val = trim($branchAns->value_text);
                if (is_numeric($val) && isset($branchMap[(int)$val])) {
                    $branchId = (int)$val;
                    $branchName = $branchMap[(int)$val]->name;
                } else {
                    $matched = $allBranches->first(fn($b) => strcasecmp($b->name, $val) === 0);
                    if ($matched) {
                        $branchId = $matched->id;
                        $branchName = $matched->name;
                    } else {
                        $branchName = $val;
                        $branchId = 'custom_' . md5($val);
                    }
                }
            }

            if (!$branchId) {
                $empBranch = $sub->user?->employee?->branch;
                if ($empBranch) {
                    $branchId = $empBranch->id;
                    $branchName = $empBranch->name;
                } else {
                    $branchId = 'unassigned';
                    $branchName = 'Unassigned';
                }
            }

            $submittedAt = \Carbon\Carbon::parse($sub->created_at);
            $matchedYear = $fiscalYears->first(fn($fy) => $submittedAt->between(
                \Carbon\Carbon::parse($fy->gregorian_start_date),
                \Carbon\Carbon::parse($fy->gregorian_end_date)
            ));
            $matchedMonth = $fiscalMonths->first(fn($fm) => $submittedAt->between(
                \Carbon\Carbon::parse($fm->gregorian_start_date),
                \Carbon\Carbon::parse($fm->gregorian_end_date)
            ));

            return [
                'id' => $sub->id,
                'branch_id' => $branchId,
                'branch_name' => $branchName,
                'user_id' => $sub->user_id,
                'user_name' => $sub->user?->name ?? 'Unknown',
                'status' => $sub->status ?: 'pending',
                'created_at' => $sub->created_at->toIso8601String(),
                'date' => $sub->created_at->format('Y-m-d'),
                'fiscal_year_id' => $matchedYear?->id,
                'fiscal_year_name' => $matchedYear?->name,
                'fiscal_month_id' => $matchedMonth?->id,
                'fiscal_month_name' => $matchedMonth?->name,
            ];
        });

        // Other forms the user can view, allowing quick switching from the tracking page
        $availableForms = Form::where(function ($query) use ($user) {
                $query->where('created_by', $user->id)
                    ->orWhereHas('user_permissions', function ($q) use ($user) {
                        $q->where('user_id', $user->id)->where('can_view_submissions', true);
                    });
            })
            ->orderBy('title')
            ->get(['id', 'title']);

        return Inertia::render('Forms/Submissions/Tracking', [
            'form' => [
                'id' => $form->id,
                'title' => $form->title,
                'description' => $form->description,
                'status' => $form->status,
            ],
            'availableForms' => $availableForms,
            'allBranches' => $allBranches->map(fn($b) => [
                'id' => $b->id,
                'name' => $b->name,
                'branch_code' => $b->branch_code,
                'location' => $b->location,
            ]),
            'submissions' => $resolvedSubmissions,
            'fiscalYears' => $fiscalYears->map(fn($fy) => [
                'id' => $fy->id,
                'name' => $fy->name,
                'start_date' => $fy->gregorian_start_date,
                'end_date' => $fy->gregorian_end_date,
            ])->values(),
            'fiscalMonths' => $fiscalMonths->map(fn($fm) => [
                'id' => $fm->id,
                'fiscal_year_id' => $fm->fiscal_year_id,
                'name' => $fm->name,
                'start_date' => $fm->gregorian_start_date,
                'end_date' => $fm->gregorian_end_date,
            ])->values(),
            'currentFiscalYearId' => $currentFiscalYear?->id,
            'currentFiscalMonthId' => $currentFiscalMonth?->id,
        ]);
    }

    /**
     * List only the authenticated user's own submissions.
     */
    public function my_submissions()
    {
        $user = auth()->user();

        $submissions = FormSubmission::where('user_id', $user->id)
            ->with([
                'formVersion.form',
                'answers.question.inputType',
            ])
            ->orderByDesc('id')
            ->get();

        $fullEmployeesCollection = \App\Models\Employee::get();
        $submissions->each(function ($sub) use ($fullEmployeesCollection) {
            $this->_calculateEmployeeScores($sub, $fullEmployeesCollection);
        });

        $branches = \App\Models\Branch::pluck('name', 'id')->toArray();
        $departments = \App\Models\Department::pluck('name', 'id')->toArray();
        $employees = \App\Models\Employee::get()->mapWithKeys(function ($e) {
            $name = trim($e->first_name . ' ' . $e->last_name) ?: $e->employee_code;
            return [$e->id => $name];
        })->toArray();

        // Load fiscal periods and resolve each submission
        $fiscalYears = \App\Models\FiscalYear::orderBy('gregorian_start_date')->get(['id', 'name', 'gregorian_start_date', 'gregorian_end_date']);
        $fiscalMonths = \App\Models\FiscalMonth::orderBy('gregorian_start_date')->get(['id', 'fiscal_year_id', 'name', 'gregorian_start_date', 'gregorian_end_date']);

        $submissions->each(function ($sub) use ($fiscalYears, $fiscalMonths) {
            $submittedAt = \Carbon\Carbon::parse($sub->created_at);

            $matchedYear = $fiscalYears->first(
                fn($fy) =>
                $submittedAt->between(
                    \Carbon\Carbon::parse($fy->gregorian_start_date),
                    \Carbon\Carbon::parse($fy->gregorian_end_date)
                )
            );
            $sub->fiscal_year_id = $matchedYear?->id;
            $sub->fiscal_year_name = $matchedYear?->name;

            $matchedMonth = $fiscalMonths->first(
                fn($fm) =>
                $submittedAt->between(
                    \Carbon\Carbon::parse($fm->gregorian_start_date),
                    \Carbon\Carbon::parse($fm->gregorian_end_date)
                )
            );
            $sub->fiscal_month_id = $matchedMonth?->id;
            $sub->fiscal_month_name = $matchedMonth?->name;
        });

        $today = \Carbon\Carbon::today();
        $currentFiscalYear = $fiscalYears->first(fn($fy) => $today->between(
            \Carbon\Carbon::parse($fy->gregorian_start_date),
            \Carbon\Carbon::parse($fy->gregorian_end_date)
        ));
        $currentFiscalMonth = $fiscalMonths->first(fn($fm) => $today->between(
            \Carbon\Carbon::parse($fm->gregorian_start_date),
            \Carbon\Carbon::parse($fm->gregorian_end_date)
        ));

        // Get unique forms from user's submissions
        $forms = $submissions->map(function ($s) {
            return $s->formVersion?->form ? [
                'id' => $s->formVersion->form->id,
                'title' => $s->formVersion->form->title,
            ] : null;
        })->filter()->unique('id')->values();

        return Inertia::render('Forms/Submissions/MySubmissions', [
            'submissions' => $submissions,
            'forms' => $forms,
            'branches' => $branches,
            'departments' => $departments,
            'employees' => $employees,
            'fiscalYears' => $fiscalYears->map(fn($fy) => ['id' => $fy->id, 'name' => $fy->name])->values(),
            'fiscalMonths' => $fiscalMonths->map(fn($fm) => ['id' => $fm->id, 'fiscal_year_id' => $fm->fiscal_year_id, 'name' => $fm->name])->values(),
            'currentFiscalYearId' => $currentFiscalYear?->id,
            'currentFiscalMonthId' => $currentFiscalMonth?->id,
        ]);
    }

    /**
     * Show a detailed view of a singular submission's answers.
     */
    public function show(string $submissionId)
    {
        $submission = FormSubmission::with([
            'user',
            'formVersion.form',
            'formVersion.sections.questions.inputType',
            'formVersion.sections.questions.choices',
            'answers.question.inputType',
            'answers.question.choices'
        ])->findOrFail($submissionId);

        $user = auth()->user();
        $isSubmitter = ((int) $submission->user_id === (int) $user->id);
        $isCreator = ((int) ($submission->formVersion->form->created_by ?? 0) === (int) $user->id);
        $hasViewPermission = $submission->formVersion->form->user_permissions()->where('user_id', $user->id)->where('can_view_submissions', true)->exists();

        if (!$isSubmitter && !$isCreator && !$hasViewPermission) {
            abort(403, 'You must be granted explicit form-level access to view submissions for this form.');
        }

        $isMySubmissions = request()->routeIs('forms.submissions.my_show')
            || request()->is('my-submissions*')
            || request()->query('from') === 'my-submissions';

        // When viewing via My Submissions or when the user is viewing their own submission, approval actions are disabled
        $canApproveReject = !$isMySubmissions
            && !$isSubmitter
            && ($isCreator || $submission->formVersion->form->user_permissions()->where('user_id', $user->id)->where('can_edit_submissions', true)->exists());

        $branches = \App\Models\Branch::select('id', 'name')->get();
        $departments = \App\Models\Department::select('id', 'name')->get();
        $employees = \App\Models\Employee::get()->map(function ($e) {
            return [
                'id' => $e->id,
                'name' => trim($e->first_name . ' ' . $e->last_name) ?: $e->employee_code,
            ];
        });

        $fullEmployeesCollection = \App\Models\Employee::get();
        $this->_calculateEmployeeScores($submission, $fullEmployeesCollection);

        $from = request()->query('from', ($isMySubmissions || $isSubmitter) ? 'my-submissions' : null);

        return Inertia::render('Forms/Submissions/Show', [
            'form' => $submission->formVersion->form, // Keep old prop structure to limit UI rewrites
            'submission' => $submission,
            'branches' => $branches,
            'departments' => $departments,
            'employees' => $employees,
            'canApproveReject' => $canApproveReject,
            'from' => $from,
        ]);
    }
    public function edit(string $submissionId)
    {
        $submission = FormSubmission::with([
            'user',
            'formVersion.form',
            'formVersion.sections.questions.inputType',
            'formVersion.sections.questions.choices',
            'answers.question'
        ])->findOrFail($submissionId);

        $user = auth()->user();
        if ($submission->formVersion->form->created_by !== $user->id) {
            if (!$submission->formVersion->form->user_permissions()->where('user_id', $user->id)->where('can_edit_submissions', true)->exists()) {
                abort(403, 'You must be granted explicit form-level access to edit submissions for this form.');
            }
        }

        $parsedAnswers = [];
        foreach ($submission->answers as $ans) {
            $questionType = $ans->question->inputType->type_identifier ?? 'text';

            if ($questionType === 'boolean') {
                $parsedAnswers[$ans->form_question_id] = (bool) $ans->value_boolean;
            } elseif ($questionType === 'employee_evaluation_grid') {
                if (!isset($parsedAnswers[$ans->form_question_id])) {
                    $parsedAnswers[$ans->form_question_id] = [];
                }
                $targets = $ans->targeted_employees;
                if (is_string($targets)) {
                    $targets = json_decode($targets, true);
                }
                if (is_array($targets)) {
                    foreach ($targets as $empId) {
                        if (!isset($parsedAnswers[$ans->form_question_id][(string) $empId])) {
                            $parsedAnswers[$ans->form_question_id][(string) $empId] = [];
                        }
                        $subQ = $ans->sub_question_identifier ?: 'single';
                        $parsedAnswers[$ans->form_question_id][(string) $empId][$subQ] = $ans->value_text;
                    }
                }
            } else {
                $val = $ans->value_text;
                $decoded = json_decode($val, true);
                if (is_array($decoded)) {
                    $parsedAnswers[$ans->form_question_id] = $decoded;
                } else {
                    $parsedAnswers[$ans->form_question_id] = $val;
                }
            }
        }

        $branches = \App\Models\Branch::select('id', 'name', 'is_sales_generating')->get();
        $departments = \App\Models\Department::select('id', 'name')->get();
        $employees = \App\Models\Employee::get()->map(function ($e) {
            return [
                'id' => $e->id,
                'name' => trim($e->first_name . ' ' . $e->last_name) ?: $e->employee_code,
                'branch_id' => $e->branch_id,
                'department_id' => $e->department_id,
                'status' => $e->status,
            ];
        });

        return Inertia::render('Forms/Fill', [
            'form' => $submission->formVersion->form,
            'formVersion' => $submission->formVersion,
            'submission' => $submission,
            'parsedAnswers' => $parsedAnswers,
            'branches' => $branches,
            'departments' => $departments,
            'employees' => $employees
        ]);
    }

    public function update(\Illuminate\Http\Request $request, string $submissionId)
    {
        $submission = FormSubmission::with('formVersion.form')->findOrFail($submissionId);

        $user = auth()->user();
        if ($submission->formVersion->form->created_by !== $user->id) {
            if (!$submission->formVersion->form->user_permissions()->where('user_id', $user->id)->where('can_edit_submissions', true)->exists()) {
                abort(403, 'You must be granted explicit form-level access to edit submissions for this form.');
            }
        }

        $validated = $request->validate([
            'answers' => 'required|array',
        ]);

        \Illuminate\Support\Facades\DB::transaction(function () use ($submission, $validated) {
            $submission->answers()->delete();

            foreach ($validated['answers'] as $questionId => $answerValue) {
                // To fetch the question type safely for matrix targeting we can query it directly here (or eager load it above)
                $questionForTypeCheck = \App\Models\FormQuestion::with('inputType')->find($questionId);
                $tId = $questionForTypeCheck->inputType->type_identifier ?? '';

                if ($tId === 'title') {
                    continue;
                }

                if ($tId === 'employee_evaluation_grid' && is_array($answerValue)) {
                    foreach ($answerValue as $empIdStr => $evals) {
                        if (!is_array($evals))
                            continue;
                        $empId = [(string) $empIdStr];

                        foreach ($evals as $subQLabel => $val) {
                            if ($subQLabel === 'remark' && ($val === '' || $val === null))
                                continue;

                            \App\Models\FormSubmissionAnswer::create([
                                'form_submission_id' => $submission->id,
                                'form_question_id' => $questionId,
                                'sub_question_identifier' => $subQLabel === 'single' ? null : $subQLabel,
                                'value_text' => (string) $val,
                                'value_boolean' => null,
                                'targeted_employees' => $empId,
                            ]);
                        }
                    }
                } elseif ($qObj = \App\Models\FormQuestion::with('choices', 'inputType')->find($questionId)) {
                    $tId = $qObj->inputType?->type_identifier ?? '';
                    if ($tId === 'select_one') {
                        $selectedChoice = $qObj->choices->first(function ($c) use ($answerValue) {
                            return (string) $c->id === (string) $answerValue;
                        });

                        if (!$selectedChoice) {
                            $selectedChoice = $qObj->choices->first(function ($c) use ($answerValue) {
                                return strtolower(trim((string) $c->label)) === strtolower(trim((string) $answerValue));
                            });
                        }

                        if (!$selectedChoice) {
                            $selectedChoice = $qObj->choices->first(function ($c) use ($answerValue) {
                                return (string) $c->value === (string) $answerValue;
                            });
                        }

                        $boolVal = null;
                        $valText = null;

                        if ($selectedChoice) {
                            $cVal = strtolower(trim((string) $selectedChoice->value));
                            if ($cVal === '1' || $cVal === 'yes' || $cVal === 'true') {
                                $boolVal = true;
                            } elseif ($cVal === '0' || $cVal === 'no' || $cVal === 'false') {
                                $boolVal = false;
                            } else {
                                $cLabel = strtolower(trim((string) $selectedChoice->label));
                                if (in_array($cLabel, ['yes', 'true', 'አዎ'], true)) {
                                    $boolVal = true;
                                } elseif (in_array($cLabel, ['no', 'false', 'አይ'], true)) {
                                    $boolVal = false;
                                }
                            }
                            $valText = (string) $selectedChoice->label;
                        } else {
                            $valText = is_bool($answerValue) ? ($answerValue ? 'yes' : 'no') : (is_array($answerValue) ? json_encode($answerValue) : (string) $answerValue);
                            if (in_array(strtolower((string) $answerValue), ['yes', 'true', '1'], true)) {
                                $boolVal = true;
                            } elseif (in_array(strtolower((string) $answerValue), ['no', 'false', '0'], true)) {
                                $boolVal = false;
                            }
                        }

                        \App\Models\FormSubmissionAnswer::create([
                            'form_submission_id' => $submission->id,
                            'form_question_id' => $questionId,
                            'value_text' => $valText,
                            'value_boolean' => $boolVal,
                        ]);
                    } else {
                        $boolVal = null;
                        if ($tId === 'boolean') {
                            if (is_bool($answerValue)) {
                                $boolVal = $answerValue;
                            } else if (!is_array($answerValue) && in_array(strtolower((string) $answerValue), ['yes', 'true', '1'], true)) {
                                $boolVal = true;
                            } else if (!is_array($answerValue) && in_array(strtolower((string) $answerValue), ['no', 'false', '0'], true)) {
                                $boolVal = false;
                            }
                        }

                        $valText = is_bool($answerValue)
                            ? ($answerValue ? 'yes' : 'no')
                            : (is_array($answerValue) ? json_encode($answerValue) : (string) $answerValue);

                        \App\Models\FormSubmissionAnswer::create([
                            'form_submission_id' => $submission->id,
                            'form_question_id' => $questionId,
                            'value_text' => $valText,
                            'value_boolean' => $boolVal,
                        ]);
                    }
                } else {
                    \App\Models\FormSubmissionAnswer::create([
                        'form_submission_id' => $submission->id,
                        'form_question_id' => $questionId,
                        'value_text' => is_bool($answerValue) ? ($answerValue ? 'yes' : 'no') : (is_array($answerValue) ? json_encode($answerValue) : (string) $answerValue),
                        'value_boolean' => null,
                    ]);
                }
            }
        });

        return redirect()->route('forms.submissions.show', $submission->id)->with('success', 'Submission updated successfully.');
    }

    /**
     * Update only the structural status of a submission.
     */
    public function update_status(\Illuminate\Http\Request $request, string $submissionId)
    {
        $validated = $request->request->all() ? $request->validate([
            'status' => 'required|in:pending,approved,rejected'
        ]) : [];

        $submission = FormSubmission::with('formVersion.form')->findOrFail($submissionId);

        $user = auth()->user();
        if ((int) $submission->user_id === (int) $user->id) {
            abort(403, 'You cannot approve or reject your own submission.');
        }

        if ($submission->formVersion->form->created_by !== $user->id) {
            if (!$submission->formVersion->form->user_permissions()->where('user_id', $user->id)->where('can_edit_submissions', true)->exists()) {
                abort(403, 'You must be granted explicit form-level access to edit submissions for this form.');
            }
        }
        $submission->update(['status' => $validated['status']]);

        return back()->with('success', 'Submission status updated.');
    }



    /**
     * Delete the submission entirely.
     */
    public function destroy(string $submissionId)
    {
        $submission = FormSubmission::with('formVersion.form')->findOrFail($submissionId);

        $user = auth()->user();
        if ($submission->formVersion->form->created_by !== $user->id) {
            if (!$submission->formVersion->form->user_permissions()->where('user_id', $user->id)->where('can_delete_submissions', true)->exists()) {
                abort(403, 'You must be granted explicit form-level access to delete submissions for this form.');
            }
        }
        $submission->answers()->delete();
        $submission->delete();

        return redirect()->route('forms.submissions.index')->with('success', 'Submission deleted successfully.');
    }

    /**
     * Export all submissions for a given form as a CSV.
     */
    public function export_csv(Form $form)
    {
        $user = auth()->user();
        if ($form->created_by !== $user->id) {
            if (!$form->user_permissions()->where('user_id', $user->id)->where('can_view_submissions', true)->exists()) {
                abort(403, 'You must be granted explicit form-level access to view/export submissions for this form.');
            }
        }
        // 1. Fetch lookups for decoding relational data types
        $branches = \App\Models\Branch::pluck('name', 'id')->toArray();
        $departments = \App\Models\Department::pluck('name', 'id')->toArray();
        $employees = \App\Models\Employee::get()->mapWithKeys(function ($e) {
            $name = trim($e->first_name . ' ' . $e->last_name) ?: $e->employee_code;
            return [$e->id => $name];
        })->toArray();

        // 2. Extract distinct Questions acting as Columns
        $allQuestions = \App\Models\FormQuestion::whereHas('section.formVersion', function ($q) use ($form) {
            $q->where('form_id', $form->id);
        })->with('inputType')->get();

        $headersMap = [];
        foreach ($allQuestions as $q) {
            if (($q->inputType->type_identifier ?? '') === 'title') {
                continue;
            }
            if ($q->local_id && !isset($headersMap[$q->local_id])) {
                $headersMap[$q->local_id] = [
                    'label' => $q->label,
                    'type' => $q->inputType->type_identifier ?? 'text'
                ];
            }
        }

        // 3. Fetch submissions
        $submissions = FormSubmission::whereHas('formVersion', function ($q) use ($form) {
            $q->where('form_id', $form->id);
        })
            ->with(['user', 'answers.question'])
            ->orderByDesc('id')
            ->get();

        // 4. Stream response (UTF-8 + BOM so Excel shows Amharic/other Unicode correctly)
        $cleanTitle = trim(preg_replace('/[\\\\\/:\*\?"<>\|]/', '_', $form->title)) ?: 'Form_' . $form->id;
        $filename = "{$cleanTitle}_Submissions.csv";
        $asciiFallback = preg_replace('/[^A-Za-z0-9_\-\.]/', '_', $filename) ?: "form_{$form->id}_submissions.csv";
        $encodedFilename = rawurlencode($filename);

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$asciiFallback}\"; filename*=UTF-8''{$encodedFilename}",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($submissions, $headersMap, $branches, $departments, $employees) {
            $file = fopen('php://output', 'w');

            // UTF-8 BOM — same approach as Evaluation Results / detailed form export
            fputs($file, "\xEF\xBB\xBF");

            // Build CSV Header
            $headerRow = ['Record ID', 'Status', 'Submitted By', 'Submission Date'];
            foreach ($headersMap as $qData) {
                $headerRow[] = rtrim($qData['label'], '?'); // Clean trailing question marks
            }
            fputcsv($file, $headerRow);

            // Output Rows
            foreach ($submissions as $sub) {
                $empName = $sub->user->name ?? 'Unknown User';

                $row = [
                    '#' . $sub->id,
                    strtoupper($sub->status ?? 'PENDING'),
                    $empName,
                    $sub->created_at->format('Y-m-d H:i:s')
                ];

                $ansMap = [];
                foreach ($sub->answers as $ans) {
                    if ($ans->question && $ans->question->local_id) {
                        $ansMap[$ans->question->local_id] = clone $ans;
                    }
                }

                foreach ($headersMap as $localId => $qData) {
                    if (!isset($ansMap[$localId])) {
                        $row[] = '';
                        continue;
                    }

                    $ans = $ansMap[$localId];
                    if ($qData['type'] === 'number') {
                        $row[] = ($ans->value_text !== null && $ans->value_text !== '')
                            ? $ans->value_text
                            : ($ans->value_boolean !== null ? (string) (int) $ans->value_boolean : '');
                    } elseif ($ans->value_boolean !== null) {
                        $row[] = ($ans->value_text && $ans->value_text !== '1' && $ans->value_text !== '0')
                            ? $ans->value_text
                            : ($ans->value_boolean ? 'Yes' : 'No');
                    } else {
                        $val = trim((string) $ans->value_text);
                        if ($qData['type'] === 'branch_lookup') {
                            $val = $branches[$val] ?? $val;
                        } elseif ($qData['type'] === 'department_lookup') {
                            $val = $departments[$val] ?? $val;
                        } elseif ($qData['type'] === 'employee_lookup') {
                            $val = $employees[$val] ?? $val;
                        }

                        // Ignore huge signature payload for brevity in CSV
                        if (str_starts_with($val, 'data:image/')) {
                            $val = '[Signature Attached]';
                        }

                        $row[] = $val;
                    }
                }
                fputcsv($file, $row);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Detailed Export of all questions and answers for a given form into an Excel (.xlsx) or CSV file.
     * Supports optional fiscal year, fiscal month, date range, branch, and status filters.
     */
    public function export_detail(Request $request, Form $form)
    {
        $user = auth()->user();
        if ($form->created_by !== $user->id) {
            $hasAccess = $form->user_permissions()->where('user_id', $user->id)->where('can_view_submissions', true)->exists();
            if (!$hasAccess) {
                abort(403, 'You must be granted explicit form-level access to view/export submissions for this form.');
            }
        }

        $format = strtolower((string) $request->query('format', 'xlsx'));

        // 1. Reference lookups
        $allBranches = \App\Models\Branch::get(['id', 'name', 'branch_code', 'is_sales_generating']);
        $branchMap = $allBranches->keyBy('id');
        $branches = $allBranches->pluck('name', 'id')->toArray();
        $branchCodes = $allBranches->pluck('branch_code', 'id')->toArray();

        $departments = \App\Models\Department::pluck('name', 'id')->toArray();
        $employeeModels = \App\Models\Employee::get(['id', 'first_name', 'last_name', 'employee_code']);
        $employees = $employeeModels->mapWithKeys(function ($e) {
            $name = trim($e->first_name . ' ' . $e->last_name) ?: $e->employee_code;
            return [$e->id => $name];
        })->toArray();
        $employeeCodes = $employeeModels->pluck('employee_code', 'id')->toArray();

        $fiscalYears = \App\Models\FiscalYear::orderBy('gregorian_start_date')->get(['id', 'name', 'gregorian_start_date', 'gregorian_end_date']);
        $fiscalMonths = \App\Models\FiscalMonth::orderBy('gregorian_start_date')->get(['id', 'fiscal_year_id', 'name', 'gregorian_start_date', 'gregorian_end_date']);

        // 2. Extract all distinct questions across all versions of this form, preserving section & question order
        $sections = \App\Models\FormSection::whereHas('formVersion', function ($q) use ($form) {
                $q->where('form_id', $form->id);
            })
            ->with(['questions' => function ($q) {
                $q->orderBy('order_index')->with(['inputType', 'choices']);
            }])
            ->orderBy('order_index')
            ->get();

        $headersMap = [];
        foreach ($sections as $sec) {
            foreach ($sec->questions as $q) {
                $tId = $q->inputType?->type_identifier ?? 'text';
                if ($tId === 'title') {
                    continue; // Skip static section title elements
                }

                $key = $q->local_id ?: ('q_' . $q->id);
                if (!isset($headersMap[$key])) {
                    $choiceMap = [];
                    foreach ($q->choices as $choice) {
                        $choiceMap[(string) $choice->value] = $choice->label;
                        $choiceMap[(string) $choice->id] = $choice->label;
                    }

                    $headersMap[$key] = [
                        'id' => $q->id,
                        'local_id' => $q->local_id,
                        'label' => rtrim($q->label, '? '),
                        'type' => $tId,
                        'choices' => $choiceMap,
                    ];
                }
            }
        }

        // 3. Query submissions
        $subQuery = FormSubmission::whereHas('formVersion', function ($q) use ($form) {
                $q->where('form_id', $form->id);
            })
            ->with([
                'user:id,name,employee_id',
                'user.employee.branch:id,name,branch_code',
                'answers.question.inputType',
                'answers.question.choices',
            ])
            ->orderByDesc('created_at');

        // Apply date & status filters at query level
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        $status = $request->query('status');

        if ($startDate) {
            $subQuery->whereDate('created_at', '>=', $startDate);
        }
        if ($endDate) {
            $subQuery->whereDate('created_at', '<=', $endDate);
        }
        if ($status && $status !== 'all') {
            $subQuery->where('status', $status);
        }

        $submissions = $subQuery->get();

        // 4. Resolve branch and fiscal periods for each submission
        $fiscalYearId = $request->query('fiscal_year_id');
        $fiscalMonthId = $request->query('fiscal_month_id');
        $branchIdFilter = $request->query('branch_id');

        $rows = [];
        foreach ($submissions as $sub) {
            // Resolve branch
            $branchAns = $sub->answers->first(function ($a) {
                return ($a->question?->inputType?->type_identifier ?? '') === 'branch_lookup';
            });

            $branchId = null;
            $branchName = null;
            $branchCode = null;

            if ($branchAns && $branchAns->value_text) {
                $val = trim($branchAns->value_text);
                if (is_numeric($val) && isset($branchMap[(int) $val])) {
                    $branchId = (int) $val;
                    $branchName = $branchMap[(int) $val]->name;
                    $branchCode = $branchMap[(int) $val]->branch_code;
                } else {
                    $matched = $allBranches->first(fn($b) => strcasecmp($b->name, $val) === 0);
                    if ($matched) {
                        $branchId = $matched->id;
                        $branchName = $matched->name;
                        $branchCode = $matched->branch_code;
                    } else {
                        $branchName = $val;
                        $branchId = 'custom_' . md5($val);
                    }
                }
            }

            if (!$branchId) {
                $empBranch = $sub->user?->employee?->branch;
                if ($empBranch) {
                    $branchId = $empBranch->id;
                    $branchName = $empBranch->name;
                    $branchCode = $empBranch->branch_code;
                } else {
                    $branchId = 'unassigned';
                    $branchName = 'Unassigned';
                }
            }

            // Resolve fiscal periods
            $submittedAt = Carbon::parse($sub->created_at);
            $matchedYear = $fiscalYears->first(fn($fy) => $submittedAt->between(
                Carbon::parse($fy->gregorian_start_date),
                Carbon::parse($fy->gregorian_end_date)
            ));
            $matchedMonth = $fiscalMonths->first(fn($fm) => $submittedAt->between(
                Carbon::parse($fm->gregorian_start_date),
                Carbon::parse($fm->gregorian_end_date)
            ));

            // Apply in-memory fiscal & branch filters if requested
            if ($fiscalYearId && $fiscalYearId !== 'all') {
                if (!$matchedYear || (string) $matchedYear->id !== (string) $fiscalYearId) {
                    continue;
                }
            }

            if ($fiscalMonthId && $fiscalMonthId !== 'all') {
                if (!$matchedMonth || (string) $matchedMonth->id !== (string) $fiscalMonthId) {
                    continue;
                }
            }

            if ($branchIdFilter && $branchIdFilter !== 'all') {
                if ((string) $branchId !== (string) $branchIdFilter) {
                    continue;
                }
            }

            // Submitter details
            $submitterName = $sub->user?->name ?? 'Unknown';
            $submitterCode = $employeeCodes[$sub->user?->employee_id ?? ''] ?? '';

            // Map answers by local_id and by question_id
            $ansByLocalId = [];
            $ansByQId = [];
            foreach ($sub->answers as $ans) {
                if ($ans->question) {
                    if ($ans->question->local_id) {
                        $ansByLocalId[$ans->question->local_id] = $ans;
                    }
                    $ansByQId[$ans->question->id] = $ans;
                }
            }

            // Base row columns
            $row = [
                '#' . $sub->id,
                strtoupper($sub->status ?: 'PENDING'),
                $branchName ?? 'Unassigned',
                $branchCode ?? '',
                $submitterName,
                $submitterCode,
                $sub->created_at ? $sub->created_at->format('Y-m-d H:i:s') : '',
                $matchedYear?->name ?? '',
                $matchedMonth?->name ?? '',
            ];

            // Append each question's answer
            foreach ($headersMap as $key => $qMeta) {
                $ans = $ansByLocalId[$key] ?? ($ansByQId[$qMeta['id']] ?? null);
                if (!$ans) {
                    $row[] = '';
                    continue;
                }

                $type = $qMeta['type'];

                if ($type === 'number') {
                    $row[] = ($ans->value_text !== null && $ans->value_text !== '')
                        ? $ans->value_text
                        : ($ans->value_boolean !== null ? (string) (int) $ans->value_boolean : '');
                } elseif ($type === 'boolean') {
                    if ($ans->value_text && !in_array($ans->value_text, ['0', '1', 'yes', 'no'], true)) {
                        $row[] = $ans->value_text;
                    } else {
                        $row[] = ($ans->value_boolean !== null)
                            ? ($ans->value_boolean ? 'Yes' : 'No')
                            : ($ans->value_text === '1' ? 'Yes' : ($ans->value_text === '0' ? 'No' : $ans->value_text));
                    }
                } elseif ($type === 'branch_lookup') {
                    $val = trim((string) $ans->value_text);
                    $row[] = $branches[$val] ?? $val;
                } elseif ($type === 'department_lookup') {
                    $val = trim((string) $ans->value_text);
                    $row[] = $departments[$val] ?? $val;
                } elseif ($type === 'employee_lookup') {
                    $val = trim((string) $ans->value_text);
                    $row[] = $employees[$val] ?? $val;
                } elseif (str_starts_with((string) $ans->value_text, 'data:image/')) {
                    $row[] = '[Signature Attached]';
                } else {
                    $val = trim((string) $ans->value_text);
                    // Check if question has defined choices
                    if (!empty($qMeta['choices'])) {
                        // Check if answer is a JSON array of choice keys
                        $decodedChoices = json_decode($val, true);
                        if (is_array($decodedChoices)) {
                            $labels = array_map(fn($c) => $qMeta['choices'][(string) $c] ?? (string) $c, $decodedChoices);
                            $row[] = implode(', ', $labels);
                        } elseif (isset($qMeta['choices'][$val])) {
                            $row[] = $qMeta['choices'][$val];
                        } else {
                            $row[] = $val;
                        }
                    } else {
                        $row[] = $val;
                    }
                }
            }

            $rows[] = $row;
        }

        // 5. Header row
        $baseHeaders = [
            'Record ID',
            'Status',
            'Branch',
            'Branch Code',
            'Submitted By',
            'Employee Code',
            'Submission Date',
            'Fiscal Year',
            'Fiscal Month',
        ];

        $questionHeaders = [];
        foreach ($headersMap as $qMeta) {
            $questionHeaders[] = $qMeta['label'];
        }

        $allHeaders = array_merge($baseHeaders, $questionHeaders);

        // 6. Generate filename
        $cleanTitle = trim(preg_replace('/[\\\\\/:\*\?"<>\|]/', '_', $form->title)) ?: 'Form_' . $form->id;
        $timestamp = date('Y_m_d_His');

        // CSV export
        if ($format === 'csv') {
            $filename = "{$cleanTitle}_Detail_Submissions_{$timestamp}.csv";
            $asciiFallback = preg_replace('/[^A-Za-z0-9_\-\.]/', '_', $filename) ?: "form_{$form->id}_submissions.csv";
            $encodedFilename = rawurlencode($filename);
            $headers = [
                'Content-Type' => 'text/csv; charset=UTF-8',
                'Content-Disposition' => "attachment; filename=\"{$asciiFallback}\"; filename*=UTF-8''{$encodedFilename}",
                'Pragma' => 'no-cache',
                'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
                'Expires' => '0',
            ];

            return response()->stream(function () use ($allHeaders, $rows) {
                $file = fopen('php://output', 'w');
                // UTF-8 BOM for Excel
                fputs($file, "\xEF\xBB\xBF");
                fputcsv($file, $allHeaders);
                foreach ($rows as $row) {
                    fputcsv($file, $row);
                }
                fclose($file);
            }, 200, $headers);
        }

        // Default: Native OpenXML Excel (.xlsx) with automatic fallback to CSV
        try {
            $xlsxFilename = "{$cleanTitle}_Detail_Submissions_{$timestamp}.xlsx";
            $xlsxWriter = new SimpleXlsxWriter();
            return $xlsxWriter->download($xlsxFilename, $allHeaders, $rows, substr($cleanTitle, 0, 31));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('XLSX export failed, falling back to CSV: ' . $e->getMessage());

            $csvFilename = "{$cleanTitle}_Detail_Submissions_{$timestamp}.csv";
            $asciiFallback = preg_replace('/[^A-Za-z0-9_\-\.]/', '_', $csvFilename) ?: "form_{$form->id}_submissions.csv";
            $encodedFilename = rawurlencode($csvFilename);
            $csvHeaders = [
                'Content-Type' => 'text/csv; charset=UTF-8',
                'Content-Disposition' => "attachment; filename=\"{$asciiFallback}\"; filename*=UTF-8''{$encodedFilename}",
                'Pragma' => 'no-cache',
                'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
                'Expires' => '0',
            ];

            return response()->stream(function () use ($allHeaders, $rows) {
                $file = fopen('php://output', 'w');
                // UTF-8 BOM for Excel
                fputs($file, "\xEF\xBB\xBF");
                fputcsv($file, $allHeaders);
                foreach ($rows as $row) {
                    fputcsv($file, $row);
                }
                fclose($file);
            }, 200, $csvHeaders);
        }
    }


    /**
     * Checklists identify the assessed person with an employee lookup, not a roster.
     * The first lookup is the subject. Later lookups are sign-off names and are skipped.
     */
    private function attachLookupSubjectScore($submission, $employeesCollection): void
    {
        if (!empty($submission->employee_scores)) {
            return;
        }

        $lookup = $submission->answers
            ->filter(function ($answer) {
                $type = $answer->question?->inputType?->type_identifier ?? '';

                return $type === 'employee_lookup' && is_numeric($answer->value_text);
            })
            ->sortBy(function ($answer) {
                $sectionOrder = $answer->question?->section?->order_index ?? 9999;
                $questionOrder = $answer->question?->order_index ?? 9999;

                return sprintf('%05d-%05d-%08d', $sectionOrder, $questionOrder, $answer->id);
            })
            ->first();

        if (!$lookup) {
            return;
        }

        $employee = $employeesCollection->firstWhere('id', (int) $lookup->value_text);
        if (!$employee) {
            return;
        }

        $submission->employee_scores = [[
            'id' => $employee->id,
            'name' => trim($employee->first_name . ' ' . $employee->last_name) ?: $employee->employee_code,
            'department_id' => $employee->department_id,
            'branch_id' => $employee->branch_id,
            'percentage' => $submission->calculated_score,
        ]];
    }

    private function postAssessmentOutcome(?float $score): array
    {
        if ($score === null) {
            return [
                'status' => 'not_scored',
                'status_label' => 'Not scored',
            ];
        }

        if ($score >= 75) {
            return [
                'status' => 'pass',
                'status_label' => 'Pass',
            ];
        }

        return [
            'status' => 'fail',
            'status_label' => 'Fail',
        ];
    }

    private function nextActionLabel(string $nextAction): string
    {
        return match ($nextAction) {
            'na' => 'NA',
            'warning' => 'Warning',
            'training' => 'Training',
            'not_scored' => 'Not scored',
            default => ucfirst(str_replace('_', ' ', $nextAction)),
        };
    }
}
