// src/components/dev/liveLogger.js

import { getDevLogs, clearDevLogs } from '@utils/devLogger.js';
import { DEV_EMAIL } from '@config/devConfig.js';
import { getUserSettings } from '@state/userState.js';
import { qs, getChecked } from '@utils/domHelper.js';

/**
 * Mounts the floating live logger panel for developers.
 * Displays recent logs, user context, and optional auto-refresh.
 */
export function mountLiveLogger() {
  const user = getUserSettings() || {};
  if (user.email !== DEV_EMAIL) return;

  // Avoid duplicates
  if (qs('#live-log-wrapper')) return;

  // === Wrapper ===
  const wrapper = document.createElement('div');
  wrapper.id = 'live-log-wrapper';
  wrapper.className = 'fixed top-4 right-4 z-[9997] flex flex-col items-end space-y-2';

  // === Logger panel ===
  const panel = document.createElement('div');
  panel.id = 'live-log-box';
  panel.className = `
    bg-black/70 backdrop-blur-md text-white p-3 rounded-xl shadow-lg text-xs
    w-[360px] max-h-[280px] overflow-y-auto transition-all duration-300
  `.trim();
  if (localStorage.getItem('log.visible') === 'false') panel.classList.add('hidden');

  // === Toolbar ===
  const toolbar = document.createElement('div');
  toolbar.className = 'flex items-center justify-between mb-2 text-[10px]';

  const clearBtn = document.createElement('button');
  clearBtn.textContent = '🗑 Clear';
  clearBtn.className =
    'px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs transition';
  clearBtn.addEventListener('click', () => {
    clearDevLogs();
    updateLogBody();
  });

  const autoRefreshLabel = document.createElement('label');
  autoRefreshLabel.className = 'flex items-center gap-1 cursor-pointer';
  autoRefreshLabel.innerHTML = `
    <input type="checkbox" id="log-auto-refresh" class="cursor-pointer" />
    <span>Auto-refresh</span>
  `;

  toolbar.append(clearBtn, autoRefreshLabel);

  // === Log content ===
  const body = document.createElement('div');
  body.id = 'live-log-body';
  body.className = 'space-y-[2px] font-mono leading-snug';
  updateLogBody(body);

  // === Context block ===
  const context = document.createElement('div');
  context.id = 'log-context';
  context.className = 'mt-2 border-t border-white/20 pt-2 text-[10px] text-white/80';
  context.innerHTML = getContextHTML(user);

  panel.append(toolbar, body, context);

  // === Toggle button ===
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'log-toggle';
  toggleBtn.title = 'Toggle Logs';
  toggleBtn.innerText = '👁️';
  toggleBtn.className = `
    bg-black/60 backdrop-blur text-white w-8 h-8 rounded-full
    flex items-center justify-center shadow hover:bg-black/80
  `.trim();
  toggleBtn.addEventListener('click', () => {
    const isHidden = panel.classList.toggle('hidden');
    localStorage.setItem('log.visible', String(!isHidden));
  });

  wrapper.append(toggleBtn, panel);
  document.body.appendChild(wrapper);

  // === Auto-refresh listener ===
  const autoRefresh = toolbar.querySelector('#log-auto-refresh');
  if (autoRefresh instanceof HTMLInputElement) {
    autoRefresh.addEventListener('change', (e) => {
      getChecked(e) ? startAutoRefresh() : stopAutoRefresh();
    });
  }
}

/**
 * Updates the log content area.
 * @param {HTMLElement} [bodyEl=document.getElementById('live-log-body')]
 */
export function updateLogBody(bodyEl = qs('#live-log-body')) {
  if (!bodyEl) return;

  const logs = getDevLogs();
  bodyEl.innerHTML = '';

  logs.forEach((log) => {
    const entry = document.createElement('div');
    entry.textContent = log;
    entry.className = getLogClass(log);
    bodyEl.appendChild(entry);
  });

  bodyEl.scrollTop = bodyEl.scrollHeight;
}

/**
 * Updates the context info at the bottom of the live logger.
 */
export function updateLogContext() {
  const el = qs('#log-context');
  if (el) el.innerHTML = getContextHTML(getUserSettings());
}

/**
 * Returns formatted HTML for the current user context.
 */
function getContextHTML(user = {}) {
  return `
    <div><span class="text-white/60">Page:</span> <code>${location.hash || '(none)'}</code></div>
    <div><span class="text-white/60">Role:</span> <code>${user.role || 'unknown'}</code></div>
    <div><span class="text-white/60">Team ID:</span> <code>${user.team_id || 'none'}</code></div>
    <div><span class="text-white/60">Font:</span> <code>${user.font_theme || 'default'}</code></div>
    <div><span class="text-white/60">Color:</span> <code>${user.color_theme || 'default'}</code></div>
  `;
}

/**
 * Assigns Tailwind color classes based on log content.
 */
function getLogClass(msg) {
  if (msg.includes('✅') || msg.includes('success')) return 'text-green-400';
  if (msg.includes('⚠️') || msg.includes('warn')) return 'text-yellow-300';
  if (msg.includes('❌') || msg.includes('error')) return 'text-red-400';
  if (msg.includes('🧪') || msg.includes('debug')) return 'text-purple-300';
  if (msg.includes('🔄') || msg.includes('refresh')) return 'text-blue-300';
  return 'text-white/80';
}

// === Auto-refresh Interval ===
let refreshInterval = null;
function startAutoRefresh() {
  if (!refreshInterval) refreshInterval = setInterval(updateLogBody, 1000);
}
function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}
