<?php

namespace App\Http\Controllers;

use App\Models\EvaluationType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class EvaluationTypeController extends Controller
{
    public function index(Request $request)
    {
        $query = EvaluationType::query();

        if ($request->has('search') && $request->search) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('evaluation_type', 'like', '%' . $request->search . '%');
        }

        $evaluationTypes = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('EvaluationTypes/Index', [
            'evaluationTypes' => $evaluationTypes,
            'request' => $request->only('search'),
        ]);
    }

    public function create()
    {
        return Inertia::render('EvaluationTypes/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'evaluation_type' => 'required|in:person,department,branch,other',
        ]);

        EvaluationType::create($validated);

        return Redirect::route('evaluation-types.index')->with('flash.message', 'Evaluation type created successfully!');
    }

    public function edit(EvaluationType $evaluationType)
    {
        return Inertia::render('EvaluationTypes/Edit', [
            'evaluationType' => $evaluationType,
        ]);
    }

    public function update(Request $request, EvaluationType $evaluationType)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'evaluation_type' => 'required|in:person,department,branch,other',
        ]);

        $evaluationType->update($validated);

        return Redirect::route('evaluation-types.index')->with('flash.message', 'Evaluation type updated successfully!');
    }

    public function destroy(EvaluationType $evaluationType)
    {
        $evaluationType->delete();

        return Redirect::route('evaluation-types.index')->with('flash.message', 'Evaluation type deleted successfully!');
    }
}