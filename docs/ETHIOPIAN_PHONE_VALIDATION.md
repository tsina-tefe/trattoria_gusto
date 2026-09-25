## Ethiopian Phone Number Validation

This document explains the Ethiopian phone number validation requirements for the PreOrder system.

## Phone Number Format Requirements

### User Input Format (Frontend - 9 digits only)
- **Required Input**: `9XXXXXXXX` or `7XXXXXXXX` (9 characters total)
- **Prefix**: Must start with `9` (major carriers) or `7` (Safaricom)
- **Digits**: 8 additional digits after the prefix
- **Country Code**: `+251` will be added automatically by the system

### Examples of Valid User Input
- ✅ `911223344` → Stored as `+251911223344`
- ✅ `723456789` → Stored as `+251723456789`
- ✅ `998765432` → Stored as `+251998765432`

### Examples of Invalid User Input
- ❌ `0911223344` (includes additional prefix)
- ❌ `+251911223344` (includes full country code)
- ❌ `811223344` (wrong mobile prefix - should be 9 or 7)
- ❌ `91122334` (too short)
- ❌ `9112233445` (too long)
- ❌ `91223344x` (contains non-digit characters

### Database Storage Format
- **Full Format**: `+2519XXXXXXXX` (13 characters total)
- **Example**: `+251911223344`
- **Type**: VARCHAR(13)

### GeezSMS API Format
- **API Format**: `2519XXXXXXXX` (12 characters without +)
- **Example**: `251911223344`
- **Conversion**: `+` sign removed automatically for API

## Validation Implementation

### 1. Backend Validation (Laravel)
- Custom validation rule: `App\Rules\EthiopianPhoneNumber`
- Regex pattern: `/^[97]\d{8}$/` (only validates user input)
- Applied in both `store()` and `update()` methods
- Automated conversion: `+251` prefix added automatically

### 2. Database Level
- Column length: 13 characters
- Data type: VARCHAR(13)
- Stores numbers with full `+2519XXXXXXXX` format

### 3. Controller Processing
```php
// Validation: User input = "911223344"
'phone_number' => ['required', 'string', 'max:9', new EthiopianPhoneNumber]

// Automatic conversion:
$cleanedPhone = preg_replace('/[^0-9]/', '', $validated['phone_number']);
$validated['phone_number'] = '+251' . $cleanedPhone; // Result: "+251911223344"
```

### 4. GeezSMS Integration
- **Input**: `+251911223344` (from database)
- **Output**: `251911223344` (sent to GeezSMS API)
- **Conversion**: `+` sign removed automatically

## Error Messages

When invalid phone number is provided by users:
```
The phone number must be a valid Ethiopian phone number starting with 9 or 7 and followed by 8 digits (e.g., 912345678 or 712345678). The country code +251 will be added automatically.
```

## Frontend Implementation Notes

### Recommended Input Field Design
```html
<!-- Example HTML structure -->
<div class="phone-input-group">
  <label for="phone_number">Phone Number</label>
  <div class="phone-input-wrapper">
    <span class="country-prefix">+251</span>
    <input 
      type="tel" 
      id="phone_number" 
      name="phone_number" 
      maxlength="9" 
      placeholder="912345678"
      pattern="[9][0-9]{8}"
      required
    >
  </div>
  <small>Enter phone number starting with 9 (country code +251 will be added automatically)</small>
</div>

<style>
.phone-input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.country-prefix {
  padding: 8px 12px;
  background: #f5f5f5;
  border-right: 1px solid #ccc;
  font-weight: bold;
}
.phone-input-wrapper input {
  border: none;
  outline: none;
  padding: 8px;
  flex: 1;
}
</style>
```

### JavaScript Validation (Recommended)
```javascript
// Real-time validation example
document.getElementById('phone_number').addEventListener('input', function(e) {
  const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
  e.target.value = value;
  
  // Validate format
  if (!/^9\d{0,8}$/.test(value)) {
    e.target.setCustomValidity('Must start with 9 and have 9 digits total');
  } else {
    e.target.setCustomValidity('');
  }
});
```

## Migration Details

Two migrations were created:
1. `2025_12_18_170000_update_phone_number_column_for_ethiopian_format.php` - Made column nullable
2. `2025_12_18_170500_update_pre_orders_phone_column_length.php` - Set column length to 13 chars

## Testing Recommendations

### User Input Test Cases
1. **Valid Format**: `911223344` ✅ → Becomes `+251911223344`
2. **Wrong Prefix**: `811223344` ❌
3. **Too Short**: `91122334` ❌
4. **Too Long**: `9112233445` ❌
5. **Special Characters**: `9(112)233-44` ❌ (auto-cleaned to `911223344`)

### SMS Delivery Test
1. Create a test order with phone `911223344`
2. System stores as `+251911223344`
3. Update order status to "Paid"
4. SMS sent to GeezSMS with `251911223344`
5. Verify SMS reception by customer

## Benefits of This Approach

1. **User Friendly**: Users only need to input 9 digits
2. **Data Consistency**: All numbers stored in standardized format
3. **Error Prevention**: Country code ensures no missing prefixes
4. **Easy Validation**: Simple regex pattern for user input
5. **Clear Interface**: +251 prefix is always visible to users
