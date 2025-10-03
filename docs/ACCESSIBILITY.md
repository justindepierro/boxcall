# Accessibility (A11y) & WCAG 2.1 AA Compliance

This document outlines the comprehensive accessibility implementation in BoxCall, ensuring WCAG 2.1 AA compliance and inclusive user experience.

## Overview

BoxCall implements extensive accessibility features to ensure the application is usable by people with diverse abilities and assistive technologies.

## Features Implemented

### 1. Screen Reader Support

- **ARIA Live Regions**: Dynamic content announcements
- **Semantic HTML**: Proper heading structure and landmarks
- **Screen Reader Only Content**: Hidden descriptive text for context
- **Page Change Announcements**: Navigation feedback

```tsx
// Usage Example
import { useAccessibility } from "../components/accessibility/AccessibilityProvider";

const { announceMessage, announceError } = useAccessibility();

// Announce success
announceMessage("Team saved successfully", "POLITE");

// Announce error
announceError("Failed to save team");
```

### 2. Keyboard Navigation

- **Focus Management**: Proper focus order and indicators
- **Skip Links**: Quick navigation to main content
- **Focus Trapping**: Modal and dropdown focus containment
- **Keyboard Shortcuts**: Standard navigation patterns

```tsx
// Keyboard Navigation Hook
import { useKeyboardNavigation } from "../hooks/useAccessibility";

useKeyboardNavigation((event) => {
  if (event.key === "Enter") {
    // Handle enter key
  }
});
```

### 3. Color and Contrast

- **4.5:1 Minimum Contrast**: WCAG AA compliant colors
- **High Contrast Mode**: Enhanced contrast support
- **Color Independence**: Information not conveyed by color alone
- **Theme Support**: Light and dark mode accessibility

### 4. Interactive Elements

- **44px Minimum Touch Targets**: Mobile accessibility standard
- **Focus Indicators**: Visible focus states
- **Error States**: Clear error communication
- **Loading States**: Accessible loading indicators

### 5. Form Accessibility

- **Proper Labels**: Associated labels for all inputs
- **Error Messaging**: Clear, accessible error communication
- **Required Field Indicators**: Screen reader friendly
- **Input Validation**: Real-time accessible feedback

```tsx
// Accessible Input Example
<AccessibleInput
  label="Team Name"
  required
  error={errors.name}
  hint="Enter a unique name for your team"
  aria-describedby="team-name-help"
/>
```

### 6. Modal Accessibility

- **Focus Management**: Save and restore focus
- **Escape Key**: Close modal accessibility
- **Focus Trapping**: Keep focus within modal
- **ARIA Attributes**: Proper modal semantics

```tsx
// Accessible Modal Example
<AccessibleModal
  isOpen={isOpen}
  onClose={onClose}
  title="Create New Team"
  description="Enter details for your new team"
>
  <TeamForm />
</AccessibleModal>
```

## Components

### AccessibilityProvider

Global provider that enables accessibility features throughout the application.

**Features:**

- Screen reader announcements
- Keyboard navigation setup
- Reduced motion preferences
- Focus management
- Skip links

### AccessibleButton

WCAG compliant button component with comprehensive accessibility features.

**Features:**

- Proper ARIA attributes
- Loading states
- Focus management
- Touch target compliance
- Screen reader support

### AccessibleInput

Fully accessible form input component.

**Features:**

- Associated labels
- Error messaging
- Required field indicators
- ARIA descriptions
- Focus management

### AccessibleModal

Modal component with complete accessibility support.

**Features:**

- Focus trapping
- Focus restoration
- Keyboard navigation
- ARIA semantics
- Screen reader announcements

## Configuration

### Accessibility Config

Centralized configuration for all accessibility features:

```typescript
// src/config/accessibility.ts
export const accessibilityConfig = {
  colorContrast: {
    minRatio: 4.5, // WCAG AA
    enhancedRatio: 7.0, // WCAG AAA
  },
  keyboardNavigation: {
    enabled: true,
    skipLinks: true,
    focusVisible: true,
  },
  screenReader: {
    enabled: true,
    announcePageChanges: true,
    announceErrors: true,
  },
  // ... more configuration
};
```

## Hooks

### useScreenReader

Provides screen reader announcement functionality.

```tsx
const {
  announce,
  announceError,
  announceSuccess,
  announcePageChange,
  ScreenReaderAnnouncer,
} = useScreenReader();
```

### useKeyboardNavigation

Handles keyboard navigation and shortcuts.

```tsx
useKeyboardNavigation((event) => {
  // Handle keyboard events
});
```

### useFocusManagement

Manages focus for complex interactions.

```tsx
const { saveFocus, restoreFocus, focusFirst, trapFocus } = useFocusManagement();
```

### useReducedMotion

Respects user's motion preferences.

```tsx
const prefersReducedMotion = useReducedMotion();
```

## Testing

### Development Mode

- Accessibility violations detection
- Contrast ratio checking
- Focus flow validation
- Screen reader simulation

### Integration

```tsx
// Enable A11y testing in development
<AccessibilityProvider enableTesting={true}>
  <App />
</AccessibilityProvider>
```

## WCAG 2.1 AA Compliance Checklist

### ✅ Perceivable

- [x] Text alternatives for images
- [x] Captions and transcripts for media
- [x] Content can be presented without loss of meaning
- [x] Sufficient color contrast (4.5:1 minimum)

### ✅ Operable

- [x] All functionality available via keyboard
- [x] No content causes seizures
- [x] Users have enough time to read content
- [x] Clear navigation and page structure

### ✅ Understandable

- [x] Text is readable and understandable
- [x] Content appears and operates predictably
- [x] Input assistance for forms

### ✅ Robust

- [x] Content works with assistive technologies
- [x] Valid, semantic HTML
- [x] Compatible with screen readers

## Best Practices

### 1. Semantic HTML

Always use proper HTML elements for their intended purpose:

```tsx
// Good
<button onClick={handleClick}>Submit</button>

// Avoid
<div onClick={handleClick} role="button">Submit</div>
```

### 2. ARIA Labels

Provide descriptive labels for interactive elements:

```tsx
<button aria-label="Close dialog">×</button>
```

### 3. Focus Management

Always manage focus for dynamic content:

```tsx
// Save focus before opening modal
saveFocus();

// Restore focus when closing
restoreFocus();
```

### 4. Error Handling

Provide clear, actionable error messages:

```tsx
<AccessibleInput
  error="Password must be at least 8 characters"
  aria-invalid={hasError}
/>
```

## Browser Support

### Screen Readers

- ✅ NVDA (Windows)
- ✅ JAWS (Windows)
- ✅ VoiceOver (macOS/iOS)
- ✅ TalkBack (Android)

### Browsers

- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Accessibility Guidelines](https://webaim.org/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

## Support

For accessibility issues or improvements:

1. File an issue with the "accessibility" label
2. Include assistive technology details
3. Provide step-by-step reproduction
4. Suggest alternative approaches when possible
