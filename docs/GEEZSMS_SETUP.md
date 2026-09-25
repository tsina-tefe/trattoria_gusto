# GeezSMS Integration for Pre-order System

This document explains how to configure SMS notifications for customers when their pre-order status is changed to "Paid" using GeezSMS API.

## Overview
When an admin updates a pre-order status to "Paid", the system sends:
1. Telegram message (existing functionality)
2. SMS notification to the customer's phone number via GeezSMS (new functionality)

## GeezSMS API Information
- **Base URL**: `https://api.geezsms.com/api/v1`
- **Send SMS Endpoint**: `/sms/send`
- **Message Limit**: Maximum 335 characters with Unicode support
- **Phone Format**: Must start with Ethiopian country code (251)

## Prerequisites

### 1. GeezSMS Account
- Sign up for GeezSMS at https://geezsms.com
- Get your API token from the API section
- Configure a shortcode or use GeezSMS default shortcode

### 2. Phone Number Requirements
- User-friendly input: Only need to enter `9XXXXXXXX` or `7XXXXXXXX` (9 digits)
- System automatically adds `+251` country code prefix
- Database stores full format: `+2519XXXXXXXX` or `+2517XXXXXXXX`
- GeezSMS API receives: `2519XXXXXXXX` or `2517XXXXXXXX` (without +)
- Frontend shows +251 prefix as default (non-editable)
- Strict validation ensures Ethiopian mobile format for all major carriers + Safaricom

## Configuration

### 1. Environment Variables
Add the following to your `.env` file:

```env
# SMS Configuration (GeezSMS)
GEEZSMS_TOKEN=your_geezsms_api_token_here
GEEZSMS_SHORTCODE_ID=your_shortcode_id_here
GEEZSMS_CALLBACK_URL=your_callback_url_here
```

### 2. Get Your GeezSMS Credentials
1. Log in to your GeezSMS account
2. Go to API section or visit https://geezsms.com/#/api
3. Copy your API token
4. If you have a custom shortcode, note the shortcode ID
5. (Optional) Set up a callback URL for delivery notifications

### 3. Example Configuration
Replace the placeholder values in your `.env`:

```env
GEEZSMS_TOKEN=mOxwCAoZhEzyCwvMiV8Xo9QFNMuvskyn
GEEZSMS_SHORTCODE_ID=123
GEEZSMS_CALLBACK_URL=https://your-domain.com/sms-callback
```

## How It Works

### When Order Status Changes to "Paid"
1. The controller generates a Telegram message (existing)
2. The system attempts to send an SMS via GeezSMS to the customer
3. Success/failure status is logged and shown to the admin

### SMS Message Template (Optimized for 335 characters)
```
KALDIS - Order Confirmed!
Order #: PRE-20251218-0001
Hi John Doe,
Your order is PAID & confirmed.

Collection:
Day: Monday
Branch: Downtown Branch

Total: $25.50
Items: 3

Thank you!
```

### Phone Number Formatting
The system handles phone number formatting automatically:
- **User Input**: `911223344` or `723456789` (9 digits only, starting with 9 or 7)
- **Database Storage**: `+251911223344` or `+251723456789` (full format with country code)
- **GeezSMS API**: `251911223344` or `251723456789` (removes + sign for API)
- **Validation**: Ensures user input is exactly 9 digits starting with 9 or 7
- **Frontend**: Shows +251 as read-only prefix

## Testing

### Test SMS Functionality
1. Create a test pre-order with your Ethiopian phone number
2. Change the status to "Paid"
3. Check if you receive the SMS
4. Monitor logs at `storage/logs/laravel.log`

### Check Logs
SMS operations are logged:
- Success: `"SMS sent to customer via GeezSMS"`
- Failure: `"SMS sending failed via GeezSMS"`
- Errors: `"SMS notification exception via GeezSMS"`

## API Response Examples

### Success Response
```json
{
  "message_status": "success",
  "log": "async 908703ee-3898-4b45-b0e9-6fb05d7619a5",
  "phone": "25100000000",
  "message": "Test message",
  "api_log_id": 6569829
}
```

## Troubleshooting

### Common Issues

1. **SMS not sending**
   - Check your GeezSMS token in `.env`
   - Verify your GeezSMS account has sufficient balance
   - Ensure phone number is valid Ethiopian format

2. **Invalid phone number error**
   - Users only need to enter 9 digits starting with 9
   - Example valid input: `911223344`
   - System automatically adds +251 prefix
   - Invalid formats show error: "The phone number must be a valid Ethiopian phone number starting with 9 and followed by 8 digits (e.g., 912345678). The country code +251 will be added automatically."

3. **Message too long**
   - System automatically truncates messages to 335 characters
   - SMS content is optimized for Ethiopian use cases

4. **Configuration errors**
   - Ensure all GeezSMS environment variables are filled
   - Restart your application after changing `.env`

### Error Messages in Admin Interface
- `"SMS notification sent to customer successfully via GeezSMS."` - SMS sent
- `"SMS notification failed via GeezSMS. Please check GeezSMS configuration."` - Check token/balance
- `"SMS notification error via GeezSMS: [error message]"` - Detailed error info

## Advanced Features

### Bulk SMS Sending
The system supports bulk SMS via GeezSMS's bulk endpoint:

```php
$contacts = [
    ['phone_number' => '0912345678', 'fname' => 'John', 'lname' => 'Doe'],
    ['phone_number' => '0912345679', 'fname' => 'Jane', 'lname' => 'Smith'],
];

$geezSmsService = app(GeezSMSService::class);
$success = $geezSmsService->sendBulkSMS($contacts, "Your message here");
```

### Balance Checking
Check your GeezSMS account balance:

```php
$geezSmsService = app(GeezSMSService::class);
$balance = $geezSmsService->getBalance();
```

## Cost & Pricing
- **Average Cost per SMS:** ETB 0.60
- SMS charges apply per message sent
- GeezSMS offers competitive rates for Ethiopian numbers
- Monitor your GeezSMS account balance regularly
- Consider account recharge for high-volume usage
- Example: 100 SMS = ETB 60.00 approximately

## Security Notes
- Keep your GeezSMS token secure
- Never commit tokens to version control
- Use environment-specific configurations
- Consider adding webhook authentication for callback URLs

## Support
- GeezSMS API Documentation: https://geezsms.com/#/api
- For GeezSMS-specific issues, contact GeezSMS support
- For implementation issues, check Laravel logs and application configuration
