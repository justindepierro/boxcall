import { showSpinner, hideSpinner } from '@utils/spinner.js';
import { devLog } from '@utils/devLogger.js';

const pageModules = import.meta.glob('@pages/**/*.js');

/**
 * Navigate to a specific page by updating the hash
 */
export function navigateTo(page = '') {
  const cleanPage = page.replace(/^\/+/, '');
  window.location.hash = `#/${cleanPage}`;
  devLog('🚦 Reached new page after routing');
}

/**
 * Boot up the router
 */
export function initRouter() {
  window.addEventListener('hashchange', handleRouting);
  handleRouting(); // Trigger on initial load
}

/**
 * Handles routing by dynamically resolving the best match
 */
export async function handleRouting() {
  const hash = window.location.hash.replace(/^#\/?/, '') || 'dashboard';
  const pathParts = hash.split('/'); // ['team', 'settings']
  const routeBase = pathParts[0]; // 'team'
  const subRoute = pathParts[1]; // 'settings' (optional)

  const container = document.getElementById('page-view') || document.getElementById('app');
  if (!container) {
    console.error('❌ Missing #page-view or #app container in index.html');
    return;
  }

  showSpinner();

  try {
    // Try to match nested route first (e.g. /pages/team/settings.js)
    const nestedPath = Object.keys(pageModules).find((path) =>
      path.toLowerCase().includes(`/pages/${routeBase}/${subRoute}.js`)
    );

    // Otherwise, fall back to index.js in folder
    const indexPath = Object.keys(pageModules).find((path) =>
      path.toLowerCase().includes(`/pages/${routeBase}/index.js`)
    );

    // Choose the best match
    const modulePath = nestedPath || indexPath;
    if (!modulePath) throw new Error(`No route found for "${hash}"`);

    const module = await pageModules[modulePath]();
    const renderFn = module.default || module.render;

    if (typeof renderFn === 'function') {
      renderFn(container);
    } else {
      throw new Error(`Module for "${hash}" is missing a valid render function`);
    }
  } catch (err) {
    console.warn(`⚠️ Falling back to 404 for "${hash}"`, err);
    const fallback = await loadFallback404();
    fallback(container);
  } finally {
    hideSpinner(); // ✅ This is now correctly part of the try/catch/finally
  }
}

/**
 * Gracefully loads the 404 fallback module
 */
async function loadFallback404() {
  const fallbackPath = Object.keys(pageModules).find((p) =>
    p.toLowerCase().includes('/pages/404/index.js')
  );

  if (!fallbackPath) {
    return (el) => {
      el.innerHTML = `<h1 class="text-red-500 text-center mt-10">404: Page not found</h1>`;
    };
  }

  const mod = await pageModules[fallbackPath]();
  return mod.default || mod.render;
}
