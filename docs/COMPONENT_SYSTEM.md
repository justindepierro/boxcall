# Component System (Archived Summary)

This large document was archived during August 2025 cleanup to meet the 300‑line doc policy and eliminate duplication. Core guidance has been redistributed to:

- `docs/product/ROADMAP.md` (adoption & sequencing)
- `docs/style-inventory/` (tokens, audit metrics)
- `docs/STYLE_PROFESSIONALIZATION_PLAN.md` (governance & next steps)

Recovery (older full content lives in git history):

```
git log --follow -- docs/COMPONENT_SYSTEM.md
git show <commit>:docs/COMPONENT_SYSTEM.md > /tmp/COMPONENT_SYSTEM_legacy.md
```

Migration Status Snapshot:

- Design tokens: centralized in tokens.ts ✅
- Primitive audit scripts: style-audit & contrast-check ✅
- Button unification: complete (variants normalized) ✅
- Remaining primitives to standardize: Tag, Badge (extended states), Tooltip (semantic surface) 🔄

Future additions should target concise, focused reference docs instead of a monolith.

<!-- allow-empty -->

### **Color System**

```typescript
// BoxCall Football Color Palette
const colors = {
  // Primary Brand Colors
  primary: {
    50: "#f0f9ff", // lightest blue
    100: "#e0f2fe",
    200: "#bae6fd",
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9", // primary blue
    600: "#0284c7", // primary dark
    700: "#0369a1",
    800: "#075985",
    900: "#0c4a6e", // darkest blue
  },

  // Football Field Green
  field: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e", // field green
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
  },

  // Warning/Alert Colors (Yellow for penalties, etc.)
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b", // warning yellow
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },

  // Error/Penalty Colors
  error: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444", // error red
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
  },

  // Success Colors (Touchdowns, wins)
  success: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e", // success green
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
  },

  // Neutral Colors
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280", // neutral text
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827", // darkest text
  },
};
```

### **Spacing System**

```typescript
// Consistent spacing scale (Tailwind-based)
const spacing = {
  // Micro spacing
  xs: "0.25rem", // 4px
  sm: "0.5rem", // 8px
  md: "0.75rem", // 12px
  lg: "1rem", // 16px
  xl: "1.25rem", // 20px

  // Component spacing
  "2xl": "1.5rem", // 24px
  "3xl": "2rem", // 32px
  "4xl": "2.5rem", // 40px
  "5xl": "3rem", // 48px
  "6xl": "4rem", // 64px

  // Layout spacing
  "7xl": "5rem", // 80px
  "8xl": "6rem", // 96px
  "9xl": "8rem", // 128px
};
```

## 🏗️ **Component Architecture**

### **Component Categories**

```
src/components/
├── 🎨 design-system/          # Core design tokens
│   ├── Typography.tsx         # Text components
│   ├── Colors.tsx            # Color utilities
│   └── Spacing.tsx           # Layout utilities
├── 🧱 ui/                    # Primitive UI components
│   ├── Button/               # Button system
│   ├── Input/                # Form inputs
│   ├── Card/                 # Container components
│   ├── Modal/                # Dialog system
│   ├── Loading/              # Loading states
│   └── ErrorBoundary.tsx     # Error handling ✅
├── 🏈 football/              # Football-specific components
│   ├── PlayerCard/           # Player display
│   ├── TeamCard/             # Team display
│   ├── StatDisplay/          # Statistics
│   ├── PlayCard/             # Play diagrams
│   └── FormationView/        # Field formations
├── 📱 layout/                # Layout components
│   ├── Header/               # Navigation header
│   ├── Sidebar/              # Navigation sidebar
│   ├── MainContent/          # Content wrapper
│   └── Footer/               # Page footer
├── 📝 forms/                 # Form components
│   ├── LoginForm/            # Authentication
│   ├── TeamForm/             # Team management
│   ├── PlayerForm/           # Player management
│   └── PlayForm/             # Play creation
└── 🔧 utility/               # Utility components
    ├── DevHealthCheck.tsx    # Development monitoring ✅
    ├── LoadingSpinner/       # Loading indicators
    └── ErrorMessage/         # Error displays
```

## 📝 **Naming Conventions**

### **Component Naming Standards**

```typescript
// ✅ GOOD: PascalCase for components
export const PlayerCard = () => { ... }
export const TeamStatistics = () => { ... }
export const PlaybookEditor = () => { ... }

// ❌ BAD: Other naming patterns
export const playerCard = () => { ... }
export const team_statistics = () => { ... }
export const playbook-editor = () => { ... }
```

### **File and Directory Standards**

