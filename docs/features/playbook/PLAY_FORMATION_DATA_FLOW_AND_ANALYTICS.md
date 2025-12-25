# Play + Formation Data Flow & Analytics Vision

**Date:** October 17, 2025  
**Status:** Current Implementation + Future Vision

---

## 🎯 Your Questions Answered

### **Q1: When I create a play from AddNewPlayModal and put a new formation in there, where does it go?**

**Answer:** Currently, it goes to the **`plays` table ONLY** (as text). The formation is NOT automatically created in the `formations` table.

---

## 📊 Current Data Flow (What Happens Now)

### **Scenario: User creates a play with a new formation "Trips Left"**

```
┌─────────────────────────────────────────────────────────────────┐
│                    AddNewPlayModal                              │
│  ─────────────────────────                                      │
│  User enters:                                                   │
│  • Formation: "Trips Left"  ← ⚠️ Just typing text               │
│  • Play Name: "Y-Sail"                                          │
│  • Play Type: "Pass"                                            │
│  • Personnel: "11"                                              │
│  • Other fields...                                              │
└─────────────────────────────────────────────────────────────────┘
                        ↓
                  handleSubmit()
                        ↓
┌─────────────────────────────────────────────────────────────────┐
│                     plays table                                 │
│  ─────────────────                                              │
│  INSERT:                                                        │
│    formation = "Trips Left"        ← TEXT field                 │
│    formation_id = NULL             ← No DB link                 │
│    formation_direction = NULL      ← No variant info            │
│    play_name = "Y-Sail"                                         │
│    p_type = "Pass"                                              │
│    personnel = "11"                                             │
│    f_dir = NULL                    ← No normalized direction    │
│    ... other fields                                             │
└─────────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────────┐
│                  formations table                               │
│  ─────────────────────                                          │
│  ❌ NOTHING HAPPENS                                             │
│                                                                  │
│  "Trips Left" is NOT automatically created as a formation       │
│  You'd have to manually create it in Formation Builder later    │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ What SHOULD Happen (Recommended Fix)

### **Scenario: User creates play → Auto-create formation if needed**

```
┌─────────────────────────────────────────────────────────────────┐
│                    AddNewPlayModal                              │
│  ─────────────────────────                                      │
│  User enters:                                                   │
│  • Formation: "Trips" (smart detection removed "Left")          │
│  • Formation Direction: "Left"                                  │
│  • Play Name: "Y-Sail"                                          │
└─────────────────────────────────────────────────────────────────┘
                        ↓
           Check: Does "Trips" exist?
                        ↓
              ┌─────────┴─────────┐
              No                  Yes
              ↓                   ↓
      Create Formation      Use Existing
      ────────────         ──────────────
      INSERT INTO           SELECT id
      formations            FROM formations
      (name, playbook_id)   WHERE name='Trips'
              ↓                   ↓
              └─────────┬─────────┘
                        ↓
                formation.id retrieved
                        ↓
┌─────────────────────────────────────────────────────────────────┐
│                     plays table                                 │
│  ─────────────────                                              │
│  INSERT:                                                        │
│    formation = "Trips"             ← Clean name                 │
│    formation_id = <UUID>           ← ✅ DATABASE LINK!          │
│    formation_direction = "left"    ← Variant selected           │
│    play_name = "Y-Sail"                                         │
│    f_dir = "L"                     ← Normalized                 │
│    ... other fields                                             │
└─────────────────────────────────────────────────────────────────┘
                        ↓
                Triggers:
                ↓
        update_formation_usage_count()
                ↓
┌─────────────────────────────────────────────────────────────────┐
│                  formations table                               │
│  ─────────────────────                                          │
│  UPDATE:                                                        │
│    WHERE name = "Trips"                                         │
│    SET usage_count = usage_count + 1                            │
│                                                                  │
│  ✅ Formation is now linked and tracked!                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔗 Q2: Does anything hold the formation AND play together?

### **Answer:** Yes! Three mechanisms:

### **1. Direct Database Link (PRIMARY)**

```sql
plays (
  formation_id UUID REFERENCES formations(id)  ← Direct FK relationship
)
```

### **2. Text Fallback (LEGACY)**

```sql
plays (
  formation TEXT NOT NULL  ← Text name for backwards compatibility
)
```

