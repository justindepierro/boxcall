import js from '@eslint/js';
import globals from 'globals';
import pluginPrettier from 'eslint-plugin-prettier';
import pluginImport from 'eslint-plugin-import';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '**/*.config.js', // Ignore build/config files
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      prettier: pluginPrettier,
      import: pluginImport,
    },
    rules: {
      ...js.configs.recommended.rules,
      // Prettier Integration
      'prettier/prettier': ['warn'],
      // Best Practices
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-empty': 'warn',
      'no-extra-boolean-cast': 'off',
      // Import Rules
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
        },
      ],
      'import/no-duplicates': 'warn',
    },
  },
]);
