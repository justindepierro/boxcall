# Storybook for BoxCall

Storybook provides an interactive development environment for UI components. It allows you to browse components, view their different states, and develop them in isolation.

## Getting Started

1. **Start Storybook:**

   ```bash
   npm run storybook
   ```

2. **Open in browser:**
   Visit `http://localhost:6006`

## Features

- **Component Library:** Browse all UI components with their variants and states
- **Interactive Controls:** Adjust props in real-time to see component behavior
- **Accessibility Testing:** Built-in a11y checks with `@storybook/addon-a11y`
- **Documentation:** Auto-generated docs from component prop types
- **Design System Integration:** Full Tailwind CSS and theme support

## Available Stories

### Design System

- **Typography:** All text styles and variants
- **Colors:** Theme color palette
- **Spacing:** Consistent spacing utilities

### UI Components

- **Button:** All button variants, sizes, and states
- **Card:** Flexible card layouts with headers/footers
- **Form Elements:** Inputs, selects, textareas
- **Navigation:** Sidebar, breadcrumbs, tabs
- **Feedback:** Toast, modal, loading states

## Development Workflow

1. **Create Components:** Build components in `src/components/`
2. **Add Stories:** Create `.stories.tsx` files alongside components
3. **Test Interactively:** Use Storybook to test component variants
4. **Document:** Stories auto-generate documentation
5. **Integrate:** Use tested components in your app

## Story Structure

Each story file follows this pattern:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { ComponentName } from "./ComponentName";

const meta: Meta<typeof ComponentName> = {
  title: "Category/ComponentName",
  component: ComponentName,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Default props
  },
};
```

## Best Practices

- **Organize by Category:** Group related components (UI, Forms, Layout)
- **Comprehensive Variants:** Show all possible states and combinations
- **Realistic Data:** Use meaningful example content
- **Accessibility:** Test with a11y addon enabled
- **Documentation:** Add descriptions for complex props

## Building for Production

```bash
npm run build-storybook
```

This creates a static Storybook site in `storybook-static/` that can be deployed anywhere.
