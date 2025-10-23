# BoxCall Analytics Roadmap - Quick Reference

**Full Roadmap:** See [BOXCALL_ANALYTICS_COMPLETE_ROADMAP.md](./BOXCALL_ANALYTICS_COMPLETE_ROADMAP.md)

---

## 🎯 The Vision

**"Start with really clean and tight data from the playbook. Then the BoxCall page is the feature app to start getting confidence and analytics."**

Build the workflow coaches actually use:

1. **Organize plays** → Practice Scripts & Game Plans
2. **Track execution** → BoxCall Live Sessions
3. **Analyze results** → Confidence & Analytics

---

## 📅 Timeline Summary

| Stage                    | Duration                  | Key Deliverables                            |
| ------------------------ | ------------------------- | ------------------------------------------- |
| **1. Data Foundation**   | Oct 17 - Nov 7 (3 weeks)  | Formation linking, validation, multi-select |
| **2. Planning Features** | Nov 7 - Dec 5 (4 weeks)   | Practice Scripts, Game Plans (Billick)      |
| **3. BoxCall Live**      | Dec 5 - Jan 2 (4 weeks)   | Live/retroactive session tracking           |
| **4. Analytics Engine**  | Jan 2 - Jan 30 (4 weeks)  | Confidence scores, recommendations          |
| **5. Polish & Launch**   | Jan 30 - Feb 15 (2 weeks) | Dashboard, mobile, beta testing             |

**Launch Date:** February 15, 2026 🚀

---

## 🚦 Current Status

**Today:** October 17, 2025  
**Current Phase:** Phase 1 - Formation-Play Linking  
**Next Milestone:** Formation linking complete by Oct 28

---

## 🏈 The Coaching Workflow

### **Step 1: Build Playbook** (Already done!)

- Formation Builder (3 tabs)
- Play library (150+ plays)
- Personnel configurations

### **Step 2: Create Practice Scripts** (Stage 2)

- Select 10-15 plays from playbook
- Organize into practice script
- Templates: Install, Review, Red Zone, 3rd Down

**Example:**

```
Tuesday Practice Script:
• 5 Install plays (new this week)
• 8 Review plays (review from last week)
• 3 Red Zone plays
• 10 planned reps each
```

### **Step 3: Create Game Plan** (Stage 2)

- Select 80-120 plays from playbook
- Organize by Billick situations (12 categories)
- Print for press box

**Billick Situations:**

1. First & 10
2. Second & Short (1-3)
3. Second & Medium (4-7)
4. Second & Long (8+)
5. Third & Short (1-3)
6. Third & Medium (4-7)
7. Third & Long (8+)
8. Red Zone (Inside 20)
9. Goal Line (Inside 5)
10. Two-Minute Drill
11. Short Yardage (4th & 1-2)
12. Situational (Trick plays, etc.)

### **Step 4: BoxCall Live Sessions** (Stage 3)

#### **Practice Mode:**

```
1. Load Tuesday Practice Script
2. During practice: Mark each rep as ✓ Success or ✗ Failure
3. Add notes: "QB late on read"
4. System tracks: 8/10 reps successful on Y-Sail
```

#### **Game Mode:**

```
1. Load Friday Game Plan
2. During game:
   - BoxCall shows recommended plays for situation
   - Coach calls play
   - Assistant marks result (Success/Failure, yards gained)
3. OR log retroactively after game
```

### **Step 5: Analytics & Insights** (Stage 4)

BoxCall calculates confidence scores based on execution history:

**Confidence Algorithm:**

- Historical Success (40% weight)
- Recent Trend (30% weight)
- Volume of Data (15% weight)
- Recency (10% weight)
- Situational Fit (5% weight)

**Result:**

```
Y-Sail from Trips Left: 92/100 confidence 🔥

Why?
• 23 total executions, 20 successes (87%)
• Last 8 calls: 7 successes (hot streak!)
• Best on 3rd & 5-8 (9/10 success)
• Works great vs Cover 2 (10/11)

Recommendation: Call on 3rd & 7 today!
```

---

## 🎯 What Makes This Different

### **Other Apps:**

- Generic play-calling tools
- No learning from your data
- One-size-fits-all recommendations

### **BoxCall:**

- Learns YOUR offense
- Tracks YOUR executions
- Knows what works for YOUR team
- Adapts to THIS GAME's performance

**Example:**

```
Season-long: Y-Sail has 87% confidence
This Game: Called 3 times, 3/3 success (100%)
Q4, 3rd & 7: BoxCall boosts to 95% "🔥 Money play today!"
```

---

## 📊 Success Metrics

### **By Stage 1 Complete (Nov 7):**

- [ ] 95%+ plays linked to formations
- [ ] Multi-select works perfectly
- [ ] Playbook health score: 85/100

### **By Stage 2 Complete (Dec 5):**

- [ ] 80%+ coaches create practice scripts
- [ ] 70%+ coaches create game plans
- [ ] Average script: 10-15 plays
- [ ] Average game plan: 80-120 plays

### **By Stage 3 Complete (Jan 2):**

- [ ] <10 seconds to log each play
- [ ] 90%+ practice reps tracked
- [ ] 70%+ game plays logged
- [ ] Offline mode works flawlessly

### **By Stage 4 Complete (Jan 30):**

- [ ] Confidence scores within 10% of actual success
- [ ] Trend detection 80%+ accurate
- [ ] <200ms recommendation query time
- [ ] 85%+ coach satisfaction

### **By Launch (Feb 15):**

- [ ] <2 second page load
- [ ] 95%+ mobile compatibility
- [ ] 80%+ weekly active users
- [ ] 4+ star average rating

---

## 🛠️ Tech Stack

**Frontend:**

- React + TypeScript
- Tailwind CSS
- React Query (data fetching)
- Zustand (state management)

**Backend:**

- Supabase (PostgreSQL)
- Edge Functions (analytics calculations)
- Real-time subscriptions (live updates)

**Key Tables:**

```sql
formations              -- Formation definitions
plays                   -- Play library
practice_scripts        -- Practice organization
game_plans              -- Game planning (Billick)
practice_sessions       -- Practice tracking
game_sessions           -- Game tracking
play_executions         -- Every rep/play result
play_confidence_scores  -- Calculated confidence
situational_stats       -- Success by situation
```

---

## 🚀 Next Actions

### **This Week (Oct 17-24):**

1. Update `AddNewPlayModal` to auto-create formations
2. Add `formation_id` to play creation flow
3. Test formation linking with 10 sample plays

### **Next Week (Oct 24-28):**

1. Build migration script for existing plays
2. Link all 150+ plays to formations
3. Validate no orphaned data

### **Week of Oct 28 - Nov 7:**

1. Add multi-select to PlaybookPage
2. Build "Add to Script" functionality
3. Complete Stage 1

---

## 📞 Questions?

**See Full Roadmap:** [BOXCALL_ANALYTICS_COMPLETE_ROADMAP.md](./BOXCALL_ANALYTICS_COMPLETE_ROADMAP.md)

**Key Documents:**

- [FORMATION_SCHEMA_WORKFLOW_VISUALIZATION.md](./FORMATION_SCHEMA_WORKFLOW_VISUALIZATION.md) - Database schema
- [PLAY_FORMATION_DATA_FLOW_AND_ANALYTICS.md](./PLAY_FORMATION_DATA_FLOW_AND_ANALYTICS.md) - Data flow explained

---

**Let's nail this! 🏈🚀**

**Document Version:** 1.0  
**Created:** October 17, 2025  
**Status:** ✅ Ready to Execute
