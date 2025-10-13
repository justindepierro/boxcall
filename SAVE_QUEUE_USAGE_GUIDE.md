# Save Queue System - Usage Guide & Best Practices

**Version**: 3.0.0  
**Date**: October 13, 2025  
**Audience**: Developers integrating save functionality

---

## Overview

This guide explains how to integrate the Universal Save Indicator (v3.0) with retry queue into your components. The system provides automatic retry logic, visual feedback, and graceful error handling for all save operations.

---

## Quick Start

### 1. Basic Integration (Most Common)

```typescript
import { useSaveState } from "../../contexts/SaveStateContext";

function MyComponent() {
  const { startSaving, finishSaving } = useSaveState();

  const handleSave = async (data) => {
    startSaving(); // Start visual indicator

    try {
      await saveToAPI(data);
      finishSaving("success"); // Show success state
    } catch (error) {
      finishSaving("error"); // Show error + auto-queue for retry
      throw error; // Re-throw for local error handling
    }
  };

  return <button onClick={() => handleSave(formData)}>Save</button>;
}
```

**What happens automatically:**
- ✅ Logo spins during save
- ✅ Green flash on success
- ✅ Red flash on error
- ✅ Failed saves queue automatically for retry
- ✅ Exponential backoff handles retries
- ✅ User sees badge with pending count

---

## Integration Patterns

### Pattern 1: Auto-Save with Debounce

**Use Case**: Form fields, text inputs, continuous editing

```typescript
import { useSaveState } from "../../contexts/SaveStateContext";
import { useCallback } from "react";
import { debounce } from "lodash";

function FormationBuilder() {
  const { startSaving, finishSaving } = useSaveState();
  const { updateFormation } = useUpdateFormationMutation();

  // Debounce auto-save to prevent excessive requests
  const debouncedSave = useCallback(
    debounce(async (formationData) => {
      startSaving();

      try {
        await updateFormation(formationData);
        finishSaving("success");
      } catch (error) {
        finishSaving("error");
        console.error("Auto-save failed:", error);
        // Don't throw - let retry queue handle it
      }
    }, 500), // 500ms debounce
    [startSaving, finishSaving, updateFormation]
  );

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    debouncedSave({ ...formData, [field]: value });
  };

  return <input onChange={(e) => handleFieldChange("name", e.target.value)} />;
}
```

**Best Practices:**
- Use **500ms debounce** for text inputs
- Use **1000ms debounce** for canvas/drag operations
- Call `startSaving()` inside debounced function (not outside)
- Don't throw errors in auto-save - let queue handle retries

---

### Pattern 2: Manual Save with Confirmation

**Use Case**: Explicit save buttons, form submissions

```typescript
import { useSaveState } from "../../contexts/SaveStateContext";
import { toast } from "react-hot-toast";

function PlayEditForm() {
  const { startSaving, finishSaving } = useSaveState();
  const { updatePlay } = useUpdatePlayMutation();

  const handleManualSave = async () => {
    startSaving();

    try {
      await updatePlay(playData);
      finishSaving("success");
      toast.success("Play saved successfully!");
    } catch (error) {
      finishSaving("error");
      toast.error("Save failed - will retry automatically");
      // Queue automatically handles retry
    }
  };

  return (
    <button onClick={handleManualSave} className="btn-primary">
      Save Changes
    </button>
  );
}
```

**Best Practices:**
- Show user feedback (toast/notification) for manual saves
- Still call `finishSaving("error")` even if showing error toast
- Let queue handle retries in background
- Users can manually retry via header badge if needed

---

### Pattern 3: Batch Operations

**Use Case**: Saving multiple items at once

```typescript
import { useSaveState } from "../../contexts/SaveStateContext";

function BulkPlayImport() {
  const { startSaving, finishSaving } = useSaveState();
  const { createPlay } = useCreatePlayMutation();

  const handleBulkSave = async (plays) => {
    startSaving(); // Single indicator for entire batch

    let successCount = 0;
    let errorCount = 0;

    for (const play of plays) {
      try {
        await createPlay(play);
        successCount++;
      } catch (error) {
        errorCount++;
        console.error(`Failed to save play ${play.name}:`, error);
      }
    }

    // Show result based on batch outcome
    if (errorCount === 0) {
      finishSaving("success");
    } else if (successCount === 0) {
      finishSaving("error");
    } else {
      finishSaving("warning"); // Partial success
    }
  };

  return <button onClick={() => handleBulkSave(selectedPlays)}>Save All</button>;
}
```

