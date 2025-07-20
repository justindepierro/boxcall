/* eslint-disable no-console */

/** @typedef {'info' | 'warn' | 'error' | 'debug'} LogLevel */

// 🛡️ Safe log queue initialization
const logQueue = Array.isArray(globalThis.__logQueue) ? globalThis.__logQueue : [];
globalThis.__logQueue = logQueue;

const MAX_LOGS = 500;

/**
 * Main developer logger.
 * @param {string} msg - The message to log.
 * @param {LogLevel} [level='info'] - Log level.
 */
export function devLog(msg, level = 'info') {
  const timestamp = `[${new Date().toLocaleTimeString()}]`;
  const formatted = `${timestamp} ${msg}`;

  logQueue.push({ message: formatted, level });
  if (logQueue.length > MAX_LOGS) logQueue.shift();

  renderLogEntry(formatted, level);
  directConsoleLog(formatted, level);
  saveLogsToSession();
}

/**
 * Logs an error-level message.
 * @param {string} msg
 */
export function devError(msg) {
  devLog(msg, 'error');
}

/**
 * Logs a warning-level message.
 * @param {string} msg
 */
export function devWarn(msg) {
  devLog(msg, 'warn');
}

/**
 * Logs a debug-level message.
 * @param {string} msg
 */
export function devDebug(msg) {
  devLog(msg, 'debug');
}

/**
 * Ensures we don't call devLog recursively by directly using console.
 * @param {string} formatted
 * @param {LogLevel} level
 */
function directConsoleLog(formatted, level) {
  switch (level) {
    case 'error':
      console.error(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    default:
      console.info(formatted);
  }
}

/**
 * Renders a single log entry in the UI panel (if present).
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
 * Returns all logs.
 * @returns {string[]}
 */
export function getDevLogs() {
  return logQueue.map((log) => log.message);
}

/**
 * Clears logs from memory and UI.
 */
export function clearDevLogs() {
  logQueue.length = 0;
  const panel = document.getElementById('dev-log-console');
  if (panel) panel.innerHTML = '';
  saveLogsToSession();
}

/**
 * Saves logs to sessionStorage.
 */
export function saveLogsToSession() {
  try {
    sessionStorage.setItem('dev.logs', JSON.stringify(logQueue));
  } catch (e) {
    console.warn('⚠️ Failed to save logs:', e);
  }
}

/**
 * Restores logs from sessionStorage.
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
 * Refreshes the developer context panel.
 */
export function refreshDevContext() {
  const context = document.getElementById('log-context');
  if (context) {
    context.innerHTML = getContextHTML();
  }
}

/**
 * Dynamically loads user settings (avoids circular imports).
 */
function getSafeUserSettings() {
  try {
    const { getUserSettings } = require('@state/userState'); // Dynamic require
    return getUserSettings();
  } catch {
    return {};
  }
}

function getContextHTML() {
  const settings = getSafeUserSettings() || {};
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

function renderAllLogs() {
  const panel = document.getElementById('dev-log-console');
  if (!panel) return;
  panel.innerHTML = '';
  logQueue.forEach((log) => renderLogEntry(log.message, log.level));
}

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
