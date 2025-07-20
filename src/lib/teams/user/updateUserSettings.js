// src/lib/teams/user/updateUserSettings.js
import { supabase } from '@auth/supabaseClient.js';

/**
 * Updates user settings in the `profiles` table.
 * - Updates profile fields (full_name, bio, etc.).
 * - Merges updates into `profiles.settings` JSONB (e.g., font_theme, color_theme).
 * - Optionally updates team role in `team_memberships`.
 *
 * @param {string} userId - Supabase user ID
 * @param {object} updates - Fields to update (e.g., { full_name, bio, avatar_url, settings })
 * @param {string} [teamId] - Optional team ID if updating a team-specific role
 */
export async function updateUserSettings(userId, updates, teamId = null) {
  try {
    // -------------------------
    // 1. Update Profile Columns
    // -------------------------
    const profileData = {};
    if (updates.full_name) profileData.full_name = updates.full_name;
    if (updates.bio) profileData.bio = updates.bio;
    if (updates.avatar_url) profileData.avatar_url = updates.avatar_url;
    if (updates.phone) profileData.phone = updates.phone;
    if (updates.role) profileData.role = updates.role; // fallback role

    // -------------------------
    // 2. Update Settings (JSONB)
    // -------------------------
    if (updates.settings || updates.font_theme || updates.color_theme) {
      const settingsUpdate = updates.settings || {};
      if (updates.font_theme) settingsUpdate.font_theme = updates.font_theme;
      if (updates.color_theme) settingsUpdate.color_theme = updates.color_theme;

      profileData.settings = supabase.rpc('jsonb_merge_patch', {
        column: 'settings',
        value: settingsUpdate,
      });
    }

    // -------------------------
    // 3. Perform Profile Update
    // -------------------------
    if (Object.keys(profileData).length > 0) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId);

      if (profileError) throw new Error(`Profile update failed: ${profileError.message}`);
    }

    // -------------------------
    // 4. Team Role Update
    // -------------------------
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
