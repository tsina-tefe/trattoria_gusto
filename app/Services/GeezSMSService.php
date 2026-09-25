<?php

namespace App\Services;

use App\Models\SmsSettings;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class GeezSMSService
{
    protected $token;
    protected $shortcodeId;
    protected $callbackUrl;
    protected $baseUrl = 'https://api.geezsms.com/api/v1';

    public function __construct()
    {
        $this->token = config('services.geezsms.token');
        $this->shortcodeId = config('services.geezsms.shortcode_id');
        $this->callbackUrl = config('services.geezsms.callback_url');
    }

    /**
     * Send SMS message using GeezSMS API
     */
    public function sendMessage(string $phoneNumber, string $message): bool
    {
        // Check if SMS is active
        if (!SmsSettings::isActive()) {
            $settings = SmsSettings::getInstance();
            Log::warning('SMS is currently deactivated', [
                'phone' => $phoneNumber,
                'reason' => $settings->deactivation_reason,
            ]);
            return false;
        }

        try {
            // Format phone number to Ethiopian format (must start with 251)
            $formattedPhone = $this->formatEthiopianPhoneNumber($phoneNumber);
            
            if (!$formattedPhone) {
                Log::error('Invalid Ethiopian phone number format', ['phone' => $phoneNumber]);
                return false;
            }

            // Prepare request data
            $data = [
                'token' => $this->token,
                'phone' => $formattedPhone,
                'msg' => mb_substr($message, 0, 335, 'UTF-8'), // Ensure message is under 335 characters and UTF-8 safe
            ];

            // Add optional shortcode_id only if it's a valid integer
            if ($this->shortcodeId && is_numeric($this->shortcodeId)) {
                $data['shortcode_id'] = (int)$this->shortcodeId;
            }

            // Add optional callback_url only if it's valid URL format
            if ($this->callbackUrl && filter_var($this->callbackUrl, FILTER_VALIDATE_URL)) {
                $data['callback'] = $this->callbackUrl;
            }

            // Send request to GeezSMS API with SSL verification disabled for development
            $response = Http::asForm()->withoutVerifying()->post("{$this->baseUrl}/sms/send", $data);

            // Check if request was successful
            if ($response->successful()) {
                $responseData = $response->json();
                
                Log::info('SMS sent successfully via GeezSMS', [
                    'phone' => $formattedPhone,
                    'message_status' => $responseData['message_status'] ?? 'unknown',
                    'api_log_id' => $responseData['api_log_id'] ?? null,
                ]);
                
                return true;
            } else {
                Log::error('Failed to send SMS via GeezSMS', [
                    'phone' => $formattedPhone,
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);
                
                return false;
            }
        } catch (\Exception $e) {
            Log::error('Exception when sending SMS via GeezSMS', [
                'error' => $e->getMessage(),
                'phone' => $phoneNumber,
            ]);
            
            return false;
        }
    }

    /**
     * Format phone number from +251 format to GeezSMS format (remove + sign)
     * Input should now always be in +2519XXXXXXXX or +2517XXXXXXXX format from database
     */
    private function formatEthiopianPhoneNumber(string $phone): ?string
    {
        // Validate input format (should be +2519XXXXXXXX or +2517XXXXXXXX)
        if (!preg_match('/^\+251[97]\d{8}$/', $phone)) {
            Log::error('Invalid Ethiopian phone number format in database', ['phone' => $phone]);
            return null;
        }
        
        // Remove the + sign for GeezSMS API
        return substr($phone, 1); // Remove the first character (+)
    }

    /**
     * Check if GeezSMS service is configured
     */
    public function isConfigured(): bool
    {
        return !empty($this->token);
    }

    /**
     * Get SMS account balance
     */
    public function getBalance(): ?array
    {
        try {
            $response = Http::withHeaders([
                'X-GeezSMS-Key' => $this->token,
            ])->withoutVerifying()->get("{$this->baseUrl}/balance");

            if ($response->successful()) {
                return $response->json();
            } else {
                Log::error('Failed to get GeezSMS balance', [
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to get GeezSMS balance', [
                'error' => $e->getMessage(),
            ]);
        }

        return null;
    }

    /**
     * Send bulk SMS messages
     */
    public function sendBulkSMS(array $contacts, string $message): bool
    {
        // Check if SMS is active
        if (!SmsSettings::isActive()) {
            $settings = SmsSettings::getInstance();
            Log::warning('Bulk SMS is currently deactivated', [
                'contact_count' => count($contacts),
                'reason' => $settings->deactivation_reason,
            ]);
            return false;
        }

        try {
            $data = [
                'token' => $this->token,
                'msg' => substr($message, 0, 335),
                'contacts' => array_map(function($contact) {
                    $formattedPhone = $this->formatEthiopianPhoneNumber($contact['phone_number']);
                    if (!$formattedPhone) {
                        Log::error('Invalid phone number for bulk SMS', ['phone' => $contact['phone_number']]);
                        return null;
                    }
                    
                    return [
                        'phone_number' => $formattedPhone,
                        'fname' => $contact['fname'] ?? null,
                        'lname' => $contact['lname'] ?? null,
                    ];
                }, array_filter($contacts)), // Filter out null phones
            ];

            if ($this->shortcodeId) {
                $data['sender_id'] = $this->shortcodeId;
            }

            if ($this->callbackUrl) {
                $data['notify_url'] = $this->callbackUrl;
            }

            $response = Http::withoutVerifying()->post("{$this->baseUrl}/sms/send/bulk", $data);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Exception when sending bulk SMS via GeezSMS', [
                'error' => $e->getMessage(),
            ]);
            
            return false;
        }
    }
}
