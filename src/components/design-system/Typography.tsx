/**
 * BoxCall Design System - Typography
 *
 * Professional typography system with masculine, square aesthetic
 * Features Bebas Neue (display) + Inter (body) + JetBrains Mono (code)
 */
import React from "react";
// Typography variant types - Updated with new display variant
export type TypographyVariant =
  | "display-xl" // NEW: Hero text, team names (Bebas Neue)
  | "display-lg" // NEW: Large display text (Bebas Neue)
  | "display-md" // NEW: Medium display text (Bebas Neue)
  | "headline-xl" // Main headlines (Inter Bold)
  | "headline-lg" // Section headers (Inter Bold)
  | "headline-md" // Subsection headers (Inter Bold)
  | "headline-sm" // Small headers (Inter Bold)
  | "body-lg" // Large body text (Inter)
  | "body-md" // Standard body text (Inter)
  | "body-sm" // Small body text (Inter)
  | "body-xs" // Extra small body text (Inter)
  | "code-lg" // NEW: Large code/stats (JetBrains Mono)
  | "code-md" // NEW: Standard code/stats (JetBrains Mono)
  | "code-sm" // NEW: Small code/stats (JetBrains Mono)
  | "label-lg" // Large labels (Inter Medium)
  | "label-md" // Standard labels (Inter Medium)
  | "button" // Button text (Inter Semibold)
  | "caption"; // Caption text (Inter)
export type TypographyElement =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "span"
  | "div"
  | "label"
  | "code";
// Optional alias variants for ergonomic usage (maps to -md defaults)
export type TypographyVariantAlias =
  | "display"
  | "headline"
  | "body"
  | "code"
  | "label";

export interface TypographyProps {
  /** Typography variant for consistent styling. If omitted, inferred from `as` or defaults to body-md */
  variant?: TypographyVariant | TypographyVariantAlias;
  /** HTML element to render */
  as?: TypographyElement;
  /** Text content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Text color override - Updated with jade/navy colors */
  color?:
    | "primary" // jade-600
    | "secondary" // navy-600
    | "success" // green-600
    | "warning" // yellow-600
    | "error" // red-600
    | "muted" // gray-500
    | "inverse"; // white/dark mode text
  /** Text alignment */
  align?: "left" | "center" | "right";
  /** Truncate text with ellipsis */
  truncate?: boolean;
}

// Polymorphic typing helpers so native props/ref match the chosen `as` element
type ElementFor<E extends TypographyElement> = E extends "p"
  ? HTMLParagraphElement
  : E extends "span"
    ? HTMLSpanElement
    : E extends "div"
      ? HTMLDivElement
      : E extends "label"
        ? HTMLLabelElement
        : E extends "code"
          ? HTMLElement
          : HTMLHeadingElement;

type NativePropsFor<E extends TypographyElement> = Omit<
  React.ComponentPropsWithoutRef<E>,
  keyof TypographyProps | "color" | "children" | "className"
>;

type PolymorphicProps<E extends TypographyElement> = TypographyProps & {
  as?: E;
} & NativePropsFor<E>;
// Typography variant class mappings - Updated with new font families and square aesthetic
const typographyClasses: Record<TypographyVariant, string> = {
  // Display variants - Bebas Neue for maximum impact
  "display-xl":
    "font-display text-[3.25rem] font-normal leading-[0.95] tracking-tight",
  "display-lg":
    "font-display text-[2.75rem] font-normal leading-[0.95] tracking-tight",
  "display-md":
    "font-display text-[2.25rem] font-normal leading-[1.05] tracking-tight",
  // Headlines - Inter Bold for hierarchy
  "headline-xl": "font-sans text-[2rem] font-semibold leading-[1.15]",
  "headline-lg": "font-sans text-[1.625rem] font-semibold leading-[1.15]",
  "headline-md": "font-sans text-[1.375rem] font-semibold leading-[1.2]",
  "headline-sm": "font-sans text-[1.125rem] font-semibold leading-[1.25]",
  // Body text - Inter for readability
  "body-lg": "font-sans text-[0.95rem] leading-[1.4]",
  "body-md": "font-sans text-[0.9rem] leading-[1.38]",
  "body-sm": "font-sans text-[0.82rem] leading-[1.32]",
  "body-xs": "font-sans text-[0.72rem] leading-[1.3]",
  // Code/Stats - JetBrains Mono for technical data
  "code-lg": "font-mono text-[0.95rem] leading-[1.3]",
  "code-md": "font-mono text-[0.85rem] leading-[1.3]",
  "code-sm": "font-mono text-[0.78rem] leading-[1.25]",
  // Labels and UI - Inter Medium
  "label-lg":
    "font-sans text-[0.7rem] font-semibold uppercase tracking-[0.18em]",
  "label-md":
    "font-sans text-[0.62rem] font-semibold uppercase tracking-[0.18em]",
  button: "font-sans text-[0.85rem] font-semibold",
  caption: "font-sans text-[0.7rem] text-muted leading-[1.3]",
};
// Color class mappings - Fixed to use correct Tailwind utilities from tailwind.config.js
const colorClasses: Record<NonNullable<TypographyProps["color"]>, string> = {
  primary: "text-primary", // Uses var(--color-text-primary) from Tailwind config
  secondary: "text-secondary", // Uses var(--color-text-secondary)
  success: "text-success", // Uses var(--color-success)
  warning: "text-warning", // Uses var(--color-warning)
  error: "text-error", // Uses var(--color-error)
  muted: "text-muted", // Uses var(--color-text-muted)
  inverse: "text-inverse", // Uses var(--color-text-inverse)
};
// Text alignment classes
const alignClasses: Record<NonNullable<TypographyProps["align"]>, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};
// Default element mapping for semantic HTML - Updated with new variants
const defaultElements: Record<TypographyVariant, TypographyElement> = {
  "display-xl": "h1",
  "display-lg": "h1",
  "display-md": "h2",
  "headline-xl": "h1",
  "headline-lg": "h2",
  "headline-md": "h3",
  "headline-sm": "h4",
  "body-lg": "p",
  "body-md": "p",
  "body-sm": "p",
  "body-xs": "p",
  "code-lg": "code",
  "code-md": "code",
  "code-sm": "code",
  "label-lg": "label",
  "label-md": "label",
  button: "span",
  caption: "span",
};
/**
 * Typography component for consistent text styling across BoxCall
 *
 * @param variant - Typography style variant
 * @param as - HTML element to render (optional, defaults based on variant)
 * @param children - Text content
 * @param className - Additional CSS classes
 * @param color - Text color variant
 * @param align - Text alignment
 * @param truncate - Whether to truncate text with ellipsis
 */
