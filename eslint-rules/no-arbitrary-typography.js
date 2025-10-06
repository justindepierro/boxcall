export default {
  rules: {
    "no-arbitrary-typography": {
      meta: {
        type: "problem",
        docs: {
          description:
            "Disallow arbitrary typography values that bypass the design system",
          category: "Design System",
          recommended: true,
        },
        schema: [],
        messages: {
          arbitraryFontSize:
            'Arbitrary font size "{{utility}}" found. Use Tailwind standard classes instead.',
          suggestion: "Consider: {{suggestions}}",
        },
      },
      create(context) {
        // Pattern to match arbitrary font sizes
        // Matches: text-[10px], text-[12px], text-[1.5rem], etc.
        const ARBITRARY_FONT_SIZE_PATTERN =
          /\btext-\[(?:\d+(?:\.\d+)?(?:px|rem|em))\]/gi;

        // Whitelist of allowed arbitrary font sizes
        // These are intentional design decisions documented in:
        // docs/TYPOGRAPHY_STANDARDIZATION_STRATEGY.md
        const ALLOWED_ARBITRARY_SIZES = new Set([
          "text-[11px]", // Intentional: between xs (12px) and 2xs (10px) for compact labels/badges
          "text-[13px]", // Intentional: between xs (12px) and sm (14px) for compact mode
          "text-[2rem]", // Typography variant system (headline-xl)
          "text-[3.25rem]", // Typography variant system (display-xl)
          "text-[2.75rem]", // Typography variant system (display-lg)
          "text-[2.25rem]", // Typography variant system (display-md)
          "text-[1.625rem]", // Typography variant system (headline-lg)
          "text-[1.375rem]", // Typography variant system (headline-md)
          "text-[1.125rem]", // Typography variant system (headline-sm)
          "text-[0.95rem]", // Typography variant system (body-lg)
          "text-[0.9rem]", // Typography variant system (body-md)
          "text-[0.82rem]", // Typography variant system (body-sm)
          "text-[0.72rem]", // Typography variant system (body-xs)
          "text-[0.85rem]", // Typography variant system (code-md, button)
          "text-[0.78rem]", // Typography variant system (code-sm)
          "text-[0.7rem]", // Typography variant system (label-lg, caption)
          "text-[0.62rem]", // Typography variant system (label-md)
        ]);

        const TARGET_ATTRIBUTES = new Set(["className", "class"]);
        const TARGET_CALLEES = new Set([
          "clsx",
          "classnames",
          "classNames",
          "cn",
        ]);

        // Common font size suggestions
        const SUGGESTIONS = {
          "text-[10px]": "text-2xs (10px) - for ultra-compact UI",
          "text-[12px]": "text-xs (12px)",
          "text-[14px]": "text-sm (14px)",
          "text-[16px]": "text-base (16px)",
          "text-[18px]": "text-lg (18px)",
          "text-[20px]": "text-xl (20px)",
          "text-[24px]": "text-2xl (24px)",
          "text-[30px]": "text-3xl (30px)",
          "text-[36px]": "text-4xl (36px)",
          "text-[0.625rem]": "text-2xs (10px)",
          "text-[0.75rem]": "text-xs (12px)",
          "text-[0.875rem]": "text-sm (14px)",
          "text-[1rem]": "text-base (16px)",
          "text-[1.125rem]": "text-lg (18px)",
          "text-[1.25rem]": "text-xl (20px)",
          "text-[1.5rem]": "text-2xl (24px)",
          "text-[1.875rem]": "text-3xl (30px)",
          "text-[2.25rem]": "text-4xl (36px)",
        };

        function getSuggestion(utility) {
          const normalized = utility.toLowerCase();
          return (
            SUGGESTIONS[normalized] || "Use a standard Tailwind text size class"
          );
        }

        function reportMatches(value, node) {
          if (typeof value !== "string" || !value) return;

          const matches = value.matchAll(ARBITRARY_FONT_SIZE_PATTERN);
          let reported = false;

          for (const match of matches) {
            const utility = match[0];
            const normalized = utility.toLowerCase();

            // Skip if it's in the whitelist (intentional design decision)
            if (ALLOWED_ARBITRARY_SIZES.has(normalized)) continue;

            reported = true;
            context.report({
              node,
              messageId: "arbitraryFontSize",
              data: {
                utility,
                suggestions: getSuggestion(utility),
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
            default:
              return [];
          }
        }

        return {
          JSXAttribute(node) {
            if (
              node.name &&
              node.name.name &&
              TARGET_ATTRIBUTES.has(node.name.name)
            ) {
              if (node.value && node.value.type === "Literal") {
                reportMatches(node.value.value, node);
              } else if (
                node.value &&
                node.value.type === "JSXExpressionContainer" &&
                node.value.expression
              ) {
                const strings = collectStrings(node.value.expression);
                strings.forEach((str) => reportMatches(str, node));
              }
            }
          },

          Property(node) {
            if (
              node.key &&
              node.key.type === "Identifier" &&
              TARGET_ATTRIBUTES.has(node.key.name)
            ) {
              const strings = collectStrings(node.value);
              strings.forEach((str) => reportMatches(str, node));
            }
          },

          CallExpression(node) {
            if (
              node.callee.type === "Identifier" &&
              TARGET_CALLEES.has(node.callee.name)
            ) {
              node.arguments.forEach((arg) => {
                const strings = collectStrings(arg);
                strings.forEach((str) => reportMatches(str, node));
              });
            }
          },
        };
      },
    },
  },
};
