const fs = require('fs');

// Read the Icon.tsx file
const iconFile = fs.readFileSync('src/components/ui/Icon/Icon.tsx', 'utf8');

// Extract the supported icons from the Set
const supportedMatch = iconFile.match(/const supported = new Set<ModularIconName>\(\[([\s\S]*?)\]\);/);
if (supportedMatch) {
  const supportedIcons = supportedMatch[1]
    .split(',')
    .map(s => s.trim().replace(/['"]/g, ''))
    .filter(s => s.length > 0);

  console.log('Supported icons in Icon.tsx:', supportedIcons.length);
  console.log('First 10:', supportedIcons.slice(0, 10).join(', '));

  // Read ModularIcon.tsx
  const modularFile = fs.readFileSync('src/components/ui/Icon/ModularIcon.tsx', 'utf8');

  // Extract ModularIconName type
  const typeMatch = modularFile.match(/export type ModularIconName =([\s\S]*?);/);
  if (typeMatch) {
    const modularIcons = typeMatch[1]
      .split('|')
      .map(s => s.trim().replace(/['"]/g, ''))
      .filter(s => s.length > 0);

    console.log('ModularIconName icons:', modularIcons.length);
    console.log('First 10:', modularIcons.slice(0, 10).join(', '));

    // Find missing icons
    const missing = modularIcons.filter(icon => !supportedIcons.includes(icon));
    console.log('Missing icons:', missing.length);
    if (missing.length > 0) {
      console.log('Missing:', missing.slice(0, 20).join(', '));
      if (missing.length > 20) {
        console.log('... and', missing.length - 20, 'more');
      }
    }

    // Find extra icons in supported that aren't in ModularIconName
    const extra = supportedIcons.filter(icon => !modularIcons.includes(icon));
    console.log('Extra icons in supported (not in ModularIconName):', extra.length);
    if (extra.length > 0) {
      console.log('Extra:', extra.join(', '));
    }
  }
}