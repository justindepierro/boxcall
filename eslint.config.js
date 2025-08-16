import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";
import path from "node:path";
import importPlugin from "eslint-plugin-import";
import { noRawButtonRule } from "./scripts/eslint-rules/no-raw-button.js";
import { noUnsafeWhiteRule } from "./scripts/eslint-rules/no-unsafe-white.js";
import { noRadiusViolationsRule } from "./scripts/eslint-rules/no-radius-violations.js";
import { noOutlineVariantInDisallowedContextsRule } from "./scripts/eslint-rules/no-outline-variant-in-disallowed-contexts.js";

// Allow a relaxed lint mode for rapid iteration (set BC_LINT_MODE=relaxed)
// Gate import ordering behind BC_LINT_IMPORTS=true to run as an on-demand fixer
const RELAXED = process.env.BC_LINT_MODE === "relaxed";
const ENFORCE_IMPORT_ORDER = process.env.BC_LINT_IMPORTS === "true";
const STRICT_BOUNDARIES = process.env.BC_LINT_BOUNDARIES_STRICT === "true";
const configArray = [
  {
    ignores: [
      "node_modules/",
      "dist/",
      "build/",
      "coverage/",
      ".vscode/",
      "archive/**",
      ".codemod-backups/",
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
    plugins: {
      import: importPlugin,
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
      "boxcall-style/no-radius-violations": [
        "warn",
        {
          allowScale: ["", "none", "sm", "md", "lg", "full"],
        },
      ],
      "boxcall-style/no-outline-variant-in-disallowed-contexts": [
        "error",
        {
          allowPatterns: [
            // Allow outline variant still in RSVP neutral states (handled in EventDetails) for now
            "EventDetails.tsx$",
          ],
        },
      ],
      "boxcall-style/no-raw-gray-text": "error",
      "boxcall-style/no-raw-heading-utilities": "error",
      "boxcall-style/no-raw-emoji": "error",

      // Module boundaries (initial rollout: warn)
      // Enforce that UI foundation stays pure and lower layers don't depend on UI
      // Uses eslint-plugin-import's no-restricted-paths with zone-based restrictions
      "import/no-restricted-paths": [
        STRICT_BOUNDARIES ? "error" : "warn",
        {
          zones: [
            // design-system must not import from higher-level app/pages/components/routes/etc.
            {
              target: path.resolve(process.cwd(), "src/app"),
              from: path.resolve(process.cwd(), "src/design-system"),
            },
            {
              target: path.resolve(process.cwd(), "src/pages"),
              from: path.resolve(process.cwd(), "src/design-system"),
            },
            {
              target: path.resolve(process.cwd(), "src/components"),
              from: path.resolve(process.cwd(), "src/design-system"),
            },
            {
              target: path.resolve(process.cwd(), "src/features"),
              from: path.resolve(process.cwd(), "src/design-system"),
            },
            {
              target: path.resolve(process.cwd(), "src/routes"),
              from: path.resolve(process.cwd(), "src/design-system"),
            },
            {
              target: path.resolve(process.cwd(), "src/services"),
              from: path.resolve(process.cwd(), "src/design-system"),
            },
            {
              target: path.resolve(process.cwd(), "src/state"),
              from: path.resolve(process.cwd(), "src/design-system"),
            },
            {
              target: path.resolve(process.cwd(), "src/hooks"),
              from: path.resolve(process.cwd(), "src/design-system"),
            },
            {
              target: path.resolve(process.cwd(), "src/domain"),
              from: path.resolve(process.cwd(), "src/design-system"),
            },
            {
              target: path.resolve(process.cwd(), "src/infra"),
              from: path.resolve(process.cwd(), "src/design-system"),
            },
            {
              target: path.resolve(process.cwd(), "src/adapters"),
              from: path.resolve(process.cwd(), "src/design-system"),
            },
            {
              target: path.resolve(process.cwd(), "src/data"),
              from: path.resolve(process.cwd(), "src/design-system"),
            },

            // components should not import from app/pages/routes (keep them presentation-only)
            {
              target: path.resolve(process.cwd(), "src/app"),
              from: path.resolve(process.cwd(), "src/components"),
            },
            {
              target: path.resolve(process.cwd(), "src/pages"),
              from: path.resolve(process.cwd(), "src/components"),
            },
            {
              target: path.resolve(process.cwd(), "src/routes"),
              from: path.resolve(process.cwd(), "src/components"),
            },

            // features (UI-level) should not import from app/pages/routes
            {
              target: path.resolve(process.cwd(), "src/app"),
              from: path.resolve(process.cwd(), "src/features"),
            },
            {
              target: path.resolve(process.cwd(), "src/pages"),
              from: path.resolve(process.cwd(), "src/features"),
            },
            {
              target: path.resolve(process.cwd(), "src/routes"),
              from: path.resolve(process.cwd(), "src/features"),
            },

            // services and state must not import UI (pages/app/components/design-system/routes)
            {
              target: path.resolve(process.cwd(), "src/app"),
              from: path.resolve(process.cwd(), "src/services"),
            },
            {
              target: path.resolve(process.cwd(), "src/pages"),
              from: path.resolve(process.cwd(), "src/services"),
            },
            {
              target: path.resolve(process.cwd(), "src/components"),
              from: path.resolve(process.cwd(), "src/services"),
            },
            {
              target: path.resolve(process.cwd(), "src/design-system"),
              from: path.resolve(process.cwd(), "src/services"),
            },
            {
              target: path.resolve(process.cwd(), "src/features"),
              from: path.resolve(process.cwd(), "src/services"),
            },
            {
              target: path.resolve(process.cwd(), "src/routes"),
              from: path.resolve(process.cwd(), "src/services"),
            },
            {
              target: path.resolve(process.cwd(), "src/app"),
              from: path.resolve(process.cwd(), "src/state"),
            },
            {
              target: path.resolve(process.cwd(), "src/pages"),
              from: path.resolve(process.cwd(), "src/state"),
            },
            {
              target: path.resolve(process.cwd(), "src/components"),
              from: path.resolve(process.cwd(), "src/state"),
            },
            {
              target: path.resolve(process.cwd(), "src/design-system"),
              from: path.resolve(process.cwd(), "src/state"),
            },
            {
              target: path.resolve(process.cwd(), "src/features"),
              from: path.resolve(process.cwd(), "src/state"),
            },
            {
              target: path.resolve(process.cwd(), "src/routes"),
              from: path.resolve(process.cwd(), "src/state"),
            },

            // hooks should not import app/pages/components/routes by default (prefer using hooks in UI, not vice-versa)
            {
              target: path.resolve(process.cwd(), "src/app"),
              from: path.resolve(process.cwd(), "src/hooks"),
            },
            {
              target: path.resolve(process.cwd(), "src/pages"),
              from: path.resolve(process.cwd(), "src/hooks"),
            },
            {
              target: path.resolve(process.cwd(), "src/components"),
              from: path.resolve(process.cwd(), "src/hooks"),
            },
            {
              target: path.resolve(process.cwd(), "src/routes"),
              from: path.resolve(process.cwd(), "src/hooks"),
            },

            // domain should stay pure (no UI, no infra/adapters/services/state/hooks)
            { target: path.resolve(process.cwd(), "src/app"), from: path.resolve(process.cwd(), "src/domain") },
            { target: path.resolve(process.cwd(), "src/pages"), from: path.resolve(process.cwd(), "src/domain") },
            { target: path.resolve(process.cwd(), "src/routes"), from: path.resolve(process.cwd(), "src/domain") },
            { target: path.resolve(process.cwd(), "src/components"), from: path.resolve(process.cwd(), "src/domain") },
            { target: path.resolve(process.cwd(), "src/features"), from: path.resolve(process.cwd(), "src/domain") },
            { target: path.resolve(process.cwd(), "src/design-system"), from: path.resolve(process.cwd(), "src/domain") },
            { target: path.resolve(process.cwd(), "src/hooks"), from: path.resolve(process.cwd(), "src/domain") },
            { target: path.resolve(process.cwd(), "src/services"), from: path.resolve(process.cwd(), "src/domain") },
            { target: path.resolve(process.cwd(), "src/state"), from: path.resolve(process.cwd(), "src/domain") },
            { target: path.resolve(process.cwd(), "src/infra"), from: path.resolve(process.cwd(), "src/domain") },
            { target: path.resolve(process.cwd(), "src/adapters"), from: path.resolve(process.cwd(), "src/domain") },
            { target: path.resolve(process.cwd(), "src/data"), from: path.resolve(process.cwd(), "src/domain") },

            // infra/adapters/data should not import UI
            { target: path.resolve(process.cwd(), "src/app"), from: path.resolve(process.cwd(), "src/infra") },
            { target: path.resolve(process.cwd(), "src/pages"), from: path.resolve(process.cwd(), "src/infra") },
            { target: path.resolve(process.cwd(), "src/routes"), from: path.resolve(process.cwd(), "src/infra") },
            { target: path.resolve(process.cwd(), "src/components"), from: path.resolve(process.cwd(), "src/infra") },
            { target: path.resolve(process.cwd(), "src/features"), from: path.resolve(process.cwd(), "src/infra") },
            { target: path.resolve(process.cwd(), "src/design-system"), from: path.resolve(process.cwd(), "src/infra") },
            { target: path.resolve(process.cwd(), "src/hooks"), from: path.resolve(process.cwd(), "src/infra") },

            { target: path.resolve(process.cwd(), "src/app"), from: path.resolve(process.cwd(), "src/adapters") },
            { target: path.resolve(process.cwd(), "src/pages"), from: path.resolve(process.cwd(), "src/adapters") },
            { target: path.resolve(process.cwd(), "src/routes"), from: path.resolve(process.cwd(), "src/adapters") },
            { target: path.resolve(process.cwd(), "src/components"), from: path.resolve(process.cwd(), "src/adapters") },
            { target: path.resolve(process.cwd(), "src/features"), from: path.resolve(process.cwd(), "src/adapters") },
            { target: path.resolve(process.cwd(), "src/design-system"), from: path.resolve(process.cwd(), "src/adapters") },
            { target: path.resolve(process.cwd(), "src/hooks"), from: path.resolve(process.cwd(), "src/adapters") },

            { target: path.resolve(process.cwd(), "src/app"), from: path.resolve(process.cwd(), "src/data") },
            { target: path.resolve(process.cwd(), "src/pages"), from: path.resolve(process.cwd(), "src/data") },
            { target: path.resolve(process.cwd(), "src/routes"), from: path.resolve(process.cwd(), "src/data") },
            { target: path.resolve(process.cwd(), "src/components"), from: path.resolve(process.cwd(), "src/data") },
            { target: path.resolve(process.cwd(), "src/features"), from: path.resolve(process.cwd(), "src/data") },
            { target: path.resolve(process.cwd(), "src/design-system"), from: path.resolve(process.cwd(), "src/data") },
            { target: path.resolve(process.cwd(), "src/hooks"), from: path.resolve(process.cwd(), "src/data") },
          ],
        },
      ],

      // Import hygiene
      "import/order": ENFORCE_IMPORT_ORDER
        ? [
            "warn",
            {
              groups: [
                "builtin",
                "external",
                "internal",
                "parent",
                "sibling",
                "index",
                "object",
                "type",
              ],
              "newlines-between": "always",
              alphabetize: { order: "asc", caseInsensitive: true },
              pathGroups: [
                { pattern: "@design-system/**", group: "internal", position: "before" },
                { pattern: "@components/**", group: "internal", position: "before" },
                { pattern: "@features/**", group: "internal", position: "before" },
                { pattern: "@app/**", group: "internal" },
                { pattern: "@routes/**", group: "internal" },
                { pattern: "@hooks/**", group: "internal" },
                { pattern: "@state/**", group: "internal" },
                { pattern: "@services/**", group: "internal" },
                { pattern: "@domain/**", group: "internal" },
                { pattern: "@infra/**", group: "internal" },
                { pattern: "@adapters/**", group: "internal" },
                { pattern: "@data/**", group: "internal" },
                { pattern: "@lib/**", group: "internal" },
                { pattern: "@utils/**", group: "internal" },
                { pattern: "@types/**", group: "internal" },
                { pattern: "@styles/**", group: "internal" },
                { pattern: "@telemetry/**", group: "internal" },
              ],
              pathGroupsExcludedImportTypes: ["builtin", "external"],
            },
          ]
        : "off",
      "import/newline-after-import": ENFORCE_IMPORT_ORDER
        ? ["warn", { count: 1 }]
        : "off",
    },
  },
  // Overrides for purity and to reduce noise in tests
  {
    files: ["src/domain/**/*.{ts,tsx}"],
    rules: {
      // Domain layer must be framework-agnostic
      "no-restricted-imports": [
        "warn",
        {
          paths: [
            { name: "react", message: "Domain layer must not depend on React." },
            { name: "react-dom", message: "Domain layer must not depend on React DOM." },
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.test.{ts,tsx}", "**/__tests__/**/*.{ts,tsx}", "**/*.spec.{ts,tsx}"],
    rules: {
      // Allow cross-layer imports within isolated tests
      "import/no-restricted-paths": "off",
      "no-restricted-imports": "off",
    },
  },
  // Plugin injection for custom rule namespace
  {
    plugins: {
      import: importPlugin,
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
                            return fixer.replaceText(
                              variantAttr.value,
                              `"${replacement}"`
                            );
                          } else if (
                            variantAttr.value.type ===
                              "JSXExpressionContainer" &&
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
          "no-raw-tooltip-bg": {
            meta: {
              type: "suggestion",
              docs: {
                description:
                  "Disallow raw bg-gray-900 tooltip/popover containers; use surface-inverse",
              },
              schema: [],
            },
            create(context) {
              return {
                JSXAttribute(attr) {
                  if (
                    attr.name?.name === "className" &&
                    attr.value?.type === "Literal"
                  ) {
                    const v = String(attr.value.value);
                    if (
                      /role=\"tooltip\"/.test(
                        context.getSourceCode().getText()
                      ) &&
                      /bg-gray-900/.test(v) &&
                      !/surface-inverse/.test(v)
                    ) {
                      context.report({
                        node: attr,
                        message:
                          "Tooltip uses raw bg-gray-900; replace with surface-inverse for theming.",
                      });
                    }
                  }
                },
              };
            },
          },
          "no-radius-violations": noRadiusViolationsRule,
          "no-outline-variant-in-disallowed-contexts":
            noOutlineVariantInDisallowedContextsRule,
          "no-raw-gray-text": {
            meta: {
              type: "problem",
              docs: {
                description:
                  "Disallow raw text-gray-500/600/700/800/900 utilities; use semantic text-text-* tokens",
              },
              schema: [],
            },
            create(context) {
              return {
                JSXAttribute(attr) {
                  if (
                    attr.name?.name === "className" &&
                    attr.value?.type === "Literal"
                  ) {
                    const v = String(attr.value.value);
                    const re = /(\s|^)(text-gray-(500|600|700|800|900))(\s|$)/;
                    if (re.test(v)) {
                      context.report({
                        node: attr,
                        message:
                          "Raw gray text utility detected; replace with text-text-primary / text-text-secondary / text-text-muted.",
                      });
                    }
                  }
                },
              };
            },
          },
          "no-raw-heading-utilities": {
            meta: {
              type: "problem",
              docs: {
                description:
                  "Disallow raw text-xl/2xl/3xl/4xl heading utilities outside Typography component; use <Typography variant=...>",
              },
              schema: [],
              messages: {
                rawHeading:
                  "Raw heading utility '{{utility}}' detected. Replace with <Typography variant=\"headline-*\" />.",
              },
            },
            create(context) {
              const headingRe = /(\s|^)(text-(xl|2xl|3xl|4xl))(\s|$)/;
              return {
                JSXAttribute(attr) {
                  if (
                    attr.name?.name === "className" &&
                    attr.value?.type === "Literal"
                  ) {
                    const v = String(attr.value.value);
                    if (headingRe.test(v)) {
                      // Allow inside Typography component via parent name check
                      const parent = attr.parent?.parent;
                      if (
                        parent &&
                        parent.type === "JSXOpeningElement" &&
                        parent.name.type === "JSXIdentifier" &&
                        parent.name.name === "Typography"
                      ) {
                        return;
                      }
                      const match = v.match(/text-(xl|2xl|3xl|4xl)/);
                      context.report({
                        node: attr,
                        messageId: "rawHeading",
                        data: { utility: match ? match[0] : "text-*" },
                      });
                    }
                  }
                },
              };
            },
          },
          "no-raw-emoji": {
            meta: {
              type: "problem",
              docs: {
                description:
                  "Disallow raw emoji characters in interactive / structural UI; use <Icon name=...> instead",
              },
              schema: [],
              messages: {
                rawEmoji:
                  "Raw emoji '{{emoji}}' detected. Replace with appropriate <Icon /> component.",
              },
            },
            create(context) {
              // Basic emoji detection pattern (covers most common pictographs used previously)
              const emojiRe =
                /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/u;
              return {
                JSXText(node) {
                  const value = node.value;
                  if (emojiRe.test(value)) {
                    const match = value.match(emojiRe);
                    context.report({
                      node,
                      messageId: "rawEmoji",
                      data: { emoji: match?.[0] || "emoji" },
                    });
                  }
                },
                Literal(node) {
                  if (
                    typeof node.value === "string" &&
                    emojiRe.test(node.value) &&
                    node.parent?.type === "JSXElement"
                  ) {
                    const match = String(node.value).match(emojiRe);
                    context.report({
                      node,
                      messageId: "rawEmoji",
                      data: { emoji: match?.[0] || "emoji" },
                    });
                  }
                },
              };
            },
          },
        },
      },
    },
  },
];

if (RELAXED) {
  // Override strict rules — convert errors to warnings or disable style gates
  configArray.push({
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "no-raw-button/no-raw-button": "off",
      "boxcall-style/no-raw-gray-text": "off",
      "boxcall-style/no-raw-heading-utilities": "off",
      "boxcall-style/no-raw-emoji": "off",
      "boxcall-style/no-outline-variant-in-disallowed-contexts": "off",
      "boxcall-style/no-legacy-badge-variants": "off",
      "boxcall-style/no-raw-surface-gradients": "off",
      "contrast/no-unsafe-white": "off",
    },
  });
}

export default tseslint.config(configArray);
