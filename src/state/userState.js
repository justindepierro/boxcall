// src/state/userState.js
import { devLog, devError } from '@utils/devLogger.js';

import { getUser, getSession } from '../auth/auth.js';

let user = null;
let session = null;
let userSettings = null;
let supabaseUser = null;

/* ----------------------------- AUTH MANAGEMENT ----------------------------- */
export async function initAuthState() {
  session = await getSession();
  user = await getUser();
  devLog(`🔐 Auth initialized: ${JSON.stringify({ session, user })}`);
}

export function getCurrentUser() {
  return user;
}

export function getCurrentSession() {
  return session;
}

export function isLoggedIn() {
  return !!user && !!session;
}

export function clearAuthState() {
  user = null;
  session = null;
  userSettings = null;
  devLog('🔒 Auth state cleared');
}

/* --------------------------- USER SETTINGS STATE --------------------------- */
export function setUserSettings(settings) {
  userSettings = settings;
  devLog(`⚙️ userSettings updated: ${JSON.stringify(userSettings)}`);
}

export function getUserSettings() {
  return userSettings;
}

/**
 * Returns the current active role (default: 'player').
 * @returns {string|null}
 */
export function getActiveRole() {
  return userSettings?.activeRole || userSettings?.role || 'player';
}

export function setActiveRole(role) {
  if (!userSettings) userSettings = {};
  userSettings.activeRole = role;
  devLog(`🎭 Active role set to: ${role}`);
}

/* --------------------------- PROFILE & TEAMS --------------------------- */
export function setUserProfile(profile) {
  if (!userSettings) userSettings = {};
  userSettings.profile = profile;
}

export function getUserProfile() {
  return userSettings?.profile || null;
}

export function setUserTeams(teams) {
  if (!userSettings) userSettings = {};
  userSettings.teams = teams;
  devLog(`🏈 Teams updated: ${JSON.stringify(teams)}`);
}

export function getUserTeams() {
  return userSettings?.teams || [];
}

/**
 * Returns the currently active team (if any).
 */
export function getActiveTeam() {
  return userSettings?.activeTeam || null;
}

/**
 * Set the active team by team_id.
 * @param {string} teamId
 */
export function setActiveTeam(teamId) {
  if (!userSettings) userSettings = {};
  const teams = getUserTeams();
  const team = teams.find((t) => t.team_id === teamId);
  if (!team) {
    devError(`⚠️ Team with id ${teamId} not found in user teams.`);
    return false;
  }
  userSettings.activeTeam = team;
  devLog(`🏆 Active team set to: ${team.teams?.name || teamId}`);
  return true;
}

/**
 * Set the active team by index (0-based).
 * @param {number} index
 */
export function setActiveTeamByIndex(index = 0) {
  const teams = getUserTeams();
  if (teams[index]) {
    userSettings.activeTeam = teams[index];
    devLog(`🏆 Active team set to: ${teams[index].teams?.name || teams[index].team_id}`);
    return true;
  }
  devError(`⚠️ No team found at index ${index}`);
  return false;
}

/* ------------------------------ SUPABASE USER ------------------------------ */
export function setSupabaseUser(userObj) {
  supabaseUser = userObj;
}

export function getSupabaseUser() {
  return supabaseUser;
}

/**
 * Fully resets all user state.
 */
export function resetUserState() {
  user = null;
  session = null;
  userSettings = null;
  supabaseUser = null;
  devLog('🔄 User state fully reset');
}
