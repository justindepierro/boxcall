# Formation Linking: Automatic + Manual Fallback

## Overview

Formation direction system with TWO approaches:

1. **Primary (Automatic)**: System prompts to create opposite after saving ✅
2. **Fallback (Manual)**: Link formations created separately ✅

---

## Why We Need Both

### Automatic Creation (Primary Flow)

**When it works**:

- User creates formation in Formation Manager
- User has time to make decision
- Normal, deliberate creation process

**Example**:

```
User creates "Trips" → Save → Modal: "Create opposite?" → Yes → Done!
```

### Manual Linking (Fallback Flow)

**When it's needed**:

- Formation created through "New Play" modal (quick flow, no time for prompts)
- Bulk import from spreadsheet
- API/script creation
- User skipped automatic prompt initially
- Formations created before this feature existed

**Example**:

```
User adds "Trips" quickly in play modal → No prompt
Later: Opens Formation Manager → "Link Formations" tab → Sees suggestions → Links
```

---

## Tab 3: Link Formations (Simplified Design)

### Current Status Section

Shows whether formation has opposite or not:

```tsx
┌─────────────────────────────────────────────────────────────────┐
│  Formation: Trips (left)                                        │
│  Status: ⚠️ No opposite formation linked                        │
│                                                                 │
│  Without an opposite, this formation:                           │
│  • Can only be used in one direction                           │
│  • Won't appear in formation selector with Left/Right buttons │
│  • May be incomplete for playbook                              │
└─────────────────────────────────────────────────────────────────┘
```

OR if already linked:

```tsx
┌─────────────────────────────────────────────────────────────────┐
│  Formation: Trips (left)                                        │
│  Status: ✅ Linked to opposite formation                        │
│                                                                 │
│  Linked with: Trips (right)                                    │
│  Created: Oct 15, 2025                                         │
│                                                                 │
│  [View Opposite Formation] [Unlink]                            │
└─────────────────────────────────────────────────────────────────┘
```

---

### Smart Suggestions Section

Show top 5 potential matches with scoring:

```tsx
┌─────────────────────────────────────────────────────────────────┐
│  🔍 Suggested Matches                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Trips (right) ⭐⭐⭐⭐⭐ 220/240 points                        │
│     ✅ Exact name match                                         │
│     ✅ Opposite direction (left ↔ right)                        │
│     ✅ Same personnel (11)                                      │
│     ✅ Same category (Spread)                                   │
│     📅 Created: Oct 15, 2025, 2:30 PM                          │
│                                                                 │
│     [Preview] [Link This Formation]                             │
│                                                                 │
│  ───────────────────────────────────────────────────────────    │
│                                                                 │
│  2. Trips Right ⭐⭐⭐⭐ 170/240 points                            │
│     ⚠️  Similar name (not exact match)                          │
│     ✅ Opposite direction                                       │
│     ✅ Same personnel (11)                                      │
│     ✅ Same category (Spread)                                   │
│     📅 Created: Oct 14, 2025, 5:15 PM                          │
│                                                                 │
│     [Preview] [Link This Formation]                             │
│                                                                 │
│  ───────────────────────────────────────────────────────────    │
│                                                                 │
│  3. Trips East ⭐⭐⭐ 130/240 points                              │
│     ⚠️  Similar name                                            │
│     ⚠️  No clear direction                                      │
│     ✅ Same personnel (11)                                      │
│     ✅ Same category (Spread)                                   │
│     📅 Created: Oct 13, 2025, 11:00 AM                         │
│                                                                 │
│     [Preview] [Link This Formation]                             │
│                                                                 │
│  ───────────────────────────────────────────────────────────    │
│                                                                 │
│  No more suggestions                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### Advanced Options Section

```tsx
┌─────────────────────────────────────────────────────────────────┐
│  🔧 Advanced Options                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [➕ Create New Opposite] [🔍 Search All Formations]           │
│                                                                 │
│  💡 Create New: Automatically flip this formation and link     │
│  🔍 Search All: Browse all formations (not just suggestions)   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Matching Algorithm

### Scoring System

