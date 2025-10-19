# 🚀 AddNewPlayModal Enhancement Plan

## Tags, Positions, and Players Schema

**Date:** October 17, 2025  
**Priority:** HIGH - Critical coaching features  
**Time:** 3-4 hours total

---

## 🎯 User Requirements (Clarified)

### **1. Play Tags (Variations)**

**Purpose:** Different variations of the same play

- Example: "IZ" base play → "IZ Bubble", "IZ Read", "IZ Screen", "IZ Alert"
- Each tag represents a tactical variation
- Coaches need unlimited variations

**Current Limitation:** Only 2 tags (p_tag1, p_tag2)  
**Fix Required:** Unlimited tag array

---

### **2. Key Positions**

**Purpose:** Map play to personnel configuration positions

- Example: "Blue" personnel (11) → Key position is "X"
- Links play design to specific personnel positions
- Validates against selected personnel configuration

**Current:** Not in database  
**Fix Required:** Add key_positions array with personnel validation

---

### **3. Key Players**

**Purpose:** Assign real roster players to key positions

- Example: "John Smith #12" assigned to "X" position
- Pull from team_players roster
- Link via UUID for roster updates

**Current:** Not in database  
**Fix Required:** Add key_players UUID array referencing team_players

---

### **4. Special Flags**

**Purpose:** Situational/tactical markers

- Examples: "Red Zone", "2-Minute", "Goal Line", "Check With Me"
- Help filter/organize plays by situation

**Current:** Not in database  
**Fix Required:** Add flags text array

---

## 📊 Database Schema Changes

### **Migration: Add Play Metadata Arrays**

