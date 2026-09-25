<?php

namespace App\Http\Controllers;

use App\Models\SmsTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class SmsTemplateController extends Controller
{
    /**
     * Display a listing of the SMS templates.
     */
    public function index(): Response
    {
        // Require permission - using send bulk sms reminders as the default gatekeeper
        if (!auth()->check() || (!auth()->user()->can('send bulk sms reminders') && !auth()->user()->can('manage pre-order sms templates'))) {
            abort(403, 'You do not have permission to manage SMS templates.');
        }

        $templates = SmsTemplate::orderBy('name')->get();

        return Inertia::render('pre-orders/sms-templates/index', [
            'templates' => $templates,
        ]);
    }

    /**
     * Update the specified SMS template in storage.
     */
    public function update(Request $request, SmsTemplate $smsTemplate): RedirectResponse
    {
        // Require permission
        if (!auth()->check() || (!auth()->user()->can('send bulk sms reminders') && !auth()->user()->can('manage pre-order sms templates'))) {
            abort(403, 'You do not have permission to manage SMS templates.');
        }

        $validated = $request->validate([
            'content' => ['required', 'string'],
        ]);

        $smsTemplate->update([
            'content' => $validated['content'],
        ]);

        return back()->with('success', 'SMS Template updated successfully.');
    }
}
