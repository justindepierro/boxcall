## TypeScript `any` Usage Audit (In Progress)

- Identified all direct usages of `any`, `as any`, `: any`, and related patterns in src/
- Will prioritize refactoring:
  - src/components/playbook/diagram/context/context.tsx
  - src/components/calendar/EventModal.tsx
  - src/components/ui/Icon/ModularIcon.tsx
  - src/services/pdf/BasePDFService.ts
  - src/services/pdf/styles.ts
  - src/components/ui/Sidebar/**tests**/\*.test.tsx
- Plan: Replace `any` with more specific types, generics, or unknown where possible
- Will batch commit refactors and document results here

## August 26, 2025 — Batch Cleanup Progress

- Removed all legacyProfiles imports and usage from dev-profiles/configs/index.ts
- Cleaned broken type references (DevMode, DevProfileConfig) and switched to plain object typing
- No lint/type errors remain in dev-profiles/configs/index.ts
- Next: Audit and refactor TypeScript `any` usage across src (see grep results)

# 📋 Codebase Cleanup Checklist

## 1. Remove Unused Imports, Variables, and Console Statements

[x] Remove all unused imports and variables (ESLint/lint warnings) — Complete
[x] Remove all console.log statements from production code — Complete
[x] Replace all raw <button> elements in React components with shared <Button> component for style and accessibility compliance — Complete

## 2. Split Large Files/Components

- [ ] Refactor any file/component >800 lines into smaller modules
- [ ] Split PracticePlannerModal and other flagged files

## 3. Accessibility Improvements

- [ ] Add missing ARIA attributes to interactive elements
- [ ] Expand Playwright + axe-core a11y tests
- [ ] Audit and improve keyboard navigation (skip links, tab order)

## 4. Performance Optimization

- [ ] Implement lazy loading for large feature bundles
- [ ] Convert inline styles to CSS classes
- [ ] Memoize list/table components (target 40+)
- [ ] Optimize image assets (PNG → WebP, lazy load)

## 5. Mobile & Responsive Design

- [ ] Audit and fix mobile layout inconsistencies
- [ ] Improve touch targets and usability for mobile users

## 6. Testing & Error Handling

- [ ] Increase unit/integration/mutation test coverage
- [ ] Add error boundaries to major components
- [ ] Implement proper loading/error states

## 7. Documentation & Comments

- [ ] Update and expand component documentation
- [ ] Organize architecture docs and remove root-level clutter
- [ ] Clean up stale TODOs and outdated comments

## 8. Dependencies & Security

- [ ] Update dependencies and patch vulnerabilities
- [ ] Remove unused packages
- [ ] Check license compliance

## 9. Monitoring & CI

- [ ] Enforce bundle size, Lighthouse, and Core Web Vitals budgets in CI
- [ ] Set up error tracking and performance regression alerts
- [ ] Enforce code coverage thresholds in CI
