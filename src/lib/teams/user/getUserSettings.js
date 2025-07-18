// src/lib/user/getUserSettings.js
import { supabase } from '@auth/supabaseClient.js';

/**
 * Fetches user_settings row for a given userId.
 * @param {string} userId - Supabase user ID
 * @returns {Promise<object|null>} settings object or null if error
 */
export async function getUserSettings(userId) {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*') // Consider selecting only needed fields for performance
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('❌ Failed to fetch user settings:', error.message);
    return null;
  }

  return data;
}
