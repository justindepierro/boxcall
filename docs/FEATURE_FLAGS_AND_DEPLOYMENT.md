# Feature Flags & Incremental Deployment Strategy

**Purpose:** Deploy every little win without breaking production.  
**Philosophy:** "Ship fast, ship often, ship safely."  
**Status:** Ready to implement in Stage 1

---

## 🎯 The Strategy

> "I think we deploy every little win. and let people know this is a one man gig."

**Core Principles:**

1. **Feature flags** - Hide incomplete features from users
2. **Backward compatible** - Never break existing functionality
3. **Incremental rollout** - Beta coaches first, then everyone
4. **Clear communication** - Users know what's coming and why
5. **Fast iteration** - Deploy daily/weekly, get feedback quick

---

## 🚩 Feature Flag System

### **Implementation:**

```typescript
// src/config/featureFlags.ts

export interface FeatureFlags {
  // Stage 1: Data Foundation
  ENABLE_FORMATION_LINKING: boolean; // Phase 1
  ENABLE_PLAYBOOK_HEALTH_SCORE: boolean; // Phase 2
  ENABLE_MULTI_SELECT_PLAYS: boolean; // Phase 3

  // Stage 2: Planning Features
  ENABLE_PRACTICE_SCRIPTS: boolean; // Phase 4
  ENABLE_GAME_PLANS: boolean; // Phase 5

  // Stage 3: BoxCall Live
  ENABLE_BOXCALL_LIVE: boolean; // Phase 7-10
  ENABLE_PRACTICE_SESSION_TRACKING: boolean;
  ENABLE_GAME_SESSION_TRACKING: boolean;

  // Stage 4: Analytics
  ENABLE_CONFIDENCE_SCORES: boolean; // Phase 11-14
  ENABLE_ANALYTICS_DASHBOARD: boolean;
  ENABLE_AI_RECOMMENDATIONS: boolean;

  // Beta Testing
  ENABLE_BETA_FEATURES: boolean; // Master switch for beta coaches
}

// Default flags (production)
export const DEFAULT_FLAGS: FeatureFlags = {
  ENABLE_FORMATION_LINKING: true, // Always on once deployed
  ENABLE_PLAYBOOK_HEALTH_SCORE: false, // Off until Phase 2 complete
  ENABLE_MULTI_SELECT_PLAYS: false,
  ENABLE_PRACTICE_SCRIPTS: false,
  ENABLE_GAME_PLANS: false,
  ENABLE_BOXCALL_LIVE: false,
  ENABLE_PRACTICE_SESSION_TRACKING: false,
  ENABLE_GAME_SESSION_TRACKING: false,
  ENABLE_CONFIDENCE_SCORES: false,
  ENABLE_ANALYTICS_DASHBOARD: false,
  ENABLE_AI_RECOMMENDATIONS: false,
  ENABLE_BETA_FEATURES: false,
};

// Beta flags (for beta coaches)
export const BETA_FLAGS: FeatureFlags = {
  ...DEFAULT_FLAGS,
  ENABLE_BETA_FEATURES: true,
  // Enable features as they're ready for beta testing
};

// Get flags for current user
export function getFeatureFlags(user: User): FeatureFlags {
  // Check if user is beta tester
  if (user.isBetaTester || user.email.endsWith("@boxcall.dev")) {
    return BETA_FLAGS;
  }

  return DEFAULT_FLAGS;
}

// Hook for components
export function useFeatureFlag(flag: keyof FeatureFlags): boolean {
  const { user } = useAuth();
  const flags = getFeatureFlags(user);
  return flags[flag];
}
```

### **Usage in Components:**

```tsx
// Example: Hide multi-select until ready
function PlaybookPage() {
  const canMultiSelect = useFeatureFlag("ENABLE_MULTI_SELECT_PLAYS");

  return (
    <div>
      <h1>Playbook</h1>

      {canMultiSelect && <button onClick={handleSelectAll}>Select All</button>}

      <PlayList plays={plays} />
    </div>
  );
}

// Example: Show beta badge
function NavigationMenu() {
  const betaEnabled = useFeatureFlag("ENABLE_BETA_FEATURES");
  const scriptsEnabled = useFeatureFlag("ENABLE_PRACTICE_SCRIPTS");

  return (
    <nav>
      <NavLink to="/playbook">Playbook</NavLink>

      {scriptsEnabled && (
        <NavLink to="/practice-scripts">
          Practice Scripts
          {betaEnabled && <Badge>BETA</Badge>}
        </NavLink>
      )}
    </nav>
  );
}
```

