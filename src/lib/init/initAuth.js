import { initAuthState, getCurrentUser } from '@state/userState.js';
import { initAuthListeners } from '@components/AuthGuard.js';

/**
 * Initializes Supabase auth and listeners
 */
export async function initAuth() {
  console.log('🔐 initializeAuth(): Starting Supabase Auth setup...');

  await initAuthState();
  initAuthListeners();

  // 🛠️ SET window.supabaseUser — this is MISSING right now
  const user = getCurrentUser();
  window.supabaseUser = user;

  console.log('✅ Supabase Auth initialized');
}
