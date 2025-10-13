# P2: IndexedDB Queue Persistence - Architecture Decision

**Date**: October 13, 2025  
**Status**: Architecture Planning  
**Version**: 3.2.0

---

## Problem Statement

The current save queue (v3.1) lives in React Context state (memory only). If the user refreshes the page or browser crashes, all pending operations are lost.

**Goal**: Persist queue to IndexedDB so operations survive page refreshes.

---

## Challenge: Function Serialization

### The Issue

```typescript
interface SaveOperation {
  id: string;
  entityType: string;
  entityId: string;
  operation: () => Promise<void>; // ❌ Cannot serialize functions to IndexedDB
  retries: number;
  maxRetries: number;
  timestamp: number;
}
```

IndexedDB can only store **structured clone-able data** (JSON-serializable). JavaScript functions cannot be serialized.

---

## Solution Options

### Option A: Don't Persist Operations (Current v3.1)
**Pros**: Simple, no complexity  
**Cons**: Queue lost on refresh

### Option B: Persist Metadata Only ⭐ CHOSEN
**Approach**: Store operation metadata, show user pending saves, let them manually retry

```typescript
interface PersistedQueueMetadata {
  id: string;
  entityType: string;
  entityId: string;
  retries: number;
  timestamp: number;
  description: string;
  // NO operation function - just metadata
}
```

**On page load:**
1. Load metadata from IndexedDB
2. Show notification: "You have 3 pending saves from your last session"
3. Provide "Retry All" button
4. User clicks → App reconstructs operations based on entityType/entityId
5. Queue processes normally

**Pros**: 
- User doesn't lose context
- Can manually recover
- Simple architecture

**Cons**: 
- Not fully automatic (requires user action)
- Must reconstruct operations manually

### Option C: Event Sourcing Pattern
**Approach**: Store the DATA that was being saved, not the function

```typescript
interface PersistedSaveOperation {
  id: string;
  entityType: string;
  entityId: string;
  operationData: Record<string, unknown>; // The actual data being saved
  retries: number;
  timestamp: number;
}
```

**On page load:**
1. Load persisted operations
2. Reconstruct operation functions:
   ```typescript
   const operation = () => updatePlay(op.entityId, op.operationData);
   ```
3. Auto-retry automatically

**Pros**:
- Fully automatic recovery
- No user action needed
- Survives crashes

**Cons**:
- Complex architecture
- Must capture save payloads everywhere
- Larger storage footprint

---

## Decision: Option B (Metadata Only)

### Rationale

1. **Simplicity**: Minimal code changes to existing system
2. **User Control**: Users see what's pending and choose to retry
3. **Safety**: Prevents auto-saving stale data after crashes
4. **Progressive Enhancement**: Can upgrade to Option C later if needed

### Implementation Plan

1. ✅ Create `saveQueueDB.ts` utility (done in v3.1)
2. Modify `SaveStateContext` to:
   - On queue change → Persist metadata to IndexedDB
   - On component mount → Load metadata, show notification
   - On clear queue → Clear IndexedDB
3. Create `PendingSavesNotification` component
4. Add "Retry Pending Saves" button in AppHeader

---

## Future Enhancement (v3.3+)

If we need full automatic recovery (Option C), we can:
1. Add `operationData` field to `SaveOperation`
2. Require components to pass save payloads when queueing
3. Reconstruct operations on load

Example:
```typescript
// Component code
queueSave({
  id: `play-${playId}-${Date.now()}`,
  entityType: "play",
  entityId: playId,
  operation: async () => await updatePlay(playId, updates),
  operationData: updates, // NEW: Capture payload for persistence
  retries: 0,
  maxRetries: 5,
  timestamp: Date.now(),
});
```

---

## Conclusion

**v3.2.0 Implementation**: Metadata-only persistence with manual retry  
**Status**: Ready to implement  
**Breaking Changes**: None - backward compatible
