// src/js/init.js

import { applyContextualTheme } from '../src/config/themes/themeController.js';
import { applyFontTheme, applyColorTheme } from '../src/config/themes/themeLoader.js';
import { initAuthListeners } from '../src/components/authGuard.js';
import { renderAppShell } from '../src/render/renderAppShell.js';
// import { renderLoadingScreen } from './loading.js';     // Optional
import { handleRouting } from '../src/routes/router.js';       // Enable later

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
  initAuthListeners();

  const currentPage = getCurrentPage();
  const sessionStr = localStorage.getItem('session');
  const sessionObj = sessionStr ? JSON.parse(sessionStr) : null;
  const userId = sessionObj?.user?.id || null;

  // 🔐 Redirect to login if needed
  if (isProtectedPage(currentPage) && !userId) {
    console.warn('🔒 No session, redirecting to login...');
    window.location.hash = '#/login';
    return;
  }

  // 🎨 Theme Setup
  try {
    await applyContextualTheme(currentPage);
    console.log(`🎨 Theme applied based on: ${currentPage}`);
  } catch (err) {
    console.warn('⚠️ Failed to apply theme:', err.message);
    applyFontTheme('classic');
    applyColorTheme('classic');
  }

  // 🧱 Layout Shell Mount
  renderAppShell();

    // ✅ Render sidebar only if user is logged in and page is protected
  if (userId && isProtectedPage(currentPage)) {
    const { renderSidebar } = await import('../src/components/sidebar.js');
    renderSidebar();
  }

  // 🧾 Optional Direct Page Render for Public Routes
  const pageView = document.getElementById('page-view');
  if (currentPage === 'login') {
    const { default: renderLoginPage } = await import('../src/pages/login/index.js');
    renderLoginPage(pageView);
    return; // 🛑 Stop here; no router needed for login page
  }

  // 🧭 Boot the router (initial + reactive)
  await handleRouting(); // Render route immediately
  window.addEventListener('hashchange', handleRouting); // React to hash changes
}