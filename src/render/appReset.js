// src/render/appReset.js
import { clearAuthState } from '@state/userState.js';
import { renderAppShell } from '@render/renderAppShell.js';
import { handleRouting, navigateTo } from '@routes/router.js';
import { initSidebar } from '@components/sidebar/initSidebar';

/**
 * Resets the application to the public (unauthenticated) state.
 * @param {string} [page='login'] - The public page to navigate to (default is 'login').
 */
export async function resetAppToPublic(page = 'login') {
  console.log(
    `🚪 resetAppToPublic(): Resetting app shell to public state. Redirecting to: ${page}`
  );

  // 1. Clear all user-related state
  clearAuthState();

  // 2. Render the public app shell (no sidebar)
  renderAppShell(true); // Passing true means "public layout"

  // 3. Navigate to the given page (default login)
  navigateTo(page);

  // 4. Re-run routing to ensure correct page rendering
  await handleRouting();
}

/**
 * Resets the application to the private (authenticated) state.
 * @param {string} [page='dashboard'] - The private page to navigate to (default is 'dashboard').
 */
export async function resetAppToPrivate(page = 'dashboard') {
  console.log(`🔒 resetAppToPrivate(): Switching to private layout. Redirecting to: ${page}`);

  renderAppShell(false); // 1. Render the private app shell with sidebar
  await initSidebar(); // 2. Initialize sidebar state and events
  navigateTo(page); // 3. Navigate to target private page
  await handleRouting(); // 4. Render that page
}
