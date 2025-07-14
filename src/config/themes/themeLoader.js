// src/config/themes/themeLoader.js
import { themeMap } from './themeMap.js';
import { applyThemeClass } from './themeManager.js';

/**
 * Utility to remove all previously applied theme classes.
 * Handles multi-class strings like 'bg-gradient-to-b from-gray-900 to-black'
 */
function removeOldThemeClasses() {
  const html = document.documentElement;
  const body = document.body;

  Object.values(themeMap).forEach((theme) => {
    Object.values(theme.fonts).forEach((cls) => {
      html.classList.remove(...cls.split(' '));
    });
    Object.values(theme.colors).forEach((cls) => {
      body.classList.remove(...cls.split(' '));
    });
  });
}

/**
 * Applies a new font theme to <html>
 */
export function applyFontTheme(themeKey = 'classic') {
  const html = document.documentElement;

  html.classList.forEach((cls) => {
    if (/^font-(h|b|m)-/.test(cls)) html.classList.remove(cls);
  });

  const fallback = themeMap['classic'].fonts;
  const { header, body, mono } = themeMap[themeKey]?.fonts || fallback;

  html.classList.add(header, body, mono);

  document.body.setAttribute('data-font-header', header);
  document.body.setAttribute('data-font-body', body);
  document.body.setAttribute('data-font-mono', mono);

  console.log(`🎨 Font theme "${themeKey}" applied:`, header, body, mono);
}

/**
 * Applies a new color theme to <body> and sets the <html> theme class
 */
export function applyColorTheme(themeKey = 'classic') {
  const colors = themeMap[themeKey]?.colors || themeMap.classic.colors;

  removeOldThemeClasses(); // 🧹 clean previous colors
  applyThemeClass(themeKey); // 🎯 sets html class: `theme-modern` etc.

  document.body.classList.add(...colors.bg.split(' '));
  document.body.classList.add(...colors.text.split(' '));
  document.body.classList.add(...colors.accent.split(' '));
  document.body.classList.add(...colors.border.split(' '));
  document.body.classList.add(...colors.sidebarBg.split(' '));
  document.body.classList.add(...colors.header.split(' '));

  console.log(`🎨 Color theme applied: ${themeKey}`);
}
