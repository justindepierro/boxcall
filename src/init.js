// 🌐 AUTH INIT
import { initAuth } from '@lib/init/initAuth.js';

// 🧑‍💼 USER SETTINGS + DEV OVERRIDES
import { initializeUser, handleAuthRedirect } from '@lib/init/initUser.js';
import { getUserSettings, setUserSettings, getSupabaseUser } from '@state/userState.js';

// 🎨 THEMING
import { applyContextualTheme } from '@config/themes/themeController.js';
import { applyTheme } from '@utils/themeManager.js';

// 🧱 APP SHELL + ROUTING
import { renderAppShell } from '@render/renderAppShell.js';
import { handleRouting } from '@routes/router.js';
import { loadSidebarStateFromStorage } from '@state/sidebarState.js';

// 🛠️ DEV TOOLS
import { renderDevToolsPanel } from '@components/dev/devToolsPanel.js';
import { mountLiveLogger, updateLogContext } from '@components/dev/liveLogger.js';
import { DEV_EMAIL } from '@config/devConfig.js';

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
  const isPublicPage = !isProtectedPage(page);

  // 1️⃣ Supabase Auth Setup
  await initAuth();
  const user = getSupabaseUser();
  console.log('🧪 Authenticated user:', user);

  const isLoggedIn = !!user;

  // 2️⃣ Handle unauthorized access
  if (isProtectedPage(page) && !isLoggedIn) {
    handleAuthRedirect(page, PUBLIC_PAGES);
    return;
  }

  // 3️⃣ Load user settings if logged in
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

  // 4️⃣ Apply theme
  try {
    await applyContextualTheme();
    console.log('🎨 Theme applied');
  } catch (err) {
    console.error('🎨 Theme error, falling back to classic:', err.message);
    applyTheme('classic');
  }

  loadSidebarStateFromStorage();

  // 5️⃣ Render correct shell
  renderAppShell(isPublicPage);
  console.log(`✅ renderAppShell() called (${isPublicPage ? 'public' : 'private'})`);

  // 6️⃣ Handle current route
  await handleRouting();
  window.addEventListener('hashchange', handleRouting);
  console.log('🚦 handleRouting() finished');

  // 7️⃣ Developer tools
  const userSettings = getUserSettings();
  if (userSettings?.email === DEV_EMAIL) {
    console.log('🛠️ Dev mode: Initializing tools...');
    renderDevToolsPanel(userSettings);
    mountLiveLogger();
    updateLogContext();
  }

  console.log('✅ initApp(): App fully initialized.');
}
