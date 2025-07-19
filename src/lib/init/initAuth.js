// /lib/init/initAuth.js
import { supabase } from '@auth/supabaseClient.js';
import { initAuthState, setSupabaseUser } from '@state/userState.js';
import { initAuthListeners } from '@components/AuthManager.js';

/**
 * Initializes Supabase auth and restores session if present.
 */
export async function initAuth() {
  console.log('🔐 initAuth(): Starting Supabase Auth setup...');

  // Initialize state
  await initAuthState();

  // Fetch current session
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('❌ initAuth(): Could not fetch session:', error);
  } else {
    const session = data?.session;
    setSupabaseUser(session?.user || null);
    console.log('✅ initAuth(): Session restored:', session?.user);
  }

  // Start auth state listeners
  initAuthListeners();
}
