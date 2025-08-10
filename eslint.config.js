import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";
import path from "node:path";
import { noRawButtonRule } from "./scripts/eslint-rules/no-raw-button.js";

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
    },
  },
]);
