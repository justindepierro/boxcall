#!/usr/bin/env node

/**
 * CSS Variable Migration Script
 * 
 * Automatically converts hardcoded hex colors in CSS files to CSS variables
 * from the design token system.
 * 
 * Usage: node scripts/migrate-css-colors.js <css-file>
 */

const fs = require('fs');
const path = require('path');

// Color mapping: hex → CSS variable
// Based on design tokens from generated-tokens.css
const colorMap = {
  // Whites and blacks
  '#ffffff': 'var(--color-white)',
  '#fff': 'var(--color-white)',
  '#000000': 'var(--color-black)',
  '#000': 'var(--color-black)',
  
  // Jade (Primary Brand)
  '#10b981': 'var(--color-jade-500)',
  '#34d399': 'var(--color-jade-400)',
  '#059669': 'var(--color-jade-600)',
  '#047857': 'var(--color-jade-700)',
  '#065f46': 'var(--color-jade-800)',
  
  // Navy (Secondary)
  '#1e3a8a': 'var(--color-navy-900)',
  '#1e40af': 'var(--color-navy-800)',
  '#1d4ed8': 'var(--color-navy-700)',
  '#2563eb': 'var(--color-navy-600)',
  '#3b82f6': 'var(--color-navy-500)',
  '#60a5fa': 'var(--color-navy-400)',
  '#93c5fd': 'var(--color-navy-300)',
  
  // Gray/Slate
  '#f8fafc': 'var(--color-gray-50)',
  '#f1f5f9': 'var(--color-gray-100)',
  '#e5e7eb': 'var(--color-gray-200)',
  '#e2e8f0': 'var(--color-gray-200)',
  '#cbd5e1': 'var(--color-gray-300)',
  '#94a3b8': 'var(--color-gray-400)',
  '#64748b': 'var(--color-gray-500)',
  '#475569': 'var(--color-gray-600)',
  '#374151': 'var(--color-gray-700)',
  '#334155': 'var(--color-gray-700)',
  '#1f2937': 'var(--color-gray-800)',
  '#1e293b': 'var(--color-gray-800)',
  '#111827': 'var(--color-gray-900)',
  '#0f172a': 'var(--color-gray-900)',
  
  // Amber (Warning)
  '#f59e0b': 'var(--color-amber-500)',
  '#fbbf24': 'var(--color-amber-400)',
  '#d97706': 'var(--color-amber-600)',
  '#b45309': 'var(--color-amber-700)',
  
  // Red (Error)
  '#ef4444': 'var(--color-red-500)',
  '#f87171': 'var(--color-red-400)',
  '#dc2626': 'var(--color-red-600)',
  '#b91c1c': 'var(--color-red-700)',
  
  // Emerald (Success)
  '#10b981': 'var(--color-emerald-500)',
  '#34d399': 'var(--color-emerald-400)',
  '#059669': 'var(--color-emerald-600)',
  
  // Purple
  '#a855f7': 'var(--color-purple-500)',
  '#c084fc': 'var(--color-purple-400)',
  '#9333ea': 'var(--color-purple-600)',
  
  // Blue
  '#3b82f6': 'var(--color-blue-500)',
  '#60a5fa': 'var(--color-blue-400)',
  '#2563eb': 'var(--color-blue-600)',
};

// Gradient mapping
const gradientMap = {
  'linear-gradient(135deg, #10b981 0%, #34d399 100%)': 
    'linear-gradient(135deg, var(--color-jade-500) 0%, var(--color-jade-400) 100%)',
  
  'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)':
    'linear-gradient(135deg, var(--color-navy-500) 0%, var(--color-navy-400) 100%)',
  
  'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)':
    'linear-gradient(135deg, var(--color-amber-500) 0%, var(--color-amber-400) 100%)',
  
  'linear-gradient(135deg, #ef4444 0%, #f87171 100%)':
    'linear-gradient(135deg, var(--color-red-500) 0%, var(--color-red-400) 100%)',
  
  'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)':
    'linear-gradient(135deg, var(--color-gray-50) 0%, var(--color-gray-100) 100%)',
};

function migrateFile(filePath) {
  console.log(`\n🔍 Analyzing: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;
  
  // First, replace gradients (more specific)
  Object.entries(gradientMap).forEach(([oldGradient, newGradient]) => {
    const regex = new RegExp(oldGradient.replace(/[()]/g, '\\$&'), 'g');
    const matches = content.match(regex);
    if (matches) {
      content = content.replace(regex, newGradient);
      changes += matches.length;
      console.log(`  ✓ Replaced gradient: ${oldGradient.substring(0, 50)}...`);
    }
  });
  
  // Then, replace individual colors
  Object.entries(colorMap).forEach(([hex, cssVar]) => {
    // Case-insensitive hex matching
    const regex = new RegExp(hex, 'gi');
    const matches = content.match(regex);
    if (matches) {
      content = content.replace(regex, cssVar);
      changes += matches.length;
      console.log(`  ✓ Replaced ${hex} → ${cssVar} (${matches.length} times)`);
    }
  });
  
  if (changes > 0) {
    // Create backup
    const backupPath = `${filePath}.backup`;
    fs.copyFileSync(filePath, backupPath);
    console.log(`  💾 Created backup: ${backupPath}`);
    
    // Write migrated content
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ Migrated ${changes} color references`);
    console.log(`  📝 Saved: ${filePath}`);
  } else {
    console.log(`  ℹ️  No hex colors found`);
  }
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node scripts/migrate-css-colors.js <css-file>');
    console.log('\nExample:');
    console.log('  node scripts/migrate-css-colors.js src/styles/team-dashboard.css');
    process.exit(1);
  }
  
  const filePath = args[0];
  migrateFile(filePath);
  
  console.log('\n✨ Migration complete!');
  console.log('⚠️  Remember to:');
  console.log('   1. Review changes carefully');
  console.log('   2. Test visual appearance');
  console.log('   3. Run type check and lint');
  console.log('   4. Delete .backup file when satisfied');
}

main();
