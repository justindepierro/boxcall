// src/render/appReset.js
import { renderAppShell } from '@render/renderAppShell.js';
import { navigateTo, handleRouting } from '@routes/router.js';

/**
 * Resets the application to the public layout (login/signup/forgot).
 * @param {string} page - Target page to navigate to (default: 'login').
 */
export async function resetAppToPublic(page = 'login') {
  console.log(`🔄 resetAppToPublic(): Switching to public layout → ${page}`);

  // 1. Render the app shell without the sidebar
  renderAppShell(true); // 'true' means public layout mode

  // 2. Force routing to rebuild public pages
  await handleRouting();

  // 3. Navigate to the requested page
  navigateTo(page);
}

/**
 * Resets the application to the private layout (dashboard).
 * This is called after successful login/signup.
 * @param {string} page - Target private page (default: 'dashboard').
 */
export async function resetAppToPrivate(page = 'dashboard') {
  console.log(`🔐 resetAppToPrivate(): Switching to private layout → ${page}`);

  // 1. Render the app shell with the sidebar
  renderAppShell(false); // 'false' means private layout mode

  // 2. Force routing to rebuild private pages
  await handleRouting();

  // 3. Navigate to the requested page
  navigateTo(page);
}
