// src/routes/router.js

// Define routes and their corresponding lazy-loaded modules
const routes = {
  home: () => import('../pages/home/index.js'),
  dashboard: () => import('../pages/dashboard/index.js'),
  teamdashboard: () => import('../pages/teamdashboard/index.js'),
  boxcall: () => import('../pages/boxcall/index.js'),
  calendar: () => import('../pages/calendar/index.js'),
  templates: () => import('../pages/templates/index.js'),
  login: () => import('../pages/login/index.js'),
  signup: () => import('../pages/signup/index.js'),
  playbook: () => import('../pages/playbook/index.js'),
  team: () => import('../pages/team/index.js'),
  settings: () => import('../pages/settings/index.js'),
  forgot: () => import('../pages/forgot/index.js'),
  '404': () => import('../pages/404/index.js'),
}

// Main function to handle page routing
export async function handleRouting() {
  const container = document.getElementById('app')
  if (!container) {
    console.error('❌ Missing #app container in index.html')
    return
  }

  const hash = window.location.hash.replace(/^#\/?/, '') || 'home'
  const loadRoute = routes[hash] || routes['404']

  try {
    const module = await loadRoute()
    const renderFn = Object.values(module)[0]
    renderFn(container)
  } catch (err) {
    console.error(`❌ Failed to load route: ${hash}`, err)
    const fallback = await routes['404']()
    const render404 = Object.values(fallback)[0]
    render404(container)
  }
}

export function navigateTo(page) {
  window.location.hash = `#/${page}`
}