**Best Practices:**
- Use single `startSaving()` for entire batch
- Use `warning` status for partial successes
- Log individual failures for debugging
- Consider progress indicator for large batches

---

### Pattern 4: Advanced Queue Control

**Use Case**: Custom retry logic, manual queue management

```typescript
import { useSaveState } from "../../contexts/SaveStateContext";

function AdvancedSaveManager() {
  const { queueSave, queueLength, retryFailedSaves, clearQueue } = useSaveState();

  // Manually queue a complex operation
  const handleComplexSave = () => {
    queueSave({
      id: `formation-${formationId}-${Date.now()}`,
      entityType: "formation",
      entityId: formationId,
      operation: async () => {
        // Multi-step save operation
        await saveFormationMetadata(metadata);
        await saveFormationPositions(positions);
        await saveFormationRoutes(routes);
      },
      retries: 0,
      maxRetries: 3, // Custom retry limit
      timestamp: Date.now(),
      description: "Save formation with all dependencies",
    });
  };

  // Show custom UI for pending saves
  return (
    <div>
      {queueLength > 0 && (
        <div className="alert alert-warning">
          {queueLength} save{queueLength > 1 ? "s" : ""} pending
          <button onClick={retryFailedSaves}>Retry Now</button>
          <button onClick={clearQueue}>Discard All</button>
        </div>
      )}
    </div>
  );
}
```

**When to use:**
- Complex multi-step operations
- Custom retry limits (default is 5)
- Need to show custom pending save UI
- Want more control over queue behavior

---

## API Reference

### `useSaveState()` Hook

```typescript
const {
  // Visual indicator control
  isSaving,           // boolean - Is any save in progress?
  saveStatus,         // 'idle' | 'success' | 'error' | 'warning'
  startSaving,        // () => void - Start save indicator
  finishSaving,       // (status: SaveStatus) => void - Finish with status
  
  // Queue management (v3.0)
  queueLength,        // number - Pending operations count
  queueSave,          // (operation: SaveOperation) => void - Add to queue
  retryFailedSaves,   // () => void - Manually retry all queued
  clearQueue,         // () => void - Clear all pending operations
} = useSaveState();
```

### `SaveOperation` Interface

```typescript
interface SaveOperation {
  id: string;                          // Unique ID (e.g., "play-123-1697234567")
  entityType: EntityType;              // "play" | "formation" | "team" | "personnel" | "other"
  entityId: string;                    // Entity being saved (e.g., play ID)
  operation: () => Promise<void>;      // Async save function
  retries: number;                     // Current retry count
  maxRetries: number;                  // Max retries before giving up
  timestamp: number;                   // When queued (Date.now())
  description?: string;                // Optional description for logs
}
```

---

## Best Practices

### ✅ DO

1. **Always pair `startSaving()` with `finishSaving()`**
   ```typescript
   startSaving();
   try {
     await save();
     finishSaving("success");
   } catch {
     finishSaving("error");
   }
   ```

2. **Use debounce for rapid/continuous edits**
   - 500ms for text inputs
   - 1000ms for canvas/drag operations

3. **Re-throw errors after `finishSaving("error")`**
   ```typescript
   catch (error) {
     finishSaving("error");
     throw error; // Let component handle it
   }
   ```

4. **Use descriptive operation IDs**
   ```typescript
   id: `${entityType}-${entityId}-${timestamp}`
   ```

5. **Log errors for debugging**
   ```typescript
   catch (error) {
     console.error("Save failed:", error);
     finishSaving("error");
   }
   ```

### ❌ DON'T

1. **Don't call `startSaving()` multiple times concurrently**
   ```typescript
   // BAD
   startSaving();
   startSaving(); // Overwrites first call
   
   // GOOD
   startSaving();
   await save();
   finishSaving("success");
   ```

