// src/config/themes/themeLoader.js
import { themeMap } from './themeMap.js';

function removeOldClasses(classMap, target = document.body) {
  Object.values(classMap).forEach((group) => {
    Object.values(group).forEach((cls) => {
      target.classList.remove(cls);
    });
  });
}

export function applyFontTheme(themeKey = 'classic') {
  const html = document.documentElement;

  // Step 1: Remove any existing font-h-*, font-b-*, font-m-* classes
  html.classList.forEach((cls) => {
    if (/^font-(h|b|m)-/.test(cls)) {
      html.classList.remove(cls);
    }
  });

  // Step 2: Add the new font classes
  const fallback = themeMap['classic'].fonts;
  const { header, body, mono } = themeMap[themeKey]?.fonts || fallback;

  html.classList.add(header, body, mono);

  console.log(`🎨 Font theme "${themeKey}" applied:`, header, body, mono);
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
