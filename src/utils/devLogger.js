// src/utils/devLogger.js

import { getUserSettings } from '@state/userState';

const logQueue = [];
const MAX_LOGS = 500;

/**
 * Adds a new log entry with timestamp and triggers UI updates.
 * @param {string} msg
 * @param {'info' | 'warn' | 'error' | 'debug'} [level='info']
 */
export function devLog(msg, level = 'info') {
  const timestamp = `[${new Date().toLocaleTimeString()}]`;
  const formatted = `${timestamp} ${msg}`;
  logQueue.push({ message: formatted, level });

  // Trim logQueue if too large
  if (logQueue.length > MAX_LOGS) logQueue.shift();

  renderLogEntry(formatted, level); // UI update
  console.log(formatted);
  saveLogsToSession();
}

/**
 * Renders a single log entry in the UI panel (if present).
 * @param {string} message
 * @param {'info'|'warn'|'error'|'debug'} level
 */
function renderLogEntry(message, level) {
  const panel = document.getElementById('dev-log-console');
  if (!panel) return;

  const entry = document.createElement('div');
  entry.textContent = message;
  entry.className = getLogClass(level);

  panel.appendChild(entry);
  panel.scrollTop = panel.scrollHeight;
}

/**
 * Retrieves all current logs as an array of strings.
 * @returns {string[]}
 */
export function getDevLogs() {
  return logQueue.map((log) => log.message);
}

/**
 * Clears all logs and updates the panel.
 */
export function clearDevLogs() {
  logQueue.length = 0;
  const panel = document.getElementById('dev-log-console');
  if (panel) panel.innerHTML = '';
  saveLogsToSession();
}

/**
 * Saves logs to session storage.
 */
export function saveLogsToSession() {
  sessionStorage.setItem('dev.logs', JSON.stringify(logQueue));
}

/**
 * Restores logs from session storage.
 */
export function restoreLogsFromSession() {
  const saved = sessionStorage.getItem('dev.logs');
  if (saved) {
    const logs = JSON.parse(saved);
    logQueue.push(...logs);
    renderAllLogs();
  }
}

/**
 * Refreshes the role/theme context section in the dev panel.
 */
export function refreshDevContext() {
  const context = document.getElementById('log-context');
  if (context) {
    context.innerHTML = getContextHTML();
  }
}

/**
 * Builds the HTML snippet for user context.
 */
function getContextHTML() {
  const settings = getUserSettings() || {};
  return `
    <div class="space-y-[2px] font-mono text-[11px] leading-snug text-white/90">
      <div><span class="text-white/60">Page:</span> <code>${location.hash || '(none)'}</code></div>
      <div><span class="text-white/60">Role:</span> <code>${settings.role || 'unknown'}</code></div>
      <div><span class="text-white/60">Team ID:</span> <code>${settings.team_id || 'none'}</code></div>
      <div><span class="text-white/60">Font:</span> <code>${settings.font_theme || 'default'}</code></div>
      <div><span class="text-white/60">Color:</span> <code>${settings.color_theme || 'default'}</code></div>
    </div>
  `;
}

/**
 * Renders all logs into the dev panel (e.g., after restore).
 */
function renderAllLogs() {
  const panel = document.getElementById('dev-log-console');
  if (!panel) return;
  panel.innerHTML = '';
  logQueue.forEach((log) => {
    renderLogEntry(log.message, log.level);
  });
}

/**
 * Maps log level to Tailwind color classes.
 */
function getLogClass(level) {
  switch (level) {
    case 'error':
      return 'text-red-400';
    case 'warn':
      return 'text-yellow-300';
    case 'debug':
      return 'text-purple-300';
    default:
      return 'text-white/80';
  }
}
