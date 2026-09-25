# Offline-First Sync System Implementation

## Overview

This document describes the offline-first synchronization system implemented for the Kaldis Coffee Company Management System. The system allows users to continue working when internet connectivity is lost, with automatic synchronization when connectivity is restored.

## Architecture

### Components

1. **IndexedDB Wrapper** (`resources/js/lib/indexedDB.ts`)
   - Low-level database operations
   - Manages 4 object stores: inventory counts, evaluations, sync queue, and cached data
   - Provides CRUD operations with promise-based API

2. **Sync Queue Manager** (`resources/js/lib/syncQueue.ts`)
   - Tracks all offline operations (create/update/delete)
   - Manages sync status (pending/syncing/failed/completed)
   - Handles retry logic for failed operations

3. **Sync Service** (`resources/js/lib/syncService.ts`)
   - Background synchronization engine
   - Automatically syncs when online
   - Periodic sync checks (every 5 minutes)
   - Conflict resolution logic

4. **Offline Storage** (`resources/js/lib/offlineStorage.ts`)
   - High-level API for inventory counts and evaluations
   - Abstracts IndexedDB complexity
   - Integrates with sync queue

5. **Offline Detection** (`resources/js/hooks/use-offline.tsx`)
   - React context for offline state
   - Listens to browser online/offline events
   - Provides `isOffline` and `isOnline` states

6. **Sync Status Hook** (`resources/js/hooks/use-sync.tsx`)
   - React hook for sync status
   - Real-time pending count
   - Manual sync trigger

7. **UI Components**
   - `OfflineBanner`: Shows offline/online status
   - `SyncStatusIndicator`: Shows sync progress and pending count

8. **Backend Sync Controller** (`app/Http/Controllers/SyncController.php`)
   - Sync API endpoints
   - Conflict resolution
   - Server-side validation

## Features

### 1. Offline Data Storage

When offline, all data changes are stored locally in IndexedDB:
- Inventory counts
- Evaluation responses
- Timestamps for conflict resolution

### 2. Automatic Synchronization

The sync service automatically:
- Syncs when the device comes back online
- Performs periodic sync checks (every 5 minutes)
- Handles failed syncs with retry logic (max 5 attempts)
- Cleans up completed sync items

### 3. Conflict Resolution

When conflicts occur:
- Timestamp-based resolution (latest change wins)
- Server returns conflict status with current data
- Failed syncs are marked and can be retried

### 4. User Experience

#### Visual Indicators

**Offline Banner**
- Shows at top of page when offline
- Displays "You're offline" message with orange background
- Shows "You're back online" when reconnected (auto-hides after 3s)

**Sync Status Indicator**
- Located in app header (top-right)
- Shows current status:
  - 🟢 **Synced**: All changes synced
  - 🟡 **X Pending**: Changes waiting to sync
  - 🔵 **Syncing**: Sync in progress
  - 🟠 **Offline Mode**: Device is offline
- Manual sync button (when online with pending items)

**Inventory Count Form**
- Shows "Offline mode" notice when offline
- Save states per product:
  - ⏳ **Saving...**: Saving in progress
  - ✅ **Saved**: Successfully saved
  - ❌ **Failed**: Save failed with error message
- Different toasts for online vs offline saves

## API Endpoints

### POST `/sync/inventory-counts`

Sync inventory count from offline storage.

**Request:**
```json
{
  "type": "create|update|delete",
  "data": {
    "inventory_period_id": 1,
    "product_id": 123,
    "branch_id": 5,
    "child_category_id": 10,
    "count": 42.5,
    "unit_price": 10.00,
    "total_price": 425.00
  },
  "timestamp": 1702345678000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 456,
    "status": "created|updated|conflict"
  }
}
```

### POST `/sync/evaluations`

Sync evaluation response from offline storage.

**Request:**
```json
{
  "type": "create|update",
  "data": {
    "evaluation_id": 1,
    "evaluates_id": 5,
    "responses": [
      { "question_id": 1, "response": "4" },
      { "question_id": 2, "response": "Excellent work" }
    ]
  },
  "timestamp": 1702345678000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 789,
    "status": "created|updated|conflict"
  }
}
```

