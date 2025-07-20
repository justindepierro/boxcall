import { supabase } from '@auth/supabaseClient.js';
import { initAuthState, setSupabaseUser } from '@state/userState.js';
import { initAuthListeners } from '@components/AuthManager.js';
import { devLog } from '@utils/devLogger.js';

/**
 * Initializes Supabase auth and restores session if present.
 */
export async function initAuth() {
  devLog('🔐 initAuth(): Starting Supabase Auth setup...', 'info');

  // Initialize state
  await initAuthState();

  // Fetch current session
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    devLog(`❌ initAuth(): Could not fetch session: ${error.message}`, 'error');
  } else {
    const session = data?.session;
    setSupabaseUser(session?.user || null);
    devLog(`✅ initAuth(): Session restored: ${JSON.stringify(session?.user)}`, 'info');
  }

  // Start auth state listeners
  initAuthListeners();
}