```sql
-- Migration: 20251017_add_play_metadata_arrays.sql
-- Purpose: Support unlimited play variations, key positions, and player assignments

-- =====================================================
-- STEP 1: Add new array columns
-- =====================================================

ALTER TABLE plays
  -- Play variations (unlimited)
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Key positions from personnel (e.g., ["X", "Y", "Z"])
  ADD COLUMN IF NOT EXISTS key_positions TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Key players from roster (UUIDs)
  ADD COLUMN IF NOT EXISTS key_players UUID[] DEFAULT ARRAY[]::UUID[],

  -- Situational flags
  ADD COLUMN IF NOT EXISTS flags TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Metadata tracking
  ADD COLUMN IF NOT EXISTS metadata_migrated_at TIMESTAMPTZ;

-- =====================================================
-- STEP 2: Migrate existing p_tag1, p_tag2 data
-- =====================================================

-- Migrate existing play tags to new tags array
UPDATE plays
SET
  tags = ARRAY_REMOVE(ARRAY[p_tag1, p_tag2], NULL),
  metadata_migrated_at = NOW()
WHERE p_tag1 IS NOT NULL OR p_tag2 IS NOT NULL;

-- Verify migration
DO $$
DECLARE
  migrated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO migrated_count
  FROM plays
  WHERE array_length(tags, 1) > 0;

  RAISE NOTICE 'Migrated % plays with tags', migrated_count;
END $$;

-- =====================================================
-- STEP 3: Create indexes for performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_plays_tags
  ON plays USING GIN(tags)
  WHERE array_length(tags, 1) > 0;

CREATE INDEX IF NOT EXISTS idx_plays_key_positions
  ON plays USING GIN(key_positions)
  WHERE array_length(key_positions, 1) > 0;

CREATE INDEX IF NOT EXISTS idx_plays_key_players
  ON plays USING GIN(key_players)
  WHERE array_length(key_players, 1) > 0;

CREATE INDEX IF NOT EXISTS idx_plays_flags
  ON plays USING GIN(flags)
  WHERE array_length(flags, 1) > 0;

-- =====================================================
-- STEP 4: Add foreign key constraint for key_players
-- =====================================================

-- Note: We can't add a direct FK for array elements, but we can add a trigger

CREATE OR REPLACE FUNCTION validate_key_players()
RETURNS TRIGGER AS $$
DECLARE
  player_id UUID;
  invalid_count INTEGER := 0;
BEGIN
  -- Check each player UUID exists in team_players
  IF NEW.key_players IS NOT NULL THEN
    FOREACH player_id IN ARRAY NEW.key_players
    LOOP
      IF NOT EXISTS (SELECT 1 FROM team_players WHERE id = player_id) THEN
        RAISE WARNING 'Invalid player ID in key_players: %', player_id;
        invalid_count := invalid_count + 1;
      END IF;
    END LOOP;

    IF invalid_count > 0 THEN
      RAISE EXCEPTION 'Cannot save play: % invalid player IDs in key_players', invalid_count;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_key_players
  BEFORE INSERT OR UPDATE ON plays
  FOR EACH ROW
  WHEN (NEW.key_players IS NOT NULL)
  EXECUTE FUNCTION validate_key_players();

-- =====================================================
-- STEP 5: Add helper functions
-- =====================================================

-- Function to add a tag (prevents duplicates)
CREATE OR REPLACE FUNCTION add_play_tag(
  play_id UUID,
  tag TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE plays
  SET tags = array_append(tags, tag)
  WHERE id = play_id
    AND NOT (tag = ANY(tags)); -- Prevent duplicates
END;
$$ LANGUAGE plpgsql;

-- Function to remove a tag
CREATE OR REPLACE FUNCTION remove_play_tag(
  play_id UUID,
  tag TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE plays
  SET tags = array_remove(tags, tag)
  WHERE id = play_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get all unique tags across all plays
CREATE OR REPLACE FUNCTION get_all_play_tags()
RETURNS TABLE(tag TEXT, play_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT unnest(tags) as tag, COUNT(*) as play_count
  FROM plays
  WHERE array_length(tags, 1) > 0
  GROUP BY tag
  ORDER BY play_count DESC, tag;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 6: Backwards compatibility (OPTIONAL)
-- =====================================================

-- Option A: Keep p_tag1, p_tag2 for backwards compatibility (sync with triggers)
CREATE OR REPLACE FUNCTION sync_play_tags()
RETURNS TRIGGER AS $$
BEGIN
  -- When tags array changes, update p_tag1 and p_tag2
  IF NEW.tags IS NOT NULL AND array_length(NEW.tags, 1) > 0 THEN
    NEW.p_tag1 := NEW.tags[1];
    NEW.p_tag2 := CASE WHEN array_length(NEW.tags, 1) > 1 THEN NEW.tags[2] ELSE NULL END;
  ELSE
    NEW.p_tag1 := NULL;
    NEW.p_tag2 := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_play_tags
  BEFORE INSERT OR UPDATE ON plays
  FOR EACH ROW
  WHEN (NEW.tags IS DISTINCT FROM OLD.tags)
  EXECUTE FUNCTION sync_play_tags();

-- Option B: Drop old columns (RECOMMENDED after migration verified)
-- ALTER TABLE plays DROP COLUMN p_tag1, DROP COLUMN p_tag2;

-- =====================================================
-- STEP 7: Grant permissions
-- =====================================================

-- Grant usage on new columns to authenticated users
GRANT SELECT, INSERT, UPDATE ON plays TO authenticated;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check migration results
SELECT
  'tags' as column_name,
  COUNT(*) as total_plays,
  COUNT(*) FILTER (WHERE array_length(tags, 1) > 0) as plays_with_data,
  SUM(array_length(tags, 1)) as total_tags
FROM plays

UNION ALL

SELECT
  'key_positions',
  COUNT(*),
  COUNT(*) FILTER (WHERE array_length(key_positions, 1) > 0),
  SUM(array_length(key_positions, 1))
FROM plays

UNION ALL

SELECT
  'key_players',
  COUNT(*),
  COUNT(*) FILTER (WHERE array_length(key_players, 1) > 0),
  SUM(array_length(key_players, 1))
FROM plays

UNION ALL

SELECT
  'flags',
  COUNT(*),
  COUNT(*) FILTER (WHERE array_length(flags, 1) > 0),
  SUM(array_length(flags, 1))
FROM plays;

```

---

## 🔧 TypeScript Type Updates

### **Update Play Interface**

```typescript
// src/types/play.ts

export interface Play {
  // ... existing fields ...

  // =====================================================
  // ENHANCED: Metadata Arrays (Oct 17, 2025)
  // =====================================================

  // Play variations (unlimited)
  tags?: string[] | null; // ["Bubble", "Read", "Screen", "Alert"]

  // Key positions from personnel
  key_positions?: string[] | null; // ["X", "Y", "Z"] - must exist in personnel config

  // Key players from roster (UUIDs)
  key_players?: string[] | null; // ["uuid-1", "uuid-2"] - references team_players.id

  // Situational flags
  flags?: string[] | null; // ["Red Zone", "2-Minute", "Goal Line"]

  // DEPRECATED (keep for backwards compatibility, remove in future)
  p_tag1?: string;
  p_tag2?: string;
}

// Helper type for player selection
export interface KeyPlayerSelection {
  position: string; // "X", "Y", "Z" from key_positions
  player_id: string; // UUID from team_players
  player_name: string; // Display name
  jersey_number?: number; // For UI display
}
```

