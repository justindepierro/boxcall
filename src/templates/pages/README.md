# Page Templates - Unified Design Language

## Overview

This directory contains page templates and examples for maintaining consistent design across all BoxCall pages. Use these templates instead of building pages from scratch.

## Quick Start

### 1. Use PageTemplate for All Pages

```tsx
import { PageTemplate } from "../../components/layout/PageTemplate";
import { Button } from "../../components/ui/Button/Button";

export default function MyPage() {
  return (
    <PageTemplate
      title="My Page"
      subtitle="Subtitle goes here"
      actions={<Button>Action</Button>}
    >
      {/* Your content here */}
    </PageTemplate>
  );
}
```

### 2. Use ContentSection for Sections

```tsx
import {
  ContentSection,
  GridLayout,
} from "../../components/layout/PageTemplate";
import { Card } from "../../components/ui/Card";

<ContentSection
  title="Section Title"
  description="Section description"
  actions={<Button>Action</Button>}
>
  <GridLayout columns={{ sm: 1, md: 2, lg: 3 }}>
    <Card>Item 1</Card>
    <Card>Item 2</Card>
    <Card>Item 3</Card>
  </GridLayout>
</ContentSection>;
```

## Components Reference

### PageTemplate

Main page wrapper with consistent header, loading, and error states.

**Props**:

- `title` - Page title (required)
- `subtitle` - Optional subtitle/metadata
- `actions` - Action buttons in header
- `loading` - Show loading skeleton
- `error` - Show error state
- `maxWidth` - Max width constraint (default: "7xl")
- `noAurora` - Disable Aurora background

### ContentSection

Reusable section wrapper with title, description, and actions.

**Props**:

- `title` - Section title
- `description` - Section description
- `actions` - Section actions
- `card` - Wrap in Card component
- `cardVariant` - Card variant (default, glass, elevated, etc.)

### GridLayout

Responsive grid with automatic column breakpoints.

**Props**:

- `columns` - Column configuration: `{ sm: 1, md: 2, lg: 3, xl: 4 }`
- `gap` - Gap size: "sm" | "md" | "lg"

### ActionBar

Consistent action button layout with primary/secondary actions.

**Props**:

- `primary` - Primary action (right side)
- `secondary` - Secondary actions (left side)
- `alignEnd` - Align to end (right)

### EmptyState

Consistent empty state design.

**Props**:

- `icon` - Icon name
- `title` - Title
- `description` - Description
- `action` - Action button

## Design Patterns

### Stats Grid (Dashboard Pattern)

```tsx
<GridLayout columns={{ sm: 1, md: 2, lg: 4 }} gap="md">
  <Card variant="elevated" size="md" interactive>
    <Typography variant="body-sm" color="muted">
      Label
    </Typography>
    <Typography variant="headline-lg" className="text-primary">
      42
    </Typography>
  </Card>
  {/* More stat cards */}
</GridLayout>
```

### Content Grid (Playbook Pattern)

```tsx
<GridLayout columns={{ sm: 1, md: 2, lg: 3 }} gap="lg">
  {items.map((item) => (
    <Card key={item.id} variant="default" interactive>
      <Typography variant="headline-sm">{item.name}</Typography>
      <Typography variant="body-sm" color="muted">
        {item.description}
      </Typography>
    </Card>
  ))}
</GridLayout>
```

### Card-Based Section (Team Bulletin Pattern)

```tsx
<ContentSection
  title="Announcements"
  description="Team updates"
  card
  cardVariant="glass"
>
  {/* Content here */}
</ContentSection>
```

## Migration Guide

### Before (Old Pattern)

```tsx
export default function OldPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Title</h1>
        <button className="bg-green-600 px-4 py-2 rounded">Action</button>
      </div>
      <div className="grid grid-cols-3 gap-4">{/* Content */}</div>
    </div>
  );
}
```

### After (New Pattern)

```tsx
import { PageTemplate, GridLayout } from "../../components/layout/PageTemplate";
import { Button } from "../../components/ui/Button/Button";
import { Card } from "../../components/ui/Card";

export default function NewPage() {
  return (
    <PageTemplate
      title="Title"
      actions={<Button variant="primary">Action</Button>}
    >
      <GridLayout columns={{ sm: 1, md: 2, lg: 3 }} gap="md">
        <Card>Content</Card>
      </GridLayout>
    </PageTemplate>
  );
}
```

## Benefits

✅ **Consistency** - All pages look and feel the same
✅ **Maintainability** - Update one file, update all pages
✅ **Speed** - Build new pages in minutes, not hours
✅ **Type Safety** - Full TypeScript support
✅ **Responsive** - Mobile-first by default
✅ **Accessible** - Built-in ARIA attributes
✅ **Performance** - Optimized loading states

## Examples

See `StandardPage.example.tsx` for a complete example showing:

- Stats grid with elevated cards
- Content grid with interactive cards
- Card-based sections with glass variant
- Empty states
- Action bars
- Loading and error states

## Next Steps

1. Copy `StandardPage.example.tsx` for new pages
2. Refactor existing pages to use PageTemplate
3. Use GridLayout for responsive grids
4. Use ContentSection for logical grouping
5. Maintain consistent Card variants across pages

---

**Last Updated**: November 27, 2024
**Status**: Ready for production use
