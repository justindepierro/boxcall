#!/usr/bin/env tsx
/**
 * Script 4: Replace Arbitrary Border Radius Values
 * 
 * Handles rounded-[Npx] → Tailwind rounded classes
 * 
 * SAFE REPLACEMENTS (high confidence):
 * - rounded-[8px] → rounded-lg
 * - rounded-[12px] → rounded-xl
 * - rounded-[16px] → rounded-2xl
 * - rounded-[24px] → rounded-3xl
 * - rounded-[28px] → rounded-[28px] (no exact match, keep custom)
 * - rounded-[36px] → rounded-[36px] (no exact match, keep custom)
 */

import { Project } from 'ts-morph';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Border radius mappings (only exact Tailwind matches)
const BORDER_RADIUS_MAPPINGS: Record<string, string> = {
  // Exact Tailwind values
  '4px': 'rounded-md',
  '6px': 'rounded-lg',
  '8px': 'rounded-lg',
  '12px': 'rounded-xl',
  '16px': 'rounded-2xl',
  '24px': 'rounded-3xl',
  // Note: 28px and 36px have no exact Tailwind equivalent, so we skip them
};

interface Replacement {
  file: string;
  line: number;
  oldValue: string;
  newValue: string;
  context: string;
}

/**
 * Find arbitrary border radius values in file
 */
function findArbitraryBorderRadius(filePath: string): Replacement[] {
  const replacements: Replacement[] = [];
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line: string, index: number) => {
    // Match patterns like: rounded-[4px], rounded-t-[8px], rounded-br-[12px]
    const regex = /rounded(-[tlbr]{1,2})?-\[(\d+)px\]/g;
    let match;

    while ((match = regex.exec(line)) !== null) {
      const prefix = match[1] || ''; // e.g., -t, -br, or empty
      const pxValue = match[2]; // e.g., "8"
      const fullMatch = match[0]; // e.g., "rounded-[8px]"

      // Only replace if we have an exact Tailwind match
      if (BORDER_RADIUS_MAPPINGS[`${pxValue}px`]) {
        const tailwindClass = BORDER_RADIUS_MAPPINGS[`${pxValue}px`];
        // Preserve directional modifiers
        const newValue = prefix ? tailwindClass.replace('rounded', `rounded${prefix}`) : tailwindClass;
        
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

  console.log(`🔍 Scanning ${sourceFiles.length} files for arbitrary border radius...\n`);

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

    const replacements = findArbitraryBorderRadius(filePath);
    if (replacements.length > 0) {
      allReplacements.set(filePath, replacements);
    }
  }

  const totalReplacements = Array.from(allReplacements.values()).reduce(
    (sum, reps) => sum + reps.length,
    0
  );

  console.log(`📊 Found ${totalReplacements} arbitrary border radius values across ${allReplacements.size} files\n\n`);

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
