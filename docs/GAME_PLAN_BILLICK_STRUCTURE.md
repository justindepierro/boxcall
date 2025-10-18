# Game Plan Structure: Billick + Customization

**Purpose:** Define how game plans are organized with situational categories.  
**Default:** Brian Billick's 12-situation structure (NFL gold standard).  
**Customization:** Coaches can add/edit/remove situations to fit their system.  
**Implementation:** Stage 2, Phase 5 (Game Plan Builder)

---

## 🏈 Brian Billick Structure (Default Template)

### **The 12 Core Situations:**

```typescript
export const BILLICK_DEFAULT_SITUATIONS = [
  {
    id: "first-and-10",
    name: "First & 10",
    description: "First down with 10 yards to go",
    criteria: { down: 1, distance: [10, 10] },
    playCount: { recommended: 8, min: 5, max: 12 },
    notes: "Set the tone. Mix run/pass to establish tendencies.",
    tags: ["base-offense", "rhythm-plays"],
  },
  {
    id: "second-short",
    name: "Second & Short",
    description: "Second down with 1-3 yards to go",
    criteria: { down: 2, distance: [1, 3] },
    playCount: { recommended: 6, min: 4, max: 8 },
    notes: "Stay aggressive. Mix in play action and explosives.",
    tags: ["opportunity", "explosive-plays"],
  },
  {
    id: "second-medium",
    name: "Second & Medium",
    description: "Second down with 4-7 yards to go",
    criteria: { down: 2, distance: [4, 7] },
    playCount: { recommended: 8, min: 5, max: 10 },
    notes: "Most common situation. Need reliable plays.",
    tags: ["bread-and-butter", "reliable"],
  },
  {
    id: "second-long",
    name: "Second & Long",
    description: "Second down with 8+ yards to go",
    criteria: { down: 2, distance: [8, 99] },
    playCount: { recommended: 6, min: 4, max: 8 },
    notes: "Avoid 3rd & long. High-percentage passes, screens.",
    tags: ["recovery", "avoid-risk"],
  },
  {
    id: "third-short",
    name: "Third & Short",
    description: "Third down with 1-3 yards to go",
    criteria: { down: 3, distance: [1, 3] },
    playCount: { recommended: 8, min: 6, max: 10 },
    notes: "MUST convert. Power run + QB sneak options.",
    tags: ["must-have", "critical"],
  },
  {
    id: "third-medium",
    name: "Third & Medium",
    description: "Third down with 4-7 yards to go",
    criteria: { down: 3, distance: [4, 7] },
    playCount: { recommended: 10, min: 8, max: 15 },
    notes: "Most critical situation. Need 8-10 money plays.",
    tags: ["money-plays", "critical"],
  },
  {
    id: "third-long",
    name: "Third & Long",
    description: "Third down with 8+ yards to go",
    criteria: { down: 3, distance: [8, 99] },
    playCount: { recommended: 6, min: 4, max: 8 },
    notes: "Avoid if possible. Max protect, scramble drills.",
    tags: ["desperation", "max-protect"],
  },
  {
    id: "red-zone",
    name: "Red Zone",
    description: "Inside opponent 20-yard line",
    criteria: { fieldPosition: [80, 100] },
    playCount: { recommended: 12, min: 10, max: 18 },
    notes: "Score TDs, not FGs. Condensed field, different rules.",
    tags: ["scoring", "critical"],
  },
  {
    id: "goal-line",
    name: "Goal Line",
    description: "Inside opponent 5-yard line",
    criteria: { fieldPosition: [95, 100] },
    playCount: { recommended: 8, min: 6, max: 12 },
    notes: "Power football. Multiple looks at same concepts.",
    tags: ["scoring", "power-football"],
  },
  {
    id: "short-yardage",
    name: "Short Yardage (4th Down)",
    description: "Fourth down with 1-2 yards to go",
    criteria: { down: 4, distance: [1, 2] },
    playCount: { recommended: 6, min: 4, max: 8 },
    notes: "Going for it. Need 100% confidence plays.",
    tags: ["critical", "gutsy"],
  },
  {
    id: "two-minute",
    name: "Two-Minute Drill",
    description: "End of half with <2 minutes",
    criteria: { timeRemaining: [0, 120] },
    playCount: { recommended: 10, min: 8, max: 15 },
    notes: "Clock management. Sideline routes, spikes, hurry-up.",
    tags: ["hurry-up", "clock-management"],
  },
  {
    id: "situational",
    name: "Situational / Trick Plays",
    description: "Special situations, trick plays, 4th quarter",
    criteria: null,
    playCount: { recommended: 6, min: 3, max: 10 },
    notes: "Game-changers. Fake punts, reverses, Statue of Liberty.",
    tags: ["trick-plays", "special-situations"],
  },
];
```