---

## 🎨 UI Component Updates

### **1. Tag Input Component**

```typescript
// src/components/playbook/AddNewPlayModal/TagInput.tsx

import React, { useState } from "react";
import { Icon } from "../../ui/Icon/Icon";
import { Button } from "../../ui/Button/Button";

interface TagInputProps {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (index: number) => void;
  placeholder?: string;
  label?: string;
  maxTags?: number;  // Optional limit
}

export const TagInput: React.FC<TagInputProps> = ({
  tags,
  onAdd,
  onRemove,
  placeholder = "Add tag...",
  label,
  maxTags,
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (maxTags && tags.length >= maxTags) return;
    if (tags.includes(trimmed)) return; // Prevent duplicates

    onAdd(trimmed);
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-spacing-xs">
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
          {maxTags && (
            <span className="text-xs text-text-muted ml-2">
              ({tags.length}/{maxTags} max)
            </span>
          )}
        </label>
      )}

      {/* Tag chips */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-spacing-xs mb-spacing-sm">
          {tags.map((tag, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-spacing-xs px-spacing-sm py-spacing-xs
                         bg-primary-subtle text-primary-default rounded-md text-sm"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="hover:text-primary-emphasis"
              >
                <Icon name="close" className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-spacing-xs">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={maxTags ? tags.length >= maxTags : false}
          className="flex-1 px-spacing-sm py-spacing-xs border border-border rounded-md
                     focus:ring-2 focus:ring-primary-default focus:border-transparent
                     disabled:bg-surface-muted disabled:cursor-not-allowed"
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleAdd}
          disabled={!inputValue.trim() || (maxTags ? tags.length >= maxTags : false)}
        >
          <Icon name="plus" className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
```

### **2. Key Position Selector**

```typescript
// src/components/playbook/AddNewPlayModal/KeyPositionSelector.tsx

import React from "react";
import { TagInput } from "./TagInput";

interface KeyPositionSelectorProps {
  positions: string[];
  personnelId?: string;
  availablePositions: string[];  // From selected personnel config
  onAdd: (position: string) => void;
  onRemove: (index: number) => void;
}

export const KeyPositionSelector: React.FC<KeyPositionSelectorProps> = ({
  positions,
  personnelId,
  availablePositions,
  onAdd,
  onRemove,
}) => {
  if (!personnelId || availablePositions.length === 0) {
    return (
      <div className="text-sm text-text-muted italic">
        Select personnel first to choose key positions
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-spacing-xs">
        Key Positions
        <span className="text-xs text-text-muted ml-2">
          (From {availablePositions.join(", ")})
        </span>
      </label>

      {/* Dropdown for validated positions */}
      <select
        onChange={(e) => {
          if (e.target.value && !positions.includes(e.target.value)) {
            onAdd(e.target.value);
            e.target.value = "";
          }
        }}
        className="w-full px-spacing-sm py-spacing-xs border border-border rounded-md"
      >
        <option value="">Select position...</option>
        {availablePositions
          .filter(p => !positions.includes(p))
          .map(position => (
            <option key={position} value={position}>
              {position}
            </option>
          ))
        }
      </select>

      {/* Selected positions */}
      {positions.length > 0 && (
        <div className="flex flex-wrap gap-spacing-xs mt-spacing-sm">
          {positions.map((pos, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-spacing-xs px-spacing-sm py-spacing-xs
                         bg-success-subtle text-success-default rounded-md text-sm font-medium"
            >
              <span>{pos}</span>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="hover:text-success-emphasis"
              >
                <Icon name="close" className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### **3. Key Player Selector**

```typescript
// src/components/playbook/AddNewPlayModal/KeyPlayerSelector.tsx

import React from "react";
import { Icon } from "../../ui/Icon/Icon";
import type { TeamPlayer } from "../../../types/roster";

interface KeyPlayerSelectorProps {
  selectedPlayerIds: string[];
  teamId: string;
  onAdd: (playerId: string) => void;
  onRemove: (playerId: string) => void;
}

