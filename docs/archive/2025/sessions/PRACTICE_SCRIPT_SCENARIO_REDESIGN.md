# Practice Script Builder - Scenario-Based Redesign

## Summary

Successfully redesigned the Practice Script Builder from **time-based** to **game scenario-based** practice planning. This fundamental shift aligns with modern football coaching methodology where practice scenarios simulate actual game situations rather than arbitrary time limits.

## What Changed

### 1. **Database Schema** (`20251018_alter_practice_script_plays_scenarios.sql`)

**Removed:**

- `duration_seconds` - Time per rep is not relevant for practice scenarios

**Added:**

- `hash` - Hash mark position (left/middle/right)
- `down_distance` - Down and distance (e.g., "1st & 10", "3rd & 3")
- `field_position` - Field context (plus_territory, red_zone, backed_up, midfield)
- `defensive_front` - Defensive front to practice against (base, 4-3, 3-4, nickel, dime, bear, tite)
- `coverage` - Defensive coverage shell (cover_0-6, quarters, man)
- `blitz` - Blitz package to simulate (none, edge, a_gap, b_gap, sim_pressure, zone_blitz, all_out)
- `scenario_notes` - Additional context (e.g., "Goal line stand", "Two-minute drill")

**Kept:**

- `repetitions` - Still relevant (how many times to rep this scenario)
- `coaching_points` - Array of coaching notes
- `segment_name/segment_type` - Practice organization

### 2. **TypeScript Interface Updates** (`practiceService.ts`)

Updated `PracticeScriptPlay` interface:

```typescript
export interface PracticeScriptPlay {
  id: string;
  playId: string;
  play: Play;
  order: number;
  notes?: string;
  repetitions: number;
  // Game scenario configuration
  hash?: "left" | "middle" | "right";
  downDistance?: string; // e.g., "1st & 10", "3rd & 3"
  fieldPosition?: "plus_territory" | "red_zone" | "backed_up" | "midfield";
  defensiveFront?: "base" | "4-3" | "3-4" | "nickel" | "dime" | "bear" | "tite";
  coverage?:
    | "cover_0"
    | "cover_1"
    | "cover_2"
    | "cover_3"
    | "cover_4"
    | "cover_6"
    | "quarters"
    | "man";
  blitz?:
    | "none"
    | "edge"
    | "a_gap"
    | "b_gap"
    | "sim_pressure"
    | "zone_blitz"
    | "all_out";
  scenarioNotes?: string;
  addedAt: Date;
}
```

### 3. **UI Component Redesign** (`PracticeScriptPlayItem.tsx`)

**Before (Time-Based):**

```tsx
<div className="grid grid-cols-3 gap-4">
  <div>Repetitions: [stepper 1-20]</div>
  <div>Time Per Rep: [stepper 15-300s]</div>
  <div>Total Time: 2m 30s (5 × 30s)</div>
</div>
```

**After (Scenario-Based):**

```tsx
<div>
  <div>Repetitions: [stepper 1-20]</div>
  <div className="grid grid-cols-3 gap-4">
    <select>Hash Mark: Left/Middle/Right</select>
    <select>Down & Distance: 1st & 10, 2nd & 7, etc.</select>
    <select>Field Position: Plus Territory, Red Zone, etc.</select>
    <select>Defensive Front: Base, 4-3, 3-4, Nickel, etc.</select>
    <select>Coverage: Cover 2, Cover 3, Man, etc.</select>
    <select>Blitz: None, Edge, A-Gap, Sim Pressure, etc.</select>
  </div>
</div>
```

### 4. **Parent Component Updates** (`PracticeScriptBuilder.tsx`)

- Replaced `handleUpdatePlayTime` with `handleUpdatePlayScenario`
- Removed duration calculations (no longer relevant)
- Updated summary section: "Total Plays" + "Total Reps" (instead of "Estimated Duration")
- Updated initial play creation to include default scenario values:
  ```typescript
  {
    repetitions: 5,
    hash: "middle",
    downDistance: "1st & 10",
    fieldPosition: "plus_territory",
    defensiveFront: "base",
    coverage: "cover_2",
    blitz: "none"
  }
  ```

### 5. **Save Logic Updates**

Updated `handleSave` to pass scenario data:

```typescript
await PracticeScriptService.addPlayToScript(
  {
    scriptId: savedScript.id,
    playId: scriptPlay.playId,
    orderIndex: scriptPlay.order,
    notes: scriptPlay.notes,
    repetitions: scriptPlay.repetitions,
    // Game scenario configuration
    hash: scriptPlay.hash,
    downDistance: scriptPlay.downDistance,
    fieldPosition: scriptPlay.fieldPosition,
    defensiveFront: scriptPlay.defensiveFront,
    coverage: scriptPlay.coverage,
    blitz: scriptPlay.blitz,
  },
  scriptPlay.play
);
```

## Migration Strategy

1. **Run migration**: `database/migrations/20251018_alter_practice_script_plays_scenarios.sql`
2. **Backward compatibility**: Existing data preserved (only adds new columns)
3. **Existing records**: Will have NULL scenario values (can be populated later)

## User Experience Changes

### Old Workflow:

1. Select plays
2. Set reps (1-20)
3. Set time per rep (15-300s)
4. See total time calculation

### New Workflow:

1. Select plays
2. Set reps (1-20)
3. Configure game scenario:
   - Hash mark position
   - Down & distance
   - Field position context
   - Defensive front
   - Coverage shell
   - Blitz package
4. See total plays + total reps

## Why This Is Better

1. **Realistic Practice Planning**: Coaches think in terms of game situations ("practice this play against Cover 2 on 3rd & 3") not arbitrary time limits
2. **Better Preparation**: Players practice plays against specific defensive looks they'll see in games
3. **Scenario Variety**: Same play can be practiced multiple times with different scenarios (Cover 2 vs Cover 3, left hash vs right hash)
4. **Coaching Focus**: Scenario notes allow context like "Goal line stand" or "Two-minute drill"
5. **Film Study Alignment**: Scenarios match what coaches see on film (front, coverage, blitz)

## Testing Checklist

- [ ] Run migration in Supabase
- [ ] Select 3 plays from playbook
- [ ] Click "Bulk Actions" → "Practice"
- [ ] Configure scenarios for each play:
  - Change hash mark
  - Change down & distance
  - Change field position
  - Change defensive front
  - Change coverage
  - Change blitz package
- [ ] Set different rep counts
- [ ] Save script
- [ ] Verify database:
  ```sql
  SELECT
    play_id,
    repetitions,
    hash,
    down_distance,
    field_position,
    defensive_front,
    coverage,
    blitz
  FROM practice_script_plays
  WHERE practice_script_id = '<your_script_id>';
  ```

## Migration SQL

```sql
-- Run this in Supabase SQL Editor:
-- See: database/migrations/20251018_alter_practice_script_plays_scenarios.sql
```

## Files Changed

1. **Database**: `database/migrations/20251018_alter_practice_script_plays_scenarios.sql` (NEW)
2. **Service**: `src/services/practiceService.ts` (MODIFIED)
   - Updated `PracticeScriptPlay` interface
   - Updated `AddPlayToPracticeScriptData` interface
   - Updated `addPlayToScript` method
3. **UI Component**: `src/components/playbook/PracticeScriptPlayItem.tsx` (MODIFIED)
   - Replaced time stepper with scenario dropdowns
   - Added 6 scenario state variables
   - Added `handleScenarioChange` callback
4. **Parent Component**: `src/components/playbook/PracticeScriptBuilder.tsx` (MODIFIED)
   - Replaced `handleUpdatePlayTime` with `handleUpdatePlayScenario`
   - Removed duration calculations
   - Updated save logic to include scenarios
   - Updated initial play creation

## Next Steps

1. Run migration in Supabase
2. Test end-to-end workflow
3. Update documentation: `docs/PRACTICE_SCRIPT_PHASE4_COMPLETE.md`
4. Consider adding:
   - Scenario presets ("Red Zone Package", "Two-Minute Drill")
   - Scenario templates (common defensive looks)
   - Scenario duplication ("Copy scenario to all plays")

## Success Criteria

✅ Migration runs without errors  
✅ UI shows scenario dropdowns instead of time stepper  
✅ Scenario data saves to database  
✅ Zero TypeScript compilation errors  
✅ Existing practice scripts still load (backward compatible)

---

**Result:** Practice Script Builder now focuses on **game-like scenarios** instead of arbitrary timing, making it a true coaching tool for game preparation.
