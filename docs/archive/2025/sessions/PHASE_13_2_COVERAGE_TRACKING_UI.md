# Phase 13.2: Coverage-Based Recommendations - UI Implementation

**Date**: January 2025  
**Status**: ✅ UI & Types Complete | ⏳ Scoring Logic Pending  
**Type Check**: ✅ Clean Compilation

---

## 🎯 Overview

Coaches can now track what defensive coverage the opponent showed on each play, enabling BoxCall to recommend plays that historically succeed against specific coverages.

---

## ✅ Completed Work

### 1. Database Schema (Migration 008)

Created `database/migrations/008_add_coverage_tracking.sql`:

```sql
-- Add opponent coverage tracking
ALTER TABLE play_executions
  ADD COLUMN IF NOT EXISTS opponent_coverage TEXT;

-- Add hash mark tracking (Phase 13.3)
ALTER TABLE play_executions
  ADD COLUMN IF NOT EXISTS hash_mark TEXT;

-- Constraints
ADD CONSTRAINT check_opponent_coverage
  CHECK (opponent_coverage IS NULL OR opponent_coverage IN (
    'Cover 0', 'Cover 1', 'Cover 2', 'Cover 3',
    'Cover 4', 'Cover 6', 'Man', 'Zone', 'Blitz', 'Unknown'
  ));

ADD CONSTRAINT check_hash_mark
  CHECK (hash_mark IS NULL OR hash_mark IN ('left', 'middle', 'right'));
```

**Indexes Created**:

- `idx_play_executions_coverage` (coverage column)
- `idx_play_executions_hash` (hash_mark column)
- `idx_play_executions_play_coverage` (composite for play + coverage queries)

---

### 2. Type Definitions

**New Types** (`src/types/session.ts`):

```typescript
export type OpponentCoverage =
  | "Cover 0" // Man-to-man, 0 deep safeties (blitz heavy)
  | "Cover 1" // Man-to-man, 1 deep safety (FS free)
  | "Cover 2" // 2 deep safeties, 5 underneath zones
  | "Cover 3" // 3 deep zones, 4 underneath zones
  | "Cover 4" // 4 deep zones (quarters coverage)
  | "Cover 6" // Quarter-quarter-half (hybrid)
  | "Man" // General man coverage
  | "Zone" // General zone coverage
  | "Blitz" // Blitz package
  | "Unknown"; // Coverage not identified
```

**Updated Interfaces**:

- `PlayExecution.opponentCoverage?: OpponentCoverage`
- `CreatePlayExecutionData.opponentCoverage?: OpponentCoverage`
- `GameSituation.opponentCoverage?: OpponentCoverage`

---

### 3. UI Components

#### GameSession Component

**New State**:

```typescript
const [opponentCoverage, setOpponentCoverage] =
  useState<OpponentCoverage>("Unknown");
```

**Coverage Selector UI**:

```tsx
<select
  value={opponentCoverage}
  onChange={(e) => setOpponentCoverage(e.target.value as OpponentCoverage)}
  className="w-full px-3 py-2 border border-border rounded-lg..."
>
  <option value="Unknown">Unknown</option>
  <option value="Cover 0">Cover 0 (Man, 0 deep)</option>
  <option value="Cover 1">Cover 1 (Man, 1 deep)</option>
  <option value="Cover 2">Cover 2 (2 deep, 5 under)</option>
  <option value="Cover 3">Cover 3 (3 deep, 4 under)</option>
  <option value="Cover 4">Cover 4 (Quarters)</option>
  <option value="Cover 6">Cover 6 (Quarter-Quarter-Half)</option>
  <option value="Man">Man Coverage</option>
  <option value="Zone">Zone Coverage</option>
  <option value="Blitz">Blitz</option>
</select>
```

**Location**: Added before Quick Tags section, after play result fields

---

### 4. Hooks & Services

#### useGameSession Hook

**Updated `logPlay()` signature**:

```typescript
logPlay: (
  play: GamePlanPlay,
  result: ExecutionResult,
  yardsGained: number,
  options?: {
    wasTouchdown?: boolean;
    wasTurnover?: boolean;
    wasPenalty?: boolean;
    penaltyYards?: number;
    notes?: string;
    quickTags?: string[];
    opponentCoverage?: OpponentCoverage; // Phase 13.2
  }
) => Promise<void>;
```

**Passes coverage to execution tracking**:

```typescript
await logExecution({
  // ...other fields
  opponentCoverage: options?.opponentCoverage,
});
```

#### executionTrackingService

**Updated Methods**:

1. `logExecution()` - Inserts `opponent_coverage` field
2. `bulkLogExecutions()` - Inserts `opponent_coverage` for bulk operations
3. `updateExecution()` - Allows updating `opponent_coverage`
4. `mapExecution()` - Maps `opponent_coverage` from database to PlayExecution

---

## 📊 How It Works

### User Flow

1. **Coach starts logging a play** in GameSession
2. **Identifies opponent coverage** from dropdown
3. **Logs the play** with result + yards + coverage
4. **Coverage is saved** to `play_executions.opponent_coverage`
5. **Data is ready** for coverage-specific analytics

### Data Storage

```
play_executions
├── id: "abc123"
├── play_id: "trips-right-mesh"
├── result: "success"
├── yards_gained: 12
├── opponent_coverage: "Cover 2"  ← NEW
└── ...other fields
```

---

## ⏳ Next Steps (Phase 13.2 Completion)

