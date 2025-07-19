// src/dev/devToolsPanel.js
import { DEV_EMAIL } from '@config/devConfig.js';
import { setOverrideRole, setOverrideTheme } from '@state/devToolState.js';
import { refreshDevContext, clearDevLogs, getDevLogs } from '@utils/devLogger.js';
import { applyTheme } from '@utils/themeManager.js';
import { ROLES } from '@utils/roles.js';
import { qs, qsi, getChecked, getValue, setSelectValue } from '@utils/domHelper.js'; // <-- Safe DOM helpers

/**
 * Renders the floating Dev Tools panel with:
 *  - Role/Theme controls
 *  - Log viewer & toolbar
 *  - Toggle button
 * @param {object} [user={}]
 */
export function renderDevToolsPanel(user = {}) {
  if (user.email !== DEV_EMAIL) return;
  if (qs('#dev-tools-wrapper')) return;

  // === Wrapper ===
  const wrapper = document.createElement('div');
  wrapper.id = 'dev-tools-wrapper';
  wrapper.className = 'fixed bottom-0 left-0 w-full z-[9999]';

  // === Floating Toggle Button ===
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'dev-tools-toggle';
  toggleBtn.title = 'Toggle Dev Tools';
  toggleBtn.innerText = '🛠️';
  toggleBtn.className = `
    absolute -top-10 left-4 w-8 h-8 rounded-full
    bg-black/70 text-white flex items-center justify-center
    shadow-md hover:bg-black transition-all
  `;

  // === Main Panel ===
  const panel = document.createElement('div');
  panel.id = 'dev-tools-panel';
  panel.className = `
    bg-black text-white text-xs
    border-t border-gray-700 shadow-lg
    max-h-[40vh] overflow-y-auto
    transition-all duration-300
  `;
  panel.innerHTML = `
    <!-- Header -->
    <div class="p-2 flex justify-between items-center border-b border-gray-600">
      <strong class="text-green-400">🛠️ Dev Tools</strong>
      <button id="dev-tools-close" class="text-red-400 text-xs hover:text-red-300 transition">Close</button>
    </div>

    <!-- Controls -->
    <div id="log-context" class="p-2 border-b border-gray-700 text-white/70 font-mono text-xs space-y-2">
      ${getRoleThemeControlsHTML()}
      ${getToolbarHTML()}
    </div>

    <!-- Log Console -->
    <div id="dev-log-console" class="p-2 space-y-1 font-mono text-xs leading-tight"></div>
  `;

  wrapper.append(toggleBtn, panel);
  document.body.appendChild(wrapper);

  // === Event Listeners ===
  toggleBtn.addEventListener('click', () => {
    panel.classList.toggle('hidden');
    toggleBtn.innerText = panel.classList.contains('hidden') ? '👁️' : '🛠️';
  });

  setupControlListeners();
  setupToolbarListeners();
}

/**
 * Build the Role & Theme dropdowns.
 */
function getRoleThemeControlsHTML() {
  return `
    <div class="flex items-center gap-4">
      <label class="flex items-center gap-1">
        <span>Role:</span>
        <select id="dev-role" class="text-black text-xs px-1 rounded">
          <option value="">(none)</option>
          ${Object.values(ROLES)
            .map((r) => `<option value="${r}">${r}</option>`)
            .join('')}
        </select>
      </label>

      <label class="flex items-center gap-1">
        <span>Theme:</span>
        <select id="dev-theme" class="text-black text-xs px-1 rounded">
          <option value="">(default)</option>
          <option value="classic">Classic</option>
          <option value="modern">Modern</option>
          <option value="athletic">Athletic</option>
          <option value="tech">Tech</option>
          <option value="casual">Casual</option>
          <option value="professional">Professional</option>
        </select>
      </label>
    </div>
  `;
}

/**
 * Toolbar for log actions (Clear, Auto-refresh, Errors only).
 */
function getToolbarHTML() {
  return `
    <div class="flex items-center gap-4 mt-2">
      <button id="clear-logs" class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition">
        Clear Logs
      </button>
      <label class="flex items-center gap-1">
        <input type="checkbox" id="auto-refresh" class="cursor-pointer" />
        <span>Auto-refresh</span>
      </label>
      <label class="flex items-center gap-1">
        <input type="checkbox" id="errors-only" class="cursor-pointer" />
        <span>Errors Only</span>
      </label>
    </div>
  `;
}

/**
 * Setup Role & Theme listeners.
 */
function setupControlListeners() {
  const roleSelect = qsi('#dev-role');
  const themeSelect = qsi('#dev-theme');
  if (!roleSelect || !themeSelect) return;

  setSelectValue(roleSelect, localStorage.getItem('dev.overrideRole') || '');
  setSelectValue(themeSelect, localStorage.getItem('dev.overrideTheme') || '');

  roleSelect.addEventListener('change', (e) => {
    setOverrideRole(getValue(e) || null);
    refreshDevContext();
  });

  themeSelect.addEventListener('change', (e) => {
    const theme = getValue(e) || null;
    setOverrideTheme(theme);
    applyTheme(theme);
    refreshDevContext();
  });
}

/**
 * Setup Toolbar listeners.
 */
function setupToolbarListeners() {
  const clearBtn = qsi('#clear-logs');
  const autoRefresh = qsi('#auto-refresh');
  const errorsOnly = qsi('#errors-only');
  const closeBtn = qsi('#dev-tools-close');

  clearBtn?.addEventListener('click', () => {
    clearDevLogs();
    renderLogs();
  });

  autoRefresh?.addEventListener('change', (e) => {
    if (getChecked(e)) startAutoRefresh();
    else stopAutoRefresh();
  });

  errorsOnly?.addEventListener('change', renderLogs);

  closeBtn?.addEventListener('click', () => {
    qs('#dev-tools-wrapper')?.remove();
  });

  renderLogs();
}

/**
 * Render all logs with filters.
 */
function renderLogs() {
  const container = qsi('#dev-log-console');
  if (!container) return;

  const errorsOnly = qsi('#errors-only');
  const filterErrors = errorsOnly instanceof HTMLInputElement && errorsOnly.checked;

  container.innerHTML = getDevLogs()
    .filter((log) => !filterErrors || log.includes('❌') || log.includes('error'))
    .map((log) => `<div class="${getLogColorClass(log)}">${log}</div>`)
    .join('');
}

/**
 * Assign Tailwind classes to logs.
 */
function getLogColorClass(log) {
  if (log.includes('✅') || log.includes('success') || log.includes('done'))
    return 'text-green-400';
  if (log.includes('❌') || log.includes('error') || log.includes('fail')) return 'text-red-400';
  if (log.includes('⚠️') || log.includes('warn')) return 'text-yellow-300';
  if (log.includes('🧪') || log.includes('test') || log.includes('debug')) return 'text-purple-300';
  if (log.includes('🔄') || log.includes('refresh')) return 'text-blue-300';
  return 'text-white/80';
}

// === Auto-refresh interval ===
let refreshInterval = null;
function startAutoRefresh() {
  if (!refreshInterval) refreshInterval = setInterval(renderLogs, 1000);
}
function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}
