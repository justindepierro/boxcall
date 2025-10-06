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
        const COLOR_SCALE_PATTERN =
          /\b(text|bg|border|ring)-(gray|slate|red|green|yellow|amber|blue)-(50|100|200|300|400|500|600|700|800|900)\b/gi;
        
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

        const TARGET_ATTRIBUTES = new Set(["className", "class"]);
        const TARGET_CALLEES = new Set([
          "clsx",
          "classnames",
          "classNames",
          "cn",
        ]);

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
          const colorScaleMatches = value.matchAll(COLOR_SCALE_PATTERN);
          for (const match of colorScaleMatches) {
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
