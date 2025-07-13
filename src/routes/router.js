// src/routes/router.js

// Dynamically map route names to their respective page modules
const routes = {
  home: () => import('@pages/home/index.js'),
  dashboard: () => import('@pages/dashboard/index.js'),
  teamdashboard: () => import('@pages/teamdashboard/index.js'),
  boxcall: () => import('@pages/boxcall/index.js'),
  calendar: () => import('@pages/calendar/index.js'),
  templates: () => import('@pages/templates/index.js'),
  login: () => import('@pages/login/index.js'),
  signup: () => import('@pages/signup/index.js'),
  playbook: () => import('@pages/playbook/index.js'),
  team: () => import('@pages/team/index.js'),
  settings: () => import('@pages/settings/index.js'),
  forgot: () => import('@pages/forgot/index.js'),
  404: () => import('@pages/404/index.js'),
};

/**
 * Navigate to a specific page by updating the hash
 */
export function navigateTo(page = '') {
  const cleanPage = page.replace(/^\/+/, ''); // 🧼 strip any leading slashes
  window.location.hash = `#/${cleanPage}`;
}

/**
 * Boot up the router
 */
export function initRouter() {
  window.addEventListener('hashchange', handleRouting);
  handleRouting(); // Trigger on initial load
}

/**
 * Handle routing by dynamically rendering the appropriate page
 */
export async function handleRouting() {
  const hash = window.location.hash.replace(/^#\/?/, '') || 'dashboard';
  const route = routes[hash] || routes['404'];
  const container = document.getElementById('page-view') || document.getElementById('app');

  if (!container) {
    console.error('❌ Missing #page-view or #app container in index.html');
    return;
  }

  try {
    const module = await route();

    // 🧠 Support both default export and named "render" function
    const renderFn = module.default || module.render;

    if (typeof renderFn === 'function') {
      renderFn(container);
    } else {
      throw new Error(`Module for route "${hash}" is missing a render function`);
    }
  } catch (err) {
    console.error(`❌ Error loading route "${hash}"`, err);

    // Graceful fallback to 404 page
    const fallback = await routes['404']();
    const fallbackRender = fallback.default || fallback.render;
    fallbackRender(container);
  }
}
