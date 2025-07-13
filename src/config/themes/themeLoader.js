// src/config/themes/themeLoader.js
import { themeMap } from './themeMap.js';
import { fontClassMap } from './fontClassMap.js';

function removeOldClasses(classMap, target = document.body) {
  Object.values(classMap).forEach((obj) => {
    Object.values(obj).forEach((cls) => target.classList.remove(cls));
  });
}

export function applyFontTheme(themeKey = 'classic') {
  const fonts = fontClassMap[themeKey] || fontClassMap.classic;

  removeOldClasses(fontClassMap);

  document.body.classList.add(fonts.header, fonts.body, fonts.mono);
  console.log(`🖋️ Font theme applied: ${themeKey}`);
}

export function applyColorTheme(themeKey = 'classic') {
  const colors = themeMap[themeKey]?.colors || themeMap.classic.colors;

  removeOldClasses(Object.fromEntries(Object.entries(themeMap).map(([k, v]) => [k, v.colors])));

  document.body.classList.add(
    colors.bg,
    colors.text,
    colors.accent,
    colors.border,
    colors.sidebarBg,
    colors.header
  );

  console.log(`🎨 Color theme applied: ${themeKey}`);
}
