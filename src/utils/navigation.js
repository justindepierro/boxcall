// src/utils/navigation.js
import { resetAppToPublic } from '@render/appReset.js';

/**
 * Redirects to a public page after a delay.
 * @param {string} route - The route to navigate to (e.g., 'login').
 * @param {number} delay - Delay before navigation (in milliseconds).
 */
export function delayedRedirect(route, delay = 3000) {
  setTimeout(() => resetAppToPublic(route), delay);
}
