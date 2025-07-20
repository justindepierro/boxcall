// src/state/userState.js

import { getUser, getSession } from '../auth/auth.js';

let user = null;
let session = null;
let userSettings = null;
let supabaseUser = null;

/* ----------------------------- AUTH MANAGEMENT ----------------------------- */
export async function initAuthState() {
  session = await getSession();
  user = await getUser();
  console.log('🔐 Auth initialized:', { session, user });
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
  console.log('🔒 Auth state cleared');
}

/* --------------------------- USER SETTINGS STATE --------------------------- */
export function setUserSettings(settings) {
  userSettings = settings;
  console.log('⚙️ userSettings updated:', userSettings);
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
  console.log(`🎭 Active role set to: ${role}`);
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
  console.log('🏈 Teams updated:', teams);
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
    console.warn(`⚠️ Team with id ${teamId} not found in user teams.`);
    return false;
  }
  userSettings.activeTeam = team;
  console.log(`🏆 Active team set to: ${team.teams?.name || teamId}`);
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
    console.log(`🏆 Active team set to: ${teams[index].teams?.name || teams[index].team_id}`);
    return true;
  }
  console.warn(`⚠️ No team found at index ${index}`);
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
  console.log('🔄 User state fully reset');
}
