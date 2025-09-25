#!/usr/bin/env node

/**
 * Design System Migration Script
 *
 * Automatically converts hardcoded Tailwind color classes to semantic design system classes
 * across the entire codebase. This ensures consistency and enables runtime theme switching.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const DESIGN_SYSTEM_MAPPING = {
  // Background Colors
  'bg-white': 'bg-surface-primary',
  'bg-gray-50': 'bg-surface-secondary',
  'bg-gray-100': 'bg-surface-muted',

  // Text Colors
  'text-gray-900': 'text-text-primary',
  'text-gray-700': 'text-text-secondary',
  'text-gray-500': 'text-text-muted',
  'text-gray-400': 'text-text-muted',
  'text-gray-600': 'text-text-secondary',
  'text-white': 'text-text-inverse',

  // Border Colors
  'border-gray-200': 'border-border',
  'border-gray-300': 'border-border-medium',
  'border-gray-100': 'border-border-light',

  // Hover States
  'hover:bg-gray-50': 'hover:bg-surface-subtle-hover',
  'hover:bg-white': 'hover:bg-surface-primary',
  'hover:text-gray-900': 'hover:text-text-primary',

  // Focus States
  'focus:border-gray-300': 'focus:border-border-focus',
  'focus:ring-gray-300': 'focus:ring-focus-ring',

  // Card Styles
  'bg-white rounded-lg border border-gray-200': 'surface-card rounded-lg border border-border',
  'bg-white border border-gray-200': 'surface-card border border-border',
} as const;

function convertToSemanticClasses(className: string): string {
  let result = className;

  Object.entries(DESIGN_SYSTEM_MAPPING).forEach(([hardcoded, semantic]) => {
    // Use word boundaries to avoid partial matches
    const regex = new RegExp(`\\b${hardcoded}\\b`, 'g');
    result = result.replace(regex, semantic);
  });

  return result;
}

function processFile(filePath: string): { changed: boolean; changes: number } {
  try {
    const content = readFileSync(filePath, 'utf-8');
    let newContent = content;
    let changes = 0;

    // Find all className attributes
    const classNameRegex = /className=["']([^"']*)["']/g;
    let match;

    while ((match = classNameRegex.exec(content)) !== null) {
      const originalClassName = match[1];
      const convertedClassName = convertToSemanticClasses(originalClassName);

      if (originalClassName !== convertedClassName) {
        // Replace the entire className attribute
        const oldAttr = `className="${originalClassName}"`;
        const newAttr = `className="${convertedClassName}"`;
        newContent = newContent.replace(oldAttr, newAttr);
        changes++;
      }
    }

    if (changes > 0) {
      writeFileSync(filePath, newContent, 'utf-8');
      console.log(`✅ Updated ${filePath}: ${changes} className(s) converted`);
      return { changed: true, changes };
    }

    return { changed: false, changes: 0 };
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
    return { changed: false, changes: 0 };
  }
}

function walkDirectory(dir: string, extensions: string[] = ['.tsx', '.ts', '.jsx', '.js']): void {
  const files = readdirSync(dir);

  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDirectory(filePath, extensions);
    } else if (stat.isFile() && extensions.includes(extname(file))) {
      processFile(filePath);
    }
  }
}

function main() {
  console.log('🎨 Starting Design System Migration...');
  console.log('Converting hardcoded Tailwind classes to semantic design system classes\n');

  // Process the src directory
  const srcDir = join(process.cwd(), 'src');
  walkDirectory(srcDir);

  console.log('\n✅ Design System Migration Complete!');
  console.log('\n📋 Migration Summary:');
  console.log('- bg-white → bg-surface-primary');
  console.log('- text-gray-900 → text-text-primary');
  console.log('- border-gray-200 → border-border');
  console.log('- And many more semantic mappings...');
  console.log('\n🚀 Your app now uses semantic design system classes that support runtime theming!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { convertToSemanticClasses, DESIGN_SYSTEM_MAPPING };