---

## 📦 Deployment Workflow

### **Step-by-Step for Each Feature:**

```
1. Develop Feature (feature branch)
   ├─ Write code with feature flag OFF by default
   ├─ Add tests
   ├─ Test locally
   └─ Create PR

2. Code Review
   ├─ Review on GitHub
   ├─ Run CI/CD checks
   └─ Merge to main

3. Deploy to Production (feature flag still OFF)
   ├─ Deploy to Netlify
   ├─ Verify deployment successful
   └─ Feature is in production but hidden

4. Enable for Beta Coaches
   ├─ Update BETA_FLAGS to enable feature
   ├─ Deploy flag change
   ├─ Email beta coaches: "New feature live! Try it out"
   └─ Monitor feedback

5. Iterate Based on Feedback
   ├─ Fix bugs
   ├─ Adjust UI
   ├─ Deploy improvements (still beta only)
   └─ Repeat until beta coaches love it

6. Roll Out to Everyone
   ├─ Update DEFAULT_FLAGS to enable feature
   ├─ Deploy flag change
   ├─ Send announcement email
   ├─ Update changelog
   └─ Monitor metrics

7. Celebrate! 🎉
   ├─ Share win on social media
   ├─ Update roadmap status
   └─ Start next feature
```

---

## 📧 Communication Templates

### **Template 1: Beta Feature Launch**

**Subject:** [BETA] New Feature: [Feature Name] 🚀

```
Hey [Coach Name],

Quick update! We just shipped a new feature for you to test:

🎯 [Feature Name]
   [Brief description - 1-2 sentences]

How to Access:
• Go to [Page/Location]
• Click [Button/Action]
• [Try it out!]

What We Need From You:
• Use it for [timeframe: 1 week, 2 weeks, etc.]
• Reply with feedback:
  - What works well?
  - What's confusing?
  - What's missing?

Known Issues:
• [Any known bugs/limitations]

Thanks for being a beta tester! Your feedback shapes BoxCall.

- Justin

P.S. This is beta-only. Other users can't see it yet.
```

### **Template 2: Feature Launch (Everyone)**

**Subject:** New Feature: [Feature Name] 🎉

```
Hey Coaches!

Excited to announce a new feature in BoxCall:

🎉 [Feature Name]
   [Description - 2-3 sentences]

Why You'll Love It:
• [Benefit 1]
• [Benefit 2]
• [Benefit 3]

How to Get Started:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Tutorial:
[Link to tutorial video or doc]

This feature was tested by our beta coaches and refined based on their
feedback. Thanks to [Coach Names] for helping make this great!

Questions? Reply to this email.

Let's nail this! 🚀

- Justin
```

### **Template 3: Deployment Announcement (In-App)**

```
┌────────────────────────────────────────────────────────────┐
│ 🎉 New Feature: [Feature Name]                            │
│                                                            │
│ [One-line description]                                     │
│                                                            │
│ [Try It Now] [Learn More] [Dismiss]                       │
└────────────────────────────────────────────────────────────┘
```

---

## 🔄 Rollback Plan

**If something breaks:**

```typescript
// Emergency rollback (30 seconds)

// 1. Disable feature flag
export const DEFAULT_FLAGS: FeatureFlags = {
  ...DEFAULT_FLAGS,
  ENABLE_PROBLEMATIC_FEATURE: false, // ← Set to false
};

// 2. Deploy flag change
// → Feature instantly hidden from all users
// → Production is safe again

// 3. Fix issue locally, re-test, re-deploy

// 4. Re-enable flag once fixed
```

**Why this works:**

- No need to revert git commits
- No need to redeploy entire app
- Just flip a flag, deploy in seconds
- Users never see broken feature

---

## 📊 Deployment Schedule

### **Stage 1 Example:**

| Week      | Feature               | Beta Deploy | Public Deploy | Status         |
| --------- | --------------------- | ----------- | ------------- | -------------- |
| Oct 17-24 | Formation Linking     | Oct 24      | Oct 28        | ⏳ In Progress |
| Oct 24-31 | Playbook Health Score | Oct 31      | Nov 4         | 📅 Planned     |
| Nov 1-7   | Multi-Select Plays    | Nov 7       | Nov 11        | 📅 Planned     |