```typescript
interface MatchScore {
  formation: Formation;
  score: number;
  maxScore: number;
  breakdown: {
    nameMatch: number; // 0-100 points
    directionMatch: number; // 0-80 points
    personnelMatch: number; // 0-40 points
    categoryMatch: number; // 0-20 points
  };
}

/**
 * Calculate match score between two formations
 * Higher score = better match
 */
function calculateMatchScore(
  current: Formation,
  candidate: Formation
): MatchScore {
  const breakdown = {
    nameMatch: 0,
    directionMatch: 0,
    personnelMatch: 0,
    categoryMatch: 0,
  };

  // 1. Name matching (100 points max)
  if (candidate.name === current.name) {
    breakdown.nameMatch = 100; // Exact match
  } else {
    // Fuzzy match
    const currentLower = current.name.toLowerCase();
    const candidateLower = candidate.name.toLowerCase();

    if (candidateLower.includes(currentLower)) {
      breakdown.nameMatch = 60; // Contains current name
    } else if (currentLower.includes(candidateLower)) {
      breakdown.nameMatch = 60; // Current contains candidate
    } else {
      // Levenshtein distance or similar
      const similarity = calculateStringSimilarity(
        currentLower,
        candidateLower
      );
      breakdown.nameMatch = Math.floor(similarity * 50);
    }
  }

  // 2. Direction matching (80 points max)
  const currentDir = current.direction;
  const candidateDir = candidate.direction;

  if (
    (currentDir === "left" && candidateDir === "right") ||
    (currentDir === "right" && candidateDir === "left")
  ) {
    breakdown.directionMatch = 80; // Perfect opposite
  } else if (!currentDir && !candidateDir) {
    breakdown.directionMatch = 40; // Both standalone
  } else if (!candidateDir) {
    breakdown.directionMatch = 20; // Candidate could be assigned
  }

  // 3. Personnel matching (40 points max)
  if (candidate.personnel_id === current.personnel_id) {
    breakdown.personnelMatch = 40; // Exact match
  } else if (candidate.personnel_name === current.personnel_name) {
    breakdown.personnelMatch = 30; // Same name, different ID
  }

  // 4. Category matching (20 points max)
  if (candidate.category === current.category) {
    breakdown.categoryMatch = 20;
  }

  const totalScore = Object.values(breakdown).reduce(
    (sum, val) => sum + val,
    0
  );

  return {
    formation: candidate,
    score: totalScore,
    maxScore: 240, // 100 + 80 + 40 + 20
    breakdown,
  };
}
```

### Filtering Rules

```typescript
/**
 * Find potential opposite formations
 * Returns up to 5 best matches
 */
async function findPotentialOpposites(
  formationId: string
): Promise<MatchScore[]> {
  const formation = await getFormationById(formationId);

  // Skip if already linked
  if (formation.opposite_formation_id) {
    return [];
  }

  // Get all unpaired formations in same playbook
  const candidates = await supabase
    .from("formations")
    .select("*")
    .eq("playbook_id", formation.playbook_id)
    .is("opposite_formation_id", null)
    .neq("id", formation.id);

  // Score each candidate
  const scored = candidates.map((candidate) =>
    calculateMatchScore(formation, candidate)
  );

  // Filter out poor matches (< 50 points)
  const goodMatches = scored.filter((s) => s.score >= 50);

  // Sort by score (highest first)
  goodMatches.sort((a, b) => b.score - a.score);

  // Return top 5
  return goodMatches.slice(0, 5);
}
```

---

## Link Preview Modal

When user clicks "Preview" or "Link This Formation":

