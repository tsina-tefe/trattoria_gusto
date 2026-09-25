<?php

namespace App\Http\Controllers;

use App\Models\Evaluation;
use App\Models\EvaluationResponse;
use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EvaluatorController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        // Get evaluations where the current user is an evaluator
        $evaluations = Evaluation::query()
            ->whereHas('evaluatorGroup.employees', function ($query) use ($user) {
                $query->where('employee_id', $user->employee_id);
            })
            ->with(['evaluatorGroup', 'evaluatesGroup', 'evaluationResponses' => function ($query) use ($user) {
                $query->where('evaluator_id', $user->id);
            }])
            ->get();

        return Inertia::render('evaluator/my-evaluations', [
            'evaluations' => $evaluations,
        ]);
    }

    public function show(Request $request, Evaluation $evaluation)
    {
        $user = Auth::user()->load('employee');
        
        // Check if user is authorized to evaluate this evaluation
        $isAuthorized = $evaluation->evaluatorGroup->employees()
            ->where('employee_id', $user->employee_id)
            ->exists();

        if (!$isAuthorized) {
            abort(403, 'You are not authorized to evaluate this evaluation.');
        }

        // Get questions for this evaluation
        $questions = Question::where('evaluation_type_id', $evaluation->evaluatorGroup->questionGroup->evaluation_type_id)
            ->where('status', 'active')
            ->get();

        // Get existing response if any
        $existingResponse = EvaluationResponse::where('evaluation_id', $evaluation->id)
            ->where('evaluator_id', $user->id)
            ->with('questionResponses.question')
            ->first();

        // Check if this is a Branch Managers Evaluation
        $isBranchManagerEvaluation = stripos($evaluation->name, 'Branch Manager') !== false;
        
        // Get branch filter from query parameter
        $branchId = $request->query('branch_id');
        
        // For Branch Managers Evaluation: require branch filter to be selected
        if ($isBranchManagerEvaluation) {
            if ($branchId) {
                // Only get evaluatees if a branch is selected
                $evaluatees = $evaluation->evaluatesGroup->employees()
                    ->where('employees.branch_id', $branchId)
                    ->get();
            } else {
                // No branch selected, return empty list
                $evaluatees = collect();
            }
        } else {
            // For non-branch manager evaluations, get all evaluatees
            $evaluatees = $evaluation->evaluatesGroup->employees()->get();
        }

        // Get all branches for the filter dropdown (only for Branch Managers Evaluation)
        $branches = collect();
        if ($isBranchManagerEvaluation) {
            $branches = \App\Models\Branch::orderBy('name')->get(['id', 'name']);
        }

        return Inertia::render('evaluator/evaluation-form', [
            'evaluation' => $evaluation,
            'questions' => $questions,
            'evaluatees' => $evaluatees,
            'existingResponse' => $existingResponse,
            'branches' => $branches,
            'selectedBranchId' => $branchId,
        ]);
    }

    public function store(Request $request, Evaluation $evaluation)
    {
        $user = Auth::user();
        
        // Check if user is authorized to evaluate this evaluation
        $isAuthorized = $evaluation->evaluatorGroup->employees()
            ->where('employee_id', $user->employee_id)
            ->exists();

        if (!$isAuthorized) {
            abort(403, 'You are not authorized to evaluate this evaluation.');
        }

        $validated = $request->validate([
            'evaluate_id' => 'required|exists:users,id',
            'comment' => 'nullable|string',
            'question_responses' => 'required|array|min:1',
            'question_responses.*.question_id' => 'required|exists:questions,id',
            'question_responses.*.score' => 'required|integer|min:1|max:5',
        ]);

        // Check if response already exists
        $existingResponse = EvaluationResponse::where('evaluation_id', $evaluation->id)
            ->where('evaluator_id', $user->id)
            ->where('evaluate_id', $validated['evaluate_id'])
            ->first();

        if ($existingResponse) {
            return back()->withErrors(['evaluate_id' => 'You have already evaluated this person for this evaluation.']);
        }

        $evaluationResponse = EvaluationResponse::create([
            'evaluation_id' => $evaluation->id,
            'evaluator_id' => $user->id,
            'evaluate_id' => $validated['evaluate_id'],
            'comment' => $validated['comment'],
        ]);

        foreach ($validated['question_responses'] as $questionResponse) {
            $evaluationResponse->questionResponses()->create([
                'question_id' => $questionResponse['question_id'],
                'score' => $questionResponse['score'],
            ]);
        }

        return redirect()->route('evaluator.my-evaluations')
            ->with('message', 'Evaluation submitted successfully!');
    }

    public function update(Request $request, Evaluation $evaluation, EvaluationResponse $evaluationResponse)
    {
        $user = Auth::user();
        
        // Check if user owns this response
        if ($evaluationResponse->evaluator_id !== $user->id) {
            abort(403, 'You are not authorized to update this evaluation response.');
        }

        $validated = $request->validate([
            'evaluate_id' => 'required|exists:users,id',
            'comment' => 'nullable|string',
            'question_responses' => 'required|array|min:1',
            'question_responses.*.question_id' => 'required|exists:questions,id',
            'question_responses.*.score' => 'required|integer|min:1|max:5',
        ]);

        $evaluationResponse->update([
            'evaluate_id' => $validated['evaluate_id'],
            'comment' => $validated['comment'],
        ]);

        // Delete existing question responses and create new ones
        $evaluationResponse->questionResponses()->delete();
        foreach ($validated['question_responses'] as $questionResponse) {
            $evaluationResponse->questionResponses()->create([
                'question_id' => $questionResponse['question_id'],
                'score' => $questionResponse['score'],
            ]);
        }

        return redirect()->route('evaluator.my-evaluations')
            ->with('message', 'Evaluation updated successfully!');
    }
}
