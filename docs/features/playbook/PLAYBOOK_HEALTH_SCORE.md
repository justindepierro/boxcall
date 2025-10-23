# Playbook Health Score System

**Purpose:** Give coaches a gamified score (0-100) showing playbook data quality.  
**Implementation:** Stage 1, Phase 2 (Data Quality & Validation)  
**Goal:** Make data quality improvement FUN and visible.

---

## 🎯 The Concept

> "Your playbook health: 87/100 🟢 Great! Fix 3 issues to reach 90."

Instead of overwhelming coaches with data quality issues, we:

1. Calculate a simple score (0-100)
2. Show what's good ✅ and what needs work ⚠️
3. Give actionable steps to improve
4. Make it a game: "Get to 90% before creating game plans!"

---

## 📊 Health Score Calculation

### **Total Score: 100 Points**

```typescript
interface PlaybookHealthScore {
  overall: number; // 0-100
  breakdown: {
    formationLinking: number; // 0-30 points
    formationCompleteness: number; // 0-20 points
    playCompleteness: number; // 0-25 points
    dataConsistency: number; // 0-15 points
    organizationQuality: number; // 0-10 points
  };
  issues: HealthIssue[];
  recommendations: string[];
}

interface HealthIssue {
  severity: "critical" | "warning" | "info";
  category: string;
  description: string;
  affectedItems: string[]; // play IDs or formation IDs
  howToFix: string;
  pointsToGain: number;
}
```

---

## 🏗️ Score Categories

### **1. Formation Linking (30 points)**

**What it measures:** Are plays properly linked to formations via `formation_id`?

**Scoring:**

```typescript
function calculateFormationLinkingScore(playbook: Playbook): number {
  const totalPlays = playbook.plays.length;
  const playsWithFormationId = playbook.plays.filter(
    (p) => p.formation_id !== null
  ).length;

  const percentage = (playsWithFormationId / totalPlays) * 100;

  // 30 points max
  return Math.round((percentage / 100) * 30);
}
```

**Examples:**

- 7/7 plays linked: **30/30 points** ✅
- 5/7 plays linked: **21/30 points** ⚠️
- 0/7 plays linked: **0/30 points** ❌

**Issues Generated:**

```typescript
{
  severity: 'critical',
  category: 'Formation Linking',
  description: '2 plays are not linked to formations',
  affectedItems: ['play-uuid-1', 'play-uuid-2'],
  howToFix: 'Edit each play and select a formation from the dropdown',
  pointsToGain: 9
}
```

---

### **2. Formation Completeness (20 points)**

**What it measures:** Do formations have opposites linked? Are personnel set?

**Scoring:**

```typescript
function calculateFormationCompletenessScore(formations: Formation[]): number {
  let totalPoints = 0;

  // 10 points: Opposite formations linked
  const formationsWithOpposites = formations.filter(
    (f) => f.opposite_formation_id !== null
  );
  totalPoints += (formationsWithOpposites.length / formations.length) * 10;

  // 10 points: Personnel configurations set
  const formationsWithPersonnel = formations.filter(
    (f) => f.personnel_id !== null
  );
  totalPoints += (formationsWithPersonnel.length / formations.length) * 10;

  return Math.round(totalPoints);
}
```

**Examples:**

- All formations have opposites + personnel: **20/20** ✅
- 50% have opposites, 100% have personnel: **15/20** 🟡
- Nothing set: **0/20** ❌

**Issues Generated:**

```typescript
{
  severity: 'warning',
  category: 'Formation Completeness',
  description: '3 formations missing opposite links',
  affectedItems: ['Trips Left', 'Empty Right', 'Pistol'],
  howToFix: 'Open Formation Builder → For each formation, select its opposite',
  pointsToGain: 5
}
```

---

### **3. Play Completeness (25 points)**

**What it measures:** Do plays have diagrams, descriptions, tags, etc.?

**Scoring:**

```typescript
function calculatePlayCompletenessScore(plays: Play[]): number {
  const scores = plays.map((play) => {
    let playScore = 0;

    if (play.diagram) playScore += 0.3; // 30% weight
    if (play.description) playScore += 0.2; // 20% weight
    if (play.tags?.length > 0) playScore += 0.15; // 15% weight
    if (play.personnel_id) playScore += 0.15; // 15% weight
    if (play.play_type) playScore += 0.1; // 10% weight (run/pass)
    if (play.concept) playScore += 0.1; // 10% weight (RPO, Play Action, etc.)

    return playScore;
  });

  const avgScore = scores.reduce((a, b) => a + b, 0) / plays.length;
  return Math.round(avgScore * 25);
}
```

