#!/usr/bin/env node
import { globby } from 'globby';

// Quick legacy audit: find old guard/route wrappers and obsolete pages
const patterns = [
  'src/**/RoleProtectedRoute.tsx',
  'src/**/ProtectedRoute.tsx',
  'src/**/PublicRoute.tsx',
  'src/**/SuperAdminRoute.tsx',
  'src/**/TeamMemberRoute.tsx',
  'src/pages/**/TeamDashboard.tsx',
  'src/pages/**/PlaygroundPage.tsx',
];

const files = await globby(patterns, {
  gitignore: true,
  absolute: false,
  ignore: ['**/components/ui/Sidebar/**', '**/components/**/Sidebar.tsx'],
});

if (files.length === 0) {
  console.log('Legacy nav audit: no candidates found.');
  process.exit(0);
}

console.log('Legacy nav candidates (review/remove or map to new sidebar):');
for (const f of files) console.log(' -', f);