### **3. Query Join (USAGE)**

```sql
SELECT
  p.play_name,
  p.p_type,
  f.name AS formation_name,
  f.personnel_name,
  f.player_positions,
  f.direction,
  f.opposite_formation_id
FROM plays p
LEFT JOIN formations f ON p.formation_id = f.id
WHERE p.playbook_id = ?
```

---

## 📈 Q3: What data can I get for game plans and practice scripts?

### **CURRENT: What You Have Available**

#### **1. Play Execution Data** ✅

```sql
-- Canonical source: play_executions table
-- Each row is one execution event with context + outcome
-- (session type, down/distance, field position, result)

-- Derived/cache fields:
-- plays.times_called / plays.times_successful are maintained from play_executions
-- and treated as read-only from the client.
```

#### **2. Formation Usage Data** ✅

```sql
-- From formations table
- usage_count: How many plays use this formation
- personnel_name: What personnel groups it works with
- direction: Left/right/standalone
- opposite_formation_id: Linked variants

-- From plays via formation_id
- How many plays in playbook use this formation
- Success rates of plays from this formation
```

#### **3. Practice Script Data** ✅

```sql
-- From practice_scripts + practice_script_plays
- Which plays are practiced together
- Repetitions per play
- Time spent on each play
- Coaching notes

-- Example Query:
SELECT
  ps.title AS script_name,
  psp.repetitions,
  psp.duration_minutes,
  p.play_name,
  p.formation,
  p.confidence_base
FROM practice_script_plays psp
JOIN plays p ON psp.play_id = p.id
JOIN practice_scripts ps ON psp.practice_script_id = ps.id
WHERE ps.team_id = ?
```

#### **4. Game Plan Data** ✅

```sql
-- From game_plans + game_plan_plays
- Success probability per play (0-1.0)
- Risk level (1-5 scale)
- Priority level (1-5 scale)
- Expected coverage matchups
- Formation strength (strong_right, balanced, etc.)
- Execution count vs success count

-- Example Query:
SELECT
  gpp.success_probability,
  gpp.risk_level,
  gpp.priority_level,
  gpp.execution_count,
  gpp.success_count,
  p.play_name,
  p.formation,
  f.personnel_name
FROM game_plan_plays gpp
JOIN plays p ON gpp.play_id = p.id
LEFT JOIN formations f ON p.formation_id = f.id
WHERE gpp.game_plan_id = ?
```

---

## 🚀 Q4: "Confidence data and predictive analysis" - Your Vision

### **What You Want:**

> "I want confidence data and predictive analysis based on:
>
> - **Formations alone** (how well does "Trips" work?)
> - **Plays alone** (how well does "Y-Sail" work?)
> - **Formation + Play together as one entire play** (how well does "Trips Left Y-Sail" work?)"

---

## 🎯 Future Analytics System - What You Need

### **1. Formation-Level Analytics** 📊

```sql
-- NEW TABLE: formation_analytics
CREATE TABLE formation_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  formation_id UUID REFERENCES formations(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,

  -- Usage Stats
  total_plays_called INTEGER DEFAULT 0,
  total_practice_reps INTEGER DEFAULT 0,

  -- Success Metrics
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  success_rate NUMERIC(5,2), -- Calculated: success/total

  -- Situational Success
  first_down_success_rate NUMERIC(5,2),
  second_down_success_rate NUMERIC(5,2),
  third_down_success_rate NUMERIC(5,2),
  red_zone_success_rate NUMERIC(5,2),

  -- Opponent Adjustments
  vs_man_coverage_success NUMERIC(5,2),
  vs_zone_coverage_success NUMERIC(5,2),
  vs_blitz_success NUMERIC(5,2),

  -- Confidence Score (AI-Driven)
  confidence_score INTEGER, -- 0-100 based on historical data
  confidence_trend TEXT, -- 'improving', 'declining', 'stable'

  -- Timestamps
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  season_year INTEGER,

  UNIQUE(formation_id, team_id, season_year)
);
```

#### **What You Can Answer:**

- ✅ "Which formation has the highest success rate?"
- ✅ "How does 'Trips' perform on 3rd down vs 1st down?"
- ✅ "What's our success rate from 'Trips' against man coverage?"
- ✅ "Is our confidence in this formation improving over the season?"

---

### **2. Play-Level Analytics** 🏈

