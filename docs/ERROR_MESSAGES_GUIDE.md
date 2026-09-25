# Error Messages Guide - Inventory Count System

## Overview
This document outlines all user-friendly error messages in the inventory count system. Every message is designed to be clear, actionable, and helpful for end users.

---

## Principles of Good Error Messages

### 1. **Clear and Understandable**
- Use plain language, not technical jargon
- State what went wrong in simple terms
- Example: ❌ "Validation failed on count field" → ✅ "Count too low: The count must be at least 10"

### 2. **Actionable**
- Tell users what they can do to fix the problem
- Provide next steps
- Example: "Please refresh the page and try again. If the problem persists, contact support."

### 3. **Contextual**
- Include relevant information (product name, threshold values)
- Example: "✓ Count saved for Coffee Beans" instead of "Count saved"

### 4. **Visual**
- Use emojis/icons to quickly convey meaning
- ✓ = Success
- ⚠️ = Warning  
- ❌ = Error
- 🔒 = Locked/Closed
- 🚫 = Access Denied

---

## Auto-Save Error Messages

### Validation Errors

#### 1. Count Below Minimum Threshold
```
Message: "⚠️ Count too low: The count must be at least [threshold] for this product."
Details: "Please check the value and try again."
Display: Red border, inline error, toast notification
```

**What it means**: The count you entered is lower than allowed  
**What to do**: Enter a value equal to or higher than the minimum shown

---

#### 2. Count Above Maximum Threshold
```
Message: "⚠️ Count too high: The count cannot exceed [threshold] for this product."
Details: "Please check the value and try again."
Display: Red border, inline error, toast notification
```

**What it means**: The count you entered is higher than allowed  
**What to do**: Enter a value equal to or lower than the maximum shown

---

#### 3. Empty Count Value
```
Message: "Please enter a count value for [Product Name]"
Details: "Please check the value and try again."
```

**What it means**: You didn't enter a count  
**What to do**: Type a number in the count field

---

#### 4. Invalid Number Format
```
Message: "Please enter a valid number for [Product Name]"
Details: "Please check the value and try again."
```

**What it means**: You entered something that's not a number  
**What to do**: Enter only numbers (like 10, 25.5, 100)

---

#### 5. Negative Count
```
Message: "Count cannot be negative. Please enter 0 or more."
Details: "Please check the value and try again."
```

**What it means**: You entered a negative number  
**What to do**: Enter zero or a positive number

---

### Period/Permission Errors

#### 6. Inventory Period Closed
```
Message: "🔒 This inventory period is closed."
Details: "You cannot add or update counts for closed periods. Please contact your manager if you need to make changes."
Display: Toast notification with details
```

**What it means**: The inventory period is no longer active  
**What to do**: Contact your manager to reopen the period, or select a different active period

---

#### 7. Inventory Period Not Found
```
Message: "Inventory period not found."
Details: "The selected inventory period no longer exists. Please refresh the page."
Display: Toast notification with details
```

**What it means**: The period was deleted or doesn't exist  
**What to do**: Refresh the page and select a valid period

---

#### 8. Branch Access Denied
```
Message: "🚫 Access denied: You can only enter counts for your own branch."
Details: "Please contact your manager if you need access to other branches."
Display: Toast notification with details
```

**What it means**: You tried to count for a branch you don't have access to  
**What to do**: Contact your manager for permission, or count for your own branch

---

#### 9. Technical Error
```
Message: "❌ Unable to save count for [Product Name]"
Details: "A technical error occurred. Please try again in a moment. If the problem continues, contact support."
Display: Toast notification with details, error status in table
```

**What it means**: Something went wrong on the server  
**What to do**: Wait a moment and the system will auto-retry, or refresh the page

---

### Success Messages

#### 10. Count Saved Successfully
```
Message: "✓ Count saved for [Product Name]"
Display: Toast notification, green checkmark in status column
Duration: 2 seconds
```

**What it means**: Your count was successfully saved to the database  
**What to do**: Nothing! Continue entering other counts

---

#### 11. Count Updated Successfully
```
Message: "✓ Count updated for [Product Name]"
Display: Toast notification, green checkmark in status column
Duration: 2 seconds
```

