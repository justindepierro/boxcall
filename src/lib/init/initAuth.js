import { initAuthState, getCurrentUser, setSupabaseUser } from '@state/userState.js';
import { initAuthListeners } from '@components/AuthManager.js';

export async function initAuth() {
  console.log('🔐 initializeAuth(): Starting Supabase Auth setup...');

  await initAuthState();
  initAuthListeners(); // Now from AuthManager

  const user = getCurrentUser();
  setSupabaseUser(user);
  console.log('✅ Supabase Auth initialized:', user);
}
