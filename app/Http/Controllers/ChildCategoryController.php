<?php

namespace App\Http\Controllers;

use App\Models\ChildCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ChildCategoryController extends Controller
{
    /**
     * Display a paginated listing of the child categories.
     */
    public function index(Request $request): Response
    {
        $query = ChildCategory::query();

        if ($search = $request->query('search')) {
            $query->where(function ($subQuery) use ($search) {
                $subQuery->where('child_name', 'like', "%{$search}%")
                    ->orWhere('status', 'like', "%{$search}%");
            });
        }

        $perPage = (int) $request->query('per_page', 15);
        $perPage = $perPage > 0 ? $perPage : 15;

        $childCategories = $query->orderByDesc('id')->paginate($perPage)->withQueryString();

        return Inertia::render('child-categories/Index', [
            'childCategories' => $childCategories,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    /**
     * Show the form for creating a new child category.
     */
    public function create(): Response
    {
        return Inertia::render('child-categories/Create');
    }

    /**
     * Store a newly created child category in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'child_name' => ['required', 'string', 'max:100'],
            'status' => ['required', Rule::in(['Active', 'Inactive'])],
        ]);

        ChildCategory::create($validated);

        return redirect()->route('child-categories.index')
            ->with('success', 'Child category created successfully.');
    }

    /**
     * Show the form for editing the specified child category.
     */
    public function edit(ChildCategory $childCategory): Response
    {
        return Inertia::render('child-categories/Edit', [
            'childCategory' => $childCategory,
        ]);
    }

    /**
     * Update the specified child category in storage.
     */
    public function update(Request $request, ChildCategory $childCategory): RedirectResponse
    {
        $validated = $request->validate([
            'child_name' => ['required', 'string', 'max:100'],
            'status' => ['required', Rule::in(['Active', 'Inactive'])],
        ]);

        $childCategory->update($validated);

        return redirect()->route('child-categories.index')
            ->with('success', 'Child category updated successfully.');
    }

    /**
     * Remove the specified child category from storage.
     */
    public function destroy(ChildCategory $childCategory): RedirectResponse
    {
        $childCategory->delete();

        return redirect()->route('child-categories.index')
            ->with('success', 'Child category deleted successfully.');
    }
}