```tsx
interface LinkPreviewModalProps {
  currentFormation: Formation;
  candidateFormation: Formation;
  matchScore: MatchScore;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export const LinkPreviewModal: React.FC<LinkPreviewModalProps> = ({
  currentFormation,
  candidateFormation,
  matchScore,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal size="xl">
      <Typography variant="headline-md">Link These Formations?</Typography>

      {/* Match Quality Indicator */}
      <div className="flex items-center gap-2 mb-4">
        <MatchQualityBadge score={matchScore.score} max={matchScore.maxScore} />
        <Typography variant="caption" className="text-text-muted">
          Match Quality:{" "}
          {Math.round((matchScore.score / matchScore.maxScore) * 100)}%
        </Typography>
      </div>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Current Formation */}
        <div className="border rounded p-4">
          <Typography variant="headline-sm" className="mb-2">
            Current Formation
          </Typography>
          <FormationBadge
            formationId={currentFormation.id}
            direction={currentFormation.direction}
          />
          <FieldCanvas
            positions={currentFormation.player_positions}
            width={400}
            height={200}
          />
          <div className="mt-2 space-y-1 text-sm">
            <div>Name: {currentFormation.name}</div>
            <div>Direction: {currentFormation.direction || "None"}</div>
            <div>Personnel: {currentFormation.personnel_name || "Not set"}</div>
            <div>Category: {currentFormation.category || "Not set"}</div>
            <div>Run Strength: {currentFormation.run_strength}</div>
            <div>Pass Strength: {currentFormation.pass_strength}</div>
          </div>
        </div>

        {/* Candidate Formation */}
        <div className="border rounded p-4">
          <Typography variant="headline-sm" className="mb-2">
            Link To
          </Typography>
          <FormationBadge
            formationId={candidateFormation.id}
            direction={candidateFormation.direction}
          />
          <FieldCanvas
            positions={candidateFormation.player_positions}
            width={400}
            height={200}
          />
          <div className="mt-2 space-y-1 text-sm">
            <div>Name: {candidateFormation.name}</div>
            <div>Direction: {candidateFormation.direction || "None"}</div>
            <div>
              Personnel: {candidateFormation.personnel_name || "Not set"}
            </div>
            <div>Category: {candidateFormation.category || "Not set"}</div>
            <div>Run Strength: {candidateFormation.run_strength}</div>
            <div>Pass Strength: {candidateFormation.pass_strength}</div>
          </div>
        </div>
      </div>

      {/* Match breakdown */}
      <div className="p-4 bg-surface-muted rounded mb-4">
        <Typography variant="body-sm" className="font-medium mb-2">
          Match Breakdown:
        </Typography>
        <div className="space-y-1 text-sm">
          <MatchScoreRow
            label="Name Match"
            score={matchScore.breakdown.nameMatch}
            max={100}
          />
          <MatchScoreRow
            label="Direction Match"
            score={matchScore.breakdown.directionMatch}
            max={80}
          />
          <MatchScoreRow
            label="Personnel Match"
            score={matchScore.breakdown.personnelMatch}
            max={40}
          />
          <MatchScoreRow
            label="Category Match"
            score={matchScore.breakdown.categoryMatch}
            max={20}
          />
        </div>
      </div>

      {/* Warnings */}
      {currentFormation.name !== candidateFormation.name && (
        <div className="p-3 bg-warning-50 border border-warning-200 rounded mb-4">
          <Typography variant="caption" className="text-warning-700">
            ⚠️ Names don't match exactly ("{currentFormation.name}" vs "
            {candidateFormation.name}")
            <br />
            Both formations will keep their current names.
          </Typography>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={onConfirm} variant="primary" className="flex-1">
          ✅ Link Formations
        </Button>
        <Button onClick={onCancel} variant="secondary" className="flex-1">
          Cancel
        </Button>
      </div>
    </Modal>
  );
};
```

---

## Complete Flow Examples

### Example 1: Perfect Match (220/240 points)

```
Current: "Trips" (left)
Candidate: "Trips" (right)

Breakdown:
✅ Name Match: 100/100 (exact)
✅ Direction: 80/80 (perfect opposite)
✅ Personnel: 40/40 (same)
✅ Category: 20/20 (same)

Total: 240/240 ⭐⭐⭐⭐⭐

Action: One-click link, no warnings needed
```

### Example 2: Good Match (170/240 points)

```
Current: "Trips" (left)
Candidate: "Trips Right" (null direction)

Breakdown:
⚠️  Name Match: 60/100 (similar, not exact)
✅ Direction: 40/80 (no direction, can assign)
✅ Personnel: 40/40 (same)
✅ Category: 20/20 (same)

Total: 160/240 ⭐⭐⭐⭐

Action: Show preview with name warning
```

### Example 3: Weak Match (90/240 points)

```
Current: "Trips" (left)
Candidate: "Bunch" (right)

Breakdown:
❌ Name Match: 10/100 (different)
✅ Direction: 80/80 (perfect opposite)
❌ Personnel: 0/40 (different)
❌ Category: 0/20 (different)

Total: 90/240 ⭐⭐

Action: Show in suggestions but with low score
User should probably skip this
```

---

## Service Layer Functions

