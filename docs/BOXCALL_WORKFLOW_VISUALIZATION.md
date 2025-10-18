# BoxCall Workflow Visualization

**Visual guide to understanding how coaches use BoxCall from playbook to analytics.**

---

## 🎯 The Complete Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           BOXCALL COACHING WORKFLOW                             │
└─────────────────────────────────────────────────────────────────────────────────┘

PHASE 1: ORGANIZE
┌──────────────────────────────────────────────────────────────────────────────┐
│  PLAYBOOK                                                                    │
│  ────────                                                                    │
│  • Formation Builder → Create formations (Trips, Spread, I-Form)            │
│  • Play Library → 150+ plays with diagrams                                  │
│  • Each play → Linked to formation via formation_id                         │
│                                                                              │
│  [Multi-Select Plays] → Add to Practice Script OR Game Plan                 │
└──────────────────────────────────────────────────────────────────────────────┘
                                    ↓
                          ┌─────────┴─────────┐
                          ↓                   ↓
            ┌─────────────────────┐  ┌────────────────────┐
            │ PRACTICE SCRIPT     │  │ GAME PLAN          │
            │ ───────────────     │  │ ─────────          │
            │ 10-15 plays         │  │ 80-120 plays       │
            │ • Install (5)       │  │ • First & 10 (10)  │
            │ • Review (8)        │  │ • 3rd & Short (8)  │
            │ • Red Zone (3)      │  │ • Red Zone (12)    │
            │                     │  │ • 2-Min Drill (6)  │
            │ 10 reps planned     │  │ ... (12 situations)│
            └─────────────────────┘  └────────────────────┘

PHASE 2: EXECUTE
┌──────────────────────────────────────────────────────────────────────────────┐
│  BOXCALL LIVE SESSION                                                        │
│  ────────────────────                                                        │
│                                                                              │
│  PRACTICE MODE:                      GAME MODE:                             │
│  • Load Tuesday Practice Script      • Load Friday Game Plan                │
│  • Track each rep:                   • Live during game:                    │
│    ✓ Success  ✗ Failure               - Situation: 3rd & 7                  │
│  • Add notes: "QB late on read"       - BoxCall recommends: Y-Sail (92%)   │
│  • Result: Y-Sail went 8/10          • Coach calls play                     │
│                                       • Assistant marks: ✓ +12 yds          │
│                                       • OR log retroactively after game     │
│                                                                              │
│  Offline Mode: Saves locally → Syncs when connected                         │
└──────────────────────────────────────────────────────────────────────────────┘
                                    ↓
                              DATA STORED
                                    ↓
                         ┌──────────────────────┐
                         │ play_executions      │
                         │ ──────────────────   │
                         │ • play_id            │
                         │ • formation_id       │
                         │ • result (✓/✗)       │
                         │ • yards_gained       │
                         │ • situation (down/dist)│
                         │ • timestamp          │
                         └──────────────────────┘

PHASE 3: ANALYZE
┌──────────────────────────────────────────────────────────────────────────────┐
│  ANALYTICS ENGINE (Runs automatically after each execution)                  │
│  ────────────────                                                            │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ CONFIDENCE ALGORITHM                                                │   │
│  │                                                                     │   │
│  │ Y-Sail from Trips Left: 92/100 🔥                                   │   │
│  │                                                                     │   │
│  │ Calculation:                                                        │   │
│  │ • Historical Success: 20/23 (87%) → 87 × 0.40 = 34.8              │   │
│  │ • Recent Trend: 7/8 last calls (88%) → 88 × 0.30 = 26.4           │   │
│  │ • Volume: 23 executions (good) → 90 × 0.15 = 13.5                 │   │
│  │ • Recency: Last call 3 days ago → 95 × 0.10 = 9.5                 │   │
│  │ • Situational: 3rd & 5-8 (9/10) → 90 × 0.05 = 4.5                 │   │
│  │                                                                     │   │
│  │ Total: 34.8 + 26.4 + 13.5 + 9.5 + 4.5 = 88.7 ≈ 89/100             │   │
│  │ (Rounded to 92 for display with recent hot streak bonus)           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ SITUATIONAL INTELLIGENCE                                            │   │
│  │                                                                     │   │
│  │ Best plays for 3rd & 7:                                            │   │
│  │ 1. Y-Sail (Trips) - 92% confidence  [Call This!]                   │   │
│  │ 2. Mesh Cross (Spread) - 89%  [Good Option]                        │   │
│  │ 3. Curl Flat (Doubles) - 84%  [Reliable]                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ LIVE GAME INTELLIGENCE                                              │   │
│  │                                                                     │   │
│  │ Q4, 3rd & 7 vs Lincoln:                                            │   │
│  │                                                                     │   │
│  │ Season Stats: Y-Sail 87% confidence                                 │   │
│  │ This Game: Called 3x, 3/3 success (100%)                           │   │
│  │                                                                     │   │
│  │ ▶ ADJUSTED CONFIDENCE: 95% 🔥                                       │   │
│  │   "Money play today! But called 3x - don't get predictable"        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘

PHASE 4: INSIGHTS
┌──────────────────────────────────────────────────────────────────────────────┐
│  BOXCALL DASHBOARD                                                           │
│  ─────────────────                                                           │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  Season Overview                                                   │    │
│  │  ──────────────                                                    │    │
│  │  • 156 plays in playbook                                           │    │
│  │  • 847 practice reps tracked                                       │    │
│  │  • 8 games logged                                                  │    │
│  │  • Average confidence: 84/100                                      │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  🔥 Hot Plays (Last 2 weeks)                                       │    │
│  │  ────────────────────────                                          │    │
│  │  1. Y-Sail (Trips) - 97% confidence, 12/12 success               │    │
│  │  2. Mesh Cross (Spread) - 95% confidence, 10/11 success          │    │
│  │  3. Power Right (I-Form) - 92% confidence, 18/20 success         │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  ❄️ Cold Plays (Need work)                                        │    │
│  │  ─────────────────────────                                         │    │
│  │  • Trey Left Smash - 45% confidence, 2/6 recent                   │    │
│  │  • Empty Fade - 52% confidence, 3/8 recent                        │    │
│  │  Recommendation: Add these to next practice script!                │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  📊 Reports                                                        │    │
│  │  ──────────                                                        │    │
│  │  • Practice Report: Rep counts, success rates, coaching notes     │    │
│  │  • Game Report: Play-by-play, drive analysis, situational success │    │
│  │  • Season Report: Trend analysis, playbook health, recommendations│    │
│  │  [Export to PDF] [Share Link] [Print for Coaches]                 │    │
│  └────────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 The Feedback Loop

```
┌──────────────────────────────────────────────────────────────────────┐
│                       THE LEARNING CYCLE                             │
└──────────────────────────────────────────────────────────────────────┘

Week 1:
  Playbook → Practice Script → Track Reps → Y-Sail: 70% confidence
  (Not enough data yet)

Week 2:
  Playbook → Practice Script → Track Reps → Y-Sail: 78% confidence
  (Building confidence, 8/10 success in practice)

Week 3:
  Playbook → Game Plan → Game Session → Y-Sail: 85% confidence
  (Called 3 times in game, 3/3 success!)

Week 4:
  Playbook → Game Plan → BoxCall recommends Y-Sail for 3rd & 7
  (92% confidence - proven money play!)

Week 8:
  BoxCall: "Y-Sail is being overused. Opponent has seen it 6x.
           Consider: Mesh Cross (similar success, not yet called today)"
  (AI prevents predictability)

Season End:
  Dashboard: Y-Sail was your #1 play (23/25 success, 92% season avg)
  Export Season Report → Share with staff → Plan next season
```

---

## 📊 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DATABASE STRUCTURE                          │
└─────────────────────────────────────────────────────────────────────┘

PLAYBOOK LAYER (Stage 1)
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  formations      │    │  plays           │    │  playbooks       │
│  ──────────────  │◄───│  ──────────────  │───►│  ──────────────  │
│  id              │    │  id              │    │  id              │
│  name            │    │  name            │    │  name            │
│  personnel_id    │    │  formation_id ───┘    │  user_id         │
│  opposite_form_id│    │  playbook_id ─────────┘  created_at      │
└──────────────────┘    └──────────────────┘    └──────────────────┘

PLANNING LAYER (Stage 2)
┌───────────────────┐    ┌──────────────────┐
│ practice_scripts  │    │ game_plans       │
│ ─────────────────│    │ ──────────────── │
│ id                │    │ id               │
│ name              │    │ opponent         │
│ playbook_id       │    │ game_date        │
│ created_at        │    │ playbook_id      │
└─────────┬─────────┘    └─────────┬────────┘
          │                        │
          ↓                        ↓
┌───────────────────────┐  ┌───────────────────────┐
│ practice_script_plays │  │ game_plan_plays       │
│ ─────────────────────│  │ ─────────────────────│
│ script_id             │  │ game_plan_id          │
│ play_id ──────────────┼──┼─► play_id             │
│ order_number          │  │ situation_type        │
│ reps_planned          │  │ order_number          │
└───────────────────────┘  └───────────────────────┘

EXECUTION LAYER (Stage 3)
┌───────────────────┐    ┌──────────────────┐
│ practice_sessions │    │ game_sessions    │
│ ─────────────────│    │ ──────────────── │
│ id                │    │ id               │
│ script_id         │    │ game_plan_id     │
│ date              │    │ date             │
│ mode (live/retro) │    │ mode (live/retro)│
└─────────┬─────────┘    └─────────┬────────┘
          │                        │
          └────────────┬───────────┘
                       ↓
            ┌──────────────────────┐
            │ play_executions      │
            │ ──────────────────── │
            │ id                   │
            │ session_id           │
            │ play_id ─────────────┼──► Links to plays table
            │ formation_id ────────┼──► Links to formations table
            │ result (✓/✗)         │
            │ yards_gained         │
            │ down, distance       │
            │ defensive_coverage   │
            │ timestamp            │
            │ coaching_notes       │
            └──────────────────────┘
                       ↓
                 (Triggers update)
                       ↓

