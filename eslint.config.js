import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";
import path from "node:path";
import { noRawButtonRule } from "./scripts/eslint-rules/no-raw-button.js";
import { noUnsafeWhiteRule } from "./scripts/eslint-rules/no-unsafe-white.js";

export default tseslint.config([
  {
    ignores: [
      "node_modules/",
      "dist/",
      "build/",
      "coverage/",
      ".vscode/",
      "*.log",
      "!shared/",
      "!shared/**/*.ts",
      "!shared/**/*.tsx",
    ],
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Custom rule registrations
      "no-raw-button/no-raw-button": [
        "error",
        {
          allow: [
            "team-dashboard/layout/TeamBulletinHeader.tsx", // logo uploader exemption
            "components/ui/IconButton/IconButton.tsx", // IconButton internal wrapper (uses <Button>)
          ],
        },
      ],
      "contrast/no-unsafe-white": [
        "warn",
        {
          allowBg: [
            "bg-jade-600",
            "bg-jade-700",
            "bg-jade-800",
            "bg-jade-900",
            "bg-navy-600",
            "bg-navy-700",
            "bg-navy-800",
            "bg-navy-900",
            "bg-gray-800",
            "bg-gray-900",
            "bg-black",
            "bg-red-600",
            "bg-red-700",
            "bg-red-800",
            "bg-yellow-700",
            "bg-yellow-800",
            "bg-yellow-900",
            "bg-brand-jade-dark",
            "bg-brand-navy-dark",
          ],
        },
      ],
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true, allowExportNames: ["DevModeProvider"] },
      ],
      // Allow unused variables that start with underscore (intentionally unused parameters)
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "boxcall-style/no-legacy-badge-variants": "warn",
      "boxcall-style/no-raw-surface-gradients": "warn",
    },
  },
  // Plugin injection for custom rule namespace
  {
    plugins: {
      "no-raw-button": {
        rules: {
          "no-raw-button": noRawButtonRule,
        },
      },
      contrast: {
        rules: {
          "no-unsafe-white": noUnsafeWhiteRule,
        },
      },
      "boxcall-style": {
        rules: {
          "no-legacy-badge-variants": {
            meta: {
              type: "problem",
              docs: { description: "Disallow legacy Badge variant names" },
              schema: [],
              fixable: "code",
            },
            create(context) {
              const legacy = new Set([
                "default",
                "urgency",
                "achievement",
                "information",
                "attention",
              ]);
              const mapping = {
                default: "neutral",
                urgency: "danger",
                achievement: "success",
                information: "info",
                attention: "warning",
              };
              return {
                JSXOpeningElement(node) {
                  if (
                    node.name.type === "JSXIdentifier" &&
                    node.name.name === "Badge"
                  ) {
                    const variantAttr = node.attributes.find(
                      (a) =>
                        a.type === "JSXAttribute" && a.name.name === "variant"
                    );
                    if (
                      variantAttr &&
                      variantAttr.value &&
                      ((variantAttr.value.type === "Literal" &&
                        legacy.has(variantAttr.value.value)) ||
                        (variantAttr.value.type === "JSXExpressionContainer" &&
                          variantAttr.value.expression.type === "Literal" &&
                          legacy.has(variantAttr.value.expression.value)))
                    ) {
                      const rawValue =
                        variantAttr.value.type === "Literal"
                          ? variantAttr.value.value
                          : variantAttr.value.expression.value;
                      const replacement = mapping[rawValue];
                      context.report({
                        node: variantAttr,
                        message: `Legacy Badge variant "${rawValue}" — replaced with canonical "${replacement}" (neutral, info, success, warning, danger, accent, premium).`,
                        fix(fixer) {
                          if (variantAttr.value.type === "Literal") {
                            return fixer.replaceText(variantAttr.value, `"${replacement}"`);
                          } else if (
                            variantAttr.value.type === "JSXExpressionContainer" &&
                            variantAttr.value.expression.type === "Literal"
                          ) {
                            return fixer.replaceText(
                              variantAttr.value,
                              `"${replacement}"`
                            );
                          }
                          return null;
                        },
                      });
                    }
                  }
                },
              };
            },
          },
          "no-raw-surface-gradients": {
            meta: {
              type: "suggestion",
              docs: {
                description:
                  "Discourage ad-hoc bg-gradient-* containers; prefer semantic surface + utility",
              },
              schema: [],
            },
            create(context) {
              return {
                JSXAttribute(attr) {
                  if (
                    attr.name &&
                    attr.name.name === "className" &&
                    attr.value &&
                    attr.value.type === "Literal"
                  ) {
                    const v = String(attr.value.value);
                    const filename = context.getFilename();
                    if (
                      /bg-gradient-to-/.test(v) &&
                      !/surface-/.test(v) &&
                      !/(decorative-gradient|premium-badge)/.test(v) &&
                      !/\/Badge\//.test(filename)
                    ) {
                      context.report({
                        node: attr,
                        message:
                          "Raw gradient background without semantic surface-* class. Wrap or replace with surface-card + decorative overlay.",
                      });
                    }
                  }
                },
              };
            },
          },
        },
      },
    },
  },
]);
