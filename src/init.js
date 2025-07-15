// src/init.js

import { initAuthState, isLoggedIn, getCurrentUser } from '@state/authState.js';
import { initAuthListeners } from '@components/AuthGuard.js';
import { handleRouting } from '@routes/router.js';
import { getUserSettings } from '@lib/teams/user/getUserSettings.js';
import { getOverrideRole } from '@state/devToolState.js';
import { renderDevToolsPanel } from '@components/dev/devToolsPanel.js';
import { mountLiveLogger, updateLogContext } from '@components/dev/liveLogger.js';
import { DEV_EMAIL } from '@config/devConfig.js';
import { applyTheme } from '@utils/themeManager.js';
import { applyContextualTheme } from '@config/themes/themeController.js'; // ✅ New theme flow

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
    const overrideRole = getOverrideRole();

    if (overrideRole) {
      settings.original_role = settings.role;
      settings.role = overrideRole;
      console.log(`🧪 Dev Role Override: ${overrideRole}`);
    }

    window.userSettings = { ...settings, email: user.email };
  }

  initAuthListeners();

  const currentPage = getCurrentPage();

  // 🔒 Redirect to login if not authenticated
  if (isProtectedPage(currentPage) && !isLoggedIn()) {
    console.warn('🔒 Not logged in, redirecting...');
    window.location.hash = '#/login';
    return;
  }

  // 🎨 Apply contextual theme
  try {
    await applyContextualTheme(); // ⬅️ handles overrides, Supabase theme, fallback
  } catch (err) {
    console.error('❌ Theme application failed:', err.message);
    applyTheme('classic'); // safe fallback
  }

  // 🚦 Route & render page
  await handleRouting();
  window.addEventListener('hashchange', handleRouting);

  // ✅ Expose theme switcher for DevTools
  window.BoxCall = window.BoxCall || {};
  window.BoxCall.forceApplyTheme = (themeKey) => {
    console.log(`🎨 Forcing live theme apply: ${themeKey}`);
    applyTheme(themeKey);
  };

  // 🛠️ Dev Tools
  if (window.userSettings?.email === DEV_EMAIL) {
    console.log('🛠️ Dev mode active — mounting dev tools and logger...');
    renderDevToolsPanel();
    mountLiveLogger();
    updateLogContext();
  } else {
    console.log('🧪 Dev tools skipped for non-dev user.');
  }
}
