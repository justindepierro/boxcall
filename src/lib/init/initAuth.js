import { initAuthState, getCurrentUser, setSupabaseUser } from '@state/userState.js';

import { initAuthListeners } from '@components/AuthGuard.js';

/**
 * Initializes Supabase auth and listeners
 */
export async function initAuth() {
  console.log('🔐 initializeAuth(): Starting Supabase Auth setup...');

  await initAuthState();
  initAuthListeners();

  const user = getCurrentUser();
  setSupabaseUser(user); // Store in state
  console.log('✅ Supabase Auth initialized:', user);
}