**Examples:**

- All plays fully detailed: **25/25** ✅
- Plays have diagrams but missing descriptions: **18/25** 🟡
- Minimal data: **8/25** ⚠️

**Issues Generated:**

```typescript
{
  severity: 'info',
  category: 'Play Completeness',
  description: '4 plays missing diagrams',
  affectedItems: ['Y-Sail', 'Mesh Cross', 'Power Right', 'QB Sneak'],
  howToFix: 'Edit play → Upload diagram or use Formation Builder to draw',
  pointsToGain: 8
}
```

---

### **4. Data Consistency (15 points)**

**What it measures:** Are naming conventions consistent? Any duplicates?

**Scoring:**

```typescript
function calculateDataConsistencyScore(playbook: Playbook): number {
  let deductions = 0;

  // Check for duplicate play names
  const playNames = playbook.plays.map((p) => p.name.toLowerCase());
  const duplicateNames = playNames.filter(
    (name, index) => playNames.indexOf(name) !== index
  );
  deductions += duplicateNames.length * 2; // -2 points per duplicate

  // Check for duplicate formation names
  const formationNames = playbook.formations.map((f) => f.name.toLowerCase());
  const duplicateFormations = formationNames.filter(
    (name, index) => formationNames.indexOf(name) !== index
  );
  deductions += duplicateFormations.length * 2;

  // Check for inconsistent naming (e.g., "Trips Left" vs "trips left" vs "TripsLeft")
  const hasInconsistentCapitalization = playNames.some((name, i) =>
    playNames.some(
      (otherName, j) =>
        i !== j && name === otherName.toLowerCase() && name !== otherName
    )
  );
  if (hasInconsistentCapitalization) deductions += 3;

  // Check for orphaned data (plays referencing non-existent formations)
  const orphanedPlays = playbook.plays.filter(
    (p) =>
      p.formation_id &&
      !playbook.formations.find((f) => f.id === p.formation_id)
  );
  deductions += orphanedPlays.length * 3; // -3 points per orphan (critical!)

  return Math.max(0, 15 - deductions);
}
```

**Issues Generated:**

```typescript
{
  severity: 'warning',
  category: 'Data Consistency',
  description: 'Duplicate play names detected',
  affectedItems: ['Y-Sail', 'Y-Sail'],
  howToFix: 'Rename one to "Y-Sail (Alt)" or delete duplicate',
  pointsToGain: 2
}
```

---

### **5. Organization Quality (10 points)**

**What it measures:** Are plays tagged/categorized for easy searching?

**Scoring:**

```typescript
function calculateOrganizationScore(plays: Play[]): number {
  // Bonus points for good organization
  let points = 0;

  // 5 points: Most plays have tags
  const playsWithTags = plays.filter((p) => p.tags && p.tags.length > 0);
  points += (playsWithTags.length / plays.length) * 5;

  // 5 points: Variety of tags (not just one tag for everything)
  const uniqueTags = new Set(plays.flatMap((p) => p.tags || []));
  if (uniqueTags.size >= 5) points += 5;
  else if (uniqueTags.size >= 3) points += 3;
  else if (uniqueTags.size >= 1) points += 1;

  return Math.round(points);
}
```

**Examples:**

- Rich tagging (5+ unique tags): **10/10** ✅
- Basic tagging: **5/10** 🟡
- No tags: **0/10** ⚠️

---

## 🎨 UI Design

### **Health Score Card (Dashboard)**

```
┌─────────────────────────────────────────────────────────────┐
│  Playbook Health Score                                      │
│                                                             │
│            87 / 100  🟢 Great!                              │
│  ████████████████████░░░░░                                  │
│                                                             │
│  You're almost there! Fix 3 issues to reach 90.            │
│  [View Details]                                             │
└─────────────────────────────────────────────────────────────┘
```

### **Health Score Details Page**