ANALYTICS LAYER (Stage 4)
┌──────────────────────────┐    ┌──────────────────────┐
│ play_confidence_scores   │    │ situational_stats    │
│ ────────────────────────│    │ ──────────────────── │
│ play_id                  │    │ play_id              │
│ confidence_score (0-100) │    │ situation_type       │
│ total_executions         │    │ success_rate         │
│ successful_executions    │    │ avg_yards            │
│ recent_trend (hot/cold)  │    │ sample_size          │
│ last_calculated          │    │ best_defenses        │
│ last_executed            │    │ worst_defenses       │
└──────────────────────────┘    └──────────────────────┘

┌──────────────────────────┐
│ formation_analytics      │
│ ────────────────────────│
│ formation_id             │
│ success_rate             │
│ total_plays              │
│ best_situations[]        │
│ weak_situations[]        │
│ trend (improving/decline)│
└──────────────────────────┘
```

---

## 🎬 User Stories

### **Story 1: Installing New Plays**

```
As a Coach,
I want to create a practice script with new install plays,
So that I can track how well players learn them.

Flow:
1. Go to Playbook
2. Multi-select 5 new plays
3. Click "Add to Practice Script"
4. Name: "Tuesday Install - Week 8"
5. Set 10 reps per play
6. Save script

During Practice:
1. Open BoxCall → Load Tuesday Install script
2. Run Y-Sail rep #1 → Mark ✓ Success
3. Run Y-Sail rep #2 → Mark ✗ Failure (QB late)
4. Add note: "Need more timing work"
5. Complete all 10 reps
6. See summary: Y-Sail 7/10 (70% success)

Result:
- Y-Sail confidence starts at 70%
- Added to "review" list for next week
- Coach knows it needs more reps
```

### **Story 2: Game Planning**

```
As a Coach,
I want to build a game plan for Friday's game,
So that I'm prepared for every situation.

Flow:
1. Go to Playbook
2. Multi-select 80 plays
3. Click "Add to Game Plan"
4. Name: "vs Lincoln HS - Week 8"
5. BoxCall organizes into 12 Billick situations
6. Coach adjusts order within each situation
7. Export to PDF → Print for press box

During Game:
1. Open BoxCall on iPad (press box)
2. Situation: 3rd & 7, own 35-yard line
3. BoxCall shows: "3rd & Medium" situation
4. Recommends: Y-Sail (92%), Mesh Cross (89%)
5. Coach calls Y-Sail
6. Assistant marks: ✓ Success, +12 yards, FIRST DOWN
7. BoxCall updates confidence: 92% → 95%

Q4, 3rd & 7 again:
1. BoxCall: "Y-Sail 95% confidence 🔥 BUT called 3x today"
2. Recommends: Mesh Cross (fresh look, 89%)
3. Coach calls Mesh Cross
4. ✓ Success, +15 yards, TD!

Post-Game:
- Export game report
- Y-Sail: 3/3, 36 yards
- Mesh Cross: 2/2, 27 yards (1 TD)
- Share with staff
```

### **Story 3: Fixing Cold Plays**

```
As a Coach,
I notice Empty Fade has low confidence (52%),
So I want to practice it more.

Analytics Dashboard shows:
- Empty Fade: 52% confidence ❄️ (Cold)
- 3/8 recent success
- Problem: Timing between QB and WR
- Works vs Man (4/5) but fails vs Zone (2/6)

Action Plan:
1. Create practice script: "Fix Empty Fade"
2. Add 15 reps vs Zone looks
3. Track practice sessions
4. After 2 weeks: 12/15 success
5. Confidence rises: 52% → 78% → 85%
6. Add back to game plan for next opponent

Result:
- Play fixed through targeted practice
- BoxCall tracked improvement
- Coach confident to call it again
```

---

## 🚀 The "Aha!" Moment

**Before BoxCall:**

> "Should I call Y-Sail here? I think it worked last week... or was that Mesh Cross? I can't remember. I'll just wing it."

**With BoxCall:**

> "BoxCall says Y-Sail has 92% confidence on 3rd & 7. It's worked 9 out of 10 times this season, and we just hit it twice already today. The algorithm says call it!"

**The Confidence:**

> Coach no longer guesses. BoxCall knows your offense better than anyone. It's tracked every rep, every game, every situation. It's your assistant coach with perfect memory and instant analysis.

---

**Full Roadmap:** [BOXCALL_ANALYTICS_COMPLETE_ROADMAP.md](./BOXCALL_ANALYTICS_COMPLETE_ROADMAP.md)  
**Quick Reference:** [BOXCALL_ROADMAP_QUICKSTART.md](./BOXCALL_ROADMAP_QUICKSTART.md)

**Let's nail this! 🏈🚀**
