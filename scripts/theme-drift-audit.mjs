#!/usr/bin/env node
/**
 * theme-drift-audit.mjs
 * Scans the codebase for raw color utilities / hex codes that bypass semantic theming.
 * Outputs JSON + Markdown report under docs/style-inventory.
 */
import { globby } from 'globby';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';

// Tailwind raw light-mode utility patterns (expand as needed)
const utilityPatterns = [
  /\bbg-white\b/g,
  /\btext-white\b/g,
  /\bbg-black\b/g,
  /\btext-black\b/g,
  /\bbg-gray-(50|100|200)\b/g,
  /\btext-gray-(500|600|700|800|900)\b/g,
  /\bbg-neutral-(50|100)\b/g,
  /\bring-white\b/g,
  /\bborder-gray-(200|300)\b/g,
  /\bborder-white\b/g,
];

// Direct hex codes for palette values we want tokenized
const hexPalette = [
  '#ffffff', '#fff', '#000000', '#000', '#111827', '#1f2937', '#374151', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb', '#f3f4f6', '#f9fafb',
  '#00a86b', '#047857', '#065f46', '#34d399', '#22c55e', '#f59e0b', '#ef4444'
];
const hexRegexes = hexPalette.map(h => new RegExp(h.replace('#','\\#'), 'gi'));

// Files to scan
const patterns = ['src/**/*.{ts,tsx,css}', '!**/generated-*', '!**/dist/**', '!**/node_modules/**'];

const results = [];
let totalMatches = 0;

const files = await globby(patterns);
for (const file of files) {
  const content = readFileSync(file, 'utf8');
  const fileFindings = [];
  // Utility patterns
  for (const re of utilityPatterns) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(content))) {
      fileFindings.push({ type: 'utility', match: m[0], index: m.index });
    }
  }
  // Hex patterns
  for (const re of hexRegexes) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(content))) {
      fileFindings.push({ type: 'hex', match: m[0], index: m.index });
    }
  }
  if (fileFindings.length) {
    totalMatches += fileFindings.length;
    results.push({ file, count: fileFindings.length, findings: fileFindings });
  }
}

// Sort by count desc
results.sort((a,b) => b.count - a.count);

const summary = {
  generatedAt: new Date().toISOString(),
  totalFilesWithFindings: results.length,
  totalMatches,
  topOffenders: results.slice(0, 25).map(r => ({ file: r.file, count: r.count })),
};

// Markdown report
let md = `# Theme Drift Audit\n\nGenerated: ${summary.generatedAt}\n\n`;
md += `Total files with drift: ${summary.totalFilesWithFindings}  \\\nTotal raw color occurrences: ${totalMatches}\n\n`;
md += `## Top Offenders (first 25)\n\n| File | Count |\n| ---- | -----:|\n`;
for (const off of summary.topOffenders) {
  md += `| ${off.file} | ${off.count} |\n`;
}
md += `\n## Recommended Next Steps\n\n`;
md += `1. Replace bg/text utility colors with semantic classes (surface-*, text-* semantic).\n`;
md += `2. Introduce missing semantic tokens if a recurring color has no mapping.\n`;
md += `3. For legacy hex in components, extract to tokens or use CSS vars (var(--semantic-...)).\n`;
md += `4. After cleanup, enable lint rule to forbid these patterns (planned).\n`;

if (!existsSync('docs/style-inventory')) {
  mkdirSync('docs/style-inventory', { recursive: true });
}
writeFileSync('docs/style-inventory/theme-drift-audit.json', JSON.stringify({ summary, results }, null, 2));
writeFileSync('docs/style-inventory/theme-drift-audit.md', md);

console.log('Theme drift audit complete.');
console.log(JSON.stringify(summary, null, 2));
