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
import { applyContextualTheme } from '@config/themes/themeController.js';
import { applyTheme } from '@utils/themeManager.js';

// 🧱 APP SHELL + ROUTING
import { renderAppShell } from '@render/renderAppShell.js';
import { loadSidebarStateFromStorage } from '@state/sidebarState.js';

// 🛠️ DEV TOOLS
import { renderDevToolsPanel } from '@components/dev/devToolsPanel.js';
import { mountLiveLogger, updateLogContext } from '@components/dev/liveLogger.js';
import { DEV_EMAIL } from '@config/devConfig.js';
import { checkAuthOnRouteChange } from '@routes/checkRouteOnAuthChange';

const PUBLIC_PAGES = ['login', 'signup', 'forgot', '404'];

function getCurrentPage() {
  return (location.hash || '').replace(/^#\/?/, '') || 'dashboard';
}

function isProtectedPage(page) {
  return !PUBLIC_PAGES.includes(page);
}

export async function initApp() {
  console.log('🧠 initApp(): Starting full app initialization...');

  const page = getCurrentPage();

  // 1️⃣ Supabase Auth Setup
  await initAuth();
  let user = getSupabaseUser();
  let isLoggedIn = !!user;

  console.log('🧪 Authenticated user:', user);

  // 2️⃣ Handle temporary session expiration
  if (isLoggedIn && isTemporarySession()) {
    console.warn('⚠️ Temporary session detected. Forcing logout.');
    clearAuthState();
    isLoggedIn = false;
    handleAuthRedirect(page, PUBLIC_PAGES);
    return;
  }

  // 3️⃣ Redirect unauthenticated users away from protected pages
  if (isProtectedPage(page) && !isLoggedIn) {
    console.warn('🔒 No user found — redirecting to login');
    handleAuthRedirect(page, PUBLIC_PAGES);
    return;
  }

  // 4️⃣ Redirect authenticated users away from public pages
  if (!isProtectedPage(page) && isLoggedIn) {
    console.log('⚡ Already logged in, redirecting to dashboard');
    location.hash = '#/dashboard';
    return;
  }

  // 5️⃣ Load user settings if logged in
  if (isLoggedIn) {
    try {
      const { settings } = await initializeUser();
      if (settings) {
        setUserSettings({ ...settings, email: user.email });
        console.log('✅ User settings loaded:', getUserSettings());
      } else {
        console.warn('⚠️ No user settings found.');
      }
    } catch (error) {
      console.error('❌ Failed to initialize user settings:', error);
    }
  }

  // 6️⃣ Apply theme
  try {
    await applyContextualTheme();
    console.log('🎨 Theme applied');
  } catch (err) {
    console.error('🎨 Theme error, falling back to classic:', err.message);
    applyTheme('classic');
  }

  loadSidebarStateFromStorage();

  // 7️⃣ Render correct shell
  renderAppShell(!isProtectedPage(page));
  console.log(`✅ renderAppShell() called (${isProtectedPage(page) ? 'private' : 'public'})`);

  // 8️⃣ Handle current route
  await checkAuthOnRouteChange();
  window.addEventListener('hashchange', checkAuthOnRouteChange);
  console.log('🚦 handleRouting() finished');

  // 9️⃣ Developer tools
  const userSettings = getUserSettings();
  if (userSettings?.email === DEV_EMAIL) {
    console.log('🛠️ Dev mode: Initializing tools...');
    renderDevToolsPanel(userSettings);
    mountLiveLogger();
    updateLogContext();
  }

  console.log('✅ initApp(): App fully initialized.');
}