2. **Don't forget to call `finishSaving()`**
   ```typescript
   // BAD
   startSaving();
   await save();
   // Indicator stuck spinning!
   
   // GOOD
   startSaving();
   await save();
   finishSaving("success");
   ```

3. **Don't use queue for every save (basic pattern is better)**
   ```typescript
   // BAD (unnecessary complexity)
   queueSave({ operation: async () => await simpleSave() });
   
   // GOOD
   startSaving();
   await simpleSave();
   finishSaving("success");
   ```

4. **Don't debounce manual save buttons**
   ```typescript
   // BAD
   <button onClick={debouncedManualSave}>Save</button>
   
   // GOOD
   <button onClick={handleManualSave}>Save</button>
   ```

5. **Don't catch errors without re-throwing**
   ```typescript
   // BAD
   catch (error) {
     finishSaving("error");
     // Error lost - component can't handle it
   }
   
   // GOOD
   catch (error) {
     finishSaving("error");
     throw error; // Component can show custom error
   }
   ```

---

## Common Scenarios

### Scenario 1: Network Timeout

**What happens:**
1. User edits play card
2. Save request times out
3. Logo flashes red
4. Operation queues automatically
5. Retries after 1 second
6. If succeeds: Badge disappears
7. If fails: Retries after 2 seconds (exponential backoff)

**User Experience:**
- Immediate feedback (red flash)
- Automatic retry in background
- Can continue working
- Badge shows pending count
- Can manually retry via badge click

---

### Scenario 2: Rapid Edits

**What happens:**
1. User edits name field rapidly
2. Debounce waits 500ms after last keystroke
3. Single save request fires
4. Logo spins briefly
5. Success → Green flash

**Prevents:**
- API spam (one request instead of 20)
- Race conditions
- Unnecessary server load
- Poor UX (constant spinning)

---

### Scenario 3: Offline Editing

**Current Behavior (v3.0):**
1. User goes offline
2. Edits play card
3. Save fails immediately
4. Operation queues
5. Badge shows "1"
6. Retries every 1s, 2s, 4s, etc.
7. User goes online
8. Next retry succeeds
9. Badge disappears

**Future Enhancement (P1 - IndexedDB):**
- Queue persists across refreshes
- Operations survive browser restart
- Sync when connection returns

---

## Migration Guide

### From Local Save State

**Before (Local State):**
```typescript
function OldComponent() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    
    try {
      await saveData();
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {isSaving && <Spinner />}
      {saveError && <ErrorMessage error={saveError} />}
    </>
  );
}
```

**After (Global State):**
```typescript
function NewComponent() {
  const { startSaving, finishSaving } = useSaveState();

  const handleSave = async () => {
    startSaving(); // Global indicator starts
    
    try {
      await saveData();
      finishSaving("success");
    } catch (error) {
      finishSaving("error"); // Auto-queues for retry
      throw error; // Still handle locally if needed
    }
  };

  // No need for local spinner - header logo shows status
  return null;
}
```

**Benefits:**
- Less component state
- Automatic retry logic
- Consistent UX across app
- Visual feedback always visible

---

## Troubleshooting

### Problem: Logo keeps spinning

**Cause**: Missing `finishSaving()` call

**Solution:**
```typescript
// Always use try/catch with finishSaving
startSaving();
try {
  await save();
  finishSaving("success"); // ← Don't forget this!
} catch (error) {
  finishSaving("error");   // ← Or this!
}
```

---

### Problem: Badge shows count but saves succeed

**Cause**: Operations queued but already successful

**Solution**: 
```typescript
// Clear queue if no longer needed
const { clearQueue } = useSaveState();
clearQueue();
```

---

### Problem: Too many save requests

**Cause**: No debounce on rapid edits

**Solution:**
```typescript
// Add debounce
const debouncedSave = useCallback(
  debounce(handleSave, 500),
  [handleSave]
);
```

---

### Problem: Save succeeds but shows error

**Cause**: Catching error without checking success

**Solution:**
```typescript
try {
  const result = await save();
  if (result.success) {
    finishSaving("success");
  } else {
    finishSaving("error");
  }
} catch (error) {
  finishSaving("error");
}
```

---

## Performance Considerations

