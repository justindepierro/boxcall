// 🌐 AUTH INIT
import { initAuth } from '@lib/init/initAuth.js';
// 🧑‍💼 USER SETTINGS + DEV OVERRIDES
import { initializeUser, handleAuthRedirect } from '@lib/init/initUser.js';
import {
  getUserSettings,
  setUserSettings,
  getSupabaseUser,
  clearAuthState,
} from '@state/userState.js';
import { isTemporarySession } from '@utils/sessionHelper';
// 🎨 THEMING
import { initTheme } from '@lib/init/initTheme.js';
// 🧱 APP SHELL + ROUTING
import { renderAppShell } from '@render/renderAppShell.js';
import { loadSidebarStateFromStorage } from '@state/sidebarState.js';
// 🛠️ DEV TOOLS
import { renderDevToolsPanel } from '@components/dev/devToolsPanel.js';
import { mountLiveLogger, updateLogContext } from '@components/dev/liveLogger.js';
import { DEV_EMAIL } from '@config/devConfig.js';
import { checkAuthOnRouteChange } from '@routes/checkRouteOnAuthChange';
// 🔧 LOGGING
import { devLog } from '@utils/devLogger.js';

const PUBLIC_PAGES = ['login', 'signup', 'forgot', '404'];

/** Extracts the current page from the URL hash. */
function getCurrentPage() {
  return (location.hash || '').replace(/^#\/?/, '') || 'dashboard';
}

/** Checks if a page is protected (requires login). */
function isProtectedPage(page) {
  return !PUBLIC_PAGES.includes(page);
}

/**
 * Handles session checks and redirects unauthenticated users.
 * @param {boolean} isLoggedIn
 * @param {string} page
 * @returns {boolean} - True if navigation should stop (redirected), false otherwise.
 */
function handleAuthChecks(isLoggedIn, page) {
  // Temporary session logout
  if (isLoggedIn && isTemporarySession()) {
    console.warn('⚠️ Temporary session detected. Forcing logout.');
    clearAuthState();
    handleAuthRedirect(page, PUBLIC_PAGES);
    return true;
  }

  // Redirect unauthenticated users from protected pages
  if (isProtectedPage(page) && !isLoggedIn) {
    console.warn('🔒 No user found — redirecting to login');
    handleAuthRedirect(page, PUBLIC_PAGES);
    return true;
  }

  // Redirect authenticated users away from public pages
  if (!isProtectedPage(page) && isLoggedIn) {
    devLog('⚡ Already logged in, redirecting to dashboard');
    location.hash = '#/dashboard';
    return true;
  }

  return false;
}

/** Loads user settings and applies themes. */
async function loadUserSettingsIfNeeded(isLoggedIn, user) {
  if (!isLoggedIn) {
    await initTheme(); // fallback theme
    return;
  }

  try {
    const { settings } = await initializeUser(); // Theme is applied here
    if (settings) {
      setUserSettings({ ...settings, email: user.email });
      devLog(`✅ User settings loaded for: ${user.email}`);
    } else {
      console.warn('⚠️ No user settings found.');
    }
  } catch (error) {
    console.error('❌ Failed to initialize user settings:', error);
  }
}

/** Initializes developer tools for dev accounts. */
function initDevToolsIfNeeded(userSettings) {
  if (userSettings?.email !== DEV_EMAIL) return;
  devLog('🛠️ Dev mode: Initializing tools...');
  renderDevToolsPanel(userSettings);
  mountLiveLogger();
  updateLogContext();
}

/** Initializes the entire app: Auth, User Settings, Routing, and Dev Tools. */
export async function initApp() {
  devLog('🧠 initApp(): Starting full app initialization...');
  const page = getCurrentPage();

  // 1️⃣ Supabase Auth Setup
  await initAuth();
  const user = getSupabaseUser();
  const isLoggedIn = !!user;
  devLog(`🧪 Authenticated user: ${user ? user.email : 'No user'}`);

  // 2️⃣ Authentication & redirection checks
  if (handleAuthChecks(isLoggedIn, page)) return;

  // 3️⃣ Load user settings (or fallback theme)
  await loadUserSettingsIfNeeded(isLoggedIn, user);

  // 4️⃣ Load sidebar state
  loadSidebarStateFromStorage();

  // 5️⃣ Render correct shell
  renderAppShell(!isProtectedPage(page));
  devLog(`✅ renderAppShell() called (${isProtectedPage(page) ? 'private' : 'public'})`);

  // 6️⃣ Handle current route
  await checkAuthOnRouteChange();
  window.addEventListener('hashchange', checkAuthOnRouteChange);
  devLog('🚦 handleRouting() finished');

  // 7️⃣ Dev tools
  initDevToolsIfNeeded(getUserSettings());

  devLog('✅ initApp(): App fully initialized.');
}
