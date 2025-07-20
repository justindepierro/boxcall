import { getSupabaseUser } from '@state/userState.js';
import { handleRouting } from '@routes/router.js';
import { devLog, devWarn } from '@utils/devLogger';
import { devSafeAuthCheck } from '@utils/devSafeAuthChecker.js';

const PUBLIC_PAGES = ['login', 'signup', 'forgot', '404'];

function getCurrentPage() {
  return (location.hash || '').replace(/^#\/?/, '') || 'dashboard';
}

function isProtectedPage(page) {
  return !PUBLIC_PAGES.includes(page);
}

export async function checkAuthOnRouteChange() {
  const page = getCurrentPage();
  const user = getSupabaseUser();
  const isLoggedIn = !!user;

  // Dev-safe temporary session check
  if (devSafeAuthCheck(isLoggedIn, page, PUBLIC_PAGES, user)) {
    return;
  }

  // Redirect if not logged in and trying to access protected page
  if (isProtectedPage(page) && !isLoggedIn) {
    devWarn('🔒 Not logged in — redirecting to login');
    location.hash = '#/login';
    return;
  }

  // Redirect if logged in and trying to access login/signup
  if (!isProtectedPage(page) && isLoggedIn) {
    devLog('⚡ Already logged in — redirecting to dashboard');
    location.hash = '#/dashboard';
    return;
  }

  // Allow route rendering
  await handleRouting();
}
