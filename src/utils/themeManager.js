import { DEFAULT_THEME, VALID_THEME_KEYS } from '@config/themes/themeConstants.js';

/**
 * Applies the selected theme by:
 * - Adding `theme-*` class to <html>
 * - Injecting the correct CSS token file from /public/tokens/
 * - Logging current font variables
 *
 * @param {string} themeKey - The theme key (e.g., 'classic', 'modern').
 */
export function applyTheme(themeKey = DEFAULT_THEME) {
  const html = document.documentElement;

  // 🧼 Remove any old theme classes
  [...html.classList].forEach((cls) => {
    if (cls.startsWith('theme-')) {
      html.classList.remove(cls);
    }
  });

  // ✅ Validate theme key
  const safeThemeKey = VALID_THEME_KEYS.includes(themeKey) ? themeKey : DEFAULT_THEME;

  // 🎨 Add the new theme class
  html.classList.add(`theme-${safeThemeKey}`);

  // 📄 Load the corresponding CSS tokens
  loadThemeCSS(safeThemeKey);

  // ✍️ Log the active font
  const currentFont = getComputedStyle(html).getPropertyValue('--font-header').trim();
  console.log(`🎨 Theme applied → ${safeThemeKey}, font: ${currentFont}`);
}

/**
 * Loads the CSS file for the given theme.
 *
 * @param {string} themeKey
 */
function loadThemeCSS(themeKey) {
  const linkId = 'theme-tokens';
  const cssPath = `/tokens/theme-${themeKey}.css`;

  let link = document.getElementById(linkId);

  if (link instanceof HTMLLinkElement) {
    // Update existing <link>
    link.href = cssPath;
  } else {
    // Create new <link>
    const newLink = document.createElement('link');
    newLink.id = linkId;
    newLink.rel = 'stylesheet';
    newLink.href = cssPath;
    document.head.appendChild(newLink);
  }
}
