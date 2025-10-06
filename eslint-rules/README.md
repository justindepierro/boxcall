# ESLint Design System Rules

Custom ESLint rules to enforce Boxcall design system compliance.

## Rules

### `boxcall-design/no-arbitrary-spacing`

**Type:** Error  
**Fixable:** No (manual fix required)

Prevents arbitrary spacing values that bypass the design system. Enforces use of Tailwind standard classes or design tokens.

#### Rule Details

This rule detects and reports arbitrary spacing values in:
- Height utilities: `h-[200px]`, `min-h-[44px]`, `max-h-[90vh]`
- Width utilities: `w-[100px]`, `min-w-[160px]`, `max-w-[220px]`
- Viewport units without `svh`: `max-h-[90vh]` (should be `max-h-[90svh]`)

#### Examples

❌ **Incorrect** (will trigger error):

```tsx
// Arbitrary heights
<div className="h-[200px]">Content</div>
<div className="min-h-[44px]">Button</div>

// Arbitrary widths
<div className="w-[100px]">Content</div>
<div className="min-w-[160px]">Input</div>

// Viewport units without svh
<div className="max-h-[90vh]">Modal</div>
```

✅ **Correct** (passes linting):

```tsx
// Standard Tailwind classes
<div className="h-48">Content</div>
<div className="min-h-11">Button</div>

// Standard Tailwind classes
<div className="w-24">Content</div>
<div className="min-w-40">Input</div>

// Safe viewport units
<div className="max-h-[90svh]">Modal</div>

// Design system tokens
<div className="p-spacing-lg m-spacing-md">Content</div>
```

#### Suggested Replacements

The rule provides suggestions for common violations:

| Arbitrary Value | Suggested Replacement | Actual Size |
|----------------|----------------------|-------------|
| `min-h-[44px]` | `min-h-11` | 44px (iOS touch target) |
| `h-[200px]` | `h-48` | 192px |
| `w-[100px]` | `w-24` | 96px |
| `min-w-[160px]` | `min-w-40` | 160px |
| `max-h-[90vh]` | `max-h-[90svh]` | 90svh (mobile-safe) |

See the full suggestion table in `eslint-rules/no-arbitrary-spacing.js`.

#### Exceptions

The rule allows:
- **Design system tokens:** `spacing-*` classes (e.g., `p-spacing-lg`)
- **Already standardized:** `svh` units (e.g., `max-h-[90svh]`)
- **Large layout containers:** `rem` values > 40rem (e.g., `min-h-[37.5rem]`)

#### Why This Rule?

**Design System Compliance:**
- Ensures consistent spacing across the entire app
- Prevents arbitrary "magic numbers" in code
- Makes components easier to maintain

**Mobile Support:**
- Enforces `svh` (small viewport height) for better mobile browser support
- Prevents content overflow on iOS Safari (dynamic address bar)

**Accessibility:**
- Suggests iOS-compliant touch targets (44px minimum)
- Maintains accessible component sizing

#### Related Documentation

- [Design System Roadmap](../docs/DESIGN_SYSTEM_ROADMAP.md)
- [Design System Changelog](../docs/DESIGN_SYSTEM_CHANGELOG.md)
- [Design System Baseline](../docs/DESIGN_SYSTEM_BASELINE.md)
- [Spacing Standardization Project](../docs/DESIGN_SYSTEM_CHANGELOG.md#210---2025-01-20)

---

### `boxcall-design/no-raw-tailwind-colors`

**Type:** Error  
**Fixable:** No (manual fix required)

Prevents raw Tailwind color utilities that bypass the design token pipeline.

#### Rule Details

This rule detects and reports arbitrary color values in:
- Background utilities: `bg-[#fff]`, `bg-[rgba(...)]`
- Text utilities: `text-[#000]`
- Border utilities: `border-[#ccc]`
- Other color utilities: `stroke-[...]`, `fill-[...]`, `outline-[...]`, `ring-[...]`

#### Examples

❌ **Incorrect**:

```tsx
<div className="bg-[#ffffff]">Content</div>
<div className="text-[rgba(0,0,0,0.5)]">Text</div>
```

✅ **Correct**:

```tsx
<div className="bg-surface-primary">Content</div>
<div className="text-text-secondary">Text</div>
```

---

## Installation

The rules are automatically loaded via `eslint.config.js`:

```javascript
import boxcallDesignRules from "./eslint-rules/[rule-name].js";

export default [
  {
    plugins: {
      "boxcall-design": boxcallDesignRules,
    },
    rules: {
      "boxcall-design/no-arbitrary-spacing": "error",
      "boxcall-design/no-raw-tailwind-colors": "error",
    },
  },
];
```

## Usage

The rules run automatically during:

```bash
# Lint entire project
npm run lint

# Lint specific file
npx eslint src/components/MyComponent.tsx

# Lint with auto-fix (where possible)
npm run lint -- --fix
```

## Development

### Testing Rules Locally

1. Add a temporary violation to a file in `src/`
2. Run `npx eslint path/to/file.tsx`
3. Verify the error appears with the correct message
4. Remove the violation

### Adding New Rules

1. Create new rule file in `eslint-rules/`
2. Export rule object with `rules` property
3. Import in `eslint.config.js`
4. Merge into `boxcallDesignRules` object
5. Add rule to `rules` configuration
6. Document in this README
7. Test thoroughly

## Contributing

When adding new design system standards:

1. **Update the rule** - Add new patterns to detect
2. **Add suggestions** - Provide helpful replacement suggestions
3. **Document exceptions** - Clearly explain any allowed edge cases
4. **Test thoroughly** - Verify rule catches violations correctly
5. **Update docs** - Add to this README and design system docs

## Maintenance

These rules should be updated whenever:
- New design system standards are established
- Spacing scale changes
- New token patterns are introduced
- Breaking changes to Tailwind configuration occur

## Support

For questions about these rules or design system compliance:
- See [Design System Roadmap](../docs/DESIGN_SYSTEM_ROADMAP.md)
- Review [Design System Changelog](../docs/DESIGN_SYSTEM_CHANGELOG.md)
- Check [Design System Baseline](../docs/DESIGN_SYSTEM_BASELINE.md)

---

**Last Updated:** January 20, 2025  
**Version:** 1.0.0
