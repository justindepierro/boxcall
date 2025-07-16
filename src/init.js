// 🌐 AUTH INIT
import { initAuth } from '@lib/init/initAuth.js';

// 🧑‍💼 USER SETTINGS + DEV OVERRIDES
import { initializeUser, handleAuthRedirect } from '@lib/init/initUser.js';

// 🎨 THEMING
import { applyContextualTheme } from '@config/themes/themeController.js';
import { applyTheme } from '@utils/themeManager.js';

// 🧱 APP SHELL + ROUTING
import { renderAppShell } from '@render/renderAppShell.js';
import { handleRouting } from '@routes/router.js';

// 🛠️ DEV TOOLS
import { renderDevToolsPanel } from '@components/dev/devToolsPanel.js';
import { mountLiveLogger, updateLogContext } from '@components/dev/liveLogger.js';
import { DEV_EMAIL } from '@config/devConfig.js';

// 🌐 Routing rules
const PUBLIC_PAGES = ['login', 'signup', 'forgot'];

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
  console.log('🧪 window.supabaseUser:', window.supabaseUser);

  const user = window.supabaseUser;
  const isLoggedIn = !!user;

  // 2️⃣ Handle redirect if unauthorized on protected page
  if (isProtectedPage(page) && !isLoggedIn) {
    handleAuthRedirect();
    return;
  }

  // 3️⃣ Load user settings (with dev overrides)
  if (user) {
    window.userSettings = await initializeUser(user);
    console.log('✅ userSettings loaded');
  }

  // 4️⃣ Apply theme (from user/team/dev fallback)
  try {
    await applyContextualTheme();
    console.log('🎨 Theme applied');
  } catch (err) {
    console.error('🎨 Theme error, falling back to classic:', err.message);
    applyTheme('classic');
  }

  // 5️⃣ Inject app shell (sidebar, layout, etc)
  renderAppShell();
  console.log('✅ renderAppShell() called');

  // 6️⃣ Load current route
  await handleRouting();
  window.addEventListener('hashchange', handleRouting);
  console.log('🚦 handleRouting() finished');

  // 7️⃣ Inject Dev Tools if authorized
  if (window.userSettings?.email === DEV_EMAIL) {
    console.log('🛠️ Dev mode: Initializing tools...');
    renderDevToolsPanel(window.userSettings);
    mountLiveLogger();
    updateLogContext();
  }

  // 8️⃣ Expose global theming tool (for live overrides)
  window.BoxCall = window.BoxCall || {};
  window.BoxCall.forceApplyTheme = (themeKey) => {
    console.log(`🎨 Live theme override: ${themeKey}`);
    applyTheme(themeKey);
  };

  console.log('✅ initApp(): App fully initialized.');
}
