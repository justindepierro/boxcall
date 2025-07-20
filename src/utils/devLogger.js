/* eslint-disable no-console */

import { getUserSettings } from '@state/userState';

/** @typedef {'info' | 'warn' | 'error' | 'debug'} LogLevel */

const logQueue = [];
const MAX_LOGS = 500;

/**
 * Adds a new log entry with timestamp and triggers UI updates.
 * @param {string} msg
 * @param {LogLevel} [level='info']
 */
export function devLog(msg, level = 'info') {
  const timestamp = `[${new Date().toLocaleTimeString()}]`;
  const formatted = `${timestamp} ${msg}`;
  logQueue.push({ message: formatted, level });

  if (logQueue.length > MAX_LOGS) logQueue.shift();

  renderLogEntry(formatted, level);
  if (level === 'error') console.error(formatted);
  else if (level === 'warn') console.warn(formatted);
  else console.info(formatted);

  saveLogsToSession();
}

/**
 * Specialized logger for errors.
 * @param {string} msg
 */
export function devError(msg) {
  devLog(msg, 'error');
}

/**
 * Specialized logger for warnings.
 * @param {string} msg
 */
export function devWarn(msg) {
  devLog(msg, 'warn');
}

/**
 * Specialized logger for debug messages.
 * @param {string} msg
 */
export function devDebug(msg) {
  devLog(msg, 'debug');
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

export function getDevLogs() {
  return logQueue.map((log) => log.message);
}

export function clearDevLogs() {
  logQueue.length = 0;
  const panel = document.getElementById('dev-log-console');
  if (panel) panel.innerHTML = '';
  saveLogsToSession();
}

export function saveLogsToSession() {
  sessionStorage.setItem('dev.logs', JSON.stringify(logQueue));
}

export function restoreLogsFromSession() {
  const saved = sessionStorage.getItem('dev.logs');
  if (saved) {
    const logs = JSON.parse(saved);
    logQueue.push(...logs);
    renderAllLogs();
  }
}

export function refreshDevContext() {
  const context = document.getElementById('log-context');
  if (context) {
    context.innerHTML = getContextHTML();
  }
}

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
