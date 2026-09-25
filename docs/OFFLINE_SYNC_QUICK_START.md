# Offline Sync - Quick Start Guide

## What's New?

Your Kaldis Coffee System now works offline! You can continue entering inventory counts and evaluations even without internet connection. All changes will automatically sync when you're back online.

## Key Features

✅ **Works Offline** - Enter data without internet  
✅ **Auto Sync** - Changes sync automatically when online  
✅ **Visual Indicators** - See sync status in real-time  
✅ **No Data Loss** - All changes saved locally first  
✅ **Conflict Resolution** - Handles multiple users editing same data

## Setup Instructions

### 1. Build Frontend Assets

```bash
npm install
npm run build
```

### 2. Clear Caches

```bash
php artisan route:clear
php artisan config:clear
php artisan view:clear
```

### 3. Test the Feature

1. Open your browser DevTools (F12)
2. Go to Network tab
3. Set network to "Offline"
4. Navigate to Inventory Counts → Create
5. Enter some counts
6. See "Saved offline" messages
7. Set network back to "Online"
8. Watch automatic sync

## User Guide

### Visual Indicators

**Top Banner**
- 🟠 Orange banner: You're offline
- 🟢 Green banner: Back online (auto-hides after 3s)

**Sync Status (Top Right)**
- 🟢 **Synced** - All changes saved to server
- 🟡 **X Pending** - Changes waiting to sync
- 🔵 **Syncing...** - Sync in progress  
- 🟠 **Offline Mode** - No internet connection

**Product Save States**
- ⏳ **Saving...** - Saving in progress
- ✅ **Saved** - Successfully saved
- ❌ **Failed** - Error occurred (with message)

### Manual Sync

Click the refresh button (🔄) next to sync status to manually trigger sync.

### How It Works

1. **When Offline:**
   - Your changes are saved to your browser's local storage
   - You see "Saved offline" messages
   - Orange "Offline Mode" indicator appears

2. **When Back Online:**
   - System automatically detects connection
   - Starts syncing all pending changes
   - Shows "Syncing..." status
   - Completes and shows "Synced" status

3. **If Conflicts Occur:**
   - System uses latest timestamp to resolve
   - Shows error if resolution fails
   - You can retry manually

## Browser Support

✅ Chrome 80+  
✅ Edge 80+  
✅ Firefox 75+  
✅ Safari 14+  
✅ Mobile browsers (iOS Safari, Chrome Android)

## Storage Limits

- **Typical**: 50-100 MB per browser
- **Enough for**: Thousands of inventory counts
- **Auto cleanup**: Synced data is cleaned up

## FAQ

**Q: How long does offline data last?**  
A: Until you sync or clear browser data. No time limit.

**Q: What happens if I close the browser?**  
A: Data remains in browser storage. Syncs next time you open the app.

**Q: Can multiple tabs sync at once?**  
A: Yes, sync is coordinated across tabs.

**Q: What if sync fails?**  
A: System retries up to 5 times. You can also manual sync.

**Q: Do I need to do anything special?**  
A: No! It works automatically. Just use the app normally.

## Testing Checklist

After deployment, test these scenarios:

- [ ] Create inventory count offline
- [ ] See offline banner
- [ ] See "Saved offline" message
- [ ] Reconnect and see auto-sync
- [ ] Check data appears in database
- [ ] Try manual sync button
- [ ] Test with multiple changes
- [ ] Test on mobile device

## Troubleshooting

**Problem: Not seeing offline indicators**
- Refresh page with Ctrl+F5
- Clear browser cache
- Check if service worker is registered (DevTools → Application → Service Workers)

**Problem: Data not syncing**
- Click manual sync button
- Check browser console for errors
- Verify you're online
- Check server logs

**Problem: "Conflict" errors**
- Another user may have edited the same data
- Refresh the page and try again
- Contact admin if persists

## For Developers

See detailed documentation in:
- `docs/OFFLINE_SYNC_IMPLEMENTATION.md` - Full technical details
- `resources/js/lib/` - Source code for offline functionality

## Support

For issues or questions, contact your system administrator or development team.

---

**Deployed on:** 2025-12-15  
**Version:** 1.0  
**Feature:** Offline-First Sync System
