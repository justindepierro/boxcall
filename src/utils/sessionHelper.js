// src/utils/sessionHelper.js
import { devLog } from './devLogger';

/**
 * Enables a persistent session (stored in localStorage).
 */
export function enablePersistentSession() {
  localStorage.setItem('supabase-temporary', 'false');
  sessionStorage.removeItem('supabase-temporary');
  devLog('✅ Persistent session enabled.');
}

/**
 * Enables a temporary (non-persistent) session (stored in sessionStorage).
 */
export function enableTemporarySession() {
  localStorage.setItem('supabase-temporary', 'true');
  devLog('⚠️ Session will NOT persist beyond this session.');
}

/**
 * Checks if the session is temporary (non-persistent).
 * @returns {boolean}
 */
export function isTemporarySession() {
  return localStorage.getItem('supabase-temporary') === 'true';
}

/**
 * Clears the session flag (e.g., on logout).
 */
export function clearSessionPersistence() {
  localStorage.removeItem('supabase-temporary');
  devLog('🧹 Session persistence cleared.');
}