```sql
-- ENHANCE: plays table (add computed fields)
ALTER TABLE plays ADD COLUMN IF NOT EXISTS success_rate NUMERIC(5,2);
ALTER TABLE plays ADD COLUMN IF NOT EXISTS avg_yards_gained NUMERIC(5,2);
ALTER TABLE plays ADD COLUMN IF NOT EXISTS turnover_rate NUMERIC(5,2);
ALTER TABLE plays ADD COLUMN IF NOT EXISTS sack_rate NUMERIC(5,2);

-- NEW TABLE: play_execution_history
CREATE TABLE play_execution_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  play_id UUID REFERENCES plays(id) ON DELETE CASCADE,
  executed_at TIMESTAMPTZ DEFAULT NOW(),

  -- Context
  game_id UUID REFERENCES game_results(id),
  practice_id UUID REFERENCES practice_scripts(id),
  quarter INTEGER,
  down INTEGER,
  distance INTEGER,
  yard_line INTEGER,
  hash TEXT CHECK (hash IN ('left', 'middle', 'right')),

  -- Opponent Info
  defensive_front TEXT, -- '4-3', '3-4', 'Nickel'
  defensive_coverage TEXT, -- 'Cover 2', 'Man Free'
  blitz BOOLEAN DEFAULT false,

  -- Result
  result TEXT CHECK (result IN ('success', 'failure', 'neutral')),
  yards_gained INTEGER,
  touchdown BOOLEAN DEFAULT false,
  turnover BOOLEAN DEFAULT false,
  penalty BOOLEAN DEFAULT false,

  -- Film/Notes
  video_timestamp TEXT,
  coaching_notes TEXT,

  -- Confidence Update
  pre_execution_confidence INTEGER, -- Before running play
  post_execution_confidence INTEGER -- After result
);
```

#### **What You Can Answer:**

- ✅ "What's the success rate of 'Y-Sail' on 3rd & 7?"
- ✅ "How many yards does this play average?"
- ✅ "How does this play perform vs Cover 2?"
- ✅ "Has our confidence in this play improved after practicing it?"

---

### **3. Formation + Play Combination Analytics** 🎯 (THE BIG ONE!)

```sql
-- NEW TABLE: formation_play_analytics
CREATE TABLE formation_play_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  formation_id UUID REFERENCES formations(id) ON DELETE CASCADE,
  play_id UUID REFERENCES plays(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,

  -- Combined Stats
  total_executions INTEGER DEFAULT 0,
  successful_executions INTEGER DEFAULT 0,
  success_rate NUMERIC(5,2),
  avg_yards_gained NUMERIC(5,2),

  -- Situational Success
  third_down_conversions INTEGER DEFAULT 0,
  third_down_attempts INTEGER DEFAULT 0,
  third_down_conversion_rate NUMERIC(5,2),

  red_zone_tds INTEGER DEFAULT 0,
  red_zone_attempts INTEGER DEFAULT 0,

  -- Advanced Metrics
  expected_success_rate NUMERIC(5,2), -- AI prediction
  actual_vs_expected NUMERIC(5,2), -- Difference

  -- Trend Analysis
  last_5_success_rate NUMERIC(5,2), -- Recent performance
  trend TEXT CHECK (trend IN ('hot', 'cold', 'stable')),

  -- Opponent-Specific
  vs_coverage_success JSONB, -- {"Cover 2": 0.75, "Man": 0.60}
  vs_front_success JSONB, -- {"4-3": 0.80, "3-4": 0.65}

  -- Recommendation Score
  confidence_score INTEGER, -- 0-100 AI-driven
  recommended_situations TEXT[], -- ["3rd & Short", "Red Zone"]
  avoid_situations TEXT[], -- ["3rd & Long", "Own 10"]

  -- Metadata
  last_executed TIMESTAMPTZ,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  season_year INTEGER,

  UNIQUE(formation_id, play_id, team_id, season_year)
);
```

#### **What You Can Answer:**

- ✅ **"What's the success rate of 'Y-Sail' from 'Trips Left'?"**
- ✅ **"Is this formation+play combo better on 3rd & short or 3rd & long?"**
- ✅ **"What's our best red zone formation+play combo?"**
- ✅ **"Which plays work best from 'Trips' against Cover 2?"**
- ✅ **"Is this combo trending hot or cold?"**
- ✅ **"Should we run this against Lincoln High's 4-3 defense?"**

