// src/components/dev/liveLogger.js

import { getDevLogs } from '@utils/devLogger.js';
import { DEV_EMAIL } from '@config/devConfig.js';

export function mountLiveLogger() {
  const user = window.userSettings || {};
  if (user.email !== DEV_EMAIL) return;

  // Prevent duplicates
  if (document.getElementById('live-log-wrapper')) return;

  // === Outer wrapper
  const wrapper = document.createElement('div');
  wrapper.id = 'live-log-wrapper';
  wrapper.className = 'fixed top-4 right-4 z-[9997] flex flex-col items-end space-y-2';

  // === Logger panel
  const panel = document.createElement('div');
  panel.id = 'live-log-box';
  panel.className =
    'bg-black/70 backdrop-blur-md text-white p-3 rounded-xl shadow-lg text-xs w-[360px] max-h-[280px] overflow-y-auto transition-all duration-300';

  // Optional: hide by default based on localStorage
  if (localStorage.getItem('log.visible') === 'false') {
    panel.classList.add('hidden');
  }

  // === Log content
  const body = document.createElement('div');
  body.id = 'live-log-body';
  updateLogBody(body);

  const context = document.createElement('div');
  context.id = 'log-context';
  context.className = 'mt-2 border-t border-white/20 pt-2 text-[10px] text-white/80';
  context.innerHTML = getContextHTML();

  panel.appendChild(body);
  panel.appendChild(context);

  // === 👁️ Button
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'log-toggle';
  toggleBtn.title = 'Toggle Logs';
  toggleBtn.innerText = '👁️';
  toggleBtn.className =
    'bg-black/60 backdrop-blur text-white w-8 h-8 rounded-full flex items-center justify-center shadow hover:bg-black/80';

  toggleBtn.addEventListener('click', () => {
    const isHidden = panel.classList.toggle('hidden');
    localStorage.setItem('log.visible', !isHidden);
  });

  // === Append everything
  wrapper.appendChild(toggleBtn);
  wrapper.appendChild(panel);
  document.body.appendChild(wrapper);
}

// 🔄 Update logs
export function updateLogBody(bodyEl = document.getElementById('live-log-body')) {
  if (!bodyEl) return;
  const logs = getDevLogs();
  bodyEl.innerHTML = '';
  logs.forEach((log) => {
    const entry = document.createElement('div');
    entry.textContent = log;
    bodyEl.appendChild(entry);
  });
  bodyEl.scrollTop = bodyEl.scrollHeight;
}

// 🔄 Update context block (e.g., after theme/role change)
export function updateLogContext() {
  const el = document.getElementById('log-context');
  if (el) el.innerHTML = getContextHTML();
}

function getContextHTML() {
  return `
    <div>Page: <code>${location.hash || '(none)'}</code></div>
    <div>Role: <code>${window.userSettings?.role || 'unknown'}</code></div>
    <div>Team ID: <code>${window.userSettings?.team_id || 'none'}</code></div>
    <div>Font: <code>${window.userSettings?.font_theme || 'default'}</code></div>
    <div>Color: <code>${window.userSettings?.color_theme || 'default'}</code></div>
  `;
}
