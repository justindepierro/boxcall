// src/render/appReset.js
import { renderAppShell } from '@render/renderAppShell.js';
import { navigateTo, handleRouting } from '@routes/router.js';
import { devLog } from '@utils/devLogger.js';

/**
 * Resets the app to a given layout and routes to the specified page.
 *
 * @param {Object} options
 * @param {boolean} [options.includeSidebar=false] - Whether the private sidebar layout should be used.
 * @param {string} [options.page='login'] - The target page to navigate to.
 */
async function resetApp({ includeSidebar = false, page = 'login' } = {}) {
  devLog(`🔄 resetApp(): Switching to ${includeSidebar ? 'private' : 'public'} layout → ${page}`);

  // 1. Render the app shell
  renderAppShell({ includeSidebar });

  // 2. Navigate to the target page
  navigateTo(page);

  // 3. Handle routing
  await handleRouting();
}

/**
 * Resets the application to the public layout (login/signup/forgot).
 * @param {string} page - Target page (default: 'login').
 */
export async function resetAppToPublic(page = 'login') {
  return resetApp({ includeSidebar: false, page });
}

/**
 * Resets the application to the private layout (e.g., dashboard).
 * @param {string} page - Target private page (default: 'dashboard').
 */
export async function resetAppToPrivate(page = 'dashboard') {
  return resetApp({ includeSidebar: true, page });
}