### GET `/sync/pending-count`

Get server time and pending sync info.

**Response:**
```json
{
  "pending_count": 0,
  "server_time": 1702345678000
}
```

## Database Schema

### IndexedDB Stores

**inventoryCounts**
- Key: `localId` (auto-increment)
- Indexes: `product_id`, `branch_id`, `inventory_period_id`, `synced`
- Fields: All inventory count fields + sync metadata

**evaluations**
- Key: `localId` (auto-increment)
- Indexes: `evaluation_id`, `synced`
- Fields: All evaluation fields + sync metadata

**syncQueue**
- Key: `id` (auto-increment)
- Indexes: `status`, `timestamp`
- Fields:
  ```typescript
  {
    id: number,
    type: 'create' | 'update' | 'delete',
    entity: 'inventoryCounts' | 'evaluations',
    data: any,
    timestamp: number,
    status: 'pending' | 'syncing' | 'failed' | 'completed',
    attempts: number,
    error?: string
  }
  ```

**cachedData**
- Key: `key` (string)
- Index: `timestamp`
- General-purpose cache for API responses

## Usage

### For Inventory Counts

The inventory count create page automatically uses offline storage:

```typescript
import { offlineInventory } from '@/lib/offlineStorage';
import { useOffline } from '@/hooks/use-offline';

const { isOffline } = useOffline();

// Save works both online and offline
if (isOffline) {
  await offlineInventory.saveCount(data);
  toast.success('Saved offline - will sync when online');
} else {
  await axios.post('/inventory-counts/auto-save', data);
  toast.success('Saved successfully');
}
```

### For Evaluations

Similar pattern for evaluation responses:

```typescript
import { offlineEvaluation } from '@/lib/offlineStorage';

// Save evaluation response (works offline)
await offlineEvaluation.saveResponse({
  evaluation_id: 1,
  evaluates_id: 5,
  responses: [/* ... */]
});
```

### Manual Sync Trigger

```typescript
import { useSync } from '@/hooks/use-sync';

const { manualSync, pendingCount, isSyncing } = useSync();

// Trigger manual sync
await manualSync();
```

## Implementation Details

### Initialization

The sync service is initialized in `app.tsx`:

```typescript
import { syncService } from './lib/syncService';
import { OfflineProvider } from './hooks/use-offline';

// Wrap app with OfflineProvider
<OfflineProvider>
  <App {...props} />
</OfflineProvider>

// Initialize sync service
syncService.init();
```

### Sync Flow

1. **User makes change offline**
   - Change saved to IndexedDB
   - Added to sync queue with status "pending"
   - User sees "Saved offline" message

2. **Device comes online**
   - `online` event triggers `syncAll()`
   - Sync service processes queue in order
   - Each item status updated to "syncing"

3. **Sync request sent to server**
   - POST to `/sync/inventory-counts` or `/sync/evaluations`
   - Server validates and applies change
   - Returns success or conflict status

4. **Handle response**
   - **Success**: Mark as "completed", update local data with server ID
   - **Conflict**: Mark as "failed", notify user
   - **Error**: Mark as "failed", retry later (max 5 attempts)

5. **Cleanup**
   - Remove completed items from queue
   - Update UI sync indicators
   - Dispatch `sync-completed` event

### Conflict Resolution

**Timestamp-Based Strategy:**
- Each change has a timestamp
- Server compares client timestamp with server `updated_at`
- If server is newer, return conflict status with server data
- Client can choose to accept server data or retry with force flag

**Handling Duplicates:**
- Unique constraints checked before insert
- If exists, returns conflict status
- Local data marked as synced to avoid re-sync

## Testing

### Manual Testing Checklist

#### Offline Mode
- [ ] Disconnect network
- [ ] Enter inventory count
- [ ] Verify "Saved offline" message
- [ ] Verify offline banner appears
- [ ] Verify sync status shows "Offline Mode"
- [ ] Check IndexedDB has the data
- [ ] Reconnect network
- [ ] Verify data syncs automatically
- [ ] Verify sync status shows "Synced"