const TypographyBase = React.forwardRef(
  (
    {
      variant,
      as,
      children,
      className = "",
      color,
      align,
      truncate = false,
      htmlFor,
      ...restProps
    }: PolymorphicProps<TypographyElement> & { htmlFor?: string },
    ref: React.ForwardedRef<ElementFor<TypographyElement>>
  ) => {
    // Map alias variants to concrete sizes
    const normalizeVariant = (
      v: TypographyVariant | TypographyVariantAlias
    ): TypographyVariant => {
      switch (v) {
        case "display":
          return "display-lg";
        case "headline":
          return "headline-md";
        case "body":
          return "body-md";
        case "code":
          return "code-md";
        case "label":
          return "label-md";
        default:
          return v as TypographyVariant;
      }
    };

    // Infer a sensible variant from the chosen element, if variant is not provided
    const deriveVariantFromElement = (
      el?: TypographyElement
    ): TypographyVariant | undefined => {
      switch (el) {
        case "h1":
          return "headline-xl";
        case "h2":
          return "headline-lg";
        case "h3":
          return "headline-md";
        case "h4":
        case "h5":
        case "h6":
          return "headline-sm";
        case "label":
          return "label-md";
        case "code":
          return "code-md";
        case "span":
          return "body-sm";
        case "div":
        case "p":
        default:
          return "body-md";
      }
    };

    const actualVariant = normalizeVariant(
      (variant as TypographyVariant | TypographyVariantAlias) ??
        deriveVariantFromElement(as) ??
        "body-md"
    );
    // Determine the HTML element to render
    const Element = as || defaultElements[actualVariant];
    // Build class string
    const classes = [
      typographyClasses[actualVariant],
      color ? colorClasses[color] : "text-primary", // Default text color when no color specified
      align && alignClasses[align],
      truncate && "truncate",
      className,
    ]
      .filter(Boolean)
      .join(" ");
    const extraProps: Record<string, unknown> = {};
    if (htmlFor && Element === "label") extraProps.htmlFor = htmlFor;
    return (
      <Element
        ref={ref as never}
        className={classes}
        {...extraProps}
        {...(restProps as object)}
      >
        {children}
      </Element>
    );
  }
);
// Set display name for debugging
type TypographyComponent = <E extends TypographyElement = "p">(
  props: PolymorphicProps<E> & { ref?: React.Ref<ElementFor<E>> }
) => React.ReactElement | null;

export const Typography = React.memo(
  TypographyBase
) as unknown as TypographyComponent & {
  displayName?: string;
};
Typography.displayName = "Typography";
export default Typography;

// Ergonomic shorthands with sensible defaults; allow overriding variant when needed
type PropsWithoutAs<E extends TypographyElement> = Omit<
  PolymorphicProps<E>,
  "as"
>;

export const H1 = ({ variant, ...rest }: PropsWithoutAs<"h1">) => (
  <Typography as="h1" variant={variant ?? "headline-xl"} {...rest} />
);
export const H2 = ({ variant, ...rest }: PropsWithoutAs<"h2">) => (
  <Typography as="h2" variant={variant ?? "headline-lg"} {...rest} />
);
export const H3 = ({ variant, ...rest }: PropsWithoutAs<"h3">) => (
  <Typography as="h3" variant={variant ?? "headline-md"} {...rest} />
);
export const H4 = ({ variant, ...rest }: PropsWithoutAs<"h4">) => (
  <Typography as="h4" variant={variant ?? "headline-sm"} {...rest} />
);
export const P = ({ variant, ...rest }: PropsWithoutAs<"p">) => (
  <Typography as="p" variant={variant ?? "body-md"} {...rest} />
);
export const Label = ({
  variant,
  ...rest
}: PropsWithoutAs<"label"> & { htmlFor?: string }) => (
  <Typography as="label" variant={variant ?? "label-md"} {...rest} />
);
export const Code = ({ variant, ...rest }: PropsWithoutAs<"code">) => (
  <Typography as="code" variant={variant ?? "code-md"} {...rest} />
);
