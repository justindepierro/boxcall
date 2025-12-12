import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";
import rawTailwindColors from "./eslint-rules/no-raw-tailwind-colors.js";
import arbitrarySpacing from "./eslint-rules/no-arbitrary-spacing.js";
import arbitraryTypography from "./eslint-rules/no-arbitrary-typography.js";

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
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "off",
      "no-console": "off",
      "boxcall-design/no-raw-tailwind-colors": "error",
      "boxcall-design/no-arbitrary-spacing": "error",
      "boxcall-design/no-arbitrary-typography": "error",
    },
  },
];
