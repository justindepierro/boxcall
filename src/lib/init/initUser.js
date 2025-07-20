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
import { applyTheme } from '@utils/themeManager.js';

/**
 * @typedef {Object} Membership
 * @property {string} team_id
 * @property {string} role
 * @property {{ name: string }} teams
 */

/**
 * Initializes the current user's state:
 *  - Loads Supabase user and profile
 *  - Fetches team memberships
 *  - Applies dev role overrides
 *  - Applies user or default theme
 *
 * @returns {Promise<{
 *   user: object|null,
 *   settings: object|null,
 *   profile: object|null,
 *   teams: Membership[],
 *   activeRole: string|null,
 *   activeTeam: Membership|null
 * }>}
 */
export async function initializeUser() {
  let user = getCurrentUser();

  // ------------------------------------------------------------
  // 1️⃣ Restore user from localStorage if missing
  // ------------------------------------------------------------
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

  // ------------------------------------------------------------
  // 2️⃣ Fallback: fetch from Supabase session if still missing
  // ------------------------------------------------------------
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

  // ------------------------------------------------------------
  // 3️⃣ Fetch legacy user settings (optional)
  // ------------------------------------------------------------
  const settings = await fetchUserSettings(user.id);

  // ------------------------------------------------------------
  // 4️⃣ Fetch Supabase profile (with theme JSONB)
  // ------------------------------------------------------------
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.warn('⚠️ Failed to load profile', profileError);
  } else {
    setUserProfile(profile || null);
  }

  // ------------------------------------------------------------
  // 5️⃣ Parse theme settings from profile.settings JSONB
  // ------------------------------------------------------------
  let fontTheme = 'classic';
  let colorTheme = 'classic';

  if (profile?.settings) {
    try {
      const parsedSettings =
        typeof profile.settings === 'string' ? JSON.parse(profile.settings) : profile.settings;

      fontTheme = parsedSettings?.font_theme || 'classic';
      colorTheme = parsedSettings?.color_theme || 'classic';

      console.log(`🎨 Theme from profile: font=${fontTheme}, color=${colorTheme}`);

      // Apply theme immediately
      applyTheme(colorTheme);
    } catch (err) {
      console.warn('⚠️ Failed to parse user settings JSON:', err);
    }
  } else {
    console.warn('⚠️ No theme settings found in profile, using defaults.');
    applyTheme(colorTheme);
  }

  // ------------------------------------------------------------
  // 6️⃣ Fetch team memberships
  // ------------------------------------------------------------
  const { data: membershipsData, error: membershipsError } = await supabase
    .from('team_memberships')
    .select('team_id, role, teams(name)')
    .eq('user_id', user.id);

  if (membershipsError) {
    console.warn('⚠️ Failed to load team memberships', membershipsError);
  }

  /** @type {Membership[]} */
  const memberships = (membershipsData || []).map((m) => ({
    team_id: m.team_id,
    role: m.role,
    teams: m.teams?.[0] || { name: 'Unknown Team' },
  }));

  setUserTeams(memberships || []);

  // ------------------------------------------------------------
  // 7️⃣ Apply dev override role if present
  // ------------------------------------------------------------
  let activeRole = settings?.role || 'player';
  const overrideRole = getOverrideRole();
  if (overrideRole) {
    activeRole = overrideRole;
    setActiveRole(overrideRole);
    console.log(`🧪 Dev role override active: ${overrideRole}`);
  } else {
    setActiveRole(activeRole);
  }

  // ------------------------------------------------------------
  // 8️⃣ Auto-select the first team as activeTeam if available
  // ------------------------------------------------------------
  let activeTeam = null;
  if (memberships.length > 0) {
    activeTeam = memberships[0];
    setActiveTeam(activeTeam.team_id);
    console.log(`🏆 Active team set to: ${activeTeam.teams.name}`);
  }

  // ------------------------------------------------------------
  // 9️⃣ Store user settings globally
  // ------------------------------------------------------------
  setUserSettings({
    ...settings,
    email: user.email,
    profile,
    teams: memberships,
    activeRole,
    activeTeam,
    fontTheme,
    colorTheme,
  });

  console.log('✅ User initialized:', {
    user,
    settings,
    profile,
    memberships,
    activeRole,
    activeTeam,
    fontTheme,
    colorTheme,
  });

  return { user, settings, profile, teams: memberships, activeRole, activeTeam };
}

/**
 * Redirect to login if not authorized for current page.
 * @param {string} currentPage
 * @param {string[]} publicPages
 * @returns {boolean}
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
