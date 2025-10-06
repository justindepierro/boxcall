export default {
  rules: {
    "no-arbitrary-spacing": {
      meta: {
        type: "problem",
        docs: {
          description:
            "Disallow arbitrary spacing values that bypass the design system",
          category: "Design System",
          recommended: true,
        },
        schema: [],
        messages: {
          arbitrarySpacing:
            'Arbitrary spacing "{{utility}}" found. Use Tailwind standard classes or design tokens instead.',
          arbitraryViewport:
            'Arbitrary viewport unit "{{utility}}" found. Use "svh" (small viewport height) for better mobile support.',
          suggestion: "Consider: {{suggestions}}",
        },
      },
      create(context) {
        // Pattern to match arbitrary spacing values
        // Matches: h-[200px], min-h-[44px], max-w-[160px], w-[100px], etc.
        // Excludes: svh units (already standardized), spacing-* tokens, rem values > 40rem (layout containers)
        const ARBITRARY_SPACING_PATTERN =
          /\b(?:h|w|min-h|max-h|min-w|max-w)-\[(?:\d+(?:\.\d+)?(?:px|rem)|(?:\d+)vh)\]/gi;

        const TARGET_ATTRIBUTES = new Set(["className", "class"]);
        const TARGET_CALLEES = new Set([
          "clsx",
          "classnames",
          "classNames",
          "cn",
        ]);

        // Common spacing value suggestions
        const SUGGESTIONS = {
          // Heights in pixels
          "h-[20px]": "h-5 (20px)",
          "h-[24px]": "h-6 (24px)",
          "h-[32px]": "h-8 (32px)",
          "h-[40px]": "h-10 (40px)",
          "h-[44px]": "h-11 (44px)",
          "h-[48px]": "h-12 (48px)",
          "h-[64px]": "h-16 (64px)",
          "h-[96px]": "h-24 (96px)",
          "h-[160px]": "h-40 (160px)",
          "h-[192px]": "h-48 (192px)",
          "h-[224px]": "h-56 (224px)",
          "h-[384px]": "h-96 (384px)",
          "h-[600px]": "h-[37.5rem] (600px - use rem for large values)",

          // Min heights
          "min-h-[20px]": "min-h-5 (20px)",
          "min-h-[24px]": "min-h-6 (24px)",
          "min-h-[32px]": "min-h-8 (32px)",
          "min-h-[36px]": "min-h-9 (36px)",
          "min-h-[40px]": "min-h-10 (40px)",
          "min-h-[44px]": "min-h-11 (44px) - iOS touch target",
          "min-h-[48px]": "min-h-12 (48px)",
          "min-h-[64px]": "min-h-16 (64px)",
          "min-h-[96px]": "min-h-24 (96px)",
          "min-h-[100px]": "min-h-24 (96px)",
          "min-h-[160px]": "min-h-40 (160px)",
          "min-h-[180px]": "min-h-44 (176px)",
          "min-h-[192px]": "min-h-48 (192px)",
          "min-h-[200px]": "min-h-48 (192px)",
          "min-h-[384px]": "min-h-96 (384px)",
          "min-h-[400px]": "min-h-96 (384px)",
          "min-h-[620px]": "min-h-[37.5rem] (600px - use rem for large values)",

          // Max heights
          "max-h-[90vh]": "max-h-[90svh] - use svh for mobile support",
          "max-h-[80vh]": "max-h-[80svh] - use svh for mobile support",
          "max-h-[85vh]": "max-h-[85svh] - use svh for mobile support",
          "max-h-[94vh]": "max-h-[94svh] - use svh for mobile support",
          "max-h-[60vh]": "max-h-[60svh] - use svh for mobile support",
          "max-h-[40vh]": "max-h-[40svh] - use svh for mobile support",

          // Widths
          "w-[20px]": "w-5 (20px)",
          "w-[24px]": "w-6 (24px)",
          "w-[32px]": "w-8 (32px)",
          "w-[36px]": "w-9 (36px)",
          "w-[44px]": "w-11 (44px)",
          "w-[48px]": "w-12 (48px)",
          "w-[64px]": "w-16 (64px)",
          "w-[96px]": "w-24 (96px)",
          "w-[100px]": "w-24 (96px)",

          // Min widths
          "min-w-[18px]": "min-w-5 (20px)",
          "min-w-[20px]": "min-w-5 (20px)",
          "min-w-[24px]": "min-w-6 (24px)",
          "min-w-[32px]": "min-w-8 (32px)",
          "min-w-[36px]": "min-w-9 (36px)",
          "min-w-[44px]": "min-w-11 (44px) - iOS touch target",
          "min-w-[48px]": "min-w-12 (48px)",
          "min-w-[52px]": "min-w-14 (56px)",
          "min-w-[60px]": "min-w-16 (64px)",
          "min-w-[64px]": "min-w-16 (64px)",
          "min-w-[140px]": "min-w-36 (144px)",
          "min-w-[150px]": "min-w-36 (144px)",
          "min-w-[160px]": "min-w-40 (160px)",
          "min-w-[180px]": "min-w-44 (176px)",
          "min-w-[220px]": "min-w-56 (224px)",
          "min-w-[240px]": "min-w-60 (240px)",
          "min-w-[16rem]": "min-w-64 (256px)",

          // Max widths
          "max-w-[120px]": "max-w-30 (120px)",
          "max-w-[160px]": "max-w-40 (160px)",
          "max-w-[220px]": "max-w-56 (224px)",
          "max-w-[10rem]": "max-w-40 (160px)",
          "max-w-[1120px]": "max-w-screen-xl (1280px)",
        };

        function getSuggestion(utility) {
          const normalized = utility.toLowerCase();
          return SUGGESTIONS[normalized] || "Check design system documentation";
        }

        function reportMatches(value, node) {
          if (typeof value !== "string" || !value) return;

          // Check if the value contains spacing-* tokens (allowed)
          if (value.includes("spacing-")) return;

          const matches = value.matchAll(ARBITRARY_SPACING_PATTERN);
          let reported = false;

          for (const match of matches) {
            const utility = match[0];

            // Skip if it's already using svh/vh (viewport height) - these are standardized
            // Note: We use vh instead of svh for better browser support
            if (utility.includes("svh") || utility.includes("vh") || utility.includes("vw")) continue;

            // Skip large rem values (> 40rem) - these are for layout containers
            const remMatch = utility.match(/(\d+(?:\.\d+)?)rem/);
            if (remMatch && parseFloat(remMatch[1]) > 40) continue;

            reported = true;

            // Special message for viewport units
            if (utility.includes("vh")) {
              context.report({
                node,
                messageId: "arbitraryViewport",
                data: {
                  utility,
                  suggestions: getSuggestion(utility),
                },
              });
            } else {
              context.report({
                node,
                messageId: "arbitrarySpacing",
                data: {
                  utility,
                  suggestions: getSuggestion(utility),
                },
              });
            }
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
