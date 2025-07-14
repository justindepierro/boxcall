// src/lib/user/getUserSettings.js
import { supabase } from '@auth/supabaseClient.js';

/**
 * Fetches user_settings row for a given user_id
 * @param {string} user_id - Supabase user ID
 * @returns {object|null} settings object or null if error
 */

export async function getUserSettings(userId) {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*') // or explicitly select needed fields
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('❌ Failed to fetch user settings:', error.message);
    return null;
  }

  return data;
}
