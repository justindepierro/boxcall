export default {
  rules: {
    "no-raw-tailwind-colors-dynamic": {
      meta: {
        type: "suggestion",
        docs: {
          description:
            "Warn on raw Tailwind color utilities inside dynamic className expressions (template literals, clsx/cn calls, logical expressions).",
          recommended: false,
        },
        schema: [],
        messages: {
          replaceWithSuggestion:
            'Replace "{{utility}}" with a semantic token class. Suggestion: {{suggestion}}',
        },
      },
      create(context) {
        // Keep this intentionally scoped: only catch common Tailwind palette scales
        // that bypass BoxCall's token pipeline.
        const COLOR_SCALE_PATTERN =
          /\b(?:text|bg|border|ring|fill|stroke|outline)-(?:gray|slate|red|green|yellow|amber)-(?:50|100|200|300|400|500|600|700|800|900)\b/g;

        // Suggestion map (small, practical set — extend as needed).
        const SUGGEST = {
          // Slate/gray → semantic
          "text-slate-600": "text-secondary",
          "text-slate-500": "text-muted",
          "text-slate-400": "text-muted",
          "bg-slate-100": "bg-secondary",
          "border-slate-200": "border-border",

          // Success
          "bg-green-600": "bg-success-600",
          "bg-green-500": "bg-success-500",
          "bg-green-100": "bg-success-bg",
          "bg-green-200": "bg-success-100",
          "text-green-800": "text-success-800",
          "ring-green-500": "ring-success-border",

          // Error
          "bg-red-500": "bg-error-500",

          // Warning
          "text-yellow-500": "text-warning-strong",
          "fill-yellow-500": "fill-warning-strong",
        };

        const TARGET_ATTRIBUTES = new Set(["className", "class"]);
        const TARGET_CALLEES = new Set([
          "clsx",
          "classnames",
          "classNames",
          "cn",
        ]);

        function reportMatches(text, node) {
          if (typeof text !== "string" || !text) return;

          for (const match of text.matchAll(COLOR_SCALE_PATTERN)) {
            const utility = match[0];

            // Skip intentional dark theme raw colors.
            const idx = match.index ?? 0;
            const prefix = text.slice(Math.max(0, idx - 5), idx);
            if (prefix.includes("dark:")) continue;

            const suggestion =
              SUGGEST[utility] || "a semantic token (see design system docs)";
            context.report({
              node,
              messageId: "replaceWithSuggestion",
              data: { utility, suggestion },
            });
          }
        }

        function getCalleeName(node) {
          if (!node) return null;
          if (node.type === "Identifier") return node.name;
          if (node.type === "MemberExpression" && !node.computed) {
            if (node.property?.type === "Identifier") return node.property.name;
          }
          return null;
        }

        function visitExpression(expr) {
          if (!expr) return;

          switch (expr.type) {
            case "Literal": {
              if (typeof expr.value === "string")
                reportMatches(expr.value, expr);
              return;
            }
            case "TemplateLiteral": {
              for (const quasi of expr.quasis) {
                reportMatches(quasi.value?.cooked ?? "", quasi);
              }
              for (const embedded of expr.expressions) {
                visitExpression(embedded);
              }
              return;
            }
            case "BinaryExpression": {
              // e.g. "foo " + (cond ? "bg-green-600" : "")
              visitExpression(expr.left);
              visitExpression(expr.right);
              return;
            }
            case "LogicalExpression": {
              visitExpression(expr.left);
              visitExpression(expr.right);
              return;
            }
            case "ConditionalExpression": {
              visitExpression(expr.consequent);
              visitExpression(expr.alternate);
              return;
            }
            case "ArrayExpression": {
              for (const el of expr.elements) {
                if (el) visitExpression(el);
              }
              return;
            }
            case "ObjectExpression": {
              for (const prop of expr.properties) {
                if (prop.type === "Property") {
                  // clsx({ "bg-green-600": active })
                  if (
                    prop.key?.type === "Literal" &&
                    typeof prop.key.value === "string"
                  ) {
                    reportMatches(prop.key.value, prop.key);
                  }
                  visitExpression(prop.value);
                }
              }
              return;
            }
            case "CallExpression": {
              const callee = getCalleeName(expr.callee);
              if (callee && TARGET_CALLEES.has(callee)) {
                for (const arg of expr.arguments) {
                  if (arg && arg.type !== "SpreadElement") visitExpression(arg);
                }
              } else {
                // Still traverse args to catch inline template literals.
                for (const arg of expr.arguments) {
                  if (arg && arg.type !== "SpreadElement") visitExpression(arg);
                }
              }
              return;
            }
            default:
              return;
          }
        }

        return {
          JSXAttribute(node) {
            if (!node.name || node.name.type !== "JSXIdentifier") return;
            if (!TARGET_ATTRIBUTES.has(node.name.name)) return;
            if (!node.value) return;

            // Only dynamic: JSXExpressionContainer. Static string literals are
            // already handled by the stricter rule.
            if (node.value.type === "JSXExpressionContainer") {
              visitExpression(node.value.expression);
            }
          },
        };
      },
    },
  },
};
