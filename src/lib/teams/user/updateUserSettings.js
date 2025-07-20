// src/lib/users/updateUserSettings.js

import { supabase } from '@auth/supabaseClient.js';
import { devLog } from '@utils/devLogger';

/**
 * Updates a user's profile and optional team role in Supabase.
 *
 * @param {string} userId - Supabase user ID
 * @param {object} updates - Fields to update (e.g., { full_name, bio, avatar_url, settings })
 * @param {string} [teamId] - Optional team ID if updating a team-specific role
 */
export async function updateUserSettings(userId, updates, teamId = null) {
  try {
    // Build the profile data object
    const profileData = buildProfileData(updates);

    // 1. Update Profile Columns
    if (Object.keys(profileData).length > 0) {
      await updateProfile(userId, profileData);
    }

    // 2. Team Role Update
    if (teamId && updates.role) {
      await updateTeamRole(userId, teamId, updates.role);
    }

    devLog(
      `✅ User settings updated → userId=${userId}, updates=${JSON.stringify(updates)}, teamId=${teamId || 'none'}`
    );
  } catch (err) {
    devLog(`❌ Failed to update user settings: ${err.message}`, 'error');
    throw err;
  }
}

// ------------------------------------------------------------
// Helper Functions
// ------------------------------------------------------------

/**
 * Builds the profileData object from the provided updates.
 * @param {object} updates
 * @returns {object} profileData
 */
function buildProfileData(updates) {
  const profileData = {};
  const basicFields = ['full_name', 'bio', 'avatar_url', 'phone', 'role'];

  // Copy simple fields
  for (const field of basicFields) {
    if (updates[field]) profileData[field] = updates[field];
  }

  // Handle settings (JSONB)
  if (updates.settings || updates.font_theme || updates.color_theme) {
    const settingsUpdate = {
      ...(updates.settings || {}),
      ...(updates.font_theme ? { font_theme: updates.font_theme } : {}),
      ...(updates.color_theme ? { color_theme: updates.color_theme } : {}),
    };

    profileData.settings = supabase.rpc('jsonb_merge_patch', {
      column: 'settings',
      value: settingsUpdate,
    });
  }

  return profileData;
}

/**
 * Updates the profile row in the 'profiles' table.
 * @param {string} userId
 * @param {object} profileData
 */
async function updateProfile(userId, profileData) {
  const { error } = await supabase.from('profiles').update(profileData).eq('id', userId);

  if (error) throw new Error(`Profile update failed: ${error.message}`);
}

/**
 * Updates the team role for a given user and team.
 * @param {string} userId
 * @param {string} teamId
 * @param {string} role
 */
async function updateTeamRole(userId, teamId, role) {
  const { error } = await supabase
    .from('team_memberships')
    .update({ role })
    .eq('user_id', userId)
    .eq('team_id', teamId);

  if (error) throw new Error(`Team role update failed: ${error.message}`);
}
