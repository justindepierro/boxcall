# Icon System Usage & Best Practices

## Icon Component API

### Import

```tsx
import { Icon } from "@components/ui/Icon/Icon";
```

### Props

- `name: IconName` — Required. The icon name from the centralized registry.
- `size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "touch" | number` — Icon size (preset or pixel value).
- `color?: "current" | "jade" | "navy" | "slate" | "success" | "warning" | "error" | "info"` — Semantic color.
- `className?: string` — Custom CSS classes.
- `strokeWidth?: number` — SVG stroke width.
- `tabIndex?: number` — Makes icon focusable for keyboard accessibility.

### Example Usage

```tsx
<Icon name="star" size="md" color="info" aria-label="Favorite" />
<Icon name="check" size="lg" color="success" />
<Icon name="alert" size={32} color="error" tabIndex={0} />
```

## Icon Registry

- All icon names are managed in `types.ts` as the `IconName` type.
- To add a new icon:
  1. Add the name to `IconName` in `types.ts` (alphabetized).
  2. Add the SVG/component to the registry.
  3. Use the new name in your codebase.

## Accessibility

- Always provide a descriptive `aria-label` for meaningful icons.
- Use `aria-hidden` for purely decorative icons.
- Use `tabIndex` for keyboard focus if the icon is interactive.

## Best Practices

- Prefer semantic colors for consistency.
- Use preset sizes for UI consistency; use pixel values for custom needs.
- Keep icon usage traceable by using only names from the registry.
- Remove unused icons from the registry to keep bundle size small.
- Document new icons and their intended usage.

## Tree-shaking & Bundle Size

- Only imported/used icons are included in the bundle.
- Avoid importing unused icons/components.
- Use dynamic imports for large icon sets if needed.

## Extensibility

- New icons can be added by updating the registry and type.
- The system supports future expansion and strict type safety.

---

For more details, see `ICON_MIGRATION_PART3.md` and the source files in `src/components/ui/Icon/`.
