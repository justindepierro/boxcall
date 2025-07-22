// src/init.js
import { initAuth } from '@lib/init/initAuth.js';
import { initializeUser, handleAuthRedirect } from '@lib/init/initUser.js';
import { getUserSettings, setUserSettings, getSupabaseUser } from '@state/userState.js';
import { devSafeAuthCheck } from '@utils/devSafeAuthChecker.js';
import { devLog, devWarn, devError } from '@utils/devLogger';
import { initTheme } from '@lib/init/initTheme.js';
import { renderPublicAppShell, renderPrivateAppShell } from '@render/renderAppShell.js';
import { loadSidebarStateFromStorage } from '@state/sidebarState.js';
import { renderDevToolsPanel } from '@components/dev/devToolsPanel.js';
import { mountLiveLogger, updateLogContext } from '@components/dev/liveLogger.js';
import { DEV_EMAIL } from '@config/devConfig.js';
import { checkAuthOnRouteChange } from '@routes/checkRouteOnAuthChange.js';
import { initRouter } from '@routes/router.js';

const PUBLIC_PAGES = ['login', 'signup', 'forgot', '404'];

function getCurrentPage() {
  return (location.hash || '').replace(/^#\/?/, '') || 'dashboard';
}

function isProtectedPage(page) {
  return !PUBLIC_PAGES.includes(page);
}

async function loadUserSettingsIfNeeded(isLoggedIn, user) {
  if (!isLoggedIn) {
    await initTheme();
    return;
  }
  try {
    const { settings } = await initializeUser();
    if (settings) {
      setUserSettings({ ...settings, email: user.email });
      devLog(`✅ User settings loaded for: ${user.email}`);
    } else {
      devWarn('⚠️ No user settings found.');
    }
  } catch (error) {
    devError(`❌ Failed to initialize user settings: ${error}`);
  }
}

function initDevToolsIfNeeded(userSettings) {
  if (userSettings?.email !== DEV_EMAIL) return;
  devLog('🛠️ Dev mode: Initializing tools...');
  renderDevToolsPanel(userSettings);
  mountLiveLogger();
  updateLogContext();
}

/**
 * Initializes the entire app (auth, theme, routing, dev tools).
 */
export async function initApp() {
  devLog('🧠 initApp(): Starting full app initialization...');
  const page = getCurrentPage();

  // 1️⃣ Auth
  await initAuth();
  const user = getSupabaseUser();
  const isLoggedIn = !!user;
  devLog(`🧪 Authenticated user: ${user ? user.email : 'No user'}`);

  // 2️⃣ Auth checks
  if (devSafeAuthCheck(isLoggedIn, page, PUBLIC_PAGES, user)) return;

  if (isProtectedPage(page) && !isLoggedIn) {
    devWarn('🔒 No user found — redirecting to login');
    handleAuthRedirect(page, PUBLIC_PAGES);
    return;
  }

  if (!isProtectedPage(page) && isLoggedIn) {
    devLog('⚡ Already logged in, redirecting to dashboard');
    location.hash = '#/dashboard';
    return;
  }

  // 3️⃣ Theme & settings
  await loadUserSettingsIfNeeded(isLoggedIn, user);

  // 4️⃣ Sidebar state
  loadSidebarStateFromStorage();

  // 5️⃣ Render shell
  if (isProtectedPage(page)) {
    renderPrivateAppShell();
    devLog('✅ Private app shell rendered');
  } else {
    renderPublicAppShell();
    devLog('✅ Public app shell rendered');
  }

  // 6️⃣ Initialize Router
  initRouter();

  // 7️⃣ Attach route guard
  window.addEventListener('hashchange', checkAuthOnRouteChange);

  // 8️⃣ Dev tools
  initDevToolsIfNeeded(getUserSettings());

  devLog('✅ initApp(): App fully initialized.');
}
