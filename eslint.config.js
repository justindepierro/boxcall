import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";
import rawTailwindColors from "./eslint-rules/no-raw-tailwind-colors.js";
import arbitrarySpacing from "./eslint-rules/no-arbitrary-spacing.js";
import arbitraryTypography from "./eslint-rules/no-arbitrary-typography.js";

// Merge custom design system rules
const boxcallDesignRules = {
  rules: {
    ...rawTailwindColors.rules,
    ...arbitrarySpacing.rules,
    ...arbitraryTypography.rules,
  },
};

export default [
  {
    ignores: [
      "node_modules/",
      "dist/",
      "build/",
      "coverage/",
      ".vscode/",
      "archive/**",
      "scripts/**", // Exclude backup scripts
      "tests/e2e/**", // Exclude Playwright E2E tests
      "*.log",
      "src/components/ui/Icon/preloadShim.d.ts",
      "src/routes/__tests__/loaderAuth.test.tsx",
      "src/utils/errorHandler.tsx",
      "**/*.stories.tsx", // Exclude Storybook files from linting
      "**/*.stories.ts", // Exclude Storybook files from linting
      "vite.config.ts", // Vite config uses different tsconfig
      "vitest.config.ts", // Vitest config uses different tsconfig
      "playwright.config.ts", // Playwright config uses different tsconfig
    ],
  },
  // Base configuration for all JS/TS files
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        React: "readonly", // Add React global for JSX
        NodeJS: "readonly", // Add NodeJS global for TypeScript
        gtag: "readonly", // Add gtag global for Google Analytics
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "boxcall-design": boxcallDesignRules,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "no-unused-vars": "off", // Turn off base rule for TS override
      "no-console": "off", // Allow console in development
      "boxcall-design/no-raw-tailwind-colors": "error",
      "boxcall-design/no-arbitrary-spacing": "error",
      "boxcall-design/no-arbitrary-typography": "error",
    },
  },
  // TypeScript specific rules
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.app.json",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      "boxcall-design": boxcallDesignRules,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-explicit-any": "off", // Allow any for rapid development
      "@typescript-eslint/no-empty-function": "off",
    },
  },
  // Relax design token rules for diagram components (intentionally always-dark)
  {
    files: [
      "**/diagram/**",
      "**/PlayDiagramBuilder.tsx",
      "**/*Demo.tsx", // Demo/test files can use direct colors
      "**/TooltipTest.tsx",
    ],
    rules: {
      "boxcall-design/no-raw-tailwind-colors": "warn", // Warn instead of error
      "boxcall-design/no-arbitrary-spacing": "warn",
    },
  },
];
