#!/usr/bin/env node
/**
 * Codemod: Rewrite legacy <Badge variant="..."> props to canonical variants.
 *
 * Legacy → Canonical mapping (mirrors runtime normalizeBadgeVariant):
 *  default      → neutral
 *  urgency      → danger
 *  achievement  → success
 *  information  → info
 *  attention    → warning
 *
 * The ESLint rule already autofixes; this script provides a one-shot repo-wide cleanup
 * and can be used in CI or pre-commit to enforce baseline before enabling stricter gates.
 *
 * Usage:
 *   node scripts/codemod-badge-variants.mjs [--dry]
 */
import { globby } from 'globby';
import fs from 'fs';

const DRY_RUN = process.argv.includes('--dry');

const mapping = {
  default: 'neutral',
  urgency: 'danger',
  achievement: 'success',
  information: 'info',
  attention: 'warning',
};

// Matches <Badge ... variant="legacy" ...> and variant={'legacy'} patterns
// We purposely avoid matching dynamic expressions and non-literal cases.
const variantRegexes = Object.entries(mapping).map(([legacy, canonical]) => ({
  legacy,
  canonical,
  // variant="legacy"
  re1: new RegExp(`(\\bvariant\\s*=\\s*")(?:${legacy})(")`, 'g'),
  // variant={'legacy'} or variant={"legacy"}
  re2: new RegExp(`(\\bvariant\\s*=\\s*{\\s*["'])(?:${legacy})(["']\\s*})`, 'g'),
}));

async function run() {
  const files = await globby(['src/**/*.{ts,tsx}'], {
    gitignore: true,
    ignore: ['**/node_modules/**'],
  });
  const changed = [];
  for (const file of files) {
    let original = fs.readFileSync(file, 'utf8');
    if (!/<Badge\b/.test(original)) continue; // fast skip
    let content = original;
    for (const { legacy, canonical, re1, re2 } of variantRegexes) {
      content = content.replace(re1, `$1${canonical}$2`);
      content = content.replace(re2, `$1${canonical}$2`);
    }
    if (content !== original) {
      changed.push(file);
      if (!DRY_RUN) fs.writeFileSync(file, content, 'utf8');
    }
  }
  console.log(`Badge variant codemod complete. Updated files: ${changed.length}`);
  changed.slice(0, 60).forEach(f => console.log('  •', f));
  if (DRY_RUN) console.log('Dry run only; no files written.');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