### 4. Coverage-Based Scoring Logic

**Extend `SituationalRecommender.calculateSituationMatch()`**:

```typescript
// Query coverage-specific stats
const coverageStats = await getPlayStatsByCoverage(
  play.id,
  teamId,
  situation.opponentCoverage
);

// Boost plays that work well vs this coverage
if (coverageStats.successRate >= 90 && coverageStats.count >= 5) {
  score += 20; // Major boost for proven plays
  reasoning.push(
    `90%+ vs ${situation.opponentCoverage} (${coverageStats.count} reps)`
  );
}
```

**Implement `getPlayStatsByCoverage()` in executionTrackingService**:

- Filter by `play_id` + `opponent_coverage`
- Calculate success rate, avg yards, execution count
- Return stats for specific coverage type

---

### 5. Display Coverage Stats

**Update PlayRecommendations component**:

```tsx
{
  /* Coverage Stats */
}
{
  recommendation.coverageStats && (
    <div className="text-xs text-text-secondary">
      <Icon name="shield" className="w-3 h-3 inline mr-1" />
      <span className="font-medium">
        {recommendation.coverageStats.successRate}% vs{" "}
        {situation.opponentCoverage}
      </span>
      <span className="text-text-tertiary ml-1">
        ({recommendation.coverageStats.count} plays)
      </span>
    </div>
  );
}
```

**Add warnings for insufficient data**:

```tsx
{
  recommendation.coverageStats.count < 3 && (
    <Typography variant="body-xs" className="text-warning">
      ⚠️ Limited data vs {situation.opponentCoverage}
    </Typography>
  );
}
```

---

## 📁 Files Modified

### Created

- `database/migrations/008_add_coverage_tracking.sql` (70 lines)

### Modified

- `src/types/session.ts` - Added OpponentCoverage type, updated PlayExecution + CreatePlayExecutionData + GameSituation
- `src/components/boxcall/GameSession.tsx` - Added coverage selector UI, state management
- `src/hooks/useGameSession.ts` - Updated logPlay signature, passed coverage to service
- `src/services/executionTrackingService.ts` - Updated insert/update/map methods for coverage

---

## 🧪 Testing

### Type Check

```bash
npm run type-check
```

✅ **Result**: Clean compilation, 0 errors

### Manual Testing

1. **Start game session**
2. **Select a play**
3. **Choose opponent coverage** from dropdown
4. **Log the play**
5. **Verify coverage saved** in database:
   ```sql
   SELECT play_id, opponent_coverage, result, yards_gained
   FROM play_executions
   ORDER BY executed_at DESC
   LIMIT 10;
   ```

---

## 💡 Design Decisions

### Coverage Types

**Why 10 types?**

- **Specifics** (Cover 0-6): Granular tracking for advanced coaching
- **Generics** (Man, Zone, Blitz): Quick logging when specific coverage unclear
- **Unknown**: Default when coverage not identified

**Why nullable?**

- Practice sessions don't have opponent coverage (practice vs scout team)
- Retroactive games may not have coverage data

### UI Placement

**Why before Quick Tags?**

- Coverage is more critical than tags (affects play success directly)
- Logical flow: Select play → Identify coverage → Execute → Log result → Add notes/tags

### Default Value

**Why "Unknown"?**

- Prevents false data (better to admit uncertainty)
- Coaches can update later if they review film

---

## 📈 Future Enhancements

### Phase 13.3 - Hash Preference Analysis

- Use `hash_mark` column (already added in migration 008)
- Calculate success rates by hash position
- Show "Best from right hash (85% vs 65% left)" in recommendations

### Phase 14 - Coverage Tendencies

- Track opponent's coverage tendencies by down/distance
- Predict likely coverage: "80% chance of Cover 2 on 2nd & long"
- Recommend plays that exploit expected coverage

### Advanced Analytics

- Coverage-specific route success rates
- Formation vs coverage matchup analysis
- Personnel grouping vs coverage correlations

---

## 🎓 Educational Notes

### Coverage Definitions

**Cover 0**: Man-to-man with zero deep help. All defenders in man coverage, often with blitz. High risk/reward for offense (explosive plays or sacks).

**Cover 1**: Man-to-man with one deep safety (free safety). Five defenders in man, FS can help deep or rob routes.

**Cover 2**: Two deep safeties split the field in halves. Five underneath defenders in zones. Vulnerable to seam routes and deep corners.

**Cover 3**: Three deep defenders (corners + FS). Four underneath zones. Balanced coverage, vulnerable to four vertical concepts.

**Cover 4**: Four deep quarters (2 safeties + 2 corners). Three underneath zones. Strong vs deep passes, vulnerable to intermediate routes.

**Cover 6**: Hybrid coverage - one side plays quarters (Cover 4), other side plays half (Cover 2). Adjusts to field/boundary strength.

---

## ✨ Impact

### For Coaches

- **Data-driven play calling**: "This play is 100% vs Cover 2 but only 45% vs Cover 3"
- **Exploit matchups**: Call plays that attack the defense they're showing
- **Learning tool**: See which plays work best against each coverage

### For BoxCall

- **Smarter recommendations**: Coverage-aware AI suggestions
- **Competitive advantage**: No other high school playbook app tracks this
- **Analytics depth**: Foundation for advanced pattern recognition

---

**Next Session**: Implement coverage-based scoring logic and display coverage stats in recommendations! 🏈
