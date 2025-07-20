// src/render/appReset.js
import { renderPublicAppShell, renderPrivateAppShell } from '@render/renderAppShell.js';
import { navigateTo, handleRouting } from '@routes/router.js';
import { devLog } from '@utils/devLogger.js';

/**
 * Resets the application to the public layout (login/signup/forgot).
 * @param {string} page - Target page to navigate to (default: 'login').
 */
export async function resetAppToPublic(page = 'login') {
  devLog(`🔄 resetAppToPublic(): Switching to public layout → ${page}`);

  // 1. Render the public app shell
  renderPublicAppShell();

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
  devLog(`🔐 resetAppToPrivate(): Switching to private layout → ${page}`);

  // 1. Render the private app shell
  renderPrivateAppShell();

  // 2. Force routing to rebuild private pages
  await handleRouting();

  // 3. Navigate to the requested page
  navigateTo(page);
}
