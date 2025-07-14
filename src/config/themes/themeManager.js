// src/config/themes/themeManager.js

/**
 * Dynamically applies the given theme by toggling a theme-[key] class on <html>
 * This enables the correct CSS variable file to take effect.
 */
export function applyThemeClass(themeKey = 'classic') {
  const html = document.documentElement;

  // Remove any existing theme-[x] classes
  html.classList.forEach((cls) => {
    if (cls.startsWith('theme-')) html.classList.remove(cls);
  });

  // Add the selected theme class
  html.classList.add(`theme-${themeKey}`);
  console.log(`🎨 HTML theme class applied: theme-${themeKey}`);
}
