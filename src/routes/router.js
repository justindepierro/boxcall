// src/routes/router.js
import { showSpinner, hideSpinner } from '@utils/spinner.js';
import { renderPage } from '@render/renderPage.js';
import { fadeIn, fadeOut } from '@utils/pageTransitions.js';
import { devLog, devError } from '@utils/devLogger.js';

/**
 * Dynamically imported page modules via Vite's import.meta.glob.
 * Every page should export either `default` or `render`.
 */
const pageModules = /** @type {Record<string, () => Promise<any>>} */ (
  import.meta.glob('@pages/**/*.js')
);

const DEFAULT_ROUTE = 'dashboard';

/**
 * Programmatically navigate to a route.
 * @param {string} page - e.g., 'dashboard', 'team/settings'
 */
export function navigateTo(page = '') {
  const cleanPage = page.replace(/^\/+/g, '');
  window.location.hash = `#/${cleanPage}`;
  devLog(`🚦 Navigating to: ${cleanPage}`);
}

/**
 * Initialize the router. (Does NOT handle auth!)
 */
export function initRouter() {
  validatePageModules();
  window.addEventListener('hashchange', handleRouting);
  handleRouting(); // Initial route load
}

/**
 * Main routing logic (purely loads pages).
 */
export async function handleRouting() {
  const hash = window.location.hash.replace(/^#\/?/, '') || DEFAULT_ROUTE;
  const [base, sub] = hash.split('/');

  const container = document.getElementById('page-content');
  if (!(container instanceof HTMLElement)) {
    devError('❌ handleRouting(): #page-content not found.');
    return;
  }

  showSpinner();

  try {
    // Fade out old content
    await fadeOut(container);

    // Find and load page module
    const modulePath = findPageModulePath(base, sub);
    if (!modulePath) throw new Error(`Route not found for "${hash}"`);

    devLog(`📦 Loading page module: ${modulePath}`);
    const mod = await pageModules[modulePath]();

    const PageComponent = mod.default || mod.render;
    if (typeof PageComponent !== 'function') {
      throw new Error(`Invalid component for route "${hash}". Must export a function.`);
    }

    // Render the page
    renderPage(PageComponent, { title: base });

    // Reset accessibility and scroll
    container.setAttribute('tabindex', '-1');
    container.focus?.();
    container.scrollTo(0, 0);

    // Fade in new content
    await fadeIn(container);

    devLog(`✅ Route loaded: ${hash}`);
  } catch (err) {
    devError(`⚠️ Fallback to 404 for route "${hash}" - ${err}`);
    const Fallback404 = await loadFallback404();
    renderPage(Fallback404, { title: '404' });
    await fadeIn(container);
  } finally {
    hideSpinner();
  }
}

/**
 * Finds the module path for a given route.
 */
function findPageModulePath(base, sub) {
  const lower = (str) => str.toLowerCase();

  // Check for nested route: /pages/<base>/<sub>.js
  if (sub) {
    const nested = Object.keys(pageModules).find((path) =>
      lower(path).endsWith(`/pages/${base}/${sub}.js`)
    );
    if (nested) return nested;
  }

  // Otherwise, check for index.js in the base folder
  return Object.keys(pageModules).find((path) => lower(path).endsWith(`/pages/${base}/index.js`));
}

/**
 * Load a fallback 404 page if no route matches.
 */
async function loadFallback404() {
  const fallbackPath = Object.keys(pageModules).find((path) =>
    path.toLowerCase().includes('/pages/404/index.js')
  );

  if (!fallbackPath) {
    devLog('⚠️ No 404 fallback page found. Rendering inline message.', 'warn');
    return () => {
      const el = document.createElement('section');
      el.innerHTML = `<h1 class="text-red-500 text-center text-3xl mt-20">404 – Page Not Found</h1>`;
      return el;
    };
  }

  const mod = await pageModules[fallbackPath]();
  return mod.default || mod.render;
}

/**
 * Validate that all page modules have a default or render export.
 */
async function validatePageModules() {
  devLog('🔍 Validating page modules...');
  const invalidPages = [];

  const loadPromises = Object.entries(pageModules).map(async ([path, loader]) => {
    try {
      const mod = await loader();
      if (!mod.default && !mod.render) {
        devLog(`⚠️ Page module "${path}" missing default or render() export`, 'warn');
        invalidPages.push(path);
      }
    } catch (err) {
      devError(`❌ Failed to load page module "${path}" - ${err}`);
      invalidPages.push(`${path} (Load Error)`);
    }
  });

  await Promise.all(loadPromises);

  if (invalidPages.length > 0) {
    devError(`🚨 Invalid Page Modules Found: ${invalidPages.join(', ')}`);
  } else {
    devLog('🎉 All page modules are valid.');
  }
}
