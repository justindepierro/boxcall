// src/lib/user/getUserSettings.js
import { supabase } from '@auth/supabaseClient.js';

/**
 * Fetches user_settings row for a given user_id
 * @param {string} user_id - Supabase user ID
 * @returns {object|null} settings object or null if error
 */
export async function getUserSettings(user_id) {
  if (!user_id) return null;

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user_id)
    .single();

  if (error) {
    console.error('❌ getUserSettings() error:', error.message);
    return null;
  }

  return data;
}
