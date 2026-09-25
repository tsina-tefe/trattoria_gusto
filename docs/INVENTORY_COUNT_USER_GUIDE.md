# Inventory Count User Guide

## Quick Start Guide

### What's New?
The inventory count page now features **automatic saving**, **previous count display**, and **real-time validation** to make data entry faster and more reliable.

---

## Creating Inventory Counts

### Step 1: Navigate to Create Page
1. Go to **Inventory Counts** from the sidebar
2. Click **Create** button
3. You'll see the enhanced inventory count creation page

### Step 2: Select Filters
Fill in the required fields at the top:

- **Branch**: Select your branch (auto-selected if you only have access to one branch)
- **Inventory Period**: Choose the active inventory period
- **Child Category**: Select the product category you want to count

💡 **Tip**: As soon as you select all three filters, the system automatically loads any previous counts for that category!

### Step 3: Enter Counts
You'll see a table with the following columns:

| Column | Description |
|--------|-------------|
| **Product Name** | Product name with min/max thresholds (if set) |
| **Previous** | Your last count for this product (if any) |
| **Count** | Input field to enter the new count |
| **Status** | Shows if your count is being saved, saved, or has an error |

#### How to Enter Counts:

1. **Type the count** in the "Count" column for each product
2. **Wait 1 second** - the system automatically saves your entry
3. **Watch the status** - you'll see a spinning icon while saving, then a green checkmark when saved

---

## Understanding Save Status Icons

| Icon | Meaning | What to Do |
|------|---------|-----------|
| 🔵 **Spinning Loader** | Saving... | Wait for it to finish |
| ✅ **Green Check** | Saved successfully | Nothing - it's saved! |
| ❌ **Red Alert** | Save failed | Read the error message and fix the issue |
| *(blank)* | No recent activity | Normal state |

---

## Understanding Previous Counts

### What is it?
When you select a category that you've counted before in the same period, the system shows your previous counts.

### How it helps:
- **See what you entered before** - helpful if you're double-checking
- **Quick reference** - compare with your new count
- **Auto-filled** - previous values are automatically filled in (you can change them)

### Example:
```
Product Name: Coffee Beans
Previous: [50.00]  ← Your last count
Count: [50.00]     ← Pre-filled, ready to update
```

---

## Validation and Error Handling

### Min/Max Thresholds

Some products have minimum and maximum count limits. These are shown below the product name:

```
Coffee Beans
Min: 10 | Max: 100
```

#### What happens if you enter an invalid value?

**If you enter a value below the minimum:**
- Input border turns **red**
- Error message appears: **"Minimum: 10"**
- Row background turns **light red**
- Count is **NOT saved**

**If you enter a value above the maximum:**
- Input border turns **red**
- Error message appears: **"Maximum: 100"**
- Row background turns **light red**
- Count is **NOT saved**

#### How to fix:
Simply **correct the value** to be within the allowed range. The red indicators will disappear and the count will auto-save.

---

## Auto-Save Feature

### How it works:
1. You type a number
2. System waits **1 second** after you stop typing
3. Count is **automatically saved** to the database
4. You see a **green checkmark** confirming it's saved

### Benefits:
- ✅ **No "Save" button needed** - just type and go
- ✅ **No data loss** - each count is saved individually
- ✅ **Continue working** - you don't have to wait
- ✅ **Overwrite protection** - updating existing counts is automatic

### When auto-save happens:
- After typing in the count field
- After 1 second of no typing activity
- Only if the value is valid (passes min/max checks)

### When auto-save does NOT happen:
- Value is blank or zero
- Value violates min/max thresholds
- You haven't selected branch, period, and category yet

---

## Finishing Your Work

### When you're done entering counts:

1. **Check the status column** - make sure all your counts show green checkmarks
2. **Fix any errors** - if you see red alerts, correct those entries
3. **Click "Go to Inventory Counts"** - this takes you back to the list view
4. **That's it!** - all your counts are already saved

### What changed?
**Before**: You had to click "Save All Counts" button to save
**Now**: Everything saves automatically as you type!

---

## Common Scenarios