**Deployment Days:**

- Beta: Thursdays (gives coaches Friday-Monday to test)
- Public: Mondays (start of week, easier for support)

---

## 🧪 Testing Checklist (Before Each Deploy)

### **Pre-Deployment:**

- [ ] Feature flag defaults to OFF
- [ ] All tests pass locally
- [ ] Manual testing completed
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Accessibility checked (keyboard nav, screen reader)

### **Beta Deployment:**

- [ ] Feature flag enabled for beta users only
- [ ] Deploy successful (no errors)
- [ ] Beta coaches notified
- [ ] Monitoring set up (Sentry, analytics)

### **Post-Beta (Before Public):**

- [ ] Beta feedback incorporated
- [ ] Known issues fixed
- [ ] Tutorial/docs created
- [ ] Changelog updated

### **Public Deployment:**

- [ ] Feature flag enabled for all users
- [ ] Deploy successful
- [ ] Announcement sent
- [ ] Social media posted
- [ ] Monitor for issues (24-48 hours)

---

## 📈 Success Metrics Per Deploy

Track these after each deployment:

```typescript
interface DeploymentMetrics {
  feature: string;
  deployDate: Date;

  adoption: {
    betaUsage: number; // % of beta coaches who tried it
    publicUsage: number; // % of all users who tried it
    dailyActiveUsers: number; // DAU using this feature
  };

  quality: {
    bugReports: number; // Bugs reported in first week
    errorRate: number; // % of feature uses with errors
    rollbackCount: number; // How many times we rolled back
  };

  satisfaction: {
    betaFeedback: number; // Average rating from beta (1-5 stars)
    supportTickets: number; // How many users needed help
    featureRequests: number; // Requests for improvements
  };
}
```

**Good Deploy:**

- Beta adoption >70%
- <5 bugs in first week
- Beta feedback >4/5 stars
- <10% users need support

**Problem Deploy:**

- Beta adoption <30% (feature not intuitive?)
- > 10 bugs (needed more testing)
- Beta feedback <3/5 stars (fundamental issue)
- > 25% users need support (confusing UX)

---

## 🎯 Phase 1 Deployment Plan

### **Week 1: Formation Linking (Oct 17-24)**

**Day 1-3 (Oct 17-19):** Development

- Update AddNewPlayModal
- Add FormationService.getOrCreateFormation()
- Write tests
- Feature flag: ENABLE_FORMATION_LINKING = false

**Day 4 (Oct 20):** Code review + merge

**Day 5 (Oct 21):** Deploy to production (flag OFF)

- Feature in prod but hidden
- No user impact

**Day 6-7 (Oct 22-23):** Enable for beta

- Set BETA_FLAGS.ENABLE_FORMATION_LINKING = true
- Deploy flag change
- Email beta coaches
- Monitor usage

**Day 8 (Oct 24):** Review beta feedback

- Fix any issues
- Deploy improvements

**Following Monday (Oct 28):** Public launch

- Set DEFAULT_FLAGS.ENABLE_FORMATION_LINKING = true
- Deploy flag change
- Send announcement
- Update changelog

---

## ✅ Implementation Checklist

### **Setup (Do Once):**

- [ ] Create src/config/featureFlags.ts
- [ ] Add useFeatureFlag hook
- [ ] Add beta tester flag to user profiles (Supabase)
- [ ] Create announcement banner component
- [ ] Set up email templates

### **Per Feature:**

- [ ] Wrap feature in feature flag
- [ ] Add to BETA_FLAGS when ready for testing
- [ ] Test with beta coaches (1-2 weeks)
- [ ] Incorporate feedback
- [ ] Add to DEFAULT_FLAGS when ready for all
- [ ] Send announcements
- [ ] Monitor metrics

---

## 🚀 Ready to Deploy!

**Next Action:** Implement feature flag system before starting Phase 1 development.

**Time Required:** 2-3 hours to set up system, then 5 minutes per feature to add flags.

**Benefit:** Deploy fearlessly, knowing you can:

- Show features to beta coaches only
- Roll back instantly if needed
- Ship daily without breaking production
- Get feedback fast and iterate

---

**Document Status:** ✅ Ready to Implement  
**Implementation Priority:** HIGH (do before Phase 1 dev)  
**Estimated Setup Time:** 2-3 hours
