// src/components/dev/liveLogger.js

import { getDevLogs } from '@utils/devLogger.js';
import { DEV_EMAIL } from '@config/devConfig.js'; // Optional: cleaner than VITE_DEV_EMAIL

let isVisible = true;

export function mountLiveLogger() {
  const user = window.userSettings || {};
  if (user.email !== DEV_EMAIL) return;

  // Prevent duplicates
  if (document.getElementById('live-log-box')) return;

  // 🧱 Logger container
  const container = document.createElement('div');
  container.id = 'live-log-box';
  container.className =
    'fixed top-4 right-4 z-[9997] bg-black bg-opacity-80 text-white p-3 rounded-xl shadow-lg text-xs w-[360px] max-h-[280px] overflow-y-auto transition-all duration-300';

  // 👁️ Persistent visibility
  const wasVisible = localStorage.getItem('log.visible') !== 'false';
  container.classList.toggle('hidden', !wasVisible);

  // 🔼 Header with toggle
  const header = document.createElement('div');
  header.className = 'flex justify-between items-center mb-2';
  header.innerHTML = `
    <div class="font-bold">📋 Live Logger</div>
    <button id="log-toggle" title="Toggle logs" class="text-white/70 hover:text-white">👁️</button>
  `;

  // 📜 Log body
  const body = document.createElement('div');
  body.id = 'live-log-body';
  updateLogBody(body);

  // 🧠 Context info
  const context = document.createElement('div');
  context.id = 'log-context';
  context.className = 'mt-2 border-t border-white/20 pt-2 text-[10px] text-white/80';
  context.innerHTML = getContextHTML();

  // 🧩 Assemble and mount
  container.appendChild(header);
  container.appendChild(body);
  container.appendChild(context);
  document.body.appendChild(container);

  // 🔘 Toggle button
  if (!document.getElementById('live-log-toggle-btn')) {
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'live-log-toggle-btn';
    toggleBtn.className =
      'fixed top-4 right-[400px] z-[9999] text-white text-xl bg-black bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-70';
    toggleBtn.innerText = '👁️';

    toggleBtn.addEventListener('click', () => {
      const logBox = document.getElementById('live-log-box');
      if (logBox) {
        const isHidden = logBox.classList.toggle('hidden');
        localStorage.setItem('log.visible', !isHidden);
      }
    });

    document.body.appendChild(toggleBtn);
  }

  // 👁️ Toggle logs panel content
  document.getElementById('log-toggle')?.addEventListener('click', () => {
    isVisible = !isVisible;
    body.style.display = isVisible ? 'block' : 'none';
    context.style.display = isVisible ? 'block' : 'none';
  });
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
