<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class EthiopianPhoneNumber implements ValidationRule
{
    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // Remove any non-digit characters
        $cleanedPhone = preg_replace('/[^0-9]/', '', $value);
        
        // Check if it's exactly 9 digits and starts with 9 or 7
        // The +251 prefix will be added automatically by the controller
        if (!preg_match('/^[97]\d{8}$/', $cleanedPhone)) {
            $fail('The :attribute must be a valid Ethiopian phone number starting with 9 or 7 followed by 8 digits (e.g., 912345678 or 712345678). The country code +251 will be added automatically.');
        }
    }

    /**
     * Get the validation error message.
     */
    public function message(): string
    {
        return 'The :attribute must be a valid Ethiopian phone number starting with 9 or 7 followed by 8 digits (e.g., 912345678 or 712345678). The country code +251 will be added automatically.';
    }
}
