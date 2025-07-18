import { showSpinner, hideSpinner } from '@utils/spinner.js';
import { devLog } from '@utils/devLogger.js';
import { renderPage } from '@render/renderPage.js';

/** @type {Record<string, () => Promise<any>>} */
const pageModules = import.meta.glob('@pages/**/*.js');

/** @constant {string} */
const DEFAULT_ROUTE = 'dashboard';

/**
 * 🚦 Programmatically navigate to a route
 * @param {string} page - e.g. 'dashboard', 'team/settings'
 */
export function navigateTo(page = '') {
  const cleanPage = page.replace(/^\/+/g, '');
  window.location.hash = `#/${cleanPage}`;
  devLog(`🚦 Navigating to: ${cleanPage}`);
}

/**
 * 🧭 Initialize the router and handle initial + hashchange events
 */
export function initRouter() {
  checkPageModules(); // ✅ Check page modules during initialization
  window.addEventListener('hashchange', handleRouting);
  handleRouting(); // Initial load
}

/**
 * 🔁 Handle routing based on the current hash
 */
export async function handleRouting() {
  const hash = window.location.hash.replace(/^#\/?/, '') || DEFAULT_ROUTE;
  const [base, sub] = hash.split('/');

  const container = document.getElementById('page-view') || document.getElementById('app');
  if (!container) {
    console.error('❌ handleRouting(): Missing #page-view or #app');
    return;
  }

  showSpinner();

  try {
    // ✅ Attempt to locate page module
    const modulePath = findPageModulePath(base, sub);
    if (!modulePath) throw new Error(`Route not found for "${hash}"`);

    devLog(`📦 Loading page module: ${modulePath}`);
    const mod = await pageModules[modulePath]();
    const Component = mod.default || mod.render;

    if (typeof Component !== 'function') {
      console.warn(`⚠️ Module "${modulePath}" has no valid default export or render() function`);
      throw new Error(`Invalid component for route "${hash}"`);
    }

    const routeProps = { base, sub, full: hash };
    renderPage({ component: Component, props: routeProps, containerId: container.id });

    // ♿ Accessibility & scroll reset
    container.setAttribute('tabindex', '-1');
    container.focus();
    container.scrollTo(0, 0);

    devLog(`✅ Loaded route: ${hash}`);
  } catch (err) {
    console.warn(`⚠️ Fallback to 404 for route "${hash}"`, err);

    const Fallback404 = await loadFallback404();
    renderPage({ component: Fallback404, containerId: container.id });
  } finally {
    hideSpinner();
  }
}

/**
 * 🔍 Find the most appropriate module path based on route
 */
function findPageModulePath(base, sub) {
  const lower = (str) => str.toLowerCase();

  // Check for nested route: /pages/<base>/<sub>.js
  const nested = Object.keys(pageModules).find((path) =>
    lower(path).endsWith(`/pages/${base}/${sub}.js`)
  );

  // Check for standard index.js in page folder
  const index = Object.keys(pageModules).find((path) =>
    lower(path).endsWith(`/pages/${base}/index.js`)
  );

  return nested || index;
}

/**
 * 🧱 Try to load a 404 fallback renderer
 */
async function loadFallback404() {
  const fallbackPath = Object.keys(pageModules).find((path) =>
    path.toLowerCase().includes('/pages/404/index.js')
  );

  if (!fallbackPath) {
    console.warn('⚠️ No 404 fallback page found. Rendering inline message.');
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
 * 🔎 Check all page modules for missing default exports
 */
async function checkPageModules() {
  devLog('🔍 Checking all page modules for default exports...');
  const invalidPages = []; // Collect invalid page paths

  const loadPromises = Object.entries(pageModules).map(async ([path, loader]) => {
    try {
      const mod = await loader();
      if (!mod.default && !mod.render) {
        console.warn(`⚠️ Page module "${path}" has no default or render() export`);
        invalidPages.push(path);
      } else {
        devLog(`✅ Page module "${path}" is valid`);
      }
    } catch (err) {
      console.error(`❌ Failed to load page module "${path}"`, err);
      invalidPages.push(`${path} (Load Error)`);
    }
  });

  await Promise.all(loadPromises);

  // Print a summary
  if (invalidPages.length > 0) {
    console.groupCollapsed(
      `🚨 Page Module Check Complete — ${invalidPages.length} Invalid Page(s) Found`
    );
    invalidPages.forEach((page) => console.warn(` - ${page}`));
    console.groupEnd();
  } else {
    console.log('🎉 All page modules are valid.');
  }

  devLog('🔎 Page module check complete');
}
