// src/utils/themeManager.js

import { DEFAULT_THEME, VALID_THEME_KEYS } from '@config/themes/themeConstants.js';

/**
 * Applies the color and font theme by adding theme-* classes
 * and injecting the proper CSS tokens file from /public/tokens/.
 *
 * @param {string} colorKey - The color theme key (e.g., 'modern', 'tech').
 * @param {string} fontKey - The font theme key (e.g., 'modern', 'tech').
 */
export function applyTheme(colorKey = DEFAULT_THEME, fontKey = DEFAULT_THEME) {
  const html = document.documentElement;

  // Clean previous classes
  html.classList.forEach((cls) => {
    if (cls.startsWith('theme-') || cls.startsWith('font-')) {
      html.classList.remove(cls);
    }
  });

  // Validate keys
  const safeColorKey = VALID_THEME_KEYS.includes(colorKey) ? colorKey : DEFAULT_THEME;
  const safeFontKey = VALID_THEME_KEYS.includes(fontKey) ? fontKey : DEFAULT_THEME;

  // Add new classes
  html.classList.add(`theme-${safeColorKey}`);
  html.classList.add(`font-${safeFontKey}`);

  // Apply CSS token file for color theme
  loadThemeCSS(safeColorKey);

  console.log(`🎨 Theme applied → color: ${safeColorKey}, font: ${safeFontKey}`);
}

/**
 * Injects or updates a <link> element pointing to the current theme CSS.
 * @param {string} themeKey - The validated theme key.
 */
function loadThemeCSS(themeKey) {
  const linkId = 'theme-tokens';
  const cssPath = `/tokens/theme-${themeKey}.css`;

  let link = document.getElementById(linkId);

  if (link instanceof HTMLLinkElement) {
    link.href = cssPath;
  } else {
    const newLink = document.createElement('link');
    newLink.id = linkId;
    newLink.rel = 'stylesheet';
    newLink.href = cssPath;
    document.head.appendChild(newLink);
  }
}
