// src/config/themes/themeLoader.js
import { themeMap } from './themeMap.js';

/**
 * Utility to remove all previously applied theme classes.
 * Handles multi-class strings like 'bg-gradient-to-b from-gray-900 to-black'
 */
function removeOldThemeClasses() {
  const html = document.documentElement;
  const body = document.body;

  Object.values(themeMap).forEach((theme) => {
    // 🎯 Remove font classes from <html>
    Object.values(theme.fonts).forEach((cls) => {
      html.classList.remove(...cls.split(' ')); // ✅ Handles multi-class strings
    });

    // 🎯 Remove color classes from <body>
    Object.values(theme.colors).forEach((cls) => {
      body.classList.remove(...cls.split(' ')); // ✅ Handles multi-class strings
    });
  });
}
/**
 * Applies a new font theme to <html>
 */
export function applyFontTheme(themeKey = 'classic') {
  const html = document.documentElement;

  // Remove all old font classes
  html.classList.forEach((cls) => {
    if (/^font-(h|b|m)-/.test(cls)) html.classList.remove(cls);
  });

  // Add new ones from themeMap
  const fallback = themeMap['classic'].fonts;
  const { header, body, mono } = themeMap[themeKey]?.fonts || fallback;

  html.classList.add(header, body, mono);

  // Also assign to HTML attribute hooks if needed
  document.body.setAttribute('data-font-header', header);
  document.body.setAttribute('data-font-body', body);
  document.body.setAttribute('data-font-mono', mono);

  console.log(`🎨 Font theme "${themeKey}" applied:`, header, body, mono);
}

/**
 * Applies a new color theme to <body>
 */
export function applyColorTheme(themeKey = 'classic') {
  const colors = themeMap[themeKey]?.colors || themeMap.classic.colors;

  removeOldThemeClasses(); // 🔄 Clean slate first

  // ✅ Use .split(' ') to safely handle multi-class values
  document.body.classList.add(...colors.bg.split(' '));
  document.body.classList.add(...colors.text.split(' '));
  document.body.classList.add(...colors.accent.split(' '));
  document.body.classList.add(...colors.border.split(' '));
  document.body.classList.add(...colors.sidebarBg.split(' '));
  document.body.classList.add(...colors.header.split(' '));

  console.log(`🎨 Color theme applied: ${themeKey}`);
}
