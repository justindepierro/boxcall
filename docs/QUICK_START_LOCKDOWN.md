# Design System Lockdown - Quick Start 🚀

**TL;DR**: Let's make it impossible to ship bad code. Here's what we're doing in the next 2 weeks.

---

## What We're Building

A **bulletproof design system** with:
- ✅ Pre-commit hooks (can't commit broken code)
- ✅ CI gates (can't merge broken code)
- ✅ Enhanced ESLint (catches ALL violations)
- ✅ Visual regression tests (catches unintended changes)
- ✅ Token dashboard (monitors coverage)
- ✅ Storybook docs (self-documenting)

---

## Where We Are Now

**✅ Completed:**
- Color standardization (340+ violations fixed)
- Token architecture (semantic tokens in place)
- 50+ UI components
- 99%+ color compliance

**⚠️ Gaps:**
- Can commit broken code (no pre-commit hooks)
- Can merge broken code (no CI gates)
- ESLint only catches colors (not spacing/sizing)
- 70% components lack Storybook docs
- Zero visual regression tests
- ~50 arbitrary values remaining

---

## The Plan (2 Weeks)

### Week 1: Lock It Down 🔒

**Days 1-2: Quick Wins**
- Fix 3 files with duplicate `border border` classes
- Clean up 4 story files using `bg-gray-100` → `bg-surface-muted`
- Standardize TeamOnboardingWizard (20+ violations)

**Days 3-5: Enforcement**
- Enhance ESLint to catch arbitrary values (`text-[11px]`, `p-[24px]`)
- Add pre-commit hooks (type-check + lint + format)
- Setup CI quality gates (GitHub Actions)

### Week 2: Document & Refine 📚

**Days 6-10: Documentation**
- Create 20 Storybook stories (core components)
- Setup visual regression testing (Playwright)
- Build token usage dashboard (HTML report)

**Days 11-14: Architecture**
- Refactor large pages (PlaybookPage 833 lines, RosterPage 996 lines)
- Document component patterns
- Polish remaining rough edges

---

## How To Execute

### Step 1: Quick Wins (Today)

```bash
# Fix duplicate border classes
npm run lint -- --fix

# Review changes
git diff

# Commit
git add .
git commit -m "fix: Remove duplicate border classes"
git push
```

### Step 2: Setup Pre-Commit (Tomorrow)

```bash
# Install Husky
npm install -D husky lint-staged

# Setup hooks
npx husky install
npx husky add .husky/pre-commit "npm run type-check && npm run lint -- --max-warnings 0"

# Test it
git add .
git commit -m "test: Pre-commit hook"
# Should run type-check + lint before committing
```

### Step 3: Setup CI (Day 3)

Create `.github/workflows/quality-gate.yml`:

```yaml
name: Quality Gate

on:
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint -- --max-warnings 0
      - run: npm run test
      - run: npm run build
```

Enable branch protection:
- Require status checks
- Require reviews
- Block merge if checks fail

### Step 4: Enhance ESLint (Day 4)

Update `eslint-rules/no-raw-tailwind-colors.js` to also detect:
- `text-[11px]` → suggest `text-xs`
- `p-[24px]` → suggest `p-6`
- `gap-[1.75rem]` → suggest `gap-7`

### Step 5: Storybook Sprint (Week 2)

Create stories for:
1. Button (9 variants)
2. Card (elevation states)
3. Input (focus states)
4. Badge (status variants)
5. Typography (type scale)
6. Aurora (background variants)
7. PageLayout (title patterns)
8. Modal (size variants)
9. Dropdown (menu patterns)
10. Tabs (segment control)

Template:
```tsx
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};
```

### Step 6: Visual Regression (Day 8-9)

```bash
# Setup Playwright visual tests
npm install -D @playwright/test

# Create baseline
npx playwright test visual-regression.spec.ts --update-snapshots

# Run tests
npm run test:visual
```

### Step 7: Token Dashboard (Day 10)

```bash
# Run token audit
npm run tokens:audit

# Open dashboard
open reports/token-usage-dashboard.html
```

---

## What Success Looks Like

### Week 1 (Friday Check-in)
- ✅ Zero lint errors
- ✅ Pre-commit hooks working
- ✅ CI gates configured
- ✅ ESLint catching all violations
- ✅ 3 quick win files fixed

### Week 2 (Friday Check-in)
- ✅ 20 Storybook stories
- ✅ Visual regression baseline
- ✅ Token dashboard showing 98%+ coverage
- ✅ 2 large pages refactored
- ✅ Pattern documentation complete

### Long-term (Ongoing)
- ✅ Can't commit broken code
- ✅ Can't merge without review + tests
- ✅ Zero arbitrary values in production
- ✅ 98%+ token coverage maintained
- ✅ 90%+ Storybook coverage

---

## Daily Checklist

### Every Day
- [ ] Run `npm run type-check` before starting
- [ ] Run `npm run lint` to catch issues
- [ ] Run `npm run test` if touching logic
- [ ] Check `npm run tokens:audit` weekly

### Before Every Commit
- [ ] Type check passes
- [ ] Lint passes with zero warnings
- [ ] Tests pass
- [ ] Format check passes

### Before Every PR
- [ ] CI passes (all checks green)
- [ ] Visual regression approved (if UI changes)
- [ ] Storybook updated (if component changes)
- [ ] Documentation updated (if patterns change)

---

## Commands Reference

```bash
# Development
npm run dev                  # Start dev server
npm run type-check           # TypeScript check
npm run lint                 # ESLint check
npm run lint -- --fix        # Auto-fix issues
npm run test                 # Run tests
npm run build                # Production build

# Token System
npm run tokens:generate      # Generate CSS from tokens
npm run tokens:audit         # Check token coverage
npm run tokens:report        # Open token dashboard

# Testing
npm run test:watch           # Watch mode
npm run test:coverage        # Coverage report
npm run test:e2e             # Playwright tests
npm run test:visual          # Visual regression

# Storybook
npm run storybook            # Start Storybook
npm run build-storybook      # Build Storybook

# Quality Checks
npm run validate             # Full validation
npm run predev               # Pre-development check
```

---

## Troubleshooting

### "Pre-commit hook failed"
**Solution**: Fix the errors shown, then commit again.
```bash
npm run type-check  # Find type errors
npm run lint        # Find lint errors
npm run format:check # Find format errors
```

### "CI checks failing"
**Solution**: Run checks locally first.
```bash
npm run validate    # Runs everything CI runs
```

### "ESLint suggesting token I don't have"
**Solution**: Check token reference.
```bash
# View all tokens
cat src/styles/generated-tokens.css

# Or check design language doc
open docs/BOXCALL_DESIGN_LANGUAGE.md
```

### "Visual regression test failing"
**Solution**: Review diff, update baseline if intentional.
```bash
# View diff images
npm run test:visual:ui

# Update baseline if change is intentional
npm run test:visual:update
```

---

## Key Files

| File                                       | Purpose                  |
| ------------------------------------------ | ------------------------ |
| `src/design-system/tokens.ts`              | Token definitions        |
| `src/styles/generated-tokens.css`          | Generated CSS vars       |
| `eslint-rules/no-raw-tailwind-colors.js`   | Custom ESLint rule       |
| `.husky/pre-commit`                        | Pre-commit hook          |
| `.github/workflows/quality-gate.yml`       | CI configuration         |
| `docs/BOXCALL_DESIGN_LANGUAGE.md`          | Design system reference  |
| `docs/DESIGN_SYSTEM_LOCKDOWN.md`           | Full lockdown plan       |
| `scripts/token-usage-dashboard.ts`         | Token audit script       |

---

## Team Communication

### Daily Standup
- What I completed yesterday
- What I'm working on today
- Any blockers (ESLint errors, test failures)

### Weekly Review
- Token coverage progress (aim for 98%+)
- Storybook coverage progress (aim for 90%+)
- CI health (passing rate, failure patterns)
- Visual regression diffs (review + approve)

### PR Reviews
- ✅ Type check passes
- ✅ Lint passes
- ✅ Tests pass
- ✅ CI green
- ✅ Uses semantic tokens (no arbitrary values)
- ✅ Storybook updated (if UI component)
- ✅ Visual regression approved (if visual change)

---

## Getting Help

**Questions about tokens?**
→ Check `docs/BOXCALL_DESIGN_LANGUAGE.md`
→ Ask in #design-systems Slack

**ESLint errors?**
→ Read the suggestion in the error message
→ Check `eslint-rules/no-raw-tailwind-colors.js` for examples

**CI failing?**
→ Run `npm run validate` locally first
→ Check GitHub Actions logs for details

**Visual regression diffs?**
→ Run `npm run test:visual:ui` to review
→ Ask in #frontend for second opinion

---

## Success Metrics Dashboard

Track these weekly:

```
┌─────────────────────────────────────────┐
│  BoxCall Design System Health           │
├─────────────────────────────────────────┤
│  Token Coverage:      [████████░░] 85%  │
│  Target: 98%                            │
├─────────────────────────────────────────┤
│  Storybook Coverage:  [███░░░░░░░] 30%  │
│  Target: 90%                            │
├─────────────────────────────────────────┤
│  CI Pass Rate:        [██████████] 100% │
│  Target: 95%+                           │
├─────────────────────────────────────────┤
│  Arbitrary Values:    50 remaining      │
│  Target: 0                              │
└─────────────────────────────────────────┘
```

Generate with: `npm run tokens:report`

---

## Let's Do This! 🚀

**Week 1 Goal**: Lock down the system with enforcement
**Week 2 Goal**: Document everything and refine architecture
**Result**: Bulletproof, future-proof design system

Questions? Check the full plan: `docs/DESIGN_SYSTEM_LOCKDOWN.md`

Let's ship it! 💪
