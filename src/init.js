
import { initRouter } from './routes/router.js';
import { applyContextualTheme } from './config/themes/themeController.js';
import { applyFontTheme, applyColorTheme } from './config/themes/themeLoader.js';
import { renderSidebar } from './components/sidebar.js';
import { renderLoadingScreen } from './js/loading.js';
import { initAuthListeners } from './components/auth/authGuard.js';

const isProtectedPage = (page) => !['login', 'signup', 'forgot'].includes(page);

export async function initApp() {
  console.log('📦 Initializing BoxCall App...');
  initAuthListeners();

  const currentPage = location.hash.replace('#', '') || 'dashboard';
  const sessionStr = localStorage.getItem('session');
  const session = sessionStr ? JSON.parse(sessionStr) : null;
  const userId = session?.user?.id;

  if (isProtectedPage(currentPage) && !userId) {
    location.hash = '#login';
    return;
  }

  try {
    await applyContextualTheme(currentPage);
    console.log(`🎨 Theme applied based on ${currentPage}`);
  } catch (err) {
    console.warn('⚠️ Failed to apply theme:', err.message);
    applyFontTheme('font-coach');
    applyColorTheme('light');
  }

  if (userId && isProtectedPage(currentPage)) {
    renderSidebar();
  }

  const pageView = document.getElementById('page-view');
  if (pageView) renderLoadingScreen(pageView);

  initRouter();
}