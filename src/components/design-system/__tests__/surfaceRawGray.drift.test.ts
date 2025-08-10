import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const RAW_BG_REGEX = /bg-gray-(50|100|200)\b/;
const RAW_BORDER_REGEX = /border-gray-(100|200)\b/;

function collect(dir: string, list: string[] = []): string[] {
  for (const e of fs.readdirSync(dir)) {
    const full = path.join(dir, e);
    if (e.startsWith('.')) continue;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) collect(full, list); else if (/\.(tsx?|jsx?|css)$/.test(e)) list.push(full);
  }
  return list;
}

describe('surface-tokens: raw gray utility drift', () => {
  it('does not use disallowed raw gray bg/border utilities', () => {
    const root = path.join(__dirname, '..', '..', '..');
    const files = collect(root);
    const offenders: { file: string; lines: number[] }[] = [];
    files.forEach(f => {
      const content = fs.readFileSync(f, 'utf8');
      const lines = content.split(/\n/);
      const bad: number[] = [];
      lines.forEach((l, i) => {
        if (RAW_BG_REGEX.test(l) || RAW_BORDER_REGEX.test(l)) bad.push(i + 1);
      });
      if (bad.length) offenders.push({ file: path.relative(root, f), lines: bad });
    });
    expect(offenders).toMatchSnapshot('raw-gray-offenders');
  });
});