---

## 🎨 Database Schema

```sql
-- Game plan situations (customizable per coach/team)
CREATE TABLE game_plan_situations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,

  -- Criteria (when to use this situation)
  criteria JSONB,  -- { down: 3, distance: [4, 7] }

  -- Playbook organization
  display_order INTEGER NOT NULL,
  color TEXT DEFAULT '#3b82f6',  -- For UI
  icon TEXT DEFAULT 'target',    -- Icon name

  -- Recommendations
  recommended_play_count INTEGER DEFAULT 8,
  min_play_count INTEGER DEFAULT 4,
  max_play_count INTEGER DEFAULT 12,

  -- Coaching notes
  coaching_notes TEXT,
  tags TEXT[],

  -- Ownership
  is_default BOOLEAN DEFAULT false,  -- Part of Billick template
  team_id UUID REFERENCES teams(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game plans
CREATE TABLE game_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  opponent TEXT,
  game_date DATE,

  -- Template used
  template_type TEXT DEFAULT 'billick',  -- 'billick', 'custom', etc.

  -- Ownership
  playbook_id UUID REFERENCES playbooks(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plays within game plan situations
CREATE TABLE game_plan_plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_plan_id UUID REFERENCES game_plans(id) ON DELETE CASCADE,
  situation_id UUID REFERENCES game_plan_situations(id) ON DELETE CASCADE,
  play_id UUID REFERENCES plays(id) ON DELETE CASCADE,

  -- Organization
  display_order INTEGER NOT NULL,

  -- Metadata for this specific game
  notes TEXT,  -- "Call vs Cover 2", "Only if winning"
  priority INTEGER DEFAULT 1,  -- 1=primary, 2=backup, 3=emergency

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_game_plan_situations_team ON game_plan_situations(team_id);
CREATE INDEX idx_game_plan_plays_game_plan ON game_plan_plays(game_plan_id);
CREATE INDEX idx_game_plan_plays_situation ON game_plan_plays(situation_id);
```

---

## 🎯 User Experience Flow

### **1. Create Game Plan (First Time):**

```
┌─────────────────────────────────────────────────────────────┐
│  Create Game Plan                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Game Plan Name:                                            │
│  [vs Lincoln HS - Week 8                              ]    │
│                                                             │
│  Opponent:                                                  │
│  [Lincoln High School                                 ]    │
│                                                             │
│  Game Date:                                                 │
│  [10/25/2025                                          ]    │
│                                                             │
│  Template:                                                  │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ ● Billick 12-Situation (Recommended)                 │ │
│  │   NFL-proven structure. Works for most offenses.     │ │
│  │   [Preview Template]                                 │ │
│  ├───────────────────────────────────────────────────────┤ │
│  │ ○ Custom Template                                    │ │
│  │   Build your own situation categories.              │ │
│  │   [Start from Blank]                                 │ │
│  ├───────────────────────────────────────────────────────┤ │
│  │ ○ Wing-T Template                                    │ │
│  │   Specialized for Wing-T offenses.                   │ │
│  │   [Preview Template]                                 │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  [Cancel] [Create Game Plan]                                │
└─────────────────────────────────────────────────────────────┘
```

### **2. Game Plan Builder (Billick Selected):**

