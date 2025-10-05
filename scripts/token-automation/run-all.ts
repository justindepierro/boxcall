#!/usr/bin/env tsx
/**
 * Master Script Runner
 * 
 * Runs all token automation scripts in sequence
 * Shows progress and summary statistics
 */

import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const scripts = [
  {
    name: 'Exact Hex Matches',
    file: '01-replace-exact-hex-matches.ts',
    description: 'Replaces hex colors with exact token equivalents',
  },
  {
    name: 'Arbitrary Font Sizes',
    file: '02-replace-arbitrary-font-sizes.ts',
    description: 'Replaces text-[Npx] with Tailwind size classes',
  },
  {
    name: 'Color Parameter Defaults',
    file: '03-replace-color-parameter-defaults.ts',
    description: 'Replaces default parameter color values',
  },
  {
    name: 'Arbitrary Border Radius',
    file: '04-replace-arbitrary-border-radius.ts',
    description: 'Replaces rounded-[Npx] with Tailwind rounded classes',
  },
  {
    name: 'Arbitrary Spacing',
    file: '05-replace-arbitrary-spacing.ts',
    description: 'Replaces p/m/gap-[Npx] with Tailwind spacing classes',
  },
];

async function runScript(scriptFile: string, apply: boolean = false) {
  const scriptPath = resolve(__dirname, scriptFile);
  const args = apply ? '--apply' : '';
  
  try {
    const output = execSync(`tsx ${scriptPath} ${args}`, {
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    return output;
  } catch (error: any) {
    return error.stdout || error.message;
  }
}

async function main() {
  const apply = process.argv.includes('--apply');
  const mode = apply ? '🚀 APPLY MODE' : '🔍 DRY RUN MODE';

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  TOKEN AUTOMATION SUITE`);
  console.log(`  ${mode}`);
  console.log(`${'='.repeat(60)}\n`);

  const results: Array<{ name: string; output: string; violations: number }> = [];

  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    console.log(`\n📋 [${i + 1}/${scripts.length}] ${script.name}`);
    console.log(`   ${script.description}`);
    console.log(`${'─'.repeat(60)}`);

    const output = await runScript(script.file, apply);
    console.log(output);

    // Parse violations count from output
    const match = output.match(/Found (\d+)/);
    const violations = match ? parseInt(match[1]) : 0;

    results.push({
      name: script.name,
      output,
      violations,
    });
  }

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  SUMMARY`);
  console.log(`${'='.repeat(60)}\n`);

  const totalViolations = results.reduce((sum, r) => sum + r.violations, 0);

  results.forEach((result, i) => {
    console.log(`${i + 1}. ${result.name}: ${result.violations} violations`);
  });

  console.log(`\n📊 Total Violations Found: ${totalViolations}`);

  if (!apply) {
    console.log(`\n💡 This was a DRY RUN. No files were modified.`);
    console.log(`   To apply all changes, run:`);
    console.log(`   tsx scripts/token-automation/run-all.ts --apply\n`);
  } else {
    console.log(`\n✅ All changes applied!`);
    console.log(`   Run 'npm run type-check' to verify\n`);
  }
}

main().catch(console.error);