---

## 🤖 AI-Powered Predictions

### **Confidence Score Calculation Algorithm**

```typescript
interface ConfidenceFactors {
  historicalSuccess: number; // 0-100: Past success rate
  recentTrend: number; // 0-100: Last 5 executions
  practiceReps: number; // 0-100: How well practiced
  situationalFit: number; // 0-100: Matches game situation
  opponentMatchup: number; // 0-100: vs opponent's defense
  playerExecution: number; // 0-100: Team skill level
}

function calculateConfidenceScore(factors: ConfidenceFactors): number {
  const weights = {
    historicalSuccess: 0.3, // 30% weight
    recentTrend: 0.25, // 25% weight
    practiceReps: 0.15, // 15% weight
    situationalFit: 0.15, // 15% weight
    opponentMatchup: 0.1, // 10% weight
    playerExecution: 0.05, // 5% weight
  };

  return Math.round(
    factors.historicalSuccess * weights.historicalSuccess +
      factors.recentTrend * weights.recentTrend +
      factors.practiceReps * weights.practiceReps +
      factors.situationalFit * weights.situationalFit +
      factors.opponentMatchup * weights.opponentMatchup +
      factors.playerExecution * weights.playerExecution
  );
}

// Example:
const confidence = calculateConfidenceScore({
  historicalSuccess: 85, // Play has 85% success rate
  recentTrend: 90, // Last 5 executions: 4/5 success
  practiceReps: 80, // Practiced 20 times this week
  situationalFit: 95, // Perfect for 3rd & 5
  opponentMatchup: 70, // Opponent weak vs this coverage
  playerExecution: 75, // Team skill moderate
});
// Result: 84 (High confidence!)
```

---

## 📊 Dashboard Views You Can Build

### **1. Formation Hub** 🎨

```
┌────────────────────────────────────────────────────────────┐
│  Formation: Trips                                          │
│  ──────────────────                                        │
│  Usage: 47 plays called this season                        │
│  Success Rate: 78% (37/47)                                 │
│  Confidence: 82/100 ↗️ Improving                           │
│                                                             │
│  Best Plays from Trips:                                    │
│  1. Y-Sail           → 90% success (18/20)                 │
│  2. Mesh Cross       → 85% success (11/13)                 │
│  3. Slot Fade        → 70% success (7/10)                  │
│                                                             │
│  Situational Success:                                      │
│  • 1st Down:  75%                                          │
│  • 2nd Down:  80%                                          │
│  • 3rd Down:  82% ⭐ Best situation!                       │
│  • Red Zone:  88% 🔥 Money zone!                           │
│                                                             │
│  vs Coverage:                                              │
│  • Cover 2:   90% ✅                                       │
│  • Cover 3:   75% ✅                                       │
│  • Man Free:  60% ⚠️                                       │
└────────────────────────────────────────────────────────────┘
```

### **2. Play Detail View** 🏈

```
┌────────────────────────────────────────────────────────────┐
│  Play: Y-Sail from Trips Left                              │
│  ──────────────────────────────                            │
│  Confidence: 87/100 🔥                                     │
│  Trend: ↗️ Hot (4/5 recent success)                       │
│                                                             │
│  Overall Stats:                                            │
│  • Called: 23 times                                        │
│  • Success: 20 times (87%)                                 │
│  • Avg Yards: 8.3                                          │
│  • TDs: 3                                                  │
│                                                             │
│  Best Situations:                                          │
│  ✅ 3rd & 5-8 yards   → 92% success                        │
│  ✅ vs Cover 2        → 90% success                        │
│  ✅ Red Zone (10-20)  → 88% success                        │
│                                                             │
│  Avoid:                                                    │
│  ⚠️ 3rd & 15+         → 40% success                        │
│  ⚠️ vs Man Coverage   → 55% success                        │
│                                                             │
│  Practice History:                                         │
│  • Last practiced: 2 days ago                              │
│  • Total reps: 47                                          │
│  • Practice success: 85%                                   │
└────────────────────────────────────────────────────────────┘
```

### **3. Game Plan Recommendations** 🎯

