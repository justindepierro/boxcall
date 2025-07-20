// src/lib/user/getUserSettings.js
import { supabase } from '@auth/supabaseClient.js';

/**
 * Fetches user profile and team memberships for a given userId.
 * @param {string} userId - Supabase user ID
 * @returns {Promise<object|null>} settings object or null if error
 */
export async function getUserSettings(userId) {
  try {
    // 1. Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, bio, role, phone')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('❌ Failed to fetch profile:', profileError.message);
      return null;
    }

    // 2. Fetch team memberships
    const { data: memberships, error: membershipsError } = await supabase
      .from('team_memberships')
      .select(
        `
        team_id,
        role,
        teams ( name )
        `
      )
      .eq('user_id', userId);

    if (membershipsError) {
      console.error('❌ Failed to fetch team memberships:', membershipsError.message);
      return { profile, teams: [], activeTeam: null, role: profile.role };
    }

    // 3. Determine active team (first one by default)
    const activeTeam = memberships.length > 0 ? memberships[0].team_id : null;
    const activeRole = memberships.length > 0 ? memberships[0].role : profile.role;

    return {
      profile,
      teams: memberships || [],
      activeTeam,
      role: activeRole,
    };
  } catch (err) {
    console.error('❌ Unexpected error in getUserSettings:', err);
    return null;
  }
}
