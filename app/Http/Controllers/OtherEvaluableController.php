<?php

namespace App\Http\Controllers;

use App\Models\OtherEvaluable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class OtherEvaluableController extends Controller
{
    public function index(Request $request)
    {
        $query = OtherEvaluable::query();

        if ($request->has('search') && $request->search) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
        }

        $otherEvaluables = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('OtherEvaluables/Index', [
            'otherEvaluables' => $otherEvaluables,
            'request' => $request->only('search'),
        ]);
    }

    public function create()
    {
        return Inertia::render('OtherEvaluables/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        OtherEvaluable::create($validated);

        return Redirect::route('other-evaluables.index')->with('flash.message', 'Other Evaluable created successfully!');
    }

    public function edit(OtherEvaluable $otherEvaluable)
    {
        return Inertia::render('OtherEvaluables/Edit', [
            'otherEvaluable' => $otherEvaluable,
        ]);
    }

    public function update(Request $request, OtherEvaluable $otherEvaluable)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $otherEvaluable->update($validated);

        return Redirect::route('other-evaluables.index')->with('flash.message', 'Other Evaluable updated successfully!');
    }

    public function destroy(OtherEvaluable $otherEvaluable)
    {
        $otherEvaluable->delete();

        return Redirect::route('other-evaluables.index')->with('flash.message', 'Other Evaluable deleted successfully!');
    }
}