```
┌────────────────────────────────────────────────────────────┐
│  vs Lincoln High - Recommended Plays                       │
│  ────────────────────────────────────                      │
│  Scout Report: Lincoln runs 4-3, heavy Cover 2             │
│                                                             │
│  🔥 HOT PLAYS (High Confidence vs Their Defense)           │
│                                                             │
│  1. Trips Left Y-Sail       Confidence: 92/100             │
│     └─ 90% vs Cover 2, avg 8.5 yards                       │
│     └─ Recommend: 3rd & 5-8, Red Zone                      │
│                                                             │
│  2. Spread Mesh Cross       Confidence: 88/100             │
│     └─ 85% vs 4-3 fronts, avg 7.2 yards                    │
│     └─ Recommend: 2nd & medium, between 20s                │
│                                                             │
│  3. Gun Power Right         Confidence: 84/100             │
│     └─ 80% vs Cover 2, avg 5.8 yards                       │
│     └─ Recommend: Short yardage, 1st down                  │
│                                                             │
│  ⚠️ AVOID THESE                                            │
│  • Trey Left Smash (45% vs Cover 2)                        │
│  • Ace Iso (Weak vs 4-3 fronts)                            │
└────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Implementation Steps

### **Phase 1: Fix Formation Creation from Play Builder** ✅ PRIORITY

```typescript
// AddNewPlayModal.tsx - Enhanced handleSubmit()

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // 1. Check if formation exists
  let formationId = formData.formation_id;

  if (!formationId && formData.formation.trim()) {
    // 2. Try to find existing formation
    const existingFormation = await FormationService.getFormationByName(
      playbookId,
      formData.formation.trim()
    );

    if (existingFormation) {
      formationId = existingFormation.id;
    } else {
      // 3. Create new formation if it doesn't exist
      const newFormation = await FormationService.createFormation({
        playbook_id: playbookId,
        name: formData.formation.trim(),
        personnel_name: formData.personnel || null,
        direction: formData.formation_direction || null,
        creation_source: "play_builder",
        creation_context: {
          created_with_play: true,
          play_type: formData.playType,
        },
      });
      formationId = newFormation.id;
    }
  }

  // 4. Create play with formation_id
  const playData = {
    ...formData,
    formation_id: formationId,
    f_dir: normalizeDirection(formData.formationDir),
  };

  await onCreatePlay?.(playData);
};
```

### **Phase 2: Add Formation Analytics Table**

```sql
-- Migration: 20251017_add_formation_analytics.sql
-- (See schema above)
```

### **Phase 3: Add Play Execution History**

```sql
-- Migration: 20251017_add_play_execution_history.sql
-- (See schema above)
```

### **Phase 4: Add Formation+Play Combination Analytics**

```sql
-- Migration: 20251017_add_formation_play_analytics.sql
-- (See schema above)
```

### **Phase 5: Build Analytics Dashboard**

- Formation Hub page
- Play Detail with confidence scores
- Game Plan AI recommendations
- Practice Script optimizer (suggests plays needing reps)

---

## 🎓 Summary: Your Questions Answered

| Question                                                          | Answer                                                                                                                                                                |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Where does a new formation go when I create a play?**           | Currently: Nowhere (just text in `plays.formation`). Should: Auto-create in `formations` table with `formation_id` link.                                              |
| **Can I create a formation from the play modal?**                 | Yes, you SHOULD be able to! Need to add auto-creation logic.                                                                                                          |
| **Does anything link formation + play together?**                 | Yes: `plays.formation_id` → `formations.id` (Foreign Key). Plus text fallback.                                                                                        |
| **What data can I get for game plans?**                           | Current: Success rates, confidence, times called, practice reps. Future: AI confidence scores, situational success, opponent matchups, trending analysis.             |
| **Can I get predictive analysis on formations + plays together?** | Not yet, but YES! Need `formation_play_analytics` table + AI scoring algorithm. Will show: combo success rate, best situations, opponent matchups, trending hot/cold. |

---

**Next Steps:**

1. ✅ **Fix AddNewPlayModal** to auto-create formations with `formation_id` link
2. 📊 **Add analytics tables** for tracking execution history
3. 🤖 **Build confidence scoring** algorithm
4. 📈 **Create dashboards** to visualize insights

---

**Generated:** October 17, 2025  
**Status:** Ready for Phase 1 implementation!
