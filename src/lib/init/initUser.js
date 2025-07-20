// src/lib/init/initUser.js

import { supabase } from '@auth/supabaseClient.js';
import {
  getCurrentUser,
  setUserSettings,
  setUserProfile,
  setUserTeams,
  setActiveRole,
  setActiveTeam,
} from '@state/userState.js';
import { getUserSettings as fetchUserSettings } from '@lib/teams/user/getUserSettings.js';
import { getOverrideRole } from '@state/devToolState.js';
import { getSession } from '@auth/auth.js';

/**
 * @typedef {Object} Membership
 * @property {string} team_id
 * @property {string} role
 * @property {{ name: string }} teams
 */

/**
 * Loads the current user's settings, Supabase profile, and team memberships.
 *
 * @returns {Promise<{ user: object|null, settings: object|null, profile: object|null, teams: Membership[], activeRole: string, activeTeam: Membership|null }>}
 */
export async function initializeUser() {
  let user = getCurrentUser();

  // 🚀 Restore user from localStorage if not in state
  if (!user) {
    const storedSession = localStorage.getItem('supabaseSession');
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        user = parsed?.user || null;
        console.log('♻️ Restored user from localStorage:', user);
      } catch (err) {
        console.warn('⚠️ Failed to parse local session:', err);
      }
    }
  }

  // 🔄 Fallback: fetch from Supabase
  if (!user) {
    const session = await getSession();
    user = session?.user || null;
    if (user) console.log('🌐 User loaded from Supabase session:', user);
  }

  if (!user) {
    console.warn('⚠️ No user found during initialization.');
    return {
      user: null,
      settings: null,
      profile: null,
      teams: [],
      activeRole: null,
      activeTeam: null,
    };
  }

  // Fetch legacy user settings (optional)
  const settings = await fetchUserSettings(user.id);

  // Fetch Supabase profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) console.warn('⚠️ Failed to load profile', profileError);
  setUserProfile(profile || null);

  // Fetch team memberships
  const { data: membershipsData, error: membershipsError } = await supabase
    .from('team_memberships')
    .select('team_id, role, teams(name)')
    .eq('user_id', user.id);

  if (membershipsError) console.warn('⚠️ Failed to load team memberships', membershipsError);

  /** @type {Membership[]} */
  const memberships = (membershipsData || []).map((m) => ({
    team_id: m.team_id,
    role: m.role,
    teams: m.teams?.[0] || { name: 'Unknown Team' },
  }));

  setUserTeams(memberships || []);

  // Apply dev override role
  let activeRole = settings?.role || 'player';
  const overrideRole = getOverrideRole();
  if (overrideRole) {
    activeRole = overrideRole;
    setActiveRole(overrideRole);
    console.log(`🧪 Dev role override active: ${overrideRole}`);
  } else {
    setActiveRole(activeRole);
  }

  // Auto-select the first team as activeTeam if available
  let activeTeam = null;
  if (memberships.length > 0) {
    activeTeam = memberships[0];
    setActiveTeam(activeTeam.team_id);
    console.log(`🏆 Active team set to: ${activeTeam.teams.name}`);
  }

  // Store user settings
  setUserSettings({
    ...settings,
    email: user.email,
    profile,
    teams: memberships,
    activeRole,
    activeTeam,
  });

  console.log('✅ User initialized:', {
    user,
    settings,
    profile,
    memberships,
    activeRole,
    activeTeam,
  });
  return { user, settings, profile, teams: memberships, activeRole, activeTeam };
}

/**
 * Redirect to login if not authorized for current page.
 */
export function handleAuthRedirect(currentPage, publicPages = ['login', 'signup', 'forgot']) {
  const isPublic = publicPages.includes(currentPage);
  if (!isPublic && !getCurrentUser()) {
    console.warn('🔒 Not logged in — redirecting to login...');
    window.location.hash = '#/login';
    return true;
  }
  return false;
}
