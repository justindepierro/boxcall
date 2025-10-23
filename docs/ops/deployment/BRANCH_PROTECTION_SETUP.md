# Branch Protection Setup Guide

This document outlines the GitHub branch protection rules for the Boxcall repository to enforce code quality standards.

## 🛡️ Protection Rules for `main` Branch

### Required Status Checks

All the following CI checks **must pass** before merging:

1. ✅ **Quality Checks** (quality-gates.yml)
   - Type Check
   - Lint Check
   - Unit Tests
   - Build

2. ✅ **PR Quality Gate** (pr-gate.yml)
   - Fast feedback on PRs
   - Automated PR comments with results

3. 🎨 **Style Gate** (optional, warning only)
   - Prettier formatting
   - Design token compliance report

### Setup Instructions

#### 1. Enable Branch Protection

1. Go to: `Settings` → `Branches` → `Add branch protection rule`
2. Branch name pattern: `main`

#### 2. Configure Protection Settings

**✅ Require status checks to pass before merging:**

- [x] Require branches to be up to date before merging
- [x] Status checks required:
  - `Quality Checks (Type + Lint + Test + Build)`
  - `PR Quality Gate`
  - `Style Gate (Prettier + Token Compliance)` (optional)

**✅ Require pull request reviews before merging:**

- [x] Required approving reviews: `1`
- [x] Dismiss stale pull request approvals when new commits are pushed

**✅ Require conversation resolution before merging:**

- [x] All conversations must be resolved

**✅ Do not allow bypassing the above settings:**

- [x] Include administrators

**Optional Settings:**

- [ ] Require linear history (clean commit history)
- [ ] Require deployments to succeed before merging
- [ ] Lock branch (read-only)

#### 3. Additional Quality Settings

**Code Review Requirements:**

- Minimum 1 approving review
- CODEOWNERS file for automatic reviewer assignment
- Code owners review required for critical files

**Merge Options:**

- ✅ Allow squash merging (recommended)
- ✅ Allow rebase merging
- ❌ Allow merge commits (optional - can disable for cleaner history)

## 🚀 Workflow Files

### `quality-gates.yml`

Comprehensive quality checks on every PR and push:

- Type checking (TypeScript strict mode)
- Linting (ESLint with design token rules)
- Unit tests (Vitest)
- Build verification (Vite)
- Accessibility audit (Playwright) - optional
- Security audit (npm audit)

**Triggers:** `pull_request`, `push` to `main` or `develop`

### `pr-gate.yml`

Fast PR-specific quality gate with automated comments:

- Quick feedback (10min timeout)
- Automated PR status comment
- Clear pass/fail indicators
- Links to lockdown documentation

**Triggers:** PR `opened`, `synchronize`, `reopened`

## 📊 Success Metrics

### Before Protection

- Manual code review only
- No automated quality checks
- Token violations could slip through

### After Protection

- ✅ Automated quality enforcement
- ✅ Can't merge broken code
- ✅ Clear feedback on PRs
- ✅ Design token compliance visibility

## 🔧 Troubleshooting

### "Status check failed" - How to fix

**Type Check Failed:**

```bash
npm run type-check
# Fix TypeScript errors shown
```

**Lint Failed:**

```bash
npm run lint
# Review violations
# Many will suggest semantic token alternatives
```

**Tests Failed:**

```bash
npm run test
# Debug failing tests
npm run test -- --reporter=verbose
```

**Build Failed:**

```bash
npm run build
# Check build output for errors
# Usually missing imports or type errors
```

### Bypassing Checks (Emergency Only)

If you need to bypass checks in an emergency:

1. Get admin approval
2. Use `git push --force-with-lease` (be careful!)
3. Create follow-up issue to fix the problem
4. Re-enable protections ASAP

**Note:** With "Include administrators" enabled, even admins can't bypass.

## 🎯 Phase 2 Goal Enforcement

These CI gates help achieve our Phase 2 goal:

- **Can't commit broken code** (pre-commit hooks)
- **Can't merge broken code** (GitHub Actions)
- **Can't deploy broken code** (build verification)

### Current Status

- Pre-commit hooks: ✅ Active
- CI gates: ✅ Configured (enable via GitHub settings)
- Branch protection: 📋 Awaiting configuration

### Next Steps

1. Enable branch protection rules in GitHub UI
2. Test with a sample PR
3. Monitor CI performance
4. Adjust timeout/thresholds as needed
5. Add visual regression tests to CI

## 📚 Related Documentation

- [Design System Lockdown](./DESIGN_SYSTEM_LOCKDOWN.md) - Overall strategy
- [Quick Start Lockdown](./QUICK_START_LOCKDOWN.md) - Developer reference
- [Contributing Guide](../CONTRIBUTING.md) - How to contribute
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Branch Protection Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)

---

**Last Updated:** October 6, 2025  
**Status:** Phase 2 - CI Quality Gates ✅ Complete