**What it means**: Your previous count was successfully updated  
**What to do**: Nothing! Continue with your work

---

## Previous Counts Loading Messages

### 12. Previous Counts Found
```
Message: "Found [X] previous count(s) for this category."
Display: Success toast notification
```

**What it means**: You had previous counts and they've been loaded  
**What to do**: Review the pre-filled values and update as needed

---

### 13. No Previous Counts
```
Message: "No previous counts found. You can start entering new counts."
Display: Info toast notification
```

**What it means**: This is your first time counting this category  
**What to do**: Start entering counts for each product

---

### 14. Error Loading Previous Counts
```
Message: "Unable to load previous counts at this time."
Details: "Please refresh the page and try again. If the problem persists, contact support."
Display: Error toast with details
```

**What it means**: The system couldn't fetch your previous counts  
**What to do**: Refresh the page, or contact support if it keeps happening

---

### 15. Missing Selection Information
```
Message: "Please make sure you have selected a branch, inventory period, and product category."
Details: "Some required information is missing or invalid."
```

**What it means**: You haven't selected all required filters  
**What to do**: Select a branch, period, and category from the dropdowns

---

### 16. Previous Counts Access Denied
```
Message: "Access denied: You can only view counts for your own branch."
Details: "Please contact your manager if you need access to other branches."
```

**What it means**: You tried to view counts from another branch  
**What to do**: Select your own branch, or contact your manager for permissions

---

## Visual Status Indicators

### In the Status Column:

| State | Icon | Label | Color | Meaning |
|-------|------|-------|-------|---------|
| **Saving** | Spinning loader | "Saving..." | Blue | Count is being sent to server |
| **Saved** | Check circle | "Saved" | Green | Count was successfully saved |
| **Failed** | Alert circle | "Failed" + error message | Red | Save failed, shows why |
| **Idle** | None | - | - | No recent activity |

---

## Error Message Format

All error responses follow this consistent structure:

```json
{
    "success": false,  // Always false for errors
    "message": "User-friendly message here",  // Main message
    "details": "Additional helpful context"  // Optional extra info
}
```

### Frontend Display Strategy:
1. **Inline errors** (validation): Show below the input field
2. **Toast notifications**: Show in top-right corner for all errors/successes
3. **Status column**: Show current save state for each product
4. **All three together**: For critical validation errors

---

## Examples of Good vs. Bad Messages

### ❌ Bad Messages:
- "Error code 422"
- "Validation failed"
- "Cannot process request"
- "Undefined error"
- "Operation not permitted"

### ✅ Good Messages:
- "Count too low: The count must be at least 10 for this product"
- "This inventory period is closed. Contact your manager if you need to make changes"
- "Access denied: You can only enter counts for your own branch"
- "Count saved for Coffee Beans"
- "Unable to save count. Please try again in a moment"

---

## Message Customization by Context

### For New Users:
- More detailed explanations
- Clear next steps
- References to managers/support

### For Experienced Users:
- Concise messages
- Quick identification of issues
- Less hand-holding

### For Errors:
- Always include "what to do"
- Always be specific
- Never blame the user

---

## Testing Error Messages

### Checklist:
- [ ] Does it explain what went wrong?
- [ ] Does it tell the user what to do?
- [ ] Is it written in plain language?
- [ ] Does it avoid technical jargon?
- [ ] Is it helpful and constructive?
- [ ] Does it include relevant context (product names, values)?
- [ ] Is it consistent with other messages in the system?

---

## Common Scenarios

### Scenario 1: User enters count below minimum
```
User enters: 5
Minimum: 10

Message shown:
- Input border: Red
- Below input: "⚠️ Minimum: 10"
- Toast: "⚠️ Count too low: The count must be at least 10 for this product."
- Status column: Red alert icon with "Failed"
```

### Scenario 2: User's count saves successfully
```
User enters: 50

Message shown:
- Toast: "✓ Count saved for Coffee Beans" (2 seconds)
- Status column: Blue "Saving..." → Green "Saved" (2 seconds) → Disappears
```

### Scenario 3: Period is closed
```
User tries to save count

Message shown:
- Toast: "🔒 This inventory period is closed."
  Details: "You cannot add or update counts for closed periods. Please contact your manager if you need to make changes."
- Status column: Red alert with "Failed" + message
```

