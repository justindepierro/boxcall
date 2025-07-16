// src/state/devToolState.js

//import { getCurrentUser } from './authState.js';
import { DEV_EMAIL } from '@config/devConfig.js';

let overrideRole = null;
let overrideTheme = null;
let spoofedUser = null;
let flags = {};

export function setOverrideRole(role) {
  if (!DEV_EMAIL) return;
  overrideRole = role;
  localStorage.setItem('dev.overrideRole', role);
  console.warn('🧪 Role overridden:', role);
}

export function getOverrideRole() {
  return localStorage.getItem('dev.overrideRole') || overrideRole;
}

export function clearOverrideRole() {
  overrideRole = null;
  localStorage.removeItem('dev.overrideRole');
  console.log('🧹 Role override cleared');
}

export function setOverrideTheme(theme) {
  if (!DEV_EMAIL) return;
  overrideTheme = theme;
  localStorage.setItem('dev.overrideTheme', theme);
}

export function getOverrideTheme() {
  if (!DEV_EMAIL) return null;
  return localStorage.getItem('dev.overrideTheme') || overrideTheme;
}

export function setSpoofedUser(userObj) {
  if (!DEV_EMAIL) return;
  spoofedUser = userObj;
  localStorage.setItem('dev.spoofedUser', JSON.stringify(userObj));
}

export function getSpoofedUser() {
  if (!DEV_EMAIL) return null;
  return spoofedUser || JSON.parse(localStorage.getItem('dev.spoofedUser') || 'null');
}

export function setFeatureFlag(key, value) {
  if (!DEV_EMAIL) return;
  flags[key] = value;
  localStorage.setItem(`flag.${key}`, value ? 'true' : 'false');
}

export function getFeatureFlag(key) {
  return localStorage.getItem(`flag.${key}`) === 'true';
}

export function clearDevOverrides() {
  overrideRole = null;
  overrideTheme = null;
  spoofedUser = null;
  flags = {};
  localStorage.removeItem('dev.overrideRole');
  localStorage.removeItem('dev.overrideTheme');
  localStorage.removeItem('dev.spoofedUser');
  Object.keys(localStorage)
    .filter((k) => k.startsWith('flag.'))
    .forEach((k) => localStorage.removeItem(k));
}
