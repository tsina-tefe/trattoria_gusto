# Inventory Count Auto-Save Feature

## Overview
This document describes the auto-save functionality implemented for the inventory count creation page. The system automatically saves counts as users type, shows previous counts, and provides real-time validation with attractive error handling.

## Features

### 1. Auto-Save on Input
- **Debounced Saving**: Counts are automatically saved 1 second after the user stops typing
- **No Manual Save Required**: Users no longer need to click a "Save All Counts" button
- **Individual Product Saves**: Each product count is saved independently, reducing data loss risk
- **Real-time Feedback**: Visual indicators show save status for each product

### 2. Previous Count Display
- **Automatic Loading**: When a user selects a branch, inventory period, and category, the system automatically fetches and displays previous counts
- **Pre-filled Values**: If previous counts exist, they are automatically filled in the input fields
- **Visual Badge**: Previous counts are shown in a secondary badge for easy reference
- **First-time Entry**: For products without previous counts, a dash (-) is displayed

### 3. Save Status Indicators
Each product row shows one of four states:

| State | Icon | Color | Description |
|-------|------|-------|-------------|
| **Idle** | None | - | No recent activity |
| **Saving** | Spinning Loader | Blue | Count is being saved to the server |
| **Saved** | Check Circle | Green | Count was successfully saved (displayed for 2 seconds) |
| **Error** | Alert Circle | Red | Save failed with error message |

### 4. Min/Max Validation
- **Visual Threshold Display**: Min/Max thresholds are shown below product names
- **Real-time Validation**: Input fields turn red when values violate thresholds
- **Inline Error Messages**: Clear error messages appear below invalid inputs
- **Prevents Invalid Saves**: Values outside thresholds show descriptive error messages

#### Validation Rules:
```typescript
if (value < min_count_threshold) {
    error: "Minimum: [threshold value]"
}

if (value > max_count_threshold) {
    error: "Maximum: [threshold value]"
}
```

### 5. Enhanced UI/UX

#### Table Columns:
1. **Product Name**: Shows product name with min/max thresholds
2. **Previous**: Displays previous count value (if exists)
3. **Count**: Input field for entering new count
4. **Status**: Visual save status indicator

#### Button Changes:
- **Old**: "Save All Counts" button that submitted all counts at once
- **New**: "Go to Inventory Counts" button that navigates to the list view
- **Disabled State**: Button is disabled until at least one count is entered

#### Success Notification:
A green alert box appears when counts are entered:
- Icon: Green check circle
- Message: "Your counts are being saved automatically as you type."
- Background: Light green with subtle border

### 6. Error Handling

#### Network Errors:
- Displayed inline with the save status indicator
- Shows specific error message from the server
- User can simply re-enter the value to retry

#### Validation Errors:
- Red border on input field
- Alert icon with error message below input
- Row background changes to light red
- Clear indication of what needs to be fixed

## API Endpoints

### 1. Get Previous Counts
```http
GET /inventory-counts/previous
```

**Parameters:**
- `branch_id` (required): Branch ID
- `inventory_period_id` (required): Inventory period ID
- `child_category_id` (required): Child category ID

**Response:**
```json
{
    "counts": {
        "123": {
            "id": 1,
            "product_id": 123,
            "count": "50.00",
            "product": {
                "id": 123,
                "product_name": "Product Name",
                "min_count_threshold": 10,
                "max_count_threshold": 100
            }
        }
    }
}
```

### 2. Auto-Save Count
```http
POST /inventory-counts/auto-save
```

**Body:**
```json
{
    "branch_id": 1,
    "inventory_period_id": 2,
    "child_category_id": 3,
    "product_id": 123,
    "count": 50.5
}
```

**Success Response:**
```json
{
    "message": "Count saved successfully",
    "data": { /* InventoryCount object */ },
    "action": "created" // or "updated"
}
```

**Error Response:**
```json
{
    "message": "The count must be at least 10 for this product.",
    "errors": {
        "count": ["The count must be at least 10 for this product."]
    }
}
```

## User Workflow

### Creating Counts:

1. **Select Filters**: User selects branch, inventory period, and child category
2. **Auto-Load**: System automatically fetches and displays previous counts
3. **Enter Counts**: User enters or modifies counts in the input fields
4. **Auto-Save**: System saves each count automatically after 1 second of inactivity
5. **Visual Feedback**: Save status is shown with icons (saving → saved → idle)
6. **Navigate**: User clicks "Go to Inventory Counts" to view all saved counts

### Updating Existing Counts:

1. User selects same branch, period, and category as before
2. Previous counts are automatically loaded into input fields
3. User modifies the count values
4. System automatically overwrites the existing counts
5. Success indicator confirms the update

### Handling Validation Errors:

1. User enters a value outside the threshold range
2. Input field border turns red
3. Error message appears below the input
4. Row background turns light red
5. User corrects the value
6. Colors return to normal when value is valid

## Technical Implementation

### Frontend (React/TypeScript)

**State Management:**
```typescript
const [productCounts, setProductCounts] = useState<Record<number, string>>({});
const [previousCounts, setPreviousCounts] = useState<Record<number, PreviousCount>>({});
const [saveStates, setSaveStates] = useState<Record<number, ProductSaveState>>({});
const [loadingPrevious, setLoadingPrevious] = useState(false);
```

**Debounced Auto-Save:**
```typescript
const autoSaveCount = useCallback((productId: number, value: string) => {
    // Clear existing timeout
    if (saveTimeoutRef.current[productId]) {
        clearTimeout(saveTimeoutRef.current[productId]);
    }
    
    // Set saving state
    setSaveStates(prev => ({ ...prev, [productId]: { state: 'saving' } }));
    
    // Debounce the save (1 second)
    saveTimeoutRef.current[productId] = setTimeout(() => {
        axios.post(route('inventory-counts.auto-save'), {
            // ... data
        }).then(/* handle success */).catch(/* handle error */);
    }, 1000);
}, [branchId, inventoryPeriodId, childCategoryId]);
```

**Validation:**
```typescript
const getValidationError = (product: Product, value: string): string | null => {
    if (!value || value === '') return null;
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'Invalid number';
    
    if (product.min_count_threshold !== null && numValue < product.min_count_threshold) {
        return `Minimum: ${product.min_count_threshold}`;
    }
    
    if (product.max_count_threshold !== null && numValue > product.max_count_threshold) {
        return `Maximum: ${product.max_count_threshold}`;
    }
    
    return null;
};
```

### Backend (Laravel/PHP)

**Auto-Save Controller Method:**
```php
public function autoSave(Request $request): JsonResponse
{
    // Validate input
    // Check permissions
    // Check if count exists
    
    if ($existingCount) {
        // Update existing
        $existingCount->update([...]);
        return response()->json(['action' => 'updated', ...]);
    } else {
        // Create new
        $count = InventoryCount::create([...]);
        return response()->json(['action' => 'created', ...]);
    }
}
```

**Previous Counts Method:**
```php
public function getPreviousCounts(Request $request): JsonResponse
{
    $counts = InventoryCount::where('branch_id', $branchId)
        ->where('inventory_period_id', $periodId)
        ->where('child_category_id', $categoryId)
        ->with('product:id,product_name,min_count_threshold,max_count_threshold')
        ->get()
        ->keyBy('product_id');
    
    return response()->json(['counts' => $counts]);
}
```

## Benefits

### For Users:
1. **No Data Loss**: Automatic saving prevents losing work due to browser crashes or network issues
2. **Faster Workflow**: No need to wait for all counts before saving
3. **Clear Feedback**: Always know what's saved and what has errors
4. **Context Awareness**: See previous counts while entering new ones
5. **Error Prevention**: Real-time validation prevents invalid data entry

### For System:
1. **Better Data Integrity**: Unique constraint + upsert logic prevents duplicates
2. **Reduced Load**: Individual saves instead of bulk submissions
3. **Audit Trail**: Each save updates the `updated_by` and `updated_at` fields
4. **Graceful Errors**: Validation errors don't block other counts from saving

## Future Enhancements

Potential improvements for future versions:
1. Offline support with local storage
2. Bulk import from Excel with auto-save
3. Count history view showing previous period comparisons
4. Mobile-optimized interface
5. Keyboard shortcuts for faster data entry
6. Real-time collaboration indicators
