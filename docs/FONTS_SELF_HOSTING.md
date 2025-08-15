# Self-hosting fonts (Inter, Bebas Neue)

This repo is prepared to self-host fonts for better LCP/CLS stability and fewer external connections.

## Steps

1. Add WOFF2 files to `public/assets/fonts/`:

- Inter-400.woff2
- Inter-500.woff2
- Inter-600.woff2
- Inter-700.woff2
- BebasNeue-Regular.woff2
- Jetbrains-Mono-400.woff2

2. The `@font-face` rules live in `src/styles/fonts.css` and are imported by `src/index.css`.

3. (Optional) Preload primary fonts in `index.html` for critical pages:

```
<link rel="preload" href="/assets/fonts/Inter-500.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/Inter-600.woff2" as="font" type="font/woff2" crossorigin>
<!-- If your code-heavy pages rely on mono early, preload it too (smaller impact): -->
<link rel="preload" href="/assets/fonts/Jetbrains-Mono-400.woff2" as="font" type="font/woff2" crossorigin>
```

4. Keep Google Fonts as a temporary fallback until the files are deployed. Once self-hosted files are live and verified, remove Google Fonts `<link>` tags and preconnects.

## CSP

Update CSP to allow `font-src 'self'` only (remove Google Fonts) after migration.

## Notes

- Use `font-display: swap` to avoid FOIT.
- If you subset fonts, keep naming consistent or update URLs in `fonts.css`.
