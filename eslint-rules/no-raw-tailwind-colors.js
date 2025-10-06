export default {
  rules: {
    "no-raw-tailwind-colors": {
      meta: {
        type: "problem",
        docs: {
          description:
            "Disallow Tailwind arbitrary color utilities and direct color scale usage that bypass the design token pipeline",
          recommended: false,
        },
        schema: [],
        messages: {
          replace:
            'Replace raw Tailwind utility "{{utility}}" with a semantic token class or CSS variable-backed helper.',
          replaceWithSuggestion:
            'Replace "{{utility}}" with semantic token. Suggestion: {{suggestion}}',
        },
      },
      create(context) {
        // Pattern for arbitrary colors (existing)
        const ARBITRARY_COLOR_PATTERN =
          /\b(?:bg|text|border|stroke|fill|outline|ring|from|via|to)-\[[^\]]*(?:#[0-9A-Fa-f]{3,8}|rgba?\s*\(|hsla?\s*\()[^\]]*]/gi;
        
        // Pattern for direct color scale usage (new)
        // Exclude approved direct colors: blue-* for info states, with dark: prefix patterns
        const COLOR_SCALE_PATTERN =
          /\b(text|bg|border|ring)-(gray|slate|red|green|yellow|amber)-(50|100|200|300|400|500|600|700|800|900)\b/gi;
        
        // NEW: Pattern for arbitrary sizing/spacing values
        // Note: We allow vh/vw units (converted from svh/svw for better browser support)
        // Note: We allow % units for aspect ratios and relative sizing
        const ARBITRARY_SIZE_PATTERN =
          /\b(?:text|w|h|min-w|min-h|max-w|max-h|p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|space)-\[([0-9.]+)(px|rem|em|svh|svw)\]/gi;
        
        // Semantic token suggestions
        const SEMANTIC_SUGGESTIONS = {
          // Gray text colors
          'text-gray-900': 'text-primary',
          'text-gray-800': 'text-primary',
          'text-gray-700': 'text-primary',
          'text-gray-600': 'text-secondary',
          'text-gray-500': 'text-muted',
          'text-gray-400': 'text-muted',
          
          // Gray backgrounds
          'bg-gray-50': 'bg-surface-secondary',
          'bg-gray-100': 'bg-surface-muted',
          'bg-gray-200': 'bg-surface-muted',
          
          // Gray borders
          'border-gray-200': 'border',
          'border-gray-300': 'border',
          'border-gray-100': 'border-subtle',
          
          // Status colors - Success (green)
          'text-green-600': 'text-success-600',
          'text-green-500': 'text-success-500',
          'bg-green-500': 'bg-success-500',
          'bg-green-600': 'bg-success-600',
          'bg-green-50': 'bg-success-bg',
          'bg-green-100': 'bg-success-bg',
          'border-green-500': 'border-success-500',
          'border-green-300': 'border-success-300',
          'border-green-200': 'border-success-200',
          
          // Status colors - Error (red)
          'text-red-600': 'text-error-600',
          'text-red-500': 'text-error-500',
          'text-red-700': 'text-error-600',
          'bg-red-500': 'bg-error-500',
          'bg-red-600': 'bg-error-600',
          'bg-red-50': 'bg-error-bg',
          'bg-red-100': 'bg-error-bg',
          'border-red-500': 'border-error-500',
          'border-red-600': 'border-error-600',
          'border-red-200': 'border-error-200',
          'ring-red-500': 'ring-error-500',
          
          // Status colors - Warning (yellow/amber)
          'text-yellow-600': 'text-warning-600',
          'text-yellow-500': 'text-warning-500',
          'text-amber-600': 'text-warning-600',
          'text-amber-500': 'text-warning-500',
          'text-amber-400': 'text-warning-500 (or text-amber-400 for icons)',
          'text-amber-700': 'text-warning-600',
          'text-amber-300': 'text-warning-400 (light mode) or keep with dark: prefix',
          'bg-yellow-500': 'bg-warning-500',
          'bg-amber-500': 'bg-warning-500',
          'bg-yellow-50': 'bg-warning-bg',
          'bg-amber-50': 'bg-warning-bg',
          'border-yellow-500': 'border-warning-500',
          'border-yellow-200': 'border-warning-200',
          
          // Blue (info) colors
          'text-blue-600': 'text-status-info or text-blue-600 (direct)',
          'text-blue-700': 'text-blue-700 (direct)',
          'text-blue-500': 'text-status-info or text-blue-500 (direct)',
          'text-blue-300': 'text-blue-300 (keep with dark: prefix)',
          'bg-blue-600': 'bg-blue-600 (direct for info states)',
          'bg-blue-500': 'bg-blue-500 (direct for info states)',
          'bg-blue-50': 'bg-status-info-bg',
          'bg-blue-100': 'bg-status-info-bg',
          'border-blue-500': 'border-blue-500 (direct for info states)',
          'border-blue-600': 'border-blue-600 (direct for info states)',
          
          // Slate colors (for dark mode - use with caution)
          'text-slate-400': 'text-muted (or use with dark: prefix)',
          'text-slate-600': 'text-secondary (or use with dark: prefix)',
          'bg-slate-800': 'Use bg-surface-secondary with dark:bg-slate-800',
          'bg-slate-900': 'Intentional dark theme (OK if always dark)',
          'border-slate-200': 'border (with dark:border-slate-700)',
          'border-slate-700': 'Use with dark: prefix (dark:border-slate-700)',
          'bg-gray-800': 'Use bg-surface-secondary with dark:bg-gray-800',
        };
        
        // NEW: Arbitrary value suggestions
        const ARBITRARY_VALUE_SUGGESTIONS = {
          // Text sizes (should use scale)
          'text-[11px]': 'text-xs (12px) - consider adjusting scale or accepting closest match',
          'text-[13px]': 'text-sm (14px base)',
          'text-[14px]': 'text-sm',
          'text-[15px]': 'text-base (16px)',
          'text-[16px]': 'text-base',
          'text-[18px]': 'text-lg (18px)',
          'text-[20px]': 'text-xl (20px)',
          'text-[0.82rem]': 'text-sm or text-xs',
          'text-[1.625rem]': 'text-2xl or adjust design token',
          'text-[1.75rem]': 'text-3xl (30px)',
          
          // Spacing (8px grid system)
          'p-[24px]': 'p-6 (6 × 4px = 24px)',
          'p-[16px]': 'p-4',
          'p-[32px]': 'p-8',
          'p-[20px]': 'p-5 (closest: 20px)',
          'px-[24px]': 'px-6',
          'py-[24px]': 'py-6',
          'm-[16px]': 'm-4',
          'gap-[16px]': 'gap-4',
          'gap-[1.75rem]': 'gap-7 (1.75rem = 28px)',
          'gap-[0.875rem]': 'gap-3.5 (0.875rem = 14px)',
          
          // Sizing
          'w-[90svh]': 'max-w-[90vh] or h-screen with constraints',
          'h-[40svh]': 'min-h-[40vh] or use h-auto with constraints',
          'max-h-[90svh]': 'max-h-[90vh] (svh → vh for better support)',
          'min-h-[40svh]': 'min-h-[40vh]',
        };

        const TARGET_ATTRIBUTES = new Set(["className", "class"]);
        const TARGET_CALLEES = new Set([
          "clsx",
          "classnames",
          "classNames",
          "cn",
        ]);
        
        function getSuggestionForArbitrarySize(match) {
          const fullMatch = match[0];
          const value = match[1];
          const unit = match[2];
          
          // Check direct match first
          if (ARBITRARY_VALUE_SUGGESTIONS[fullMatch]) {
            return ARBITRARY_VALUE_SUGGESTIONS[fullMatch];
          }
          
          // For px values, suggest 8px grid
          if (unit === 'px') {
            const numValue = parseFloat(value);
            const gridValue = Math.round(numValue / 4);
            if (numValue % 4 === 0) {
              return `Use Tailwind scale (≈ ${gridValue} units, ${numValue}px = ${gridValue} × 4px)`;
            } else {
              const nearest = Math.round(numValue / 4) * 4;
              return `Use 8px grid - nearest: ${nearest}px (actual: ${numValue}px)`;
            }
          }
          
          // For rem/em, suggest scale
          if (unit === 'rem' || unit === 'em') {
            return `Use Tailwind scale or spacing token (${value}${unit})`;
          }
          
          // For viewport units, only flag svh/svw (we use vh/vw for better support)
          if (unit === 'svh' || unit === 'svw') {
            return `Use vh/vw instead (better browser support) or h-screen/w-screen utilities`;
          }
          
          return 'Use Tailwind utility or spacing token from design system';
        }

        function reportMatches(value, node) {
          if (typeof value !== "string" || !value) return;
          
          // Check for arbitrary colors (existing)
          const arbitraryMatches = value.matchAll(ARBITRARY_COLOR_PATTERN);
          let reported = false;
          for (const match of arbitraryMatches) {
            reported = true;
            context.report({
              node,
              messageId: "replace",
              data: { utility: match[0] },
            });
          }
          
          // Check for direct color scale usage (new)
          // Skip colors that are already prefixed with dark: (intentional theme colors)
          const colorScaleMatches = value.matchAll(COLOR_SCALE_PATTERN);
          for (const match of colorScaleMatches) {
            // Check if this color is preceded by "dark:" in the same className
            const matchIndex = match.index;
            const precedingText = value.substring(Math.max(0, matchIndex - 5), matchIndex);
            if (precedingText.includes('dark:')) {
              // Skip this match - it's intentionally using dark: prefix
              continue;
            }
            
            reported = true;
            const utility = match[0];
            const suggestion = SEMANTIC_SUGGESTIONS[utility] || 'a semantic token (see design system docs)';
            context.report({
              node,
              messageId: "replaceWithSuggestion",
              data: { 
                utility: utility,
                suggestion: suggestion 
              },
            });
          }
          
          // NEW: Check for arbitrary sizing/spacing values
          const sizeMatches = value.matchAll(ARBITRARY_SIZE_PATTERN);
          for (const match of sizeMatches) {
            reported = true;
            const utility = match[0];
            const suggestion = getSuggestionForArbitrarySize(match);
            context.report({
              node,
              messageId: "replaceWithSuggestion",
              data: { 
                utility: utility,
                suggestion: suggestion 
              },
            });
          }
          
          return reported;
        }

        function collectStrings(expr) {
          if (!expr) return [];
          switch (expr.type) {
            case "Literal":
              return typeof expr.value === "string" ? [expr.value] : [];
            case "TemplateLiteral":
              return expr.quasis.map((q) => q.value.cooked || "");
            case "BinaryExpression":
              if (expr.operator === "+") {
                return [
                  ...collectStrings(expr.left),
                  ...collectStrings(expr.right),
                ];
              }
              return [];
            case "ConditionalExpression":
              return [
                ...collectStrings(expr.consequent),
                ...collectStrings(expr.alternate),
              ];
            case "LogicalExpression":
              return [
                ...collectStrings(expr.left),
                ...collectStrings(expr.right),
              ];
            case "ArrayExpression":
              return expr.elements.flatMap((el) => collectStrings(el));
            case "ObjectExpression":
              return expr.properties.flatMap((prop) => {
                if (prop.type !== "Property" || prop.computed) return [];
                if (
                  prop.key.type === "Literal" &&
                  typeof prop.key.value === "string"
                ) {
                  return [prop.key.value];
                }
                if (prop.key.type === "TemplateLiteral") {
                  return prop.key.quasis.map((q) => q.value.cooked || "");
                }
                return [];
              });
            case "TemplateElement":
              return [expr.value.cooked || ""];
            case "CallExpression": {
              if (
                expr.callee.type === "Identifier" &&
                TARGET_CALLEES.has(expr.callee.name)
              ) {
                return expr.arguments.flatMap((arg) => {
                  if (arg && arg.type === "ObjectExpression") {
                    return collectStrings(arg);
                  }
                  return collectStrings(arg);
                });
              }
              return [];
            }
            case "TSAsExpression":
            case "TSTypeAssertion":
            case "TSNonNullExpression":
            case "ChainExpression":
            case "ParenthesizedExpression":
              return collectStrings(expr.expression || expr); // chain uses .expression
            default:
              return [];
          }
        }

        return {
          JSXAttribute(node) {
            if (node.name.type !== "JSXIdentifier") return;
            if (!TARGET_ATTRIBUTES.has(node.name.name)) return;
            if (!node.value) return;

            if (node.value.type === "Literal") {
              reportMatches(node.value.value, node.value);
              return;
            }

            if (node.value.type === "JSXExpressionContainer") {
              const strings = collectStrings(node.value.expression);
              for (const value of strings) {
                reportMatches(value, node.value);
              }
            }
          },
        };
      },
    },
  },
};
