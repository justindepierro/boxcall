// src/routes/router.js
import { showSpinner, hideSpinner } from '@utils/spinner.js';
import { renderPage } from '@render/renderPage.js';
import { fadeIn, fadeOut } from '@utils/pageTransitions.js';
import { devLog, devError, devWarn } from '@utils/devLogger.js';

import { checkAuthOnRouteChange } from './checkRouteOnAuthChange.js';

/* -------------------------------------------------------------------------- */
/*                               CONFIGURATION                                */
/* -------------------------------------------------------------------------- */

/**
 * Dynamically imported page modules (via Vite).
 * Each page module must export `default` or `render`.
 */
const pageModules = /** @type {Record<string, () => Promise<any>>} */ (
  import.meta.glob('@pages/**/*.js')
);

const DEFAULT_ROUTE = 'dashboard';
const DEFAULT_404_MESSAGE = `<h1 class="text-red-500 text-center text-3xl mt-20">404 – Page Not Found</h1>`;

/* -------------------------------------------------------------------------- */
/*                              PUBLIC FUNCTIONS                              */
/* -------------------------------------------------------------------------- */

/**
 * Programmatically navigates to a page.
 * @param {string} page - e.g., 'dashboard' or 'team/settings'.
 */
export function navigateTo(page = '') {
  const cleanPage = page.replace(/^\/+/, '');
  window.location.hash = `#/${cleanPage}`;
  devLog(`🚦 navigateTo(): ${cleanPage}`);
}

/**
 * Initializes the router and sets up hashchange listeners.
 * Auth checks are always applied before rendering routes.
 */
export function initRouter() {
  devLog('🛣️ initRouter(): Starting router with auth checks...');
  validatePageModules();

  window.addEventListener('hashchange', checkAuthOnRouteChange);
  checkAuthOnRouteChange(); // Run immediately on load
}

/**
 * Handles the actual route loading (after auth checks).
 */
export async function handleRouting() {
  const hash = normalizeHash(window.location.hash) || DEFAULT_ROUTE;
  const [base, sub] = hash.split('/');

  const container = document.getElementById('page-content');
  if (!container) {
    devError('❌ handleRouting(): #page-content not found. Did you call resetAppShell()?');
    return;
  }

  showSpinner();

  try {
    await fadeOut(container);
    const modulePath = findPageModulePath(base, sub);

    if (!modulePath) {
      devWarn(`⚠️ No route found for "${hash}". Falling back to 404.`);
      await render404(container);
      return;
    }

    const PageComponent = await loadPageComponent(modulePath, hash);
    if (!PageComponent) return; // Already handled errors

    renderPage(PageComponent, { title: base });
    resetContainerState(container);

    await fadeIn(container);
    devLog(`✅ handleRouting(): Route loaded successfully → ${hash}`);
  } catch (err) {
    devError(`❌ handleRouting(): ${err}`);
    await render404(container);
  } finally {
    hideSpinner();
  }
}

/* -------------------------------------------------------------------------- */
/*                                HELPERS                                     */
/* -------------------------------------------------------------------------- */

/**
 * Normalizes the window hash to a clean route string.
 * @param {string} hash
 * @returns {string}
 */
function normalizeHash(hash) {
  return (hash || '').replace(/^#\/?/, '').toLowerCase();
}

/**
 * Finds the module path for a given base/sub route.
 * @param {string} base
 * @param {string} sub
 * @returns {string | undefined}
 */
function findPageModulePath(base, sub) {
  const lower = (str) => str.toLowerCase();

  if (sub) {
    return Object.keys(pageModules).find((path) =>
      lower(path).endsWith(`/pages/${base}/${sub}.js`)
    );
  }

  return Object.keys(pageModules).find((path) => lower(path).endsWith(`/pages/${base}/index.js`));
}

/**
 * Loads and validates a page component.
 * @param {string} modulePath
 * @param {string} route
 * @returns {Promise<Function | null>}
 */
async function loadPageComponent(modulePath, route) {
  try {
    devLog(`📦 Loading page module: ${modulePath}`);
    const mod = await pageModules[modulePath]();
    const PageComponent = mod.default || mod.render;

    if (typeof PageComponent !== 'function') {
      throw new Error(`Invalid page module for "${route}" (expected a function export).`);
    }

    return PageComponent;
  } catch (err) {
    devError(`❌ Failed to load page module "${route}": ${err}`);
    return null;
  }
}

/**
 * Attempts to render a 404 fallback page.
 * @param {HTMLElement} container
 */
async function render404(container) {
  try {
    const Fallback404 = await loadFallback404();
    renderPage(Fallback404, { title: '404' });
    await fadeIn(container);
  } catch (err) {
    devError(`❌ render404(): ${err}`);
    container.innerHTML = DEFAULT_404_MESSAGE;
  }
}

/**
 * Loads a fallback 404 module, or returns an inline renderer.
 * @returns {Promise<Function>}
 */
async function loadFallback404() {
  const fallbackPath = Object.keys(pageModules).find((path) =>
    path.toLowerCase().includes('/pages/404/index.js')
  );

  if (!fallbackPath) {
    devWarn('⚠️ No 404 page module found. Using inline fallback.');
    return () => DEFAULT_404_MESSAGE;
  }

  const mod = await pageModules[fallbackPath]();
  return mod.default || mod.render;
}

/**
 * Validates that all pages have a default or render export.
 */
export async function validatePageModules() {
  devLog('🔍 Validating page modules...');
  const invalidPages = [];

  await Promise.all(
    Object.entries(pageModules).map(async ([path, loader]) => {
      try {
        const mod = await loader();
        if (!mod.default && !mod.render) {
          invalidPages.push(path);
        }
      } catch (err) {
        devError(`❌ Failed to load page module "${path}" - ${err}`);
        invalidPages.push(path);
      }
    })
  );

  if (invalidPages.length) {
    devError(`🚨 Invalid Page Modules: ${invalidPages.join(', ')}`);
  } else {
    devLog('🎉 All page modules are valid.');
  }
}

/**
 * Resets scroll and accessibility state for a container.
 * @param {HTMLElement} container
 */
function resetContainerState(container) {
  container.setAttribute('tabindex', '-1');
  container.focus?.();
  container.scrollTo(0, 0);
}
