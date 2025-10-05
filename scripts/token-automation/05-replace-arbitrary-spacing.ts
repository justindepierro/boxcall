#!/usr/bin/env tsx
/**
 * Script 5: Replace Arbitrary Spacing Values
 * 
 * Handles p-[Npx], m-[Npx], gap-[Npx] → Tailwind spacing classes
 * 
 * SAFE REPLACEMENTS (high confidence):
 * - [4px] → -1 (0.25rem)
 * - [8px] → -2 (0.5rem)
 * - [12px] → -3 (0.75rem)
 * - [16px] → -4 (1rem)
 * - [20px] → -5 (1.25rem)
 * - [24px] → -6 (1.5rem)
 * - [32px] → -8 (2rem)
 * - [48px] → -12 (3rem)
 */

import { Project } from 'ts-morph';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Spacing mappings (only exact Tailwind matches)
const SPACING_MAPPINGS: Record<string, string> = {
  '4px': '1',
  '8px': '2',
  '12px': '3',
  '16px': '4',
  '20px': '5',
  '24px': '6',
  '28px': '7',
  '32px': '8',
  '48px': '12',
  '64px': '16',
};

interface Replacement {
  file: string;
  line: number;
  oldValue: string;
  newValue: string;
  context: string;
}

/**
 * Find arbitrary spacing values in file
 */
function findArbitrarySpacing(filePath: string): Replacement[] {
  const replacements: Replacement[] = [];
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line: string, index: number) => {
    // Match patterns like: p-[12px], mt-[8px], gap-[16px], space-x-[4px]
    const regex = /(p|m|gap|space-[xy])(-[tlrbxy])?-\[(\d+)px\]/g;
    let match;

    while ((match = regex.exec(line)) !== null) {
      const property = match[1]; // p, m, gap, space-x, space-y
      const direction = match[2] || ''; // -t, -l, -x, etc., or empty
      const pxValue = match[3]; // e.g., "12"
      const fullMatch = match[0]; // e.g., "p-[12px]"

      // Only replace if we have an exact Tailwind match
      if (SPACING_MAPPINGS[`${pxValue}px`]) {
        const spacingValue = SPACING_MAPPINGS[`${pxValue}px`];
        const newValue = `${property}${direction}-${spacingValue}`;
        
        replacements.push({
          file: filePath,
          line: index + 1,
          oldValue: fullMatch,
          newValue,
          context: line.trim().substring(0, 100),
        });
      }
    }
  });

  return replacements;
}

/**
 * Apply replacements to file
 */
function applyReplacements(filePath: string, replacements: Replacement[]): void {
  let content = readFileSync(filePath, 'utf-8');

  // Apply replacements
  replacements.forEach((r) => {
    content = content.replace(new RegExp(r.oldValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), r.newValue);
  });

  writeFileSync(filePath, content, 'utf-8');
}

async function main() {
  const applyChanges = process.argv.includes('--apply');
  const projectRoot = resolve(__dirname, '../..');

  const project = new Project({
    tsConfigFilePath: resolve(projectRoot, 'tsconfig.json'),
  });

  project.addSourceFilesAtPaths('src/**/*.{ts,tsx}');
  const sourceFiles = project.getSourceFiles();

  console.log(`🔍 Scanning ${sourceFiles.length} files for arbitrary spacing...\n`);

  const allReplacements: Map<string, Replacement[]> = new Map();

  for (const sourceFile of sourceFiles) {
    const filePath = sourceFile.getFilePath();
    
    // Skip token files and automation scripts
    if (
      filePath.includes('/design-system/tokens.ts') ||
      filePath.includes('token-automation')
    ) {
      continue;
    }

    const replacements = findArbitrarySpacing(filePath);
    if (replacements.length > 0) {
      allReplacements.set(filePath, replacements);
    }
  }

  const totalReplacements = Array.from(allReplacements.values()).reduce(
    (sum, reps) => sum + reps.length,
    0
  );

  console.log(`📊 Found ${totalReplacements} arbitrary spacing values across ${allReplacements.size} files\n\n`);

  // Display findings
  for (const [filePath, replacements] of allReplacements.entries()) {
    const relativePath = filePath.replace(projectRoot, '');
    console.log(`📁 ${relativePath} (${replacements.length} matches)`);
    replacements.forEach((r) => {
      console.log(`   Line ${r.line}: ${r.oldValue} → ${r.newValue}`);
      console.log(`   Context: ${r.context}`);
    });
    console.log('');
  }

  console.log('\n💡 DRY RUN COMPLETE\n');
  console.log('To apply these changes, run with --apply flag\n');

  if (applyChanges) {
    console.log('\n🚀 APPLYING CHANGES...\n');
    
    for (const [filePath, replacements] of allReplacements.entries()) {
      applyReplacements(filePath, replacements);
      const relativePath = filePath.replace(projectRoot, '');
      console.log(`   ✅ ${relativePath}`);
    }

    console.log(`\n✨ Applied ${totalReplacements} replacements\n`);
    console.log('⚠️  Run \'npm run type-check\' to verify changes');
  }
}

main().catch(console.error);