export const KeyPlayerSelector: React.FC<KeyPlayerSelectorProps> = ({
  selectedPlayerIds,
  teamId,
  onAdd,
  onRemove,
}) => {
  // Fetch roster using existing hook
  const { data: roster = [] } = useRosterData(teamId);

  const selectedPlayers = roster.filter(p => selectedPlayerIds.includes(p.id));
  const availablePlayers = roster.filter(p => !selectedPlayerIds.includes(p.id) && p.is_active);

  return (
    <div className="space-y-spacing-sm">
      <label className="block text-sm font-medium text-text-primary">
        Key Players
        <span className="text-xs text-text-muted ml-2">
          (From team roster)
        </span>
      </label>

      {/* Player dropdown */}
      <select
        onChange={(e) => {
          if (e.target.value) {
            onAdd(e.target.value);
            e.target.value = "";
          }
        }}
        className="w-full px-spacing-sm py-spacing-xs border border-border rounded-md"
      >
        <option value="">Select player...</option>
        {availablePlayers.map(player => (
          <option key={player.id} value={player.id}>
            {player.first_name} {player.last_name}
            {player.jersey_number && ` #${player.jersey_number}`}
            {player.position && ` - ${player.position}`}
          </option>
        ))}
      </select>

      {/* Selected players */}
      {selectedPlayers.length > 0 && (
        <div className="space-y-spacing-xs">
          {selectedPlayers.map(player => (
            <div
              key={player.id}
              className="flex items-center justify-between px-spacing-sm py-spacing-xs
                         bg-surface-secondary rounded-md"
            >
              <div className="flex items-center gap-spacing-sm">
                <div className="w-8 h-8 rounded-full bg-primary-default text-white
                                flex items-center justify-center font-bold text-sm">
                  {player.jersey_number || "?"}
                </div>
                <div>
                  <div className="text-sm font-medium">
                    {player.first_name} {player.last_name}
                  </div>
                  {player.position && (
                    <div className="text-xs text-text-muted">{player.position}</div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemove(player.id)}
                className="text-text-muted hover:text-danger-default"
              >
                <Icon name="close" className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

---

## 📝 Implementation Checklist

### **Phase 1: Database Migration** (30 min)

- [ ] Create migration file: `20251017_add_play_metadata_arrays.sql`
- [ ] Test migration on dev database
- [ ] Verify existing p_tag1, p_tag2 data migrates correctly
- [ ] Run verification queries
- [ ] Document rollback plan

### **Phase 2: TypeScript Types** (15 min)

- [ ] Update `Play` interface in `src/types/play.ts`
- [ ] Add `KeyPlayerSelection` helper type
- [ ] Update form state in `usePlayFormState.ts`
- [ ] Run `npm run type-check`

### **Phase 3: UI Components** (2 hours)

- [ ] Create `TagInput.tsx` component
- [ ] Create `KeyPositionSelector.tsx` component
- [ ] Create `KeyPlayerSelector.tsx` component
- [ ] Update `AdvancedOptionsSection.tsx` to use new components
- [ ] Test each component in isolation

### **Phase 4: Form Integration** (1 hour)

- [ ] Update `usePlayFormState.ts` with new array fields
- [ ] Wire new components into `AddNewPlayModal.tsx`
- [ ] Update submit handler to send arrays
- [ ] Test full creation flow

### **Phase 5: Testing** (30 min)

- [ ] Test tag creation (unlimited)
- [ ] Test key position selection (validated against personnel)
- [ ] Test key player selection (from roster)
- [ ] Test flag creation
- [ ] Verify database saves correctly

### **Phase 6: Future Enhancements** (Later)

- [ ] Add hashtag parsing in notes (#bubble, #redzone)
- [ ] Add @ mention parsing for players (@player_name)
- [ ] Add global tag search
- [ ] Add tag autocomplete from existing plays
- [ ] Consider tag analytics (most used tags)

---

## 🎯 Success Criteria

- ✅ Coaches can add unlimited play variations (tags)
- ✅ Key positions validated against selected personnel
- ✅ Key players selected from team roster (live data)
- ✅ All data persists correctly in database
- ✅ Existing plays with p_tag1, p_tag2 migrated seamlessly
- ✅ UI is intuitive and fast

---

## 📊 Estimated Time

- Database migration: 30 min
- TypeScript updates: 15 min
- Component creation: 2 hours
- Integration: 1 hour
- Testing: 30 min

**Total: ~4 hours**

---

**Ready to implement?** This will give you full tag/position/player support with unlimited variations! 🚀