```
// ✅ GOOD: Component directory structure
PlayerCard/
├── index.ts              # Export barrel
├── PlayerCard.tsx        # Main component
├── PlayerCard.test.tsx   # Unit tests
├── PlayerCard.stories.tsx # Storybook stories
├── PlayerCard.types.ts   # TypeScript definitions
└── README.md            # Component documentation

// ✅ GOOD: Simple component
SimpleButton.tsx          # Single file for simple components
```

### **Props and Interface Naming**

```typescript
// ✅ GOOD: Interface naming
interface PlayerCardProps {
  player: Player;
  size?: 'sm' | 'md' | 'lg';
  onClick?: (player: Player) => void;
}

interface TeamFormData {
  name: string;
  division: string;
  homeField: string;
}

// ✅ GOOD: Event handler naming
const handlePlayerSelect = (player: Player) => { ... }
const handleFormSubmit = (data: TeamFormData) => { ... }
const handleModalClose = () => { ... }
```

## 🧱 **Component Development Standards**

### **Component Template Structure**

```typescript
// ComponentName.tsx
import React from 'react';
import { ComponentNameProps } from './ComponentName.types';
import './ComponentName.styles.css'; // if needed

/**
 * ComponentName - Brief description of what this component does
 *
 * @param prop1 - Description of prop1
 * @param prop2 - Description of prop2
 * @returns JSX.Element
 */
export const ComponentName: React.FC<ComponentNameProps> = ({
  prop1,
  prop2,
  className = '',
  ...restProps
}) => {
  // Component logic here

  return (
    <div
      className={`component-name ${className}`}
      {...restProps}
    >
      {/* Component content */}
    </div>
  );
};

// Set display name for debugging
ComponentName.displayName = 'ComponentName';

export default ComponentName;
```

### **Props Interface Template**

```typescript
// ComponentName.types.ts
import { HTMLAttributes } from "react";

export interface ComponentNameProps extends HTMLAttributes<HTMLDivElement> {
  /** Required prop description */
  requiredProp: string;

  /** Optional prop description */
  optionalProp?: number;

  /** Size variant */
  size?: "sm" | "md" | "lg";

  /** Event handler */
  onAction?: (value: string) => void;
}
```

### **Test Template**

```typescript
// ComponentName.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders with required props', () => {
    render(<ComponentName requiredProp="test" />);
    expect(screen.getByRole('...')).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    const handleAction = vi.fn();
    render(<ComponentName requiredProp="test" onAction={handleAction} />);

    await userEvent.click(screen.getByRole('button'));
    expect(handleAction).toHaveBeenCalledWith('test');
  });
});
```

## 📚 **Component Documentation Template**

````markdown
# ComponentName

Brief description of the component and its purpose.

## Usage

```tsx
import { ComponentName } from "@components/category/ComponentName";

function MyComponent() {
  return (
    <ComponentName
      requiredProp="value"
      optionalProp={42}
      onAction={handleAction}
    />
  );
}
```
````

## Props

| Prop         | Type                    | Required | Default   | Description                  |
| ------------ | ----------------------- | -------- | --------- | ---------------------------- |
| requiredProp | string                  | Yes      | -         | Description of required prop |
| optionalProp | number                  | No       | undefined | Description of optional prop |
| size         | 'sm' \| 'md' \| 'lg'    | No       | 'md'      | Size variant                 |
| onAction     | (value: string) => void | No       | undefined | Event handler                |

## Examples

### Basic Usage

[Code example]

### With Custom Styling

[Code example]

### Event Handling

[Code example]

## Accessibility

- Describe ARIA attributes
- Keyboard navigation support
- Screen reader considerations

## Testing

- Key test scenarios
- Mock requirements
- Edge cases to consider

```

## 🚀 **Implementation Plan**

### **Phase 1: Design System Foundation**
1. ✅ Create typography system
2. ✅ Implement color palette
3. ✅ Set up spacing utilities
4. 🔄 Create design token utilities

### **Phase 2: Primitive UI Components**
1. 🔄 Button system (variants, sizes, states)
2. 🔄 Input components (text, number, select, textarea)
3. 🔄 Card components (basic, interactive, loading)
4. 🔄 Modal/Dialog system
5. 🔄 Loading states and skeletons

### **Phase 3: Football-Specific Components**
1. 🔄 PlayerCard (roster display, stats, actions)
2. 🔄 TeamCard (team overview, stats, navigation)
3. 🔄 StatDisplay (performance metrics, charts)
4. 🔄 PlayCard (play diagrams, routes)
5. 🔄 FormationView (field layout, positions)

### **Phase 4: Layout and Navigation**
1. 🔄 Header component (navigation, user menu)
2. 🔄 Sidebar component (football-specific navigation)
3. 🔄 MainContent wrapper (responsive layout)
4. 🔄 Footer component (links, credits)

---

**Built with ❤️ for professional football program management**
```
