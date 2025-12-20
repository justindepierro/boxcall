import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";
import rawTailwindColors from "./eslint-rules/no-raw-tailwind-colors.js";
import rawTailwindColorsDynamic from "./eslint-rules/no-raw-tailwind-colors-dynamic.js";
import arbitrarySpacing from "./eslint-rules/no-arbitrary-spacing.js";
import arbitraryTypography from "./eslint-rules/no-arbitrary-typography.js";
import windowLocationNavigation from "./eslint-rules/no-window-location-navigation.js";
import noImportFromPages from "./eslint-rules/no-import-from-pages.js";
import noFeatureDeepImports from "./eslint-rules/no-feature-deep-imports.js";
import noConsoleOutsideLogger from "./eslint-rules/no-console-outside-logger.js";
import noDirectFetchOutsideServices from "./eslint-rules/no-direct-fetch-outside-services.js";

const boxcallDesignRules = {
  rules: {
    ...rawTailwindColors.rules,
    ...rawTailwindColorsDynamic.rules,
    ...arbitrarySpacing.rules,
    ...arbitraryTypography.rules,
    ...windowLocationNavigation.rules,
    ...noImportFromPages.rules,
    ...noFeatureDeepImports.rules,
    ...noConsoleOutsideLogger.rules,
    ...noDirectFetchOutsideServices.rules,
  },
};

export default [
  {
    ignores: [
      "node_modules/",
      "dist/",
      "coverage/",
      "scripts/**",
      "**/*.test.{ts,tsx}",
      "**/*.spec.{ts,tsx}",
      "**/*.d.ts",
      "*.config.{js,ts}",
    ],
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.app.json",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        React: "readonly",
        NodeJS: "readonly",
        gtag: "readonly",
        process: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "boxcall-design": boxcallDesignRules,
    },
    rules: {
      // Base configurations
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // React
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // TypeScript - practical settings for rapid development
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "off", // Disabled - 546 existing uses, fix incrementally
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-non-null-assertion": "off", // Common in React patterns
      "@typescript-eslint/ban-ts-comment": "off", // Sometimes needed for third-party libs

      // Console - useful during development
      "no-console": "off",

      // Code Quality & Consistency
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": ["error", "always"],
      "prefer-arrow-callback": "error",
      "prefer-template": "warn",
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-else-return": "error",
      "no-lonely-if": "error",
      "prefer-spread": "error",
      "no-useless-return": "error",
      yoda: "error",
      "no-nested-ternary": "warn",

      // Complexity & Readability
      "max-depth": ["warn", 4],
      complexity: ["warn", 20],
      "max-lines-per-function": [
        "warn",
        {
          max: 200,
          skipBlankLines: true,
          skipComments: true,
        },
      ],

      // BoxCall Design System (ERRORS - these are enforced)
      "boxcall-design/no-raw-tailwind-colors": "error",
      // Warn-only: catches raw Tailwind colors in dynamic class expressions
      "boxcall-design/no-raw-tailwind-colors-dynamic": "warn",
      "boxcall-design/no-arbitrary-spacing": "error",
      "boxcall-design/no-arbitrary-typography": "error",
      "boxcall-design/no-window-location-navigation": "error",
      "boxcall-design/no-import-from-pages": "error",
      "boxcall-design/no-feature-deep-imports": "error",
      "boxcall-design/no-console-outside-logger": "error",
      "boxcall-design/no-direct-fetch-outside-services": "error",
    },
  },
];

