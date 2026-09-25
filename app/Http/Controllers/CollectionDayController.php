<?php

namespace App\Http\Controllers;

use App\Models\CollectionDay;
use App\Models\Holiday;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CollectionDayController extends Controller
{
    public function index(Request $request): Response
    {
        $query = CollectionDay::query();

        if ($search = $request->query('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $perPage = (int) $request->query('per_page', 15);
        $collectionDays = $query->with('holiday')->orderBy('display_order')->orderByDesc('id')->paginate($perPage)->withQueryString();
        $holidays = Holiday::orderByDesc('date')->get(['id', 'name']);

        return Inertia::render('settings/collection-days/Index', [
            'collectionDays' => $collectionDays,
            'holidays' => $holidays,
            'filters' => [
                'search' => $request->query('search'),
                'status' => $request->query('status'),
                'per_page' => $request->query('per_page'),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('settings/collection-days/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'display_order' => ['required', 'integer', 'min:0'],
            'status' => ['required', 'in:Active,Inactive'],
            'holiday_id' => ['nullable', 'exists:holidays,id'],
        ]);

        CollectionDay::create($validated);

        return redirect()->route('collection-days.index')
            ->with('success', 'Collection day created successfully.');
    }

    public function edit(CollectionDay $collectionDay): Response
    {
        return Inertia::render('settings/collection-days/Edit', [
            'collectionDay' => $collectionDay,
        ]);
    }

    public function update(Request $request, CollectionDay $collectionDay): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'display_order' => ['required', 'integer', 'min:0'],
            'status' => ['required', 'in:Active,Inactive'],
            'holiday_id' => ['nullable', 'exists:holidays,id'],
        ]);

        $collectionDay->update($validated);

        return redirect()->route('collection-days.index')
            ->with('success', 'Collection day updated successfully.');
    }

    public function destroy(CollectionDay $collectionDay): RedirectResponse
    {
        $collectionDay->delete();

        return redirect()->route('collection-days.index')
            ->with('success', 'Collection day deleted successfully.');
    }
}
