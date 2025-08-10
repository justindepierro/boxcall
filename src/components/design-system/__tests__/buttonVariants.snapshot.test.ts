import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

function getAllSourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (entry.startsWith('.') || entry.includes('generated')) continue;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      getAllSourceFiles(full, acc);
  } else if (/\.(tsx?|jsx?)$/.test(entry)) {
      acc.push(full);
    }
  }
  return acc;
}

describe('design-system: button variant distribution', () => {
  it('has zero outline variant usages across source', () => {
    const srcRoot = path.join(__dirname, '..', '..', '..');
    const files = getAllSourceFiles(srcRoot);
    const offenders: string[] = [];
    files.forEach(f => {
      if (f.includes('__tests__')) return; // ignore test files
      const content = fs.readFileSync(f, 'utf8');
      if (content.includes('variant="outline"')) offenders.push(path.relative(srcRoot, f));
    });
    expect(offenders).toEqual([]);
  });
});
