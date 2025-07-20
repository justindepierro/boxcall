// src/lib/teams/user/updateUserSettings.js
import { supabase } from '@auth/supabaseClient.js';

/**
 * Updates user settings in the profiles table.
 * Optionally updates team role in team_memberships if role or team_id is provided.
 *
 * @param {string} userId - Supabase user ID
 * @param {object} updates - Fields to update (e.g., { full_name, bio, avatar_url, role })
 * @param {string} [teamId] - Optional team ID if updating a team-specific role
 */
export async function updateUserSettings(userId, updates, teamId = null) {
  try {
    // 1. Update the profiles table
    if (updates.full_name || updates.bio || updates.avatar_url || updates.phone || updates.role) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: updates.full_name,
          bio: updates.bio,
          avatar_url: updates.avatar_url,
          phone: updates.phone,
          role: updates.role, // fallback role if no team role
        })
        .eq('id', userId);

      if (profileError) throw new Error(`Profile update failed: ${profileError.message}`);
    }

    // 2. Optionally update the team role
    if (teamId && updates.role) {
      const { error: membershipError } = await supabase
        .from('team_memberships')
        .update({ role: updates.role })
        .eq('user_id', userId)
        .eq('team_id', teamId);

      if (membershipError) throw new Error(`Team role update failed: ${membershipError.message}`);
    }

    console.log('✅ User settings updated:', { userId, updates, teamId });
  } catch (err) {
    console.error('❌ Failed to update user settings:', err);
    throw err;
  }
}
