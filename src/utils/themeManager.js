const DEFAULT_THEME = 'default';

/**
 * Apply the theme to <html> and load matching token CSS.
 * @param {string} themeKey
 */
export function applyTheme(themeKey = DEFAULT_THEME) {
  const html = document.documentElement;

  // Remove all previous theme-* classes
  html.classList.forEach((cls) => {
    if (cls.startsWith('theme-')) html.classList.remove(cls);
  });

  html.classList.add(`theme-${themeKey}`);

  // Inject or update <link> to load theme tokens
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

  console.log(`🎨 Theme "${themeKey}" applied.`);
}
