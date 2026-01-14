# GitHub Copilot Quick Reference Card

> **Quick commands and patterns for BoxCall development**

## 📚 Documentation Files

- **Regular Copilot**: `.github/copilot-instructions.md` (concise reference)
- **Agent Mode**: `.github/copilot-agent-instructions.md` (comprehensive training)
- **This File**: Quick reference card for common tasks

## ⚡ Quick Commands

### Quality Gates
```bash
npm run validate        # Type-check + lint + test (run before commit)
npm run type-check      # TypeScript strict mode
npm run lint           # ESLint (max 600 warnings)
npm run test           # Vitest unit tests
```

### Database Operations
```bash
npm run db:status         # Check connection
npm run db:migrate:easy   # Copy SQL, open dashboard
npm run db:sql           # Open SQL editor
```

### Development
```bash
npm run dev              # Start dev server (port 5173)
npm run build           # Production build
npm run preview         # Preview production build
npm run storybook       # Start Storybook (port 6006)
```

## 🎨 Design Token Cheat Sheet

### Common Patterns

❌ **Don't Use**:
```tsx
className="bg-[#16a34a] text-[14px] w-[24px] p-[12px]"
```

✅ **Use Instead**:
```tsx
className="btn-primary text-body w-spacing-md p-spacing-sm"
```

### Token Priority
1. **Component tokens**: `btn-primary`, `card-padding`, `input-border`
2. **Semantic tokens**: `text-primary`, `bg-surface-muted`
3. **Brand scales**: `jade-600`, `navy-500`
4. **Layout tokens**: `spacing-md`, `space-4`

## 🚀 API Client Patterns

### Basic Query
```typescript
import { api } from "@/lib/api";

const { data, error } = await api("plays")
  .select("*")
  .eq("playbook_id", playbookId)
  .order("created_at", { ascending: false });
```

### Parallel Queries (Deduplicated)
```typescript
const [plays, formations, scripts] = await Promise.all([
  api("plays").select("*").eq("team_id", teamId),
  api("formations").select("*").eq("team_id", teamId),
  api("practice_scripts").select("*").eq("team_id", teamId),
]);
```

### React Query Hook
```typescript
import { useQuery } from "@tanstack/react-query";

const { data, isLoading, error } = useQuery({
  queryKey: ["plays", playbookId],
  queryFn: () => api("plays").select("*").eq("playbook_id", playbookId),
  staleTime: 10 * 60 * 1000, // 10 minutes
});
```

## ⚡ Optimistic UI Pattern

```typescript
const handleSave = async (newData) => {
  // 1. Store original for rollback
  const original = data;
  
  // 2. Instant UI update
  setData(newData);
  toast.success("Saved!");
  
  try {
    // 3. Background sync
    const result = await api("table").insert(newData).select().single();
    setData(result.data);
  } catch (error) {
    // 4. Rollback on error
    setData(original);
    toast.error("Failed to save");
  }
};
```

## 🔔 Real-time Subscription Pattern

```typescript
import { useEffect } from "react";
import { supabaseClient } from "@/lib/supabase";

useEffect(() => {
  const channel = supabaseClient
    .channel("my_channel")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "my_table" },
      (payload) => {
        console.log("Change:", payload);
        refetch(); // Refetch React Query data
      }
    )
    .subscribe();

  // CRITICAL: Clean up
  return () => {
    supabaseClient.removeChannel(channel);
  };
}, [refetch]);
```

## 🎯 Component Creation Checklist

```typescript
// src/components/ui/MyComponent/MyComponent.tsx
import React from "react";
import { triggerHapticFeedback } from "@/lib/hapticFeedback";
import { MyComponentProps } from "./MyComponent.types";

export const MyComponent: React.FC<MyComponentProps> = ({ 
  onClick, 
  ...props 
}) => {
  const handleClick = (e: React.MouseEvent) => {
    triggerHapticFeedback(); // ✅ Haptic feedback
    onClick?.(e);
  };

  return (
    <button
      className="btn-primary focus-ring" // ✅ Tokens + accessibility
      onClick={handleClick}
      aria-label="My component" // ✅ ARIA label
      {...props}
    />
  );
};
```

**Checklist**:
- ✅ Use component tokens (not raw colors)
- ✅ Add haptic feedback for interactive elements
- ✅ Include `focus-ring` utility
- ✅ Add ARIA labels for accessibility
- ✅ Create `.types.ts` file for props

## 📂 File Organization

```
src/
├── components/ui/       # Design system components
│   └── Button/
│       ├── Button.tsx
│       ├── Button.types.ts
│       └── index.ts
├── features/           # Feature modules
│   └── playbook/
│       ├── PlayCard.tsx
│       └── PlayGrid.tsx
├── services/           # Business logic + API
│   └── playsService.ts
├── hooks/              # Custom React hooks
│   └── usePlays.ts
├── lib/                # Third-party integrations
│   ├── api/           # API client
│   └── supabase.ts
└── types/              # TypeScript types
    └── database.ts
```

## 🔍 Common Paths (Use `@` Alias)

```typescript
import { Button } from "@components/ui/Button";
import { api } from "@/lib/api";
import { usePlays } from "@hooks/usePlays";
import { Play } from "@/types/database";
import { playsService } from "@services/playsService";
```

## 🐛 Common Gotchas

1. **Never use raw Tailwind colors** → Use design tokens
2. **Always clean up subscriptions** → Return cleanup in useEffect
3. **Use `api()` client** → Never import Supabase directly
4. **Add optimistic UI** → For all write operations
5. **Include haptic feedback** → For interactive elements
6. **Test before commit** → Run `npm run validate`
7. **RLS security** → Always filter by team_id
8. **Zustand selectors** → Use `useShallow` for performance

## 🎓 Learning Resources

### Must Read (in order)
1. `.github/copilot-instructions.md` - Quick reference
2. `docs/PROJECT_OVERVIEW.md` - Vision & status
3. `docs/architecture/API_ARCHITECTURE_DEC9_2025.md` - API patterns
4. `docs/DESIGN_SYSTEM_REFERENCE.md` - Token system
5. `.github/copilot-agent-instructions.md` - Comprehensive guide

### Performance Docs
- `docs/OPTIMIZATION_COMPLETE_DEC7_2025.md` - All optimizations
- `docs/OPTIMIZATION_ACTION_PLAN_DEC7_2025.md` - Action plan
- `docs/development/DATABASE_PERFORMANCE_OPTIMIZATION_PLAN.md` - DB optimization

### Feature Docs
- `docs/features/practice/` - Practice script system
- `docs/features/playbook/` - Playbook system
- `docs/features/TEAM_BULLETIN_SOCIAL_ENHANCEMENT.md` - Social features

## 💡 Pro Tips

1. **Use Agent Mode** for complex multi-step features
2. **Check recent changes** in `CHANGELOG.md` before starting
3. **Run quality gates** before committing (`npm run validate`)
4. **Test performance** - target <100ms perceived response
5. **Update docs** when adding features
6. **Add TODOs with context** (name, date, reason)
7. **Commit often** with conventional commit messages
8. **Ask questions** if uncertain about patterns

## 🚀 Performance Targets

- Page load: **<2s** initial, **<1s** cached
- API response: **<100ms** perceived (optimistic UI)
- Bundle: **2.83MB** (975KB gzipped) - target **<1.5MB**
- Test coverage: **85%+** (current ~70%)
- ESLint warnings: **≤600** (goal: 0)

---

**Last Updated**: January 13, 2026  
**For**: GitHub Copilot users on BoxCall project  
**Status**: Quick reference card
