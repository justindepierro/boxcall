// src/js/init.js

import { initAuthState, isLoggedIn, getCurrentUser } from '@state/authState.js';
import { applyFontTheme, applyColorTheme } from '@config/themes/themeLoader.js';
import { applyContextualTheme } from '@config/themes/themeController.js';
import { initAuthListeners } from '@components/AuthGuard.js';
import { renderAppShell } from '@render/renderAppShell.js';
import { handleRouting } from '@routes/router.js';
import { getUserSettings } from '@lib/teams/user/getUserSettings.js';
import { getOverrideRole, getOverrideTheme } from '@state/devToolState.js';
import { renderDevToolsPanel } from '@components/dev/devToolsPanel.js';
import { mountLiveLogger, updateLogContext } from '@components/dev/liveLogger.js';
import { DEV_EMAIL } from '@config/devConfig.js';

const PUBLIC_PAGES = ['login', 'signup', 'forgot'];

function isProtectedPage(page) {
  return !PUBLIC_PAGES.includes(page);
}

function getCurrentPage() {
  const raw = location.hash || '';
  return raw.replace(/^#\/?/, '') || 'dashboard';
}

export async function initApp() {
  console.log('📦 Initializing BoxCall App...');
  await initAuthState();

  const user = getCurrentUser();
  if (user) {
    const settings = await getUserSettings(user.id);
    window.userSettings = { ...settings };

    // ⬇️ Save user email to userSettings
    window.userSettings.email = user.email;

    // ⬇️ Apply role override early
    const overrideRole = getOverrideRole();
    if (overrideRole) {
      window.userSettings.original_role = settings.role;
      window.userSettings.role = overrideRole;
      console.log(`🧪 Dev Role Override: ${overrideRole}`);
    }
  }

  // 🔐 Re-init auth globally (safe fallback)
  await initAuthState();

  // ✅ Log session metadata
  const sessionRaw = localStorage.getItem('session');
  if (sessionRaw) {
    try {
      const session = JSON.parse(sessionRaw);
      console.log('👤 User ID:', session?.user?.id);
      console.log('👥 Team ID:', session?.team_id);
    } catch (err) {
      console.error("⚠️ Couldn't parse session JSON:", err);
    }
  }

  initAuthListeners();

  const currentPage = getCurrentPage();

  // 🚧 Redirect to login if necessary
  if (isProtectedPage(currentPage) && !isLoggedIn()) {
    console.warn('🔒 Not logged in, redirecting...');
    window.location.hash = '#/login';
  }

  // 🎨 Apply theme (check for override first)
  const overrideTheme = getOverrideTheme();
  if (overrideTheme) {
    console.log(`🎨 Dev Theme Override: ${overrideTheme}`);
    applyFontTheme(overrideTheme);
    applyColorTheme(overrideTheme);
  } else {
    try {
      await applyContextualTheme(currentPage);
    } catch (err) {
      console.warn('⚠️ Theme fallback triggered:', err.message);
      applyFontTheme('classic');
      applyColorTheme('classic');
    }
  }

  // 🧱 Render layout shell
  renderAppShell();

  // ⏳ Wait one frame to let layout settle, then mount
  requestAnimationFrame(async () => {
    const pageView = document.getElementById('page-view');
    if (!pageView) {
      console.error('❌ #page-view not found!');
      return;
    }

    const newPage = getCurrentPage();

    if (newPage === 'login') {
      const { default: renderLoginPage } = await import('@pages/login/index.js');
      renderLoginPage(pageView);
      return;
    }

    // 🧭 Sidebar if signed in
    if (isLoggedIn() && isProtectedPage(newPage)) {
      const { renderSidebar } = await import('@components/sidebar.js');
      renderSidebar();
    }

    // 🚦 Handle routing
    await handleRouting();
    window.addEventListener('hashchange', handleRouting);

    // 🛠️ Dev Tools and Logger
    if (window.userSettings?.email === DEV_EMAIL) {
      console.log('🛠️ Dev mode active — mounting dev tools and logger...');
      renderDevToolsPanel();
      mountLiveLogger();
      updateLogContext();
    } else {
      console.log('🧪 Dev tools skipped for non-dev user.');
    }
  });
}