```
┌─────────────────────────────────────────────────────────────────────┐
│  Game Plan: vs Lincoln HS - Week 8              [Save] [Export PDF] │
├──────────────────┬──────────────────────────────────────────────────┤
│  Situations      │  Plays (First & 10)                              │
│  ──────────      │  ───────────────────                             │
│                  │                                                  │
│  🎯 First & 10   │  ┌────────────────────────────────────────────┐ │
│  (8 plays) ✓     │  │ Drag from playbook or click to add:        │ │
│                  │  └────────────────────────────────────────────┘ │
│  ⚡ 2nd & Short  │                                                  │
│  (6 plays) ✓     │  1. Y-Sail (Trips Left)          [↑] [↓] [✕]   │
│                  │     Notes: vs Cover 2                           │
│  📊 2nd & Medium │  2. Power Right (I-Form)         [↑] [↓] [✕]   │
│  (8 plays) ✓     │     Notes: Establish run                        │
│                  │  3. Mesh Cross (Spread)          [↑] [↓] [✕]   │
│  🚨 2nd & Long   │  4. Inside Zone (Pistol)         [↑] [↓] [✕]   │
│  (4 plays)       │  5. PA Boot (Play Action)        [↑] [↓] [✕]   │
│                  │  6. Bubble Screen (Trips)        [↑] [↓] [✕]   │
│  🔥 3rd & Short  │  7. QB Draw (Shotgun)            [↑] [↓] [✕]   │
│  (8 plays) ✓     │  8. Slant Flat (Doubles)         [↑] [↓] [✕]   │
│                  │                                                  │
│  💰 3rd & Medium │  [+ Add Play from Playbook]                     │
│  (10 plays) ✓    │  [+ Add Blank Play]                             │
│                  │                                                  │
│  ⚠️ 3rd & Long   │  Coaching Notes:                                 │
│  (5 plays)       │  ┌────────────────────────────────────────────┐ │
│                  │  │ First & 10 strategy: Establish run early,  │ │
│  🏈 Red Zone     │  │ then hit play action. Mix formations.      │ │
│  (12 plays) ✓    │  └────────────────────────────────────────────┘ │
│                  │                                                  │
│  🎯 Goal Line    │                                                  │
│  (8 plays) ✓     │                                                  │
│                  │                                                  │
│  💪 Short Yardage│                                                  │
│  (6 plays) ✓     │                                                  │
│                  │                                                  │
│  ⏱️ 2-Minute     │                                                  │
│  (10 plays) ✓    │                                                  │
│                  │                                                  │
│  🎭 Trick Plays  │                                                  │
│  (4 plays)       │                                                  │
│                  │                                                  │
│  [+ Add Custom   │                                                  │
│     Situation]   │                                                  │
└──────────────────┴──────────────────────────────────────────────────┘

Progress: 93 plays added (Recommended: 80-120)  ✅ Good!
```

---

## 🛠️ Customization Features

### **1. Add Custom Situation:**

```
┌─────────────────────────────────────────────────────────────┐
│  Add Custom Situation                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Situation Name:                                            │
│  [Empty Formation Package                             ]    │
│                                                             │
│  Description:                                               │
│  [4+ WR sets, spread them out                         ]    │
│                                                             │
│  When to Use (Optional):                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ □ Down: [Any ▾]                                     │   │
│  │ □ Distance: [Any ▾] to [Any ▾]                      │   │
│  │ □ Field Position: [Anywhere ▾]                      │   │
│  │ □ Time Remaining: [Any ▾]                           │   │
│  │ □ Score Differential: [Any ▾]                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Recommended Play Count: [6]                                │
│                                                             │
│  Color: [🎨 Blue ▾]    Icon: [📍 Target ▾]                 │
│                                                             │
│  Coaching Notes:                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Use when defense is loading the box. Spread them   │   │
│  │ out and attack space. Motion WR to identify        │   │
│  │ coverage pre-snap.                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Cancel] [Add Situation]                                   │
└─────────────────────────────────────────────────────────────┘
```

