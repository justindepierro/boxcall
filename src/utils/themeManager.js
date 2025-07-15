// src/utils/themeManager.js

const DEFAULT_THEME = 'default';

/**
 * Apply the theme to <html> and load matching token CSS.
 * Currently hardcoded to 'default' for Phase 1.
 */
export function applyTheme(themeKey = DEFAULT_THEME) {
  const html = document.documentElement;

  // 🧼 Clear all previous theme-* classes
  html.classList.forEach((cls) => {
    if (cls.startsWith('theme-')) {
      html.classList.remove(cls);
    }
  });

  // 🏷️ Apply the new theme class to <html>
  html.classList.add(`theme-${themeKey}`);

  // 🎨 Inject or update <link> to load theme tokens
  const linkId = 'theme-tokens';
  const cssPath = `/tokens/theme-${themeKey}.css`;
  let link = document.getElementById(linkId);

  if (link) {
    link.href = cssPath;
  } else {
    link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = cssPath;
    document.head.appendChild(link);
  }

  console.log(`🎨 Theme "${themeKey}" applied.`);
}
