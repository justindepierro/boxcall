import js from '@eslint/js';
import globals from 'globals';
import pluginReact from 'eslint-plugin-react';
import pluginPrettier from 'eslint-plugin-prettier';
import { defineConfig } from 'eslint/config';

export default defineConfig({
  files: ['**/*.{js,jsx}'],
  plugins: {
    react: pluginReact,
    prettier: pluginPrettier,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  extends: [
    'plugin:react/recommended',
    'plugin:prettier/recommended', // 🚨 Enables eslint-plugin-prettier + disables conflicting rules
  ],
  languageOptions: {
    globals: globals.browser,
  },
  rules: {
    'prettier/prettier': 'warn', // 👀 You’ll see red/yellow squiggles when code isn’t pretty
  },
});
