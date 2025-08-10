# Button Component

Professional button component with multiple variants, sizes, and states for the BoxCall football management platform. Part of BoxCall's enterprise-grade design system with jade green and navy blue color palette.

## Design System Integration

- **Primary Color**: Jade Green (#00A86B) for primary actions
- **Secondary Color**: Navy Blue (#1E3A8A) for secondary actions
- **Typography**: Inter font family with precise sizing
- **Motion**: Square motion language with confident animations
- **Football Context**: Designed for coaching and team management interfaces

## Features

- 8 variant styles (primary, secondary, outline, ghost, link, danger, success, warning)
- 5 size options (xs, sm, md, lg, xl)
- Loading states with spinner
- Icon support with positioning
- Full width option
- Comprehensive accessibility support
- TypeScript support with full type definitions

## Usage

```tsx
import { Button } from '@/components/ui/Button';

// Basic usage
<Button>Click me</Button>

// With variant and size
<Button variant="primary" size="lg">
  Save Team
</Button>

// With loading state
<Button loading>
  Creating Player...
</Button>

// With icon
<Button icon={<PlusIcon />} iconPosition="left">
  Add Player
</Button>

// Danger variant for destructive actions
<Button variant="danger" onClick={handleDelete}>
  Remove Player
</Button>
```

## Props

| Prop         | Type                                                                                             | Required | Default   | Description                             |
| ------------ | ------------------------------------------------------------------------------------------------ | -------- | --------- | --------------------------------------- |
| variant      | 'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'link' \| 'danger' \| 'success' \| 'warning' | No       | 'primary' | Button style variant                    |
| size         | 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'                                                             | No       | 'md'      | Button size                             |
| children     | ReactNode                                                                                        | No       | undefined | Button content                          |
| loading      | boolean                                                                                          | No       | false     | Show loading spinner and disable button |
| disabled     | boolean                                                                                          | No       | false     | Disable button                          |
| fullWidth    | boolean                                                                                          | No       | false     | Make button full width                  |
| icon         | ReactNode                                                                                        | No       | undefined | Icon element to display                 |
| iconPosition | 'left' \| 'right' \| 'only'                                                                      | No       | 'left'    | Position of icon relative to text       |
| className    | string                                                                                           | No       | ''        | Additional CSS classes                  |
| type         | 'button' \| 'submit' \| 'reset'                                                                  | No       | 'button'  | HTML button type                        |

All standard HTML button attributes are also supported.

## Variants

### Primary

Used for main actions and call-to-action buttons.

```tsx
<Button variant="primary">Save Changes</Button>
```

### Secondary

Used for secondary actions and general interactions.

```tsx
<Button variant="secondary">Cancel</Button>
```

### Outline

Used for less prominent actions while maintaining button importance.

```tsx
<Button variant="secondary">View Details</Button>
```

### Ghost

Used for subtle actions with minimal visual weight.

```tsx
<Button variant="ghost">Edit</Button>
```

### Link

Used for text-based actions that look like links.

```tsx
<Button variant="link">Learn More</Button>
```

### Danger

Used for destructive actions like delete or remove.

```tsx
<Button variant="danger">Delete Team</Button>
```

### Success

Used for positive confirmation actions.

```tsx
<Button variant="success">Confirm Trade</Button>
```

### Warning

Used for caution-requiring actions.

```tsx
<Button variant="warning">Bench Player</Button>
```

## Sizes

### Extra Small (xs)

```tsx
<Button size="xs">XS Button</Button>
```

### Small (sm)

```tsx
<Button size="sm">Small Button</Button>
```

### Medium (md) - Default

```tsx
<Button size="md">Medium Button</Button>
```

### Large (lg)

```tsx
<Button size="lg">Large Button</Button>
```

### Extra Large (xl)

```tsx
<Button size="xl">Extra Large Button</Button>
```

## Icon Usage

### Icon with Text

```tsx
<Button icon={<PlusIcon />} iconPosition="left">
  Add Player
</Button>

<Button icon={<ArrowRightIcon />} iconPosition="right">
  Next Step
</Button>
```

### Icon Only

```tsx
<Button icon={<SettingsIcon />} iconPosition="only" />
```

## Loading State

The loading state automatically disables the button and shows a spinner.

```tsx
const [isCreating, setIsCreating] = useState(false);

<Button loading={isCreating} onClick={handleCreateTeam}>
  {isCreating ? "Creating..." : "Create Team"}
</Button>;
```

## Football-Specific Examples

### Team Management

```tsx
// Add new team
<Button variant="primary" icon={<PlusIcon />}>
  Add Team
</Button>

// Remove team
<Button variant="danger" icon={<TrashIcon />}>
  Remove Team
</Button>
```

### Player Actions

```tsx
// Add player to roster
<Button variant="success" size="sm">
  Add to Roster
</Button>

// Bench player
<Button variant="warning" size="sm">
  Bench
</Button>

// Release player
<Button variant="danger" size="sm">
  Release
</Button>
```

### Play Management

```tsx
// Create new play
<Button variant="primary" fullWidth>
  Create New Play
</Button>

// Save play
<Button variant="success" loading={isSaving}>
  Save Play
</Button>
```

## Accessibility

- Proper ARIA attributes for screen readers
- Keyboard navigation support (Tab, Enter, Space)
- Focus management with visible focus indicators
- Loading states announced to screen readers
- Disabled states properly communicated

## Testing

### Unit Test Examples

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

test("renders button with text", () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
});

test("handles click events", async () => {
  const handleClick = vi.fn();
  render(<Button onClick={handleClick}>Click me</Button>);

  await userEvent.click(screen.getByRole("button"));
  expect(handleClick).toHaveBeenCalledTimes(1);
});

test("shows loading state", () => {
  render(<Button loading>Submit</Button>);
  expect(screen.getByRole("button")).toBeDisabled();
  expect(screen.getByRole("button")).toHaveClass("disabled:bg-blue-300");
});
```

### Key Test Scenarios

1. **Rendering**: All variants and sizes render correctly
2. **Interactions**: Click, hover, focus, keyboard navigation
3. **States**: Loading, disabled, active states
4. **Icons**: Icon positioning and rendering
5. **Accessibility**: ARIA attributes, keyboard navigation
6. **Edge Cases**: Empty children, icon-only buttons

## Best Practices

1. **Use semantic variants**: Choose variants that match the action's intent
2. **Consistent sizing**: Use consistent button sizes within the same UI section
3. **Loading states**: Always provide loading feedback for async actions
4. **Accessibility**: Include meaningful text even for icon-only buttons
5. **Football context**: Use appropriate variants for football-specific actions

## Dependencies

- React 19+
- Tailwind CSS 3.4+
- TypeScript 5.8+

---

**Built with ❤️ for BoxCall Football Management Platform**
