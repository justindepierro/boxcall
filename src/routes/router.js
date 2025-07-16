import { showSpinner, hideSpinner } from '@utils/spinner.js';
import { devLog } from '@utils/devLogger.js';
import { renderPage } from '@render/renderPage.js';

// 🧠 Auto-import every page module under /pages/
const pageModules = import.meta.glob('@pages/**/*.js');

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
  window.addEventListener('hashchange', handleRouting);
  handleRouting(); // Initial load
}

/**
 * 🔁 Handle routing based on the current hash
 */
export async function handleRouting() {
  const hash = window.location.hash.replace(/^#\/?/, '') || 'dashboard';
  const [base, sub] = hash.split('/');

  const container = document.getElementById('page-view') || document.getElementById('app');
  if (!container) {
    console.error('❌ handleRouting(): Missing #page-view or #app');
    return;
  }

  showSpinner();

  try {
    // ✅ Attempt to locate page module (nested or index)
    const modulePath = findPageModulePath(base, sub);
    if (!modulePath) throw new Error(`Route not found for "${hash}"`);

    const mod = await pageModules[modulePath]();
    const Component = mod.default || mod.render;

    if (typeof Component !== 'function') {
      throw new Error(`Module "${modulePath}" does not export a valid component function`);
    }

    const routeProps = {
      base,
      sub,
      full: hash,
    };

    renderPage({
      component: Component,
      props: routeProps,
      containerId: container.id,
    });

    // ♿ Accessibility & scroll reset
    container.setAttribute('tabindex', '-1');
    container.focus();
    container.scrollTo(0, 0);

    devLog(`✅ Loaded route: ${hash}`);
  } catch (err) {
    console.warn(`⚠️ Fallback to 404 for route "${hash}"`, err);

    const Fallback404 = await loadFallback404();

    renderPage({
      component: Fallback404,
      containerId: container.id,
    });
  } finally {
    hideSpinner();
  }
}

/**
 * 🔍 Find the most appropriate module path based on route
 */
function findPageModulePath(base, sub) {
  const nested = Object.keys(pageModules).find((path) =>
    path.toLowerCase().includes(`/pages/${base}/${sub}.js`)
  );

  const index = Object.keys(pageModules).find((path) =>
    path.toLowerCase().includes(`/pages/${base}/index.js`)
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
    return () => {
      const el = document.createElement('section');
      el.innerHTML = `<h1 class="text-red-500 text-center text-3xl mt-20">404 – Page Not Found</h1>`;
      return el;
    };
  }

  const mod = await pageModules[fallbackPath]();
  return mod.default || mod.render;
}
