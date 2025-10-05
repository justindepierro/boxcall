export default {
  rules: {
    "no-raw-tailwind-colors": {
      meta: {
        type: "problem",
        docs: {
          description:
            "Disallow Tailwind arbitrary color utilities that bypass the design token pipeline",
          recommended: false,
        },
        schema: [],
        messages: {
          replace:
            'Replace raw Tailwind utility "{{utility}}" with a semantic token class or CSS variable-backed helper.',
        },
      },
      create(context) {
        const UTILITY_PATTERN =
          /\b(?:bg|text|border|stroke|fill|outline|ring|from|via|to)-\[[^\]]*(?:#[0-9A-Fa-f]{3,8}|rgba?\s*\(|hsla?\s*\()[^\]]*]/gi;

        const TARGET_ATTRIBUTES = new Set(["className", "class"]);
        const TARGET_CALLEES = new Set([
          "clsx",
          "classnames",
          "classNames",
          "cn",
        ]);

        function reportMatches(value, node) {
          if (typeof value !== "string" || !value) return;
          const matches = value.matchAll(UTILITY_PATTERN);
          let reported = false;
          for (const match of matches) {
            reported = true;
            context.report({
              node,
              messageId: "replace",
              data: { utility: match[0] },
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
