/**
 * Design System Style Mapping
 *
 * Comprehensive mapping from hardcoded Tailwind classes to semantic design system classes.
 * This ensures consistency across the entire application and enables runtime theme switching.
 */

export const DESIGN_SYSTEM_MAPPING = {
  // Background Colors
  "bg-white": "bg-primary",
  "bg-gray-50": "bg-secondary",
  "bg-gray-100": "bg-secondary",

  // Text Colors
  "text-gray-900": "text-primary",
  "text-gray-700": "text-secondary",
  "text-gray-500": "text-secondary",
  "text-gray-400": "text-secondary",
  "text-gray-600": "text-tertiary",
  "text-white": "text-bg-primary",

  // Border Colors
  "border-gray-200": "border-border",
  "border-gray-300": "border-light",
  "border-gray-100": "border-bg-secondary",

  // Hover States
  "hover:bg-gray-50": "hover:bg-secondary",
  "hover:bg-white": "hover:bg-primary",
  "hover:text-gray-900": "hover:text-primary",

  // Focus States
  "focus:border-gray-300": "focus:border-light",
  "focus:ring-gray-300": "focus:ring-border-light",

  // Card Styles
  "bg-white rounded-lg border border-gray-200":
    "bg-primary rounded-lg border border-border",
  "bg-white border border-gray-200": "bg-primary border border-border",

  // Button Styles (these should use Button component variants instead)
  "bg-gray-100 hover:bg-gray-200": "bg-secondary hover:bg-border",
  "text-gray-600 hover:text-gray-900":
    "text-tertiary hover:text-primary",
} as const;

/**
 * Semantic CSS Custom Properties Available
 *
 * These are the CSS variables that should be used instead of hardcoded colors:
 *
 * Backgrounds:
 * - --semantic-bg-primary: Main background
 * - --semantic-bg-secondary: Secondary background
 * - --semantic-bg-muted: Muted background
 * - --semantic-hover:bg-muted: Hover state for surfaces
 *
 * Text:
 * - --semantic-text-primary: Primary text color
 * - --semantic-text-secondary: Secondary text color
 * - --semantic-text-muted: Muted text color
 * - --semantic-text-inverse: Text on dark backgrounds
 * - --semantic-text-brand: Brand color text
 *
 * Borders:
 * - --semantic-border: Default border color
 * - --semantic-border-focus: Focus state border
 * - --semantic-border-error: Error state border
 *
 * Status Colors:
 * - --semantic-success: Success color
 * - --semantic-warning: Warning color
 * - --semantic-error: Error color
 * - --semantic-success-bg: Success background
 * - --semantic-warning-bg: Warning background
 * - --semantic-error-bg: Error background
 */

/**
 * Utility function to convert hardcoded classes to semantic classes
 */
export function convertToSemanticClasses(className: string): string {
  let result = className;

  Object.entries(DESIGN_SYSTEM_MAPPING).forEach(([hardcoded, semantic]) => {
    result = result.replace(new RegExp(`\\b${hardcoded}\\b`, "g"), semantic);
  });

  return result;
}

/**
 * ESLint Rule Pattern for Design System Compliance
 *
 * This pattern can be used to create a custom ESLint rule that flags
 * hardcoded color classes and suggests semantic alternatives.
 */
export const ESLINT_DESIGN_SYSTEM_RULE = {
  name: "design-system-compliance",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Enforce use of semantic design system classes instead of hardcoded colors",
      category: "Best Practices",
      recommended: true,
    },
    fixable: "code",
    schema: [],
    messages: {
      hardcodedColor:
        'Use semantic design system class "{{semantic}}" instead of hardcoded "{{hardcoded}}"',
    },
  },
  create(context: any) {
    return {
      JSXAttribute(node: any) {
        if (node.name.name === "className" && node.value?.type === "Literal") {
          const className = node.value.value;
          if (typeof className === "string") {
            Object.entries(DESIGN_SYSTEM_MAPPING).forEach(
              ([hardcoded, semantic]) => {
                if (className.includes(hardcoded)) {
                  context.report({
                    node,
                    messageId: "hardcodedColor",
                    data: { hardcoded, semantic },
                    fix(fixer: any) {
                      const newClassName = className.replace(
                        new RegExp(`\\b${hardcoded}\\b`, "g"),
                        semantic
                      );
                      return fixer.replaceText(node.value, `"${newClassName}"`);
                    },
                  });
                }
              }
            );
          }
        }
      },
    };
  },
};
