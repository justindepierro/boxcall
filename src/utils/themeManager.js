import { DEFAULT_THEME, VALID_THEME_KEYS } from '@config/themes/themeConstants.js';

/**
 * Applies the color and font theme by:
 * - Adding `theme-*` classes to <html>
 * - Injecting the proper CSS tokens file from /public/tokens/
 * - Logging the active fonts (from CSS variables)
 *
 * @param {string} colorKey - Color theme key (e.g., 'modern', 'tech').
 */
export function applyTheme(colorKey = DEFAULT_THEME, fontKey = DEFAULT_THEME) {
  const html = document.documentElement;

  // Clean classes
  [...html.classList].forEach((cls) => {
    if (cls.startsWith('theme-') || cls.startsWith('font-')) {
      html.classList.remove(cls);
    }
  });

  // Safe keys
  const safeColorKey = VALID_THEME_KEYS.includes(colorKey) ? colorKey : DEFAULT_THEME;
  const safeFontKey = VALID_THEME_KEYS.includes(fontKey) ? fontKey : DEFAULT_THEME;

  // Apply new classes
  html.classList.add(`theme-${safeColorKey}`);
  html.classList.add(`font-${safeFontKey}`);

  // Apply CSS tokens
  loadThemeCSS(safeColorKey);

  // Fetch CSS variable fonts (real-time)
  const rootStyle = getComputedStyle(html);
  const headerFont = rootStyle.getPropertyValue('--font-header').trim();
  const bodyFont = rootStyle.getPropertyValue('--font-body').trim();
  const monoFont = rootStyle.getPropertyValue('--font-mono').trim();

  console.log(
    `🎨 Theme applied → ${safeColorKey}, fonts: header=${headerFont}, body=${bodyFont}, mono=${monoFont}`
  );
}

/**
 * Ensures a <link> element is pointing to the current theme CSS.
 * If it doesn't exist, create one and append it to <head>.
 *
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

/**
 * Logs the currently applied fonts by reading CSS variables.
 */
function logAppliedFonts() {
  const styles = getComputedStyle(document.documentElement);
  const headerFont = styles.getPropertyValue('--font-header').trim();
  const bodyFont = styles.getPropertyValue('--font-body').trim();
  const monoFont = styles.getPropertyValue('--font-mono').trim();

  console.log(`🖋️ Active fonts → header: ${headerFont}, body: ${bodyFont}, mono: ${monoFont}`);
}
