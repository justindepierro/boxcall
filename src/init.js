// 🌐 AUTH INIT
import { initAuth } from '@lib/init/initAuth.js';
// 🧑‍💼 USER SETTINGS + DEV OVERRIDES
import { initializeUser, handleAuthRedirect } from '@lib/init/initUser.js';
import { getUserSettings, setUserSettings, getSupabaseUser } from '@state/userState.js';
import { devSafeAuthCheck } from '@utils/devSafeAuthChecker.js';
import { devLog, devWarn, devError } from '@utils/devLogger';
// 🎨 THEMING
import { initTheme } from '@lib/init/initTheme.js';
// 🧱 APP SHELL + ROUTING
import { renderPublicAppShell, renderPrivateAppShell } from '@render/renderAppShell.js';
import { loadSidebarStateFromStorage } from '@state/sidebarState.js';
// 🛠️ DEV TOOLS
import { renderDevToolsPanel } from '@components/dev/devToolsPanel.js';
import { mountLiveLogger, updateLogContext } from '@components/dev/liveLogger.js';
import { DEV_EMAIL } from '@config/devConfig.js';
import { checkAuthOnRouteChange } from '@routes/checkRouteOnAuthChange';

const PUBLIC_PAGES = ['login', 'signup', 'forgot', '404'];

/** Extracts the current page from the URL hash. */
function getCurrentPage() {
  return (location.hash || '').replace(/^#\/?/, '') || 'dashboard';
}

/** Checks if a page is protected (requires login). */
function isProtectedPage(page) {
  return !PUBLIC_PAGES.includes(page);
}

/** Loads user settings and applies themes. */
async function loadUserSettingsIfNeeded(isLoggedIn, user) {
  if (!isLoggedIn) {
    await initTheme(); // fallback theme
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

  // 2️⃣ Authentication & redirection checks (now using devSafeAuthCheck)
  if (devSafeAuthCheck(isLoggedIn, page, PUBLIC_PAGES, user)) {
    return;
  }

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

  // 3️⃣ Load user settings (or fallback theme)
  await loadUserSettingsIfNeeded(isLoggedIn, user);

  // 4️⃣ Load sidebar state
  loadSidebarStateFromStorage();

  // 5️⃣ Render correct shell
  if (isProtectedPage(page)) {
    renderPrivateAppShell();
    devLog('✅ Private app shell rendered (with sidebar)');
  } else {
    renderPublicAppShell();
    devLog('✅ Public app shell rendered (no sidebar)');
  }

  // 6️⃣ Handle current route
  await checkAuthOnRouteChange();
  window.addEventListener('hashchange', checkAuthOnRouteChange);
  devLog('🚦 handleRouting() finished');

  // 7️⃣ Dev tools
  initDevToolsIfNeeded(getUserSettings());

  devLog('✅ initApp(): App fully initialized.');
}