---

## Maintenance

### When Adding New Error Messages:
1. Write the message in plain English
2. Add an emoji/icon for quick recognition
3. Include "what to do" instructions
4. Test with non-technical users
5. Add to this documentation

### When Updating Error Messages:
1. Review user feedback
2. Look for patterns in support tickets
3. A/B test if possible
4. Update documentation

---

---

## Approval and Unapproval Messages

### Single Approval/Unapproval

#### 17. Successful Approval
```
Message: "✓ Count approved successfully for [Product Name]."
Display: Success toast
```

**What it means**: The inventory count has been approved  
**What to do**: Nothing! The count is now approved

---

#### 18. Successful Unapproval
```
Message: "✓ Approval removed successfully for [Product Name]."
Display: Success toast
```

**What it means**: The approval has been removed from the count  
**What to do**: Nothing! The count is now unapproved

---

#### 19. Already Approved
```
Message: "ℹ️ This count has already been approved by [Approver Name]."
Display: Error toast
```

**What it means**: Someone else already approved this count  
**What to do**: Nothing needed, or unapprove it first if you need to reapprove

---

#### 20. Not Approved
```
Message: "ℹ️ This count is not currently approved, so it cannot be unapproved."
Display: Error toast
```

**What it means**: The count isn't approved yet  
**What to do**: Nothing, or approve it first

---

#### 21. Approval Permission Denied
```
Message: "🚫 Access denied: You do not have permission to approve inventory counts. Please contact your manager if you need this access."
Display: Error toast
```

**What it means**: You don't have permission to approve counts  
**What to do**: Contact your manager to request approval permissions

---

#### 22. Closed Period (Approval)
```
Message: "🔒 Cannot approve counts from closed periods. This inventory period ([Period Name]) is no longer active."
Display: Error toast
```

**What it means**: The inventory period is closed  
**What to do**: Contact your manager if you need to approve counts from a closed period

---

### Bulk Approval/Unapproval

#### 23. Successful Bulk Approval
```
Message: "✓ Successfully approved [X] inventory count(s)"
Additional: "(Y count(s) were already approved)" if some were skipped
Display: Success toast
```

**What it means**: Multiple counts were approved successfully  
**What to do**: Nothing! All selected counts are now approved

---

#### 24. Successful Bulk Unapproval
```
Message: "✓ Successfully removed approval from [X] inventory count(s)"
Additional: "(Y count(s) were already unapproved)" if some were skipped
Display: Success toast
```

**What it means**: Multiple approvals were removed successfully  
**What to do**: Nothing! All selected counts are now unapproved

---

#### 25. No Unapproved Counts Found
```
Message: "ℹ️ No unapproved counts found. All selected counts are already approved or do not exist."
Display: Error toast
```

**What it means**: All the counts you selected are already approved  
**What to do**: Refresh the page to see the latest status

---

#### 26. No Approved Counts Found
```
Message: "ℹ️ No approved counts found. All selected counts are already unapproved or do not exist."
Display: Error toast
```

**What it means**: All the counts you selected are already unapproved  
**What to do**: Refresh the page to see the latest status

---

#### 27. Invalid Selection
```
Message: "⚠️ Invalid selection: Please select at least one count to approve/unapprove."
Display: Error toast
```

**What it means**: You didn't select any counts  
**What to do**: Select at least one count from the list

---

#### 28. Mixed Period Status
```
Message: "🔒 Cannot approve counts from closed periods: [Period Names]. Please select only counts from active periods."
Display: Error toast
```

**What it means**: Some of your selected counts are from closed periods  
**What to do**: Deselect counts from closed periods, or contact your manager

---

#### 29. Bulk Operation Error
```
Message: "❌ An error occurred while approving/unapproving counts. Please try again. If the problem persists, contact support."
Display: Error toast
```

**What it means**: A technical error occurred during the bulk operation  
**What to do**: Try again, or contact support if it keeps happening

---

## Contact for Support

If users encounter errors:
1. Take a screenshot of the error message
2. Note what they were trying to do
3. Note the product/period/category involved
4. Contact IT support or system administrator

All error messages are logged on the server for debugging by the technical team.