### Scenario 1: Counting for the First Time
```
1. Select: Branch → Period → Category
2. Notice: "Previous" column shows "-" (no previous counts)
3. Enter: Your counts for each product
4. See: Green checkmarks as each count saves
5. Done: Click "Go to Inventory Counts"
```

### Scenario 2: Updating Previous Counts
```
1. Select: Branch → Period → Category
2. Notice: Previous counts appear and auto-fill the inputs
3. Update: Change the counts that need updating
4. See: Green checkmarks confirming updates
5. Done: Click "Go to Inventory Counts"
```

### Scenario 3: Handling Validation Errors
```
1. Enter: Count value (e.g., 150)
2. See: Red border and "Maximum: 100" error
3. Fix: Change to valid value (e.g., 95)
4. See: Border turns normal, count auto-saves
5. Continue: Move to next product
```

### Scenario 4: Network Issues
```
1. Enter: Count value
2. See: Spinning icon stays for a long time
3. Wait: Network request may be slow
4. Result: Either saves (green check) or shows error (red alert)
5. Retry: If error, correct and it auto-saves again
```

---

## Pro Tips

### 💡 Tip #1: Work at Your Own Pace
You don't need to rush or wait for saves. Type naturally, and the system keeps up with you.

### 💡 Tip #2: Watch the Status Column
The status column is your friend - it tells you exactly what's happening with each count.

### 💡 Tip #3: Use Previous Counts as Reference
Even if you're entering a different count, seeing the previous value helps you spot big changes.

### 💡 Tip #4: Fix Errors Right Away
Red borders mean that count isn't saved yet. Fix it before moving on to ensure all your work is saved.

### 💡 Tip #5: Don't Worry About Duplicates
If you accidentally count the same product twice in the same period, the system automatically updates your previous count instead of creating a duplicate.

---

## Troubleshooting

### Problem: Save status stuck on "saving"
**Solution**: 
- Check your internet connection
- Refresh the page and try again
- Contact IT if the issue persists

### Problem: Previous counts not loading
**Solution**:
- Make sure you selected all three filters (Branch, Period, Category)
- Wait a moment for the data to load
- Check if you have permission to view inventory counts

### Problem: Can't enter count (input disabled)
**Solution**:
- Ensure you've selected Branch, Period, and Category
- Check if the inventory period is active
- Verify you have permission to create inventory counts

### Problem: Error message: "Cannot create inventory count for inactive period"
**Solution**:
- The selected inventory period is closed
- Contact your manager to activate the period or select a different period

### Problem: Count keeps getting rejected
**Solution**:
- Check the min/max thresholds shown under the product name
- Ensure your value is within the allowed range
- Contact your manager if the thresholds seem incorrect

---

## Frequently Asked Questions

### Q: Do I still need to click a save button?
**A:** No! Everything saves automatically as you type. Just make sure you see the green checkmarks.

### Q: What if I make a mistake?
**A:** Just correct the value in the input field. It will auto-save the corrected value after 1 second.

### Q: Can I count the same product twice?
**A:** Yes, but the system will update your previous count instead of creating a duplicate. Only the latest count is kept.

### Q: What happens to my previous counts?
**A:** They're stored in the database and shown in the "Previous" column when you count the same category again in the same period.

### Q: Can I close the page before finishing?
**A:** Yes! Each count is saved individually, so if you close the page, all counts with green checkmarks are already saved.

### Q: How do I know everything is saved?
**A:** Look at the status column - if you see green checkmarks (or blank after checkmarks disappear), those counts are saved.

### Q: What if two people count the same product?
**A:** The last person to save wins. Their count overwrites the previous one. It's best to coordinate who counts what category.

### Q: Can I count offline?
**A:** No, you need an internet connection for auto-save to work. Without internet, counts won't be saved.

---

## Need Help?

If you encounter issues not covered in this guide:
1. Take a screenshot of the error
2. Note what you were trying to do
3. Contact your IT support or system administrator

---

## Summary

**Key Takeaways:**
- ✅ Counts save automatically after 1 second
- ✅ Previous counts are shown for reference
- ✅ Green checkmarks mean saved successfully
- ✅ Red borders mean validation error (fix the value)
- ✅ No "Save All" button needed anymore
- ✅ Click "Go to Inventory Counts" when done

**The Goal:** Make inventory counting faster, easier, and more reliable!
