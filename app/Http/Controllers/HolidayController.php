<?php

namespace App\Http\Controllers;

use App\Models\Holiday;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class HolidayController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $this->authorize('view holidays');

        $holidays = Holiday::orderByDesc('date')->get();

        return Inertia::render('holidays/index', [
            'holidays' => $holidays,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('create holidays');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'date' => 'required|date|unique:holidays,date',
            'description' => 'nullable|string',
            'status' => 'required|in:Active,Inactive',
        ]);

        Holiday::create($validated);

        return Redirect::back()->with('success', 'Holiday created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Holiday $holiday)
    {
        $this->authorize('update holidays');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'date' => 'required|date|unique:holidays,date,' . $holiday->id,
            'description' => 'nullable|string',
            'status' => 'required|in:Active,Inactive',
        ]);

        $holiday->update($validated);

        return Redirect::back()->with('success', 'Holiday updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Holiday $holiday)
    {
        $this->authorize('delete holidays');

        $holiday->delete();

        return Redirect::back()->with('success', 'Holiday deleted successfully.');
    }
}
