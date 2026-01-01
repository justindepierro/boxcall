# Code Quality Checklist

Use this checklist before committing code to ensure consistency and quality.

## Pre-Commit Checklist

### Automated Checks

- [ ] `npm run type-check` - No TypeScript errors
- [ ] `npm run lint` - ESLint passes (<600 warnings)
- [ ] `npm run format:check` - Code is properly formatted
- [ ] `npm run test` - All tests pass

**Quick Command:** `npm run validate` (runs all above checks)

### Manual Checks

#### Code Quality

- [ ] No `console.log()` statements (except in ErrorTrackingService, analytics)
- [ ] No `@ts-ignore` or `@ts-expect-error` without clear justification comment
- [ ] No magic numbers (use named constants instead)
- [ ] Functions are under 200 lines
- [ ] Cyclomatic complexity under 20 per function
- [ ] No nested ternaries
- [ ] Early returns used instead of nested if-else

#### TypeScript

- [ ] `const` used instead of `let` where possible
- [ ] No use of `var`
- [ ] `===` used instead of `==` (except for null checks)
- [ ] Proper types defined (no excessive `any` usage)
- [ ] Template literals used instead of string concatenation
- [ ] Object shorthand used `{ name }` instead of `{ name: name }`

#### React

- [ ] Components use named exports, not default exports
- [ ] Props are destructured
- [ ] Expensive computations wrapped in `useMemo`
- [ ] Event handlers wrapped in `useCallback`
- [ ] Components under 200 lines (consider splitting larger ones)
- [ ] Pure components wrapped in `React.memo`

#### Design System

- [ ] Only design tokens used (no raw colors like `bg-[#hexcode]`)
- [ ] No arbitrary spacing (no `w-[24px]`, use `w-spacing-md`)
- [ ] No arbitrary typography (no `text-[14px]`, use semantic tokens)
- [ ] Component tokens preferred over semantic tokens
- [ ] All interactive elements have haptic feedback

#### Imports

- [ ] Imports organized by type (React → Third-party → Internal → Relative)
- [ ] Path aliases used (`@components/`, `@services/`) instead of relative paths
- [ ] Unused imports removed
- [ ] Type imports grouped separately

#### Error Handling

- [ ] Async operations wrapped in try-catch
- [ ] User-friendly error messages (not raw error.message)
- [ ] Errors logged to ErrorTrackingService
- [ ] Toast notifications for user-facing errors
- [ ] Input validation at function boundaries

#### Performance

- [ ] Large lists use virtualization (react-virtuoso)
- [ ] User input debounced (search, filters)
- [ ] Images optimized (WebP format preferred)
- [ ] Heavy modals preloaded during idle time
- [ ] Optimistic UI for mutations
- [ ] High-traffic pages follow render checklist (`docs/development/RENDER_PERFORMANCE_CHECKLIST.md`)

#### Documentation

- [ ] Complex functions have JSDoc comments
- [ ] TODOs include context and timeline (not just "TODO: fix this")
- [ ] Commented-out code removed (use git history)
- [ ] Refactors include deletion: old code paths removed, duplicates merged, unused exports/files cleaned up
- [ ] README updated if adding new features
- [ ] Comments explain "why", not "what"

#### Supabase / Database

- [ ] RLS policies respected (no service role key client-side)
- [ ] Team-based data isolation via `team_members` join
- [ ] Queries use proper indexes
- [ ] Real-time subscriptions cleaned up in useEffect return
- [ ] Database types regenerated if schema changed (`npm run db:types`)

#### Security

- [ ] No sensitive data in console.log
- [ ] No API keys in source code (use env vars)
- [ ] User input sanitized before database operations
- [ ] File uploads validated (type, size)

## Common Issues to Avoid

### ❌ Anti-Patterns

```typescript
// Magic numbers
setTimeout(callback, 300000);

// Nested ternaries
const value = a ? b ? c : d : e;

// console.log in production code
console.log("Debug info:", data);

// Raw Tailwind colors
<div className="bg-[#00A86B]" />

// Arbitrary spacing
<div className="w-[247px]" />

// Inline callbacks
<Button onClick={() => handleClick(id)} />

// Default exports
export default Component;

// Any types without justification
const data: any = fetchData();
```

### ✅ Best Practices

```typescript
// Named constants
const FIVE_MINUTES_MS = 5 * 60 * 1000;
setTimeout(callback, FIVE_MINUTES_MS);

// Early returns
if (!isValid) return null;
return process(data);

// ErrorTrackingService for logging
ErrorTrackingService.captureError(error, context);

// Design tokens
<div className="btn-primary" />

// Semantic spacing tokens
<div className="w-spacing-xl" />

// useCallback for stability
const onClick = useCallback(() => handleClick(id), [id]);
<Button onClick={onClick} />

// Named exports
export { Component };

// Proper typing
const data: UserData = fetchData();
```

## Quick Commands

| Command                     | Purpose                         |
| --------------------------- | ------------------------------- |
| `npm run validate`          | Run all quality checks          |
| `npm run lint:fix-all`      | Auto-fix linting and formatting |
| `npm run check:consistency` | Verify code consistency         |
| `npm run find:todos`        | Find all TODO/FIXME comments    |
| `npm run find:console`      | Find console.log statements     |
| `npm run type-check`        | TypeScript validation           |

## CI/CD Checks

The following checks run automatically on every PR:

1. TypeScript compilation (`tsc --noEmit`)
2. ESLint (max 600 warnings)
3. Prettier formatting
4. Unit tests (Vitest)
5. Build succeeds

**Make sure all checks pass locally before pushing!**

## Resources

- [Code Style Guide](./CODE_STYLE_GUIDE.md)
- [Architecture Docs](./docs/ARCHITECTURE.md)
- [Design System Reference](./docs/DESIGN_SYSTEM_REFERENCE.md)
- [Contributing Guide](./CONTRIBUTING.md)