```typescript
// FormationService.ts

/**
 * Link two formations as opposites
 */
static async linkFormations(
  formation1Id: string,
  formation2Id: string
): Promise<void> {
  const f1 = await this.getFormationById(formation1Id);
  const f2 = await this.getFormationById(formation2Id);

  // Validation
  if (f1.playbook_id !== f2.playbook_id) {
    throw new Error("Formations must be in same playbook");
  }

  if (f1.opposite_formation_id || f2.opposite_formation_id) {
    throw new Error("One or both formations already linked");
  }

  // Determine directions
  let f1Direction = f1.direction || "left";
  let f2Direction = f2.direction || "right";

  // If both have directions, ensure they're opposite
  if (f1.direction && f2.direction) {
    if (f1.direction === f2.direction) {
      throw new Error("Formations have same direction - cannot link");
    }
    // Use their existing directions
    f1Direction = f1.direction;
    f2Direction = f2.direction;
  }

  // Update both formations
  const { error } = await supabase.rpc('link_formations_bidirectional', {
    formation1_id: formation1Id,
    formation2_id: formation2Id,
    formation1_direction: f1Direction,
    formation2_direction: f2Direction,
  });

  if (error) {
    throw new Error(`Failed to link formations: ${error.message}`);
  }
}

/**
 * Unlink a formation from its opposite
 */
static async unlinkFormation(formationId: string): Promise<void> {
  const formation = await this.getFormationById(formationId);

  if (!formation.opposite_formation_id) {
    throw new Error("Formation is not linked");
  }

  // Use RPC to ensure bidirectional unlink
  const { error } = await supabase.rpc('unlink_formations_bidirectional', {
    formation_id: formationId,
  });

  if (error) {
    throw new Error(`Failed to unlink: ${error.message}`);
  }
}
```

### Database Functions

```sql
-- Bidirectional linking (atomic operation)
CREATE OR REPLACE FUNCTION link_formations_bidirectional(
  formation1_id UUID,
  formation2_id UUID,
  formation1_direction TEXT,
  formation2_direction TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Update formation 1
  UPDATE formations
  SET
    opposite_formation_id = formation2_id,
    direction = formation1_direction
  WHERE id = formation1_id;

  -- Update formation 2
  UPDATE formations
  SET
    opposite_formation_id = formation1_id,
    direction = formation2_direction
  WHERE id = formation2_id;
END;
$$ LANGUAGE plpgsql;

-- Bidirectional unlinking (atomic operation)
CREATE OR REPLACE FUNCTION unlink_formations_bidirectional(
  formation_id UUID
)
RETURNS VOID AS $$
DECLARE
  opposite_id UUID;
BEGIN
  -- Get opposite formation ID
  SELECT opposite_formation_id INTO opposite_id
  FROM formations
  WHERE id = formation_id;

  -- Unlink current formation
  UPDATE formations
  SET
    opposite_formation_id = NULL,
    direction = NULL
  WHERE id = formation_id;

  -- Unlink opposite formation
  IF opposite_id IS NOT NULL THEN
    UPDATE formations
    SET
      opposite_formation_id = NULL,
      direction = NULL
    WHERE id = opposite_id;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

---

## Summary

### Primary Flow (Automatic)

1. User saves formation
2. System checks for opposite
3. Modal appears if missing
4. User creates opposite with one click
5. **95% of formations created this way** ✅

### Fallback Flow (Manual)

1. Formation created without prompt (play modal, import, etc.)
2. User opens Formation Manager later
3. Goes to "Link Formations" tab
4. Sees smart suggestions with scores
5. One-click link with preview
6. **5% of formations need this** ✅

### Key Features

- ✅ **Smart matching** with 240-point scoring system
- ✅ **Visual previews** before linking
- ✅ **Name mismatch warnings**
- ✅ **One-click actions** for high-confidence matches
- ✅ **Bidirectional linking** (atomic operations)
- ✅ **Easy unlinking** if mistake made

### Benefits

- 🎯 **Simple for 95% of users** (automatic prompt)
- 🛡️ **Safety net for edge cases** (manual linking)
- 🚀 **Fast workflow** (one-click suggestions)
- 💡 **Smart suggestions** (not overwhelming dropdowns)
- ✅ **Flexible** (works for all creation paths)
