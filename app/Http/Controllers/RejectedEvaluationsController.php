<?php

namespace App\Http\Controllers;

use App\Models\EvaluationResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RejectedEvaluationsController extends Controller
{
    public function index(Request $request)
    {
        // Check permission
        if (!Auth::user()->can('view rejected evaluations')) {
            abort(403, 'You do not have permission to view rejected evaluations.');
        }

        $search = $request->query('search', '');
        $periodId = $request->query('period_id');
        if ($periodId === 'all' || $periodId === '') {
            $periodId = null;
        }

        // Fetch rejected evaluations
        $query = EvaluationResponse::query()
            ->where('status', 'rejected')
            ->with(['evaluator', 'evaluation', 'evaluationPeriod', 'questionResponses']);

        // Apply search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('evaluation', function ($qq) use ($search) {
                    $qq->where('name', 'like', "%{$search}%");
                })
                ->orWhereHas('evaluator', function ($qq) use ($search) {
                    $qq->where('name', 'like', "%{$search}%");
                })
                ->orWhereHas('evaluationPeriod', function ($qq) use ($search) {
                    $qq->where('evaluation_period_name', 'like', "%{$search}%");
                });
            });
        }

        // Apply period filter
        if ($periodId) {
            $query->where('evaluation_period_id', $periodId);
        }

        $responses = $query->latest()->paginate(10)->withQueryString();

        $items = $responses->getCollection()->map(function (EvaluationResponse $r) {
            $scores = $r->questionResponses->pluck('score');
            $avg = $scores->count() ? round($scores->avg(), 2) : null;
            
            $evaluationType = $r->evaluable_type === 'employee' ? 'Personal' : ucfirst($r->evaluable_type);
            
            // Get evaluatee name based on type
            $evaluateeName = 'N/A';
            if ($r->evaluable_type === 'employee') {
                $employee = \App\Models\Employee::find($r->evaluate_id);
                $evaluateeName = $employee ? $employee->first_name . ' ' . $employee->last_name : 'N/A';
            } elseif ($r->evaluable_type === 'department') {
                $department = \App\Models\Department::find($r->evaluate_id);
                $evaluateeName = $department ? $department->name : 'N/A';
            } elseif ($r->evaluable_type === 'branch') {
                $branch = \App\Models\Branch::find($r->evaluate_id);
                $evaluateeName = $branch ? $branch->name : 'N/A';
            } else {
                $other = \App\Models\OtherEvaluable::find($r->evaluate_id);
                $evaluateeName = $other ? $other->name : 'N/A';
            }
            
            return [
                'id' => $r->id,
                'evaluation' => [
                    'id' => $r->evaluation?->id,
                    'name' => $r->evaluation?->name,
                ],
                'evaluatee_name' => $evaluateeName,
                'evaluation_period' => $r->evaluationPeriod?->evaluation_period_name,
                'evaluator' => $r->evaluator?->name,
                'average_score' => $avg,
                'evaluation_type' => $evaluationType,
                'rejected_at' => $r->rejected_at?->toDateTimeString(),
                'rejection_reason' => $r->rejection_reason,
            ];
        });
        $responses->setCollection($items);

        $periods = \App\Models\EvaluationPeriod::select('id', 'evaluation_period_name')->orderBy('id', 'desc')->get();

        return Inertia::render('rejected-evaluations/index', [
            'items' => $responses,
            'periods' => $periods,
            'request' => $request->only('search', 'period_id'),
        ]);
    }

    public function approve(EvaluationResponse $evaluationResponse)
    {
        // Check permission
        if (!Auth::user()->can('view rejected evaluations')) {
            abort(403);
        }

        if ($evaluationResponse->status !== 'rejected') {
            return redirect()->back()->with('error', 'Only rejected evaluations can be force accepted.');
        }

        $evaluationResponse->update([
            'status' => 'accepted',
            'accepted_at' => now(),
            'rejected_at' => null,
            'rejection_reason' => null,
        ]);

        return redirect()->back()->with('success', 'Evaluation has been force accepted successfully.');
    }

    public function cancel(EvaluationResponse $evaluationResponse)
    {
        // Check permission
        if (!Auth::user()->can('view rejected evaluations')) {
            abort(403);
        }

        if ($evaluationResponse->status !== 'rejected') {
            return redirect()->back()->with('error', 'Only rejected evaluations can be cancelled.');
        }

        // Delete the evaluation response and its question responses
        $evaluationResponse->questionResponses()->delete();
        $evaluationResponse->delete();

        return redirect()->back()->with('success', 'Evaluation has been cancelled. The evaluator can now re-evaluate.');
    }
}
