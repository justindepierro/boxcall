// src/routes/checkRouteOnAuthChange.js
import { getSupabaseUser } from '@state/userState.js';
import { resetAppToPublic, resetAppToPrivate } from '@render/appReset.js';
import { navigateTo } from '@routes/router.js';
import { devLog, devWarn, devError } from '@utils/devLogger.js';
import { devSafeAuthCheck } from '@utils/devSafeAuthChecker.js';

const PUBLIC_PAGES = ['login', 'signup', 'forgot', '404'];
const DEFAULT_PRIVATE_PAGE = 'dashboard';
const DEFAULT_PUBLIC_PAGE = 'login';

/**
 * Normalize hash to get the current page.
 * @returns {string}
 */
function getCurrentPage() {
  return (location.hash || '').replace(/^#\/?/, '').toLowerCase() || DEFAULT_PRIVATE_PAGE;
}

/**
 * Checks if a page is protected (requires authentication).
 * @param {string} page
 * @returns {boolean}
 */
function isProtectedPage(page) {
  return !PUBLIC_PAGES.includes(page);
}

/**
 * Main Auth + Routing Handler
 * - Determines if we should use the public or private app shell.
 * - Redirects unauthorized users to login.
 * - Redirects logged-in users away from login/signup.
 *
 * @returns {Promise<void>}
 */
export async function checkAuthOnRouteChange() {
  try {
    const page = getCurrentPage();
    const user = getSupabaseUser();
    const isLoggedIn = !!user;

    devLog(`🔍 checkAuthOnRouteChange(): page="${page}", loggedIn=${isLoggedIn}`);

    // Prevent dev infinite redirects
    if (devSafeAuthCheck(isLoggedIn, page, PUBLIC_PAGES, user)) return;

    // If user is not logged in and trying to access a protected page
    if (!isLoggedIn && isProtectedPage(page)) {
      devWarn(`🔒 Not logged in — redirecting to public shell [${DEFAULT_PUBLIC_PAGE}]`);
      await resetAppToPublic(DEFAULT_PUBLIC_PAGE);
      navigateTo(DEFAULT_PUBLIC_PAGE);
      return;
    }

    // If user is logged in but trying to access login/signup
    if (isLoggedIn && !isProtectedPage(page)) {
      devLog(`⚡ Logged in — redirecting to private shell [${DEFAULT_PRIVATE_PAGE}]`);
      await resetAppToPrivate(DEFAULT_PRIVATE_PAGE);
      navigateTo(DEFAULT_PRIVATE_PAGE);
      return;
    }

    // Otherwise, the user is allowed on this page
    if (isLoggedIn) {
      devLog('🔐 Using private shell...');
      await resetAppToPrivate(page);
      navigateTo(page);
    } else {
      devLog('🌐 Using public shell...');
      await resetAppToPublic(page);
      navigateTo(page);
    }
  } catch (err) {
    devError(`❌ checkAuthOnRouteChange() failed: ${err}`);
    await resetAppToPublic(DEFAULT_PUBLIC_PAGE); // Safe fallback
    navigateTo(DEFAULT_PUBLIC_PAGE);
  }
}
