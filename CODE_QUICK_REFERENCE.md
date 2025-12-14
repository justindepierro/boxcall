# Code Quality Quick Reference

## Quick Commands

```bash
# Full validation (before commits)
npm run validate

# Auto-fix everything
npm run lint:fix-all

# Check consistency
npm run check:consistency

# Find TODOs/FIXMEs
npm run find:todos

# Find console.log statements
npm run find:console

# Individual checks
npm run type-check    # TypeScript
npm run lint          # ESLint
npm run format:check  # Prettier
npm run test          # Unit tests
```

## Common Patterns

### ✅ DO THIS

```typescript
// Use const by default
const teamId = "team-123";

// Template literals
const message = `Hello, ${name}!`;

// Strict equality
if (value === null) { }

// Object shorthand
const obj = { name, value };

// Arrow functions
const double = (n) => n * 2;

// Design tokens
<div className="btn-primary" />
<div className="bg-surface-elevated p-spacing-md" />

// Early returns
if (!isValid) return null;
return processData();

// Named constants
const FIVE_MINUTES_MS = 5 * 60 * 1000;

// Named exports
export { Component };

// Proper typing
const data: UserData = fetchData();

// useCallback for handlers
const onClick = useCallback(() => {
  handleClick(id);
}, [id]);

// User-friendly errors
catch (error) {
  toast.error("Failed to save. Please try again.");
  ErrorTrackingService.captureError(error, { context: "save" });
}
```

### ❌ AVOID THIS

```typescript
// var keyword
var teamId = "team-123";

// String concatenation
const message = "Hello, " + name + "!";

// Loose equality
if (value == null) { }

// Verbose object properties
const obj = { name: name, value: value };

// Function expressions
const double = function(n) { return n * 2; };

// Raw Tailwind values
<div className="bg-[#00A86B] p-4" />
<div className="w-[247px]" />

// Nested if-else
if (isValid) {
  return processData();
} else {
  return null;
}

// Magic numbers
setTimeout(callback, 300000);

// Default exports
export default Component;

// Any types
const data: any = fetchData();

// Inline callbacks
onClick={() => handleClick(id)}

// Raw error messages
catch (error) {
  toast.error(error.message);
}
```

## File Naming

| Type       | Convention          | Example                          |
| ---------- | ------------------- | -------------------------------- |
| Components | PascalCase          | `Button.tsx`, `PlaybookGrid.tsx` |
| Utilities  | camelCase           | `formatDate.ts`, `validation.ts` |
| Services   | camelCase + Service | `playsService.ts`                |
| Hooks      | camelCase + use     | `useTeam.ts`, `useAuth.ts`       |
| Types      | camelCase + .types  | `play.types.ts`                  |
| Constants  | UPPER_SNAKE_CASE    | `API_ENDPOINTS.ts`               |

## Import Order

```typescript
// 1. React
import React, { useState } from "react";

// 2. Third-party
import { useQuery } from "@tanstack/react-query";

// 3. Internal aliases
import { Button } from "@components/ui/Button";
import { useTeam } from "@hooks/useTeam";

// 4. Relative imports
import { formatDate } from "./utils";

// 5. Types (separate)
import type { Play } from "@types/play";
```

## ESLint Rules Reference

| Rule                     | Level | Description                            |
| ------------------------ | ----- | -------------------------------------- |
| `prefer-const`           | error | Use const for non-reassigned variables |
| `no-var`                 | error | No var keyword                         |
| `eqeqeq`                 | error | Use === instead of ==                  |
| `no-else-return`         | error | No else after return                   |
| `prefer-template`        | warn  | Template literals over concatenation   |
| `no-nested-ternary`      | warn  | Avoid nested ternaries                 |
| `max-depth`              | warn  | Max 4 nesting levels                   |
| `complexity`             | warn  | Max 20 cyclomatic complexity           |
| `max-lines-per-function` | warn  | Max 200 lines per function             |
| `boxcall-design/*`       | error | Design system compliance               |

## Pre-Commit Checklist

- [ ] `npm run validate` passes
- [ ] No console.log statements
- [ ] No @ts-ignore without reason
- [ ] Design tokens used
- [ ] Functions under 200 lines
- [ ] Complexity under 20
- [ ] Error handling present
- [ ] Tests added/updated

## Resources

- [Code Style Guide](./CODE_STYLE_GUIDE.md)
- [Quality Checklist](./CODE_QUALITY_CHECKLIST.md)
- [Quality Improvements](./CODE_QUALITY_IMPROVEMENTS.md)
- [Contributing Guide](./CONTRIBUTING.md)