#### Conflict Handling
- [ ] User A saves count offline
- [ ] User B saves same count online
- [ ] User A comes online
- [ ] Verify conflict is detected
- [ ] Verify appropriate message shown

#### Sync Queue
- [ ] Make multiple changes offline
- [ ] Verify sync queue shows all items
- [ ] Come online
- [ ] Verify all items sync in order
- [ ] Verify queue is cleared

#### Error Recovery
- [ ] Simulate network error during sync
- [ ] Verify item marked as failed
- [ ] Verify retry logic works
- [ ] Check max retry limit (5)

### Browser Testing

Test on:
- Chrome/Edge (Chromium)
- Firefox
- Safari
- Mobile browsers

### IndexedDB Inspection

**Chrome DevTools:**
1. Open DevTools (F12)
2. Go to Application tab
3. Expand IndexedDB
4. Select `KaldisOfflineDB`
5. Inspect each store

## Performance Considerations

### Optimization Strategies

1. **Debouncing**
   - Auto-save has 1-second debounce
   - Reduces sync queue size

2. **Batch Operations**
   - Sync processes items in batches
   - Reduces server requests

3. **Lazy Initialization**
   - IndexedDB opens on first use
   - Faster initial page load

4. **Cleanup**
   - Completed sync items removed
   - Prevents database bloat

### Limits

- **IndexedDB Storage**: Typically 50-100MB per origin
- **Sync Queue**: No hard limit, but cleanup after completion
- **Max Retries**: 5 attempts before giving up

## Security

### Considerations

1. **Authentication**
   - All sync endpoints require authentication
   - User ID from auth session, not client

2. **Authorization**
   - Branch restrictions enforced server-side
   - Permissions checked before sync

3. **Data Validation**
   - All data validated on server
   - Min/max thresholds enforced
   - SQL injection protection

4. **Conflict Prevention**
   - Unique constraints at database level
   - Server is source of truth

## Future Enhancements

### Planned Features

1. **Conflict Resolution UI**
   - Show both versions to user
   - Let user choose which to keep
   - Merge options for complex data

2. **Offline Caching**
   - Cache products, categories, etc.
   - Faster offline experience
   - Reduce initial data load

3. **Background Sync API**
   - Use Service Worker Background Sync
   - Sync even when tab closed
   - Better reliability

4. **Differential Sync**
   - Only sync changed fields
   - Reduce bandwidth usage
   - Faster sync times

5. **Sync History**
   - View past sync operations
   - Debug sync issues
   - Audit trail

6. **Optimistic UI**
   - Show changes immediately
   - Roll back on error
   - Faster perceived performance

## Troubleshooting

### Common Issues

**Issue: Data not syncing**
- Check browser console for errors
- Verify IndexedDB has data
- Check network connectivity
- Try manual sync button

**Issue: "Conflict" errors**
- Multiple users editing same data
- Check server timestamp vs local
- May need to refresh and re-enter

**Issue: IndexedDB quota exceeded**
- Clear old data from IndexedDB
- Implement data retention policy
- Increase quota if needed

**Issue: Sync stuck on "Syncing"**
- Network timeout occurred
- Check server logs
- Refresh page to retry

### Debug Tools

**Console Logging:**
```javascript
// Enable verbose logging
localStorage.setItem('debug-sync', 'true');

// View sync queue
db.getAll('syncQueue').then(console.log);

// View offline data
db.getAll('inventoryCounts').then(console.log);
```

**Manual Sync:**
```javascript
// Trigger manual sync from console
syncService.manualSync();
```

## Support

For issues or questions:
1. Check browser console for errors
2. Inspect IndexedDB for data
3. Check network tab for API calls
4. Review server logs for sync errors
5. Contact development team

## Conclusion

The offline-first sync system provides a robust solution for working without internet connectivity. Users can continue their work seamlessly, with automatic synchronization when online. The system handles conflicts gracefully and provides clear visual feedback throughout the process.
