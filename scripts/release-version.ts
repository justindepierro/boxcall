#!/usr/bin/env tsx
/**
 * release-version.ts
 * Semantic version bumper + CHANGELOG Unreleased finalization.
 * Usage: npm run release:version -- [patch|minor|major]
 */
import fs from 'fs';
import path from 'path';

type Bump = 'patch' | 'minor' | 'major';
const bump: Bump = (process.argv[2] as Bump) || 'patch';

const pkgPath = path.resolve('package.json');
const changelogPath = path.resolve('CHANGELOG.md');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as { version: string };
const [maj, min, pat] = pkg.version.split('.').map(Number);
let next: string;
switch (bump) {
  case 'major': next = `${maj + 1}.0.0`; break;
  case 'minor': next = `${maj}.${min + 1}.0`; break;
  default: next = `${maj}.${min}.${pat + 1}`; break;
}
pkg.version = next;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

if (!fs.existsSync(changelogPath)) {
  fs.writeFileSync(changelogPath, `# Changelog\n\n## [${next}] - ${new Date().toISOString().split('T')[0]}\n\n`);
} else {
  const original = fs.readFileSync(changelogPath, 'utf8');
  const date = new Date().toISOString().split('T')[0];
  const updated = original.replace(/## \[Unreleased]\n([\s\S]*?)(?=\n## \[|$)/, (_m, body) => `## [Unreleased]\n\n## [${next}] - ${date}\n${body.trim()}\n\n`);
  fs.writeFileSync(changelogPath, updated);
}
console.log(`Version bumped to ${next}`);
