# InlineEditableText Component

A powerful, reusable inline editable text component with comprehensive validation, visual feedback, and accessibility features.

## Features

- ✅ **Inline Editing**: Click any text to edit it inline
- ✅ **Visual Feedback**: Subtle off-color highlight when editable, green when editing and valid
- ✅ **Validation**: Length limits, symbol restrictions, custom validation rules
- ✅ **Diagram Compatibility**: Warnings for text that may overdraw on diagram shapes
- ✅ **Accessibility**: Full keyboard navigation and screen reader support
- ✅ **Responsive**: Works on all screen sizes
- ✅ **TypeScript**: Fully typed with comprehensive props

## Basic Usage

```tsx
import { InlineEditableText } from "../ui/InlineEditableText";

function MyComponent() {
  const [value, setValue] = useState("Click to edit");

  return (
    <InlineEditableText
      value={value}
      onChange={setValue}
      placeholder="Click to edit..."
    />
  );
}
```

## Props

### Required Props

- `value: string` - The current text value
- `onChange: (value: string) => void` - Called when value changes

### Optional Props

- `placeholder?: string` - Placeholder text when value is empty
- `maxLength?: number` - Maximum allowed characters
- `minLength?: number` - Minimum required characters
- `allowSymbols?: boolean` - Whether symbols are allowed (default: false)
- `showLengthWarnings?: boolean` - Show warnings for long text (default: true)
- `maxRecommendedLength?: number` - Length that triggers diagram warnings (default: 2)
- `className?: string` - Additional CSS classes
- `disabled?: boolean` - Whether the field is disabled
- `showValidation?: boolean` - Whether to show validation messages
- `size?: 'sm' | 'md' | 'lg'` - Size variant (default: 'md')
- `autoFocus?: boolean` - Auto-focus when editing starts (default: true)
- `selectAllOnFocus?: boolean` - Select all text when editing starts (default: true)
- `icon?: ReactNode` - Custom icon to show
- `onEditStart?: () => void` - Called when editing starts
- `onEditEnd?: (value: string) => void` - Called when editing ends

### Advanced Props

- `validationRules?: ValidationRule[]` - Custom validation rules
- `customValidator?: (value: string) => { isValid: boolean; message?: string; level?: 'error' | 'warning' }` - Custom validation function

## Validation Examples

### Length Validation with Diagram Warnings

```tsx
<InlineEditableText
  value={positionName}
  onChange={setPositionName}
  placeholder="QB"
  maxRecommendedLength={2}
  showLengthWarnings={true}
/>
```

### Symbol Restrictions

```tsx
<InlineEditableText
  value={playerName}
  onChange={setPlayerName}
  allowSymbols={false} // No symbols allowed
/>
```

### Custom Validation

```tsx
<InlineEditableText
  value={code}
  onChange={setCode}
  customValidator={(value) => {
    if (!value.startsWith("QB")) {
      return {
        isValid: false,
        message: "Must start with 'QB'",
        level: "error",
      };
    }
    return { isValid: true };
  }}
/>
```

## Visual States

1. **Default**: Subtle gray border, hover shows light background
2. **Editing + Valid**: Green background and border
3. **Editing + Warning**: Yellow background and border (allows saving)
4. **Editing + Error**: Red background and border (prevents saving)

## Keyboard Navigation

- **Enter**: Save changes and exit edit mode
- **Escape**: Cancel changes and exit edit mode
- **Tab**: Move focus to next element
- **Click**: Enter edit mode

## Accessibility

- Full ARIA support with proper labels and descriptions
- Keyboard navigation support
- Screen reader announcements for validation messages
- Focus management and restoration

## Use Cases

- **Position Names**: Football position abbreviations with length validation
- **Player Names**: Names with symbol restrictions
- **Form Fields**: Any inline editable content
- **Settings**: Configuration values with validation
- **Labels**: Dynamic labels with constraints

## Integration with Existing Code

Replace regular input fields:

```tsx
// Before
<Input
  value={positionName}
  onChange={(e) => setPositionName(e.target.value)}
  placeholder="QB"
/>

// After
<InlineEditableText
  value={positionName}
  onChange={setPositionName}
  placeholder="QB"
  maxRecommendedLength={2}
  showLengthWarnings={true}
  allowSymbols={false}
/>
```

## Demo

See `InlineEditableTextDemo.tsx` for a comprehensive demonstration of all features and validation scenarios.
