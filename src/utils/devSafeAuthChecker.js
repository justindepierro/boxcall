import { isTemporarySession } from '@utils/sessionHelper.js';
import { clearAuthState } from '@state/userState.js';
import { handleAuthRedirect } from '@lib/init/initUser.js';
import { devWarn } from '@utils/devLogger.js';
import { DEV_EMAIL } from '@config/devConfig.js';

/**
 * Safely checks for temporary session logic but skips forced logout
 * for the dev email or when in development mode.
 *
 * @param {boolean} isLoggedIn - Whether a user is logged in.
 * @param {string} page - Current page being visited.
 * @param {string[]} publicPages - Pages that don't require authentication.
 * @param {object} [user] - The current Supabase user object.
 * @returns {boolean} - True if navigation should stop (redirected), false otherwise.
 */
export function devSafeAuthCheck(isLoggedIn, page, publicPages, user = {}) {
  const isDevAccount = user?.email === DEV_EMAIL;
  const isDevEnv = import.meta.env.MODE === 'development';

  // 🧪 Skip forced logout in dev mode or for dev account
  if (isLoggedIn && isTemporarySession() && !isDevAccount && !isDevEnv) {
    devWarn('⚠️ Temporary session detected. Forcing logout.');
    clearAuthState();
    handleAuthRedirect(page, publicPages);
    return true;
  }

  return false;
}