```
┌─────────────────────────────────────────────────────────────┐
│  Playbook Health: 87/100 🟢                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Score Breakdown:                                           │
│  ────────────────                                           │
│  ✅ Formation Linking        30/30  Perfect!                │
│  ✅ Formation Completeness   20/20  All set!                │
│  🟡 Play Completeness        18/25  Good, can improve       │
│  🟢 Data Consistency         14/15  Nearly perfect          │
│  🟡 Organization Quality      5/10  Needs tags              │
│                                                             │
│  Issues to Fix (3):                                         │
│  ────────────────                                           │
│  ⚠️ 4 plays missing diagrams        [+8 points]            │
│     → Y-Sail, Mesh Cross, Power Right, QB Sneak            │
│     → Fix: Edit play → Add diagram                          │
│                                                             │
│  ℹ️ Only 2 unique tags across playbook  [+5 points]        │
│     → Add tags: "3rd Down", "Red Zone", "Play Action"      │
│     → Fix: Edit plays → Add tags                            │
│                                                             │
│  ℹ️ 1 play missing description      [+2 points]            │
│     → QB Sneak has no description                           │
│     → Fix: Edit QB Sneak → Add description                  │
│                                                             │
│  [Fix All Issues] [Dismiss]                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎮 Gamification

### **Score Tiers:**

```typescript
function getHealthTier(score: number): HealthTier {
  if (score >= 95) return { level: "Elite", emoji: "💎", color: "purple" };
  if (score >= 90) return { level: "Excellent", emoji: "🟢", color: "green" };
  if (score >= 80) return { level: "Great", emoji: "🟡", color: "yellow" };
  if (score >= 70) return { level: "Good", emoji: "🟠", color: "orange" };
  if (score >= 60) return { level: "Fair", emoji: "🔴", color: "red" };
  return { level: "Needs Work", emoji: "⚠️", color: "red" };
}
```

**Visual Feedback:**

- **95-100:** 💎 "Elite! Your playbook is championship-caliber!"
- **90-94:** 🟢 "Excellent! Ready for analytics!"
- **80-89:** 🟡 "Great! A few tweaks away from excellent."
- **70-79:** 🟠 "Good! Keep improving."
- **60-69:** 🔴 "Fair. Let's clean this up."
- **<60:** ⚠️ "Needs work. Start with critical issues."

### **Achievements:**

```typescript
const achievements = [
  {
    id: "perfect-linking",
    title: "🔗 Link Master",
    description: "All plays linked to formations",
    requirement: "formationLinking === 30",
    reward: "Unlocked: Multi-select plays!",
  },
  {
    id: "organization-guru",
    title: "🏷️ Tag Champion",
    description: "10+ unique tags across playbook",
    requirement: "uniqueTags >= 10",
    reward: "Unlocked: Advanced filters!",
  },
  {
    id: "elite-playbook",
    title: "💎 Elite Playbook",
    description: "Health score 95+",
    requirement: "overall >= 95",
    reward: "Unlocked: AI Recommendations!",
  },
];
```

---

## 🚀 Implementation Plan

### **Phase 2, Week 1: Build Health Score Calculator**

**Files to Create:**

```typescript
// src/services/playbookHealthService.ts
export function calculatePlaybookHealth(
  playbookId: string
): PlaybookHealthScore {
  // Implementation
}

// src/components/playbook/PlaybookHealthCard.tsx
export function PlaybookHealthCard({ playbookId }: Props) {
  // Display score card
}

// src/pages/PlaybookHealthPage.tsx
export function PlaybookHealthPage() {
  // Full details page
}
```

### **Testing:**

```typescript
// Test with our 7-play playbook
describe("PlaybookHealth", () => {
  it("calculates score correctly for small playbook", () => {
    const score = calculatePlaybookHealth("test-playbook-id");
    expect(score.overall).toBeGreaterThan(0);
    expect(score.overall).toBeLessThanOrEqual(100);
  });

  it("identifies missing formation links", () => {
    // Test with plays missing formation_id
  });
});
```

---

## 📊 Success Metrics

**Phase 2 is successful when:**

- [ ] Health score displays on Playbook page
- [ ] Coaches can drill down to see issues
- [ ] Fixing an issue updates score in real-time
- [ ] Beta coaches find it helpful (survey feedback >4/5 stars)

**Target for Stage 1 Complete:**

- [ ] All coaches have playbook health >85/100
- [ ] All coaches understand how to improve their score
- [ ] Health score becomes a regular check ("How's my playbook health?")

---

**Ready to Build:** YES  
**Next:** Implement in Phase 2 (Week 2 of Stage 1)
