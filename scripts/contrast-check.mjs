#!/usr/bin/env node
/**
 * scripts/contrast-check.mjs
 * Quick WCAG contrast audit for Button variants (baseline version).
 *
 * Phase 2 target: integrate directly with design tokens (tokens.ts) via build step.
 * For now we inline the minimal color set to avoid TS runtime dependency.
 */

// Minimal palette (mirrors src/design-system/tokens.ts)
const palette = {
  jade: { 500: '#00A86B', 600: '#047857', 700: '#065F46' },
  navy: { 500: '#64748B', 600: '#475569', 700: '#334155' },
  gray: { 50: '#F9FAFB', 100: '#F3F4F6', 200: '#E5E7EB', 600: '#4B5563', 700: '#374151', 900: '#111827' },
  red: { 600: '#DC2626', 700: '#B91C1C' },
  yellow: { 600: '#D97706', 700: '#B45309' },
  white: '#FFFFFF',
  transparent: 'transparent'
};

// Helper: convert hex to luminance
function hexToRgb(hex) {
  const sanitized = hex.replace('#','');
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r,g,b];
}
function channelToLinear(c){
  const cs = c/255;
  return cs <= 0.03928 ? cs/12.92 : Math.pow((cs+0.055)/1.055, 2.4);
}
function relativeLuminance(hex){
  if(hex === 'transparent') { // treat as white surface (worst-case selection should be explicit below)
    return relativeLuminance(palette.white);
  }
  const [r,g,b] = hexToRgb(hex);
  const R = channelToLinear(r);
  const G = channelToLinear(g);
  const B = channelToLinear(b);
  return 0.2126*R + 0.7152*G + 0.0722*B;
}
function contrastRatio(fg, bg){
  const L1 = relativeLuminance(fg);
  const L2 = relativeLuminance(bg);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Button variant foreground/background assumptions (base state)
// NOTE: For transparent backgrounds we test against multiple typical surfaces.
const surfaces = {
  white: palette.white,
  gray50: palette.gray[50],
  gray100: palette.gray[100]
};

const variants = [
  { name: 'primary', fg: palette.white, bg: palette.jade[600] },
  { name: 'secondary', fg: palette.navy[600], bg: 'transparent', testOn: ['white','gray50','gray100'] },
  { name: 'outline', fg: palette.jade[600], bg: 'transparent', testOn: ['white','gray50','gray100'] },
  { name: 'ghost', fg: palette.gray[600], bg: 'transparent', testOn: ['white','gray50','gray100'] },
  { name: 'link', fg: palette.jade[600], bg: 'transparent', testOn: ['white','gray50','gray100'] },
  { name: 'danger', fg: palette.white, bg: palette.red[600] },
  { name: 'success', fg: palette.white, bg: palette.jade[600] },
  { name: 'warning', fg: palette.gray[900], bg: palette.yellow[600] }
];

const MIN_AA = 4.5; // normal text

let violations = 0;
const rows = [];

variants.forEach(v => {
  if(v.bg !== 'transparent') {
    const ratio = contrastRatio(v.fg, v.bg);
    const pass = ratio >= MIN_AA;
    if(!pass) violations++;
    rows.push({ variant: v.name, surface: 'self-bg', fg: v.fg, bg: v.bg, ratio: ratio.toFixed(2), pass });
  } else {
    v.testOn.forEach(surfaceKey => {
      const surfaceColor = surfaces[surfaceKey];
      const ratio = contrastRatio(v.fg, surfaceColor);
      const pass = ratio >= MIN_AA;
      if(!pass) violations++;
      rows.push({ variant: v.name, surface: surfaceKey, fg: v.fg, bg: surfaceColor, ratio: ratio.toFixed(2), pass });
    });
  }
});

// Output markdown table
function toMarkdownTable(data){
  const header = '| Variant | Surface | FG | BG | Contrast | Pass |';
  const sep = '|---------|---------|----|----|----------|------|';
  const lines = data.map(r => `| ${r.variant} | ${r.surface} | ${r.fg} | ${r.bg} | ${r.ratio} | ${r.pass ? '✅' : '❌'} |`);
  return [header, sep, ...lines].join('\n');
}

console.log('\nButton Contrast Matrix (AA >= 4.5)');
console.log(toMarkdownTable(rows));
console.log(`\nTotal potential violations: ${violations}`);

// Write report file
import { writeFileSync, mkdirSync } from 'node:fs';
const outDir = new URL('../docs/style-inventory/', import.meta.url);
try { mkdirSync(outDir, { recursive: true }); } catch(e) {}
const reportPath = new URL('contrast-matrix.md', outDir);
const md = `# Button Contrast Matrix\n\nGenerated: ${new Date().toISOString()}\n\n${toMarkdownTable(rows)}\n\nViolations (AA, normal text >=4.5): ${violations}\n`;
writeFileSync(reportPath, md);

if(violations > 0){
  console.log('\nNOTE: Some variants risk failing AA on common surfaces.');
}

// Exit code non-zero only once fail-mode enabled (future). For baseline keep 0.
process.exit(0);
