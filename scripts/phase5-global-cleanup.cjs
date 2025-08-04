#!/usr/bin/env node

/**
 * Phase 5: Global Cleanup Script
 * Final step in design system centralization
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Phase 5: Global Cleanup - Final Design System Centralization');

// Step 1: Update design system index to remove legacy Colors import
console.log('\n📝 Step 1: Updating design system index...');

const designSystemIndexPath = path.join(__dirname, '..', 'src/components/design-system/index.ts');
if (fs.existsSync(designSystemIndexPath)) {
  let content = fs.readFileSync(designSystemIndexPath, 'utf8');
  
  // Remove legacy exports and imports
  content = content.replace(/export \{[^}]*\} from "\.\/Colors";?\n?/g, '');
  content = content.replace(/import \{[^}]*\} from "\.\/Colors";?\n?/g, '');
  
  // Remove references to legacy color system
  content = content.replace(/colors,?\s*/g, '');
  content = content.replace(/colorUtils,?\s*/g, '');
  content = content.replace(/colorClasses,?\s*/g, '');
  content = content.replace(/semanticColors,?\s*/g, '');
  
  // Clean up empty lines and trailing commas
  content = content.replace(/,\s*}/g, '}');
  content = content.replace(/\n\n\n+/g, '\n\n');
  
  fs.writeFileSync(designSystemIndexPath, content);
  console.log('  ✅ Updated design system index');
}

// Step 2: Update remaining hardcoded colors in CSS files
console.log('\n📝 Step 2: Updating remaining CSS hardcoded colors...');

const cssReplacements = [
  {
    file: 'src/components/calendar/BoxCallCalendar.css',
    replacements: [
      { search: '#1e3a8a', replace: 'var(--color-brand-navy-dark)' },
      { search: '#f59e0b', replace: 'var(--color-warning)' },
      { search: '#8b5cf6', replace: 'var(--color-purple)' },
      { search: '#6b7280', replace: 'var(--color-secondary)' },
      { search: '#374151', replace: 'var(--color-text-primary)' },
      { search: '#f3f4f6', replace: 'var(--color-bg-muted)' },
      { search: '#e5e7eb', replace: 'var(--color-border)' },
      { search: '#d1d5db', replace: 'var(--color-border-strong)' },
      { search: '#9ca3af', replace: 'var(--color-text-muted)' }
    ]
  },
  {
    file: 'src/styles/globals.css',
    replacements: [
      { search: '#fafafa', replace: 'var(--color-bg-secondary)' },
      { search: '#333333', replace: 'var(--color-text-primary)' }
    ]
  }
];

let totalCSSReplacements = 0;

cssReplacements.forEach(({ file, replacements }) => {
  const filePath = path.join(__dirname, '..', file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️  File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let fileChanges = 0;

  replacements.forEach(({ search, replace }) => {
    const before = content;
    content = content.replaceAll(search, replace);
    if (content !== before) {
      const matches = (before.match(new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
      console.log(`    ✅ ${file}: ${search} → ${replace} (${matches} instances)`);
      fileChanges += matches;
    }
  });

  if (fileChanges > 0) {
    fs.writeFileSync(filePath, content);
    totalCSSReplacements += fileChanges;
  }
});

// Step 3: Update tokens.css with additional CSS variables needed
console.log('\n📝 Step 3: Adding missing CSS custom properties...');

const tokensCSSPath = path.join(__dirname, '..', 'src/styles/tokens.css');
if (fs.existsSync(tokensCSSPath)) {
  let tokensContent = fs.readFileSync(tokensCSSPath, 'utf8');
  
  // Add missing CSS variables for calendar and other components
  const additionalVariables = `
  /* Additional variables for comprehensive coverage */
  --color-brand-navy-dark: #1e3a8a;
  --color-warning: #f59e0b;
  --color-purple: #8b5cf6;
  --color-border-strong: #d1d5db;
  --color-text-primary: #374151;
`;

  if (!tokensContent.includes('--color-brand-navy-dark')) {
    tokensContent = tokensContent.replace(/}$/, additionalVariables + '}');
    fs.writeFileSync(tokensCSSPath, tokensContent);
    console.log('  ✅ Added missing CSS custom properties');
  }
}

console.log(`\n🎉 Phase 5 Step 1 Complete!`);
console.log(`📊 Summary:`);
console.log(`  • Updated design system index to remove legacy imports`);
console.log(`  • Replaced ${totalCSSReplacements} hardcoded CSS colors with variables`);
console.log(`  • Added missing CSS custom properties`);
console.log(`\n⏭️  Next: Remove legacy Colors.tsx file (manual step for safety)`);
