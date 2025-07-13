// src/lib/teams/user/updateUserSettings.js
import { supabase } from '@auth/supabaseClient.js';

export async function updateUserSettings(userId, updates) {
  const { error } = await supabase.from('user_settings').update(updates).eq('user_id', userId);

  if (error) throw error;
}
