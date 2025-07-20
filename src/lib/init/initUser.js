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
import { devLog } from '@utils/devLogger.js';

/**
 * @typedef {Object} Membership
 * @property {string} team_id
 * @property {string} role
 * @property {{ name: string }} teams
 */

export async function initializeUser() {
  let user = getCurrentUser() || restoreUserFromLocalStorage();

  if (!user) user = await fetchUserFromSupabase();
  if (!user) return buildEmptyUserResult();

  const settings = await fetchUserSettings(user.id);
  const profile = await loadUserProfile(user.id);
  const { fontTheme, colorTheme } = parseThemeSettings(profile?.settings);
  applyTheme(colorTheme);

  const memberships = await loadTeamMemberships(user.id);
  const activeRole = determineActiveRole(settings);
  const activeTeam = selectActiveTeam(memberships);

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

  devLog(
    `✅ User initialized: ${JSON.stringify({
      user,
      settings,
      profile,
      memberships,
      activeRole,
      activeTeam,
      fontTheme,
      colorTheme,
    })}`
  );

  return { user, settings, profile, teams: memberships, activeRole, activeTeam };
}

// ------------------------------------------------------------
// Helper Functions
// ------------------------------------------------------------
function restoreUserFromLocalStorage() {
  const storedSession = localStorage.getItem('supabaseSession');
  if (!storedSession) return null;

  try {
    const parsed = JSON.parse(storedSession);
    devLog(`♻️ Restored user from localStorage: ${JSON.stringify(parsed?.user || null)}`);
    return parsed?.user || null;
  } catch (err) {
    devLog(`⚠️ Failed to parse local session: ${err.message}`, 'warn');
    return null;
  }
}

async function fetchUserFromSupabase() {
  const session = await getSession();
  const user = session?.user || null;
  if (user) devLog(`🌐 User loaded from Supabase session: ${JSON.stringify(user)}`);
  else devLog('⚠️ No user found during initialization.', 'warn');
  return user;
}

function buildEmptyUserResult() {
  return {
    user: null,
    settings: null,
    profile: null,
    teams: [],
    activeRole: null,
    activeTeam: null,
  };
}

async function loadUserProfile(userId) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    devLog(`⚠️ Failed to load profile: ${error.message}`, 'warn');
    return null;
  }
  setUserProfile(profile || null);
  return profile;
}

function parseThemeSettings(settings) {
  let fontTheme = 'classic';
  let colorTheme = 'classic';

  if (!settings) {
    devLog('⚠️ No theme settings found in profile, using defaults.', 'warn');
    return { fontTheme, colorTheme };
  }

  try {
    const parsed = typeof settings === 'string' ? JSON.parse(settings) : settings;
    fontTheme = parsed?.font_theme || 'classic';
    colorTheme = parsed?.color_theme || 'classic';
    devLog(`🎨 Theme from profile: font=${fontTheme}, color=${colorTheme}`);
  } catch (err) {
    devLog(`⚠️ Failed to parse user settings JSON: ${err.message}`, 'warn');
  }

  return { fontTheme, colorTheme };
}

async function loadTeamMemberships(userId) {
  const { data, error } = await supabase
    .from('team_memberships')
    .select('team_id, role, teams(name)')
    .eq('user_id', userId);

  if (error) {
    devLog(`⚠️ Failed to load team memberships: ${error.message}`, 'warn');
    return [];
  }

  const memberships = (data || []).map((m) => ({
    team_id: m.team_id,
    role: m.role,
    teams: m.teams?.[0] || { name: 'Unknown Team' },
  }));

  setUserTeams(memberships || []);
  return memberships;
}

function determineActiveRole(settings) {
  let activeRole = settings?.role || 'player';
  const overrideRole = getOverrideRole();

  if (overrideRole) {
    activeRole = overrideRole;
    setActiveRole(overrideRole);
    devLog(`🧪 Dev role override active: ${overrideRole}`);
  } else {
    setActiveRole(activeRole);
  }

  return activeRole;
}

function selectActiveTeam(memberships) {
  if (!memberships.length) return null;
  const activeTeam = memberships[0];
  setActiveTeam(activeTeam.team_id);
  devLog(`🏆 Active team set to: ${activeTeam.teams.name}`);
  return activeTeam;
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
    devLog('🔒 Not logged in — redirecting to login...', 'warn');
    window.location.hash = '#/login';
    return true;
  }
  return false;
}