### **2. Edit Existing Situation:**

```
Coaches can:
- Rename situations ("3rd & Medium" → "3rd Down Money Plays")
- Change play counts (8 recommended → 12 recommended)
- Add/edit coaching notes
- Reorder situations (drag & drop)
- Change colors/icons for visual organization
- Delete situations (if not needed)
```

### **3. Save as Template:**

```
┌─────────────────────────────────────────────────────────────┐
│  Save as Template                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  You've customized this game plan structure!                │
│  Save it as a template for future game plans?               │
│                                                             │
│  Template Name:                                             │
│  [My Wing-T Game Plan                                 ]    │
│                                                             │
│  Description:                                               │
│  [Wing-T specific situations with unbalanced line   ]      │
│  [focus and pulling guard concepts.                 ]      │
│                                                             │
│  Share with other coaches?                                  │
│  ○ Private (only me)                                        │
│  ● Share publicly (BoxCall community)                       │
│                                                             │
│  [Cancel] [Save Template]                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📚 Other Popular Templates (Future)

### **Wing-T Template:**

```typescript
const WING_T_SITUATIONS = [
  "Power Series (Buck Sweep, Down, Trap)",
  "Waggle/Boot Series",
  "Belly/Iso Series",
  "Jet/Rocket Series",
  "Goal Line (Heavy)",
  // ... etc
];
```

### **Spread/Air Raid Template:**

```typescript
const AIR_RAID_SITUATIONS = [
  "Mesh Concepts",
  "Four Verticals Package",
  "Stick/Snag Routes",
  "Screen Game",
  "RPO Package",
  // ... etc
];
```

### **Option/Flexbone Template:**

```typescript
const FLEXBONE_SITUATIONS = [
  "Triple Option",
  "Counter Option",
  "Rocket/Load Option",
  "Play Action (Fake Option)",
  "Goal Line (Heavy)",
  // ... etc
];
```

---

## 🎯 Implementation Plan (Phase 5)

### **Week 1: Billick Template**

- [ ] Seed database with Billick 12 situations
- [ ] Build GamePlanService.createFromTemplate()
- [ ] UI for creating game plan with template selection
- [ ] Drag-and-drop plays into situations

### **Week 2: Customization**

- [ ] Add custom situation modal
- [ ] Edit situation modal
- [ ] Reorder situations (drag & drop)
- [ ] Delete situation (with confirmation)
- [ ] Save as template feature

### **Testing with Beta Coaches:**

```
Tasks for beta coaches:
1. Create game plan using Billick template
2. Add 80-100 plays across situations
3. Try adding custom situation
4. Try editing existing situation
5. Export to PDF and print for press box

Feedback needed:
- Is Billick structure intuitive?
- Are 12 situations too many? Too few?
- Would you use custom situations?
- What other templates would help?
```

---

## ✅ Success Criteria

**Phase 5 is successful when:**

- [ ] Coaches can create game plan in <15 minutes
- [ ] Billick structure feels natural
- [ ] Customization is easy (add situation in <2 minutes)
- [ ] PDF export looks professional
- [ ] 80%+ coaches use Billick default (validates template)
- [ ] 20%+ coaches customize (validates flexibility)

---

## 🚀 Long-Term Vision (Post-Launch)

### **Community Templates:**

- Coaches share templates publicly
- Vote/rate templates
- "Most Popular Templates" section
- Import template from another coach

### **AI-Generated Situations:**

- "Analyze my playbook and suggest situations"
- BoxCall detects you're a Wing-T team → suggests Wing-T template
- "You have 15 RPO plays. Create 'RPO Package' situation?"

### **Opponent-Specific Situations:**

- "They blitz a lot. Create 'vs Blitz' situation?"
- "They play Cover 2 80%. Add 'Cover 2 Beaters' section?"

---

**Ready for Phase 5:** YES (once we reach Stage 2!)  
**Template Quality:** Gold standard (Billick) + Flexibility (custom)  
**Customization Level:** Perfect balance
