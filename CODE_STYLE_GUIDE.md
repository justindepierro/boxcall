# BoxCall Code Style Guide

## Overview

This guide defines the coding standards and best practices for the BoxCall codebase to ensure consistency, maintainability, and professional code quality.

## Table of Contents

1. [TypeScript Guidelines](#typescript-guidelines)
2. [React Guidelines](#react-guidelines)
3. [Import Organization](#import-organization)
4. [Naming Conventions](#naming-conventions)
5. [Comments & Documentation](#comments--documentation)
6. [Design System Compliance](#design-system-compliance)
7. [Performance Best Practices](#performance-best-practices)
8. [Error Handling](#error-handling)

## TypeScript Guidelines

### Use `const` by Default

```typescript
// ❌ Bad
let teamId = "team-123";

// ✅ Good
const teamId = "team-123";
```

### Prefer `===` Over `==`

```typescript
// ❌ Bad
if (value == null) {
}

// ✅ Good
if (value === null || value === undefined) {
}

// ✅ Also acceptable for null checks
if (value == null) {
} // Exception allowed by eslint
```

### Avoid Magic Numbers

```typescript
// ❌ Bad
setTimeout(callback, 300000);

// ✅ Good
const FIVE_MINUTES_MS = 5 * 60 * 1000;
setTimeout(callback, FIVE_MINUTES_MS);
```

### Use Object Shorthand

```typescript
// ❌ Bad
const obj = { name: name, value: value };

// ✅ Good
const obj = { name, value };
```

### Prefer Arrow Functions

```typescript
// ❌ Bad
const doubled = numbers.map(function (n) {
  return n * 2;
});

// ✅ Good
const doubled = numbers.map((n) => n * 2);
```

### Use Template Literals

```typescript
// ❌ Bad
const message = "Hello, " + userName + "!";

// ✅ Good
const message = `Hello, ${userName}!`;
```

### Avoid Nested Ternaries

```typescript
// ❌ Bad
const status = isActive ? (isOnline ? "online" : "offline") : "inactive";

// ✅ Good
const getStatus = () => {
  if (!isActive) return "inactive";
  return isOnline ? "online" : "offline";
};
const status = getStatus();
```

### Return Early

```typescript
// ❌ Bad
function processUser(user) {
  if (user) {
    if (user.isActive) {
      return doSomething(user);
    } else {
      return null;
    }
  } else {
    return null;
  }
}

// ✅ Good
function processUser(user) {
  if (!user || !user.isActive) return null;
  return doSomething(user);
}
```

## React Guidelines

### Component Structure

```typescript
// ✅ Consistent component structure
import React from "react";
import type { ComponentProps } from "./Component.types";

export const Component = ({ prop1, prop2 }: ComponentProps) => {
  // 1. Hooks
  const [state, setState] = useState();

  // 2. Derived state
  const computedValue = useMemo(() => {}, []);

  // 3. Event handlers
  const handleClick = () => {};

  // 4. Effects
  useEffect(() => {}, []);

  // 5. Render
  return <div>{/* JSX */}</div>;
};
```

### Use Destructuring for Props

```typescript
// ❌ Bad
export const Button = (props) => {
  return <button onClick={props.onClick}>{props.children}</button>;
};

// ✅ Good
export const Button = ({ onClick, children }: ButtonProps) => {
  return <button onClick={onClick}>{children}</button>;
};
```

### Prefer Named Exports

```typescript
// ❌ Avoid default exports
export default Component;

// ✅ Good - named exports
export { Component };
```

## Import Organization

### Import Order

1. React & React-related
2. Third-party libraries
3. Internal aliases (@components, @services, etc.)
4. Relative imports
5. Types (grouped separately)

```typescript
// ✅ Good import organization
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@lib/supabase";

import { Button } from "@components/ui/Button";
import { useTeam } from "@hooks/useTeam";
import { PlaysService } from "@services/playsService";

import { formatDate } from "./utils";
import type { Play } from "@types/play";
import type { ComponentProps } from "./Component.types";
```

### Group Related Imports

```typescript
// ❌ Bad - scattered imports
import { supabase } from "@lib/supabase";
import { Button } from "@components/ui/Button";
import { getCurrentUserId } from "@lib/auth-helpers";
import { Input } from "@components/ui/Input";

// ✅ Good - grouped by source
import { supabase } from "@lib/supabase";
import { getCurrentUserId } from "@lib/auth-helpers";

import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
```

## Naming Conventions

### Files & Folders

- **Components**: PascalCase (e.g., `Button.tsx`, `PlaybookGrid.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`, `validation.ts`)
- **Services**: camelCase with "Service" suffix (e.g., `playsService.ts`)
- **Hooks**: camelCase with "use" prefix (e.g., `useTeam.ts`, `useAuth.ts`)
- **Types**: camelCase with ".types.ts" suffix (e.g., `play.types.ts`)
- **Constants**: UPPER_SNAKE_CASE for files (e.g., `API_ENDPOINTS.ts`)

### Variables & Functions

```typescript
// ✅ Variables: camelCase
const teamId = "team-123";
const isActive = true;

// ✅ Functions: camelCase, verb-based
const fetchPlays = () => {};
const handleSubmit = () => {};
const calculateTotal = () => {};

// ✅ Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;
const API_BASE_URL = "https://api.example.com";

// ✅ React Components: PascalCase
const PlaybookView = () => {};
const GamePlanCard = () => {};

// ✅ Boolean variables: is/has/should prefix
const isLoading = false;
const hasPermission = true;
const shouldRender = false;
```

### Types & Interfaces

```typescript
// ✅ Types: PascalCase
type PlayType = "run" | "pass";

interface PlayerProps {
  name: string;
  position: string;
}

// ✅ Type suffix for clarity
type PlayId = string;
type TeamRecord = Record<string, Team>;
```

## Comments & Documentation

### Use JSDoc for Functions

```typescript
/**
 * Fetches plays for a specific team with optional filtering
 * @param teamId - The ID of the team
 * @param filters - Optional filters to apply
 * @returns Promise resolving to array of plays
 */
export async function fetchPlays(
  teamId: string,
  filters?: PlayFilters
): Promise<Play[]> {
  // Implementation
}
```

### Explain "Why", Not "What"

```typescript
// ❌ Bad - obvious what
// Loop through players
players.forEach((player) => {});

// ✅ Good - explains why
// Pre-validate all players before bulk insert to avoid partial failures
players.forEach((player) => validatePlayer(player));
```

### Use TODO/FIXME Appropriately

```typescript
// ✅ Good - specific and actionable
// TODO: Replace with actual WebSocket endpoint when backend is ready (Sprint 5)

// TODO: Add error boundary once React 19 is stable

// FIXME: This query is slow (>2s) - needs database index on formation_id
```

### Remove Commented Code

```typescript
// ❌ Bad - dead code
// const oldFunction = () => {
//   return something;
// };

// ✅ Good - use git history instead
// Code removed in commit abc123 - see git history if needed
```

## Design System Compliance

### Use Design Tokens Only

```typescript
// ❌ Bad - raw Tailwind values
<div className="bg-[#00A86B] text-white p-4" />

// ✅ Good - component tokens
<div className="btn-primary" />

// ✅ Good - semantic tokens
<div className="bg-surface-elevated text-primary p-spacing-md" />
```

### No Arbitrary Values

```typescript
// ❌ Bad
<div className="w-[247px] h-[89px]" />

// ✅ Good
<div className="w-spacing-xl h-spacing-lg" />
```

## Performance Best Practices

### Memoize Expensive Computations

```typescript
// ✅ Good
const sortedPlays = useMemo(() => {
  return plays.sort((a, b) => a.name.localeCompare(b.name));
}, [plays]);
```

### Use React.memo for Pure Components

```typescript
// ✅ Good
export const PlayCard = React.memo(({ play }: PlayCardProps) => {
  return <div>{play.name}</div>;
});
```

### Debounce User Input

```typescript
// ✅ Good
const [searchQuery, setSearchQuery] = useState("");
const debouncedSearch = useDebouncedValue(searchQuery, 300);

useEffect(() => {
  searchPlays(debouncedSearch);
}, [debouncedSearch]);
```

### Avoid Inline Function Definitions

```typescript
// ❌ Bad - creates new function on every render
<Button onClick={() => handleClick(id)} />

// ✅ Good - stable reference
const onClick = useCallback(() => handleClick(id), [id]);
<Button onClick={onClick} />
```

## Error Handling

### Use Try-Catch for Async Operations

```typescript
// ✅ Good
async function fetchData() {
  try {
    const data = await api.getData();
    return data;
  } catch (error) {
    ErrorTrackingService.captureError(error, {
      context: "fetchData",
      teamId,
    });
    toast.error("Failed to fetch data");
    return null;
  }
}
```

### Provide User-Friendly Error Messages

```typescript
// ❌ Bad
catch (error) {
  toast.error(error.message);
}

// ✅ Good
catch (error) {
  console.error("Play creation failed:", error);
  toast.error("Failed to create play. Please try again.");
}
```

### Validate Data Early

```typescript
// ✅ Good
function createPlay(data: PlayInput) {
  if (!data.name?.trim()) {
    throw new Error("Play name is required");
  }

  if (!data.teamId) {
    throw new Error("Team ID is required");
  }

  // Proceed with creation
}
```

## Enforcement

These standards are enforced through:

1. **ESLint** - Automated linting with `npm run lint`
2. **Prettier** - Code formatting with `npm run format`
3. **TypeScript** - Type checking with `npm run type-check`
4. **Pre-commit hooks** - Automatic validation via Husky
5. **Code reviews** - Manual review of pull requests

Run `npm run validate` before committing to ensure all checks pass.

## Additional Resources

- [BoxCall Architecture](./docs/ARCHITECTURE.md)
- [Design System Reference](./docs/DESIGN_SYSTEM_REFERENCE.md)
- [Contributing Guide](./CONTRIBUTING.md)
