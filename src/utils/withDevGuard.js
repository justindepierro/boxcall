import { DEV_EMAIL } from '@config/devConfig.js';
import { getCurrentUser } from '@state/userState.js';
import { devLog, devWarn } from '@utils/devLogger.js';
import ForbiddenPage from '@pages/ForbiddenPage/ForbiddenPage';

/**
 * Wraps a page renderer and ensures only the dev account (DEV_EMAIL) can access it.
 * If unauthorized, shows a fallback ForbiddenPage or redirects.
 *
 * @param {Function} pageRenderer - The page renderer function (e.g., renderPlaygroundPage).
 * @param {Object} [options]
 * @param {boolean} [options.redirectOnFail=false] - Whether to redirect to dashboard on fail.
 * @param {string} [options.redirectPage='dashboard'] - Page to redirect if unauthorized.
 * @param {string} [options.fallbackMessage=''] - Custom message for forbidden page.
 * @returns {Function} - Wrapped page renderer with guard logic.
 */
export function withDevGuard(
  pageRenderer,
  { redirectOnFail = false, redirectPage = 'dashboard', fallbackMessage = '' } = {}
) {
  return function guardedRenderer(container) {
    const user = getCurrentUser();
    const isDevUser = user?.email === DEV_EMAIL || import.meta.env.MODE === 'development';

    if (!isDevUser) {
      devWarn(`⛔ Access denied to dev-only page for user: ${user?.email || 'Guest'}`);

      if (redirectOnFail) {
        window.location.hash = `#/${redirectPage}`;
        return;
      }

      // Use the ForbiddenPage component
      container.innerHTML = '';
      container.appendChild(ForbiddenPage(fallbackMessage || 'Dev-only page: Access Denied.'));
      return;
    }

    devLog('🔑 DevGuard passed — rendering page...');
    pageRenderer(container);
  };
}