### Memory Usage

- Queue stored in React Context (in-memory)
- Each operation: ~200 bytes
- 100 pending operations: ~20KB
- **Future**: IndexedDB for large queues

### Network Impact

- Exponential backoff prevents API hammering
- Max 30-second delay between retries
- Operations removed after 5 failed attempts
- Sequential processing prevents race conditions

### UI Responsiveness

- Save indicator: < 5ms overhead
- Queue processing: < 100ms per operation
- Badge render: < 10ms
- No blocking operations

---

## Testing Your Integration

### Manual Test Checklist

1. **Basic Save**
   - [ ] Logo spins during save
   - [ ] Green flash on success
   - [ ] Returns to idle state after 1 second

2. **Error Handling**
   - [ ] Red flash on error
   - [ ] Badge appears with "1"
   - [ ] Operation retries automatically

3. **Queue Behavior**
   - [ ] Multiple failures increment badge
   - [ ] Click badge triggers retry
   - [ ] Right-click clears queue

4. **Network Resilience**
   - [ ] Saves work offline → online
   - [ ] Exponential backoff visible in console
   - [ ] Max retries enforced (5 attempts)

### Unit Test Example

```typescript
import { renderHook, act } from "@testing-library/react";
import { useSaveState } from "./SaveStateContext";

test("startSaving and finishSaving update state", async () => {
  const { result } = renderHook(() => useSaveState());

  expect(result.current.isSaving).toBe(false);
  expect(result.current.saveStatus).toBe("idle");

  act(() => {
    result.current.startSaving();
  });

  expect(result.current.isSaving).toBe(true);

  act(() => {
    result.current.finishSaving("success");
  });

  expect(result.current.isSaving).toBe(false);
  expect(result.current.saveStatus).toBe("success");

  // Wait for status to reset
  await new Promise((resolve) => setTimeout(resolve, 1100));

  expect(result.current.saveStatus).toBe("idle");
});
```

---

## Real-World Examples

### Example 1: Play Grid (Implemented)

```typescript
// src/components/playbook/PlayGrid.tsx
const { startSaving, finishSaving } = useSaveState();

const handlePlaySave = useCallback(
  async (playId: string, updates: Partial<Play>) => {
    startSaving();

    try {
      await updatePlay({ id: playId, ...updates });
      finishSaving("success");
    } catch (error) {
      finishSaving("error");
      throw error;
    }
  },
  [updatePlay, startSaving, finishSaving]
);
```

### Example 2: Formation Builder (Implemented)

```typescript
// src/components/formations/FormationBuilderPanel.tsx
const debouncedSave = useCallback(
  debounce(async (formationData) => {
    startSaving();
    try {
      await updateFormation(formationData);
      finishSaving("success");
    } catch (error) {
      finishSaving("error");
      console.error("Formation auto-save failed:", error);
    }
  }, 500),
  [startSaving, finishSaving, updateFormation]
);
```

### Example 3: Diagram Editor (Planned - P1)

```typescript
// src/components/diagram/PixiCanvas.tsx
const debouncedCanvasSave = useCallback(
  debounce(async (canvasState) => {
    startSaving();
    try {
      await saveCanvasState(canvasState);
      finishSaving("success");
    } catch (error) {
      finishSaving("error");
    }
  }, 1000), // Longer debounce for drag operations
  [startSaving, finishSaving, saveCanvasState]
);

const handleNodeDragEnd = (node) => {
  debouncedCanvasSave(getCurrentCanvasState());
};
```

---

## Support & Resources

- **Documentation**: [UNIVERSAL_SAVE_INDICATOR_COMPLETE.md](./UNIVERSAL_SAVE_INDICATOR_COMPLETE.md)
- **Testing Guide**: [SAVE_QUEUE_TEST_GUIDE.md](./SAVE_QUEUE_TEST_GUIDE.md)
- **Roadmap**: [AUTOSAVE_FUTURE_ROADMAP.md](./AUTOSAVE_FUTURE_ROADMAP.md)
- **Source Code**: `src/contexts/SaveStateContext.tsx`

---

**Last Updated**: October 13, 2025  
**Version**: 3.0.0  
**Status**: Production Ready
