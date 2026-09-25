<?php

namespace App\Http\Controllers;

use App\Models\EvaluationType;
use App\Models\Question;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class QuestionController extends Controller
{
    public function index(Request $request)
    {
        $query = Question::with('evaluationType');

        if ($request->has('search') && $request->search) {
            $query->where('question_text', 'like', '%' . $request->search . '%')
                  ->orWhereHas('evaluationType', function ($q) use ($request) {
                      $q->where('name', 'like', '%' . $request->search . '%');
                  });
        }

        $questions = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Questions/Index', [
            'questions' => $questions,
            'request' => $request->only('search'),
        ]);
    }

    public function create()
    {
        $evaluationTypes = EvaluationType::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Questions/Create', [
            'evaluationTypes' => $evaluationTypes,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'question_text' => 'required|string',
            'evaluation_type_id' => 'required|exists:evaluation_types,id',
            'status' => 'required|in:active,inactive',
        ]);

        Question::create($validated);

        return Redirect::route('questions.index')->with('flash.message', 'Question created successfully!');
    }

    public function edit(Question $question)
    {
        $evaluationTypes = EvaluationType::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Questions/Edit', [
            'question' => $question->load('evaluationType'),
            'evaluationTypes' => $evaluationTypes,
        ]);
    }

    public function update(Request $request, Question $question)
    {
        $validated = $request->validate([
            'question_text' => 'required|string',
            'evaluation_type_id' => 'required|exists:evaluation_types,id',
            'status' => 'required|in:active,inactive',
        ]);

        $question->update($validated);

        return Redirect::route('questions.index')->with('flash.message', 'Question updated successfully!');
    }

    public function destroy(Question $question)
    {
        $question->delete();

        return Redirect::route('questions.index')->with('flash.message', 'Question deleted successfully!');
    }
}

