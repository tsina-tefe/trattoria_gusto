<?php

namespace App\Http\Controllers;

use App\Models\SmsSettings;
use App\Services\GeezSMSService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SmsBalanceController extends Controller
{
    /**
     * Show SMS management page (balance + activation status)
     */
    public function index(GeezSMSService $geeSmsService): Response|JsonResponse
    {
        // Check permission
        if (!auth()->user()->can('view sms balance')) {
            abort(403, 'You do not have permission to view SMS management.');
        }

        // Get balance data
        $balance = $geeSmsService->getBalance();

        // Get SMS settings
        $smsSettings = SmsSettings::getInstance();
        $smsSettings->load('updater');

        if (request()->expectsJson()) {
            return response()->json([
                'balance' => $balance,
                'smsSettings' => $smsSettings,
            ]);
        }

        return Inertia::render('sms-balance/index', [
            'balance' => $balance,
            'smsSettings' => $smsSettings,
            'lastUpdated' => now()->format('Y-m-d H:i:s'),
            'userPermissions' => auth()->user()->getAllPermissions()->pluck('name')->toArray(),
        ]);
    }

    /**
     * Get current SMS balance (AJAX endpoint)
     */
    public function getBalance(GeezSMSService $geeSmsService): JsonResponse
    {
        // Check permission
        if (!auth()->user()->can('view sms balance')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $balance = $geeSmsService->getBalance();
        $smsSettings = SmsSettings::getInstance();

        return response()->json([
            'balance' => $balance,
            'smsSettings' => [
                'is_active' => $smsSettings->is_active,
                'deactivation_reason' => $smsSettings->deactivation_reason,
            ],
            'lastUpdated' => now()->format('Y-m-d H:i:s')
        ]);
    }

    /**
     * Activate SMS service
     */
    public function activate(): RedirectResponse
    {
        // Check permission
        if (!auth()->user()->can('manage sms settings')) {
            abort(403, 'You do not have permission to manage SMS settings.');
        }

        SmsSettings::activate(auth()->id());

        return redirect()->back()->with('success', 'SMS service has been activated successfully.');
    }

    /**
     * Deactivate SMS service
     */
    public function deactivate(Request $request): RedirectResponse
    {
        // Check permission
        if (!auth()->user()->can('manage sms settings')) {
            abort(403, 'You do not have permission to manage SMS settings.');
        }

        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        SmsSettings::deactivate($validated['reason'], auth()->id());

        return redirect()->back()->with('success', 'SMS service has been deactivated successfully.');
    }
}
