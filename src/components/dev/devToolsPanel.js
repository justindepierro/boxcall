// src/components/dev/devToolsPanel.js

import { DEV_EMAIL } from '@config/devConfig.js';
import { setOverrideRole, setOverrideTheme, clearDevOverrides } from '@state/devToolState.js';
import { refreshDevContext, clearDevLogs, getDevLogs } from '@utils/devLogger.js';
import { applyTheme } from '@utils/themeManager.js';
import { ROLES } from '@utils/roles.js';
import { qs, qsi, getValue, setSelectValue } from '@utils/domHelper.js';

/* -------------------------------------------------------------------------- */
/*                                PANEL STATE                                 */
/* -------------------------------------------------------------------------- */
let panelVisible = true;
let panelHeight = parseInt(localStorage.getItem('devTools.height') || '250', 10);
let panelOpacity = parseFloat(localStorage.getItem('devTools.opacity') || '0.9');
let isDragging = false;
let activeTab = 'logs';
let refreshInterval = null;

/* -------------------------------------------------------------------------- */
/*                               MAIN RENDER                                  */
/* -------------------------------------------------------------------------- */
export function renderDevToolsPanel(user = {}) {
  if (user.email !== DEV_EMAIL) return;
  if (qs('#dev-tools-wrapper')) return;

  // === Wrapper ===
  const wrapper = document.createElement('div');
  wrapper.id = 'dev-tools-wrapper';
  wrapper.className = 'fixed bottom-0 right-4 z-[9999] w-[350px] transition-opacity duration-300';
  wrapper.style.position = 'fixed';
  wrapper.style.bottom = '0';
  wrapper.style.right = '4px';

  // === Background Overlay ===
  const bgOverlay = document.createElement('div');
  bgOverlay.id = 'dev-tools-bg';
  bgOverlay.className = 'absolute inset-0 bg-black rounded-t';
  bgOverlay.style.opacity = panelOpacity.toString();
  bgOverlay.style.zIndex = '-1';
  bgOverlay.style.transition = 'opacity 0.3s ease';

  // === Toggle Button ===
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'dev-tools-toggle';
  toggleBtn.title = 'Toggle Dev Tools';
  toggleBtn.innerText = '🛠️';
  toggleBtn.className = `
    absolute -top-10 right-0 w-8 h-8 rounded-full
    bg-black text-white flex items-center justify-center
    shadow-md hover:bg-gray-800 transition-all
  `;

  // === Panel ===
  const panel = document.createElement('div');
  panel.id = 'dev-tools-panel';
  panel.style.height = `${panelHeight}px`;
  panel.className = `
    relative text-xs border border-gray-700 shadow-lg rounded-t overflow-hidden transition-all duration-300
  `;

  panel.innerHTML = `
    ${getHeaderHTML()}
    ${getTabButtonsHTML()}
    <div id="dev-tabs-container" class="h-full overflow-y-auto">
      ${getControlsTabHTML()}
      ${getLogsTabHTML()}
    </div>
  `;
  panel.appendChild(bgOverlay);

  // Append to body
  wrapper.append(toggleBtn, panel);
  document.body.appendChild(wrapper);

  // Event listeners
  toggleBtn.addEventListener('click', () => togglePanel(panel, toggleBtn));
  setupTabListeners();
  setupControlListeners();
  setupToolbarListeners();
  setupPanelResize(panel);
  setupPanelDrag(wrapper);
  renderLogs();
}

/* -------------------------------------------------------------------------- */
/*                               TEMPLATE HTML                                */
/* -------------------------------------------------------------------------- */
function getHeaderHTML() {
  return `
    <div id="dev-header" class="cursor-ns-resize p-2 flex justify-between items-center border-b border-gray-600 bg-black/80">
      <strong class="text-green-400">🛠️ Dev Tools</strong>
      <button id="dev-tools-close" class="text-red-400 text-xs hover:text-red-300 transition">✖</button>
    </div>
  `;
}

function getTabButtonsHTML() {
  return `
    <div class="flex border-b border-gray-600 bg-black/70">
      <button data-tab="logs" class="dev-tab-btn flex-1 py-1 text-center text-white hover:bg-gray-700">Logs</button>
      <button data-tab="controls" class="dev-tab-btn flex-1 py-1 text-center text-white hover:bg-gray-700">Controls</button>
    </div>
  `;
}

function getControlsTabHTML() {
  return `
    <div id="tab-controls" class="p-2 space-y-3 ${activeTab === 'controls' ? '' : 'hidden'}">
      ${getRoleThemeControlsHTML()}
      ${getExtraControlsHTML()}
    </div>
  `;
}

function getLogsTabHTML() {
  return `
    <div id="tab-logs" class="p-2 font-mono text-xs leading-tight space-y-1 ${activeTab === 'logs' ? '' : 'hidden'}">
      ${getToolbarHTML()}
      <div id="dev-log-console" class="mt-2 space-y-1"></div>
    </div>
  `;
}

function getRoleThemeControlsHTML() {
  return `
    <div class="flex flex-col gap-2">
      <label class="flex items-center gap-2">
        <span>Role:</span>
        <select id="dev-role" class="text-black text-xs px-1 rounded w-full">
          <option value="">(none)</option>
          ${Object.values(ROLES)
            .map((r) => `<option value="${r}">${r}</option>`)
            .join('')}
        </select>
      </label>
      <label class="flex items-center gap-2">
        <span>Theme:</span>
        <select id="dev-theme" class="text-black text-xs px-1 rounded w-full">
          <option value="">(default)</option>
          <option value="classic">Classic</option>
          <option value="modern">Modern</option>
          <option value="athletic">Athletic</option>
          <option value="tech">Tech</option>
          <option value="casual">Casual</option>
          <option value="professional">Professional</option>
        </select>
      </label>
      <label class="flex items-center gap-2">
        <span>Opacity:</span>
        <input id="dev-opacity-slider" type="range" min="0.2" max="1" step="0.05"
          value="${panelOpacity}" class="w-full">
      </label>
      <button id="reset-opacity" class="bg-gray-600 text-white px-2 py-1 text-xs rounded hover:bg-gray-500">
        Reset Opacity
      </button>
    </div>
  `;
}

function getExtraControlsHTML() {
  return `
    <div class="flex items-center gap-2 mt-2">
      <button id="reset-dev" class="bg-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-600">
        Reset
      </button>
      <button id="refresh-context" class="bg-blue-600 px-2 py-1 rounded text-xs hover:bg-blue-500">
        Refresh
      </button>
    </div>
  `;
}

function getToolbarHTML() {
  return `
    <div class="flex items-center gap-2">
      <button id="clear-logs" class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs">
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

/* -------------------------------------------------------------------------- */
/*                               EVENT HANDLERS                               */
/* -------------------------------------------------------------------------- */
function togglePanel(panel, toggleBtn) {
  panelVisible = !panelVisible;
  if (panel instanceof HTMLElement) {
    panel.style.opacity = panelVisible ? '1' : '0';
    panel.style.pointerEvents = panelVisible ? 'auto' : 'none';
  }
  if (toggleBtn instanceof HTMLElement) {
    toggleBtn.innerText = panelVisible ? '🛠️' : '👁️';
  }
}

function setupTabListeners() {
  const tabBtns = document.querySelectorAll('.dev-tab-btn');
  tabBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      if (!(e.target instanceof HTMLElement)) return;
      const tab = e.target.dataset.tab;
      if (!tab) return;
      activeTab = tab;
      const logs = qsi('#tab-logs');
      const controls = qsi('#tab-controls');
      if (logs && controls) {
        logs.classList.toggle('hidden', tab !== 'logs');
        controls.classList.toggle('hidden', tab !== 'controls');
      }
    });
  });
}

function setupControlListeners() {
  const roleSelect = qsi('#dev-role');
  const themeSelect = qsi('#dev-theme');
  const opacitySlider = qsi('#dev-opacity-slider');
  const resetOpacityBtn = qsi('#reset-opacity');
  const resetBtn = qsi('#reset-dev');
  const refreshBtn = qsi('#refresh-context');

  if (roleSelect instanceof HTMLSelectElement) {
    setSelectValue(roleSelect, localStorage.getItem('dev.overrideRole') || '');
    roleSelect.addEventListener('change', (e) => {
      setOverrideRole(getValue(e));
      refreshDevContext();
    });
  }

  if (themeSelect instanceof HTMLSelectElement) {
    setSelectValue(themeSelect, localStorage.getItem('dev.overrideTheme') || '');
    themeSelect.addEventListener('change', (e) => {
      const theme = getValue(e);
      setOverrideTheme(theme);
      applyTheme(theme);
      refreshDevContext();
    });
  }

  if (opacitySlider instanceof HTMLInputElement) {
    opacitySlider.addEventListener('input', () => {
      panelOpacity = parseFloat(opacitySlider.value);
      const bg = qsi('#dev-tools-bg');
      if (bg instanceof HTMLElement) bg.style.opacity = panelOpacity.toString();
      localStorage.setItem('devTools.opacity', panelOpacity.toString());
    });
  }

  resetOpacityBtn?.addEventListener('click', () => {
    panelOpacity = 0.9;
    const bg = qsi('#dev-tools-bg');
    if (bg instanceof HTMLElement) bg.style.opacity = '0.9';
    if (opacitySlider instanceof HTMLInputElement) opacitySlider.value = '0.9';
    localStorage.setItem('devTools.opacity', '0.9');
  });

  resetBtn?.addEventListener('click', () => {
    clearDevOverrides();
    if (roleSelect instanceof HTMLSelectElement) roleSelect.value = '';
    if (themeSelect instanceof HTMLSelectElement) themeSelect.value = '';
    refreshDevContext();
  });

  refreshBtn?.addEventListener('click', refreshDevContext);
}

function setupToolbarListeners() {
  const clearBtn = qsi('#clear-logs');
  const autoRefreshEl = qsi('#auto-refresh');
  const errorsOnly = qsi('#errors-only');
  const closeBtn = qsi('#dev-tools-close');

  clearBtn?.addEventListener('click', () => {
    clearDevLogs();
    renderLogs();
  });

  if (autoRefreshEl instanceof HTMLInputElement) {
    autoRefreshEl.addEventListener('change', () => {
      autoRefreshEl.checked ? startAutoRefresh() : stopAutoRefresh();
    });
  }

  errorsOnly?.addEventListener('change', renderLogs);

  closeBtn?.addEventListener('click', () => {
    panelVisible = false;
    const panel = qs('#dev-tools-panel');
    const toggle = qs('#dev-tools-toggle');
    if (panel instanceof HTMLElement) panel.style.opacity = '0';
    if (toggle instanceof HTMLElement) toggle.innerText = '👁️';
  });
}

/* -------------------------------------------------------------------------- */
/*                                LOG RENDER                                  */
/* -------------------------------------------------------------------------- */
function renderLogs() {
  const container = qsi('#dev-log-console');
  if (!container) return;

  const errorsOnlyEl = qsi('#errors-only');
  const errorsOnly = errorsOnlyEl instanceof HTMLInputElement ? errorsOnlyEl.checked : false;

  container.innerHTML = getDevLogs()
    .filter((log) => !errorsOnly || log.includes('❌') || log.includes('error'))
    .map((log) => `<div class="${getLogColorClass(log)}">${log}</div>`)
    .join('');
}

function getLogColorClass(log) {
  if (log.includes('✅') || log.includes('success')) return 'text-green-400';
  if (log.includes('❌') || log.includes('error')) return 'text-red-400';
  if (log.includes('⚠️') || log.includes('warn')) return 'text-yellow-300';
  if (log.includes('🧪') || log.includes('debug')) return 'text-purple-300';
  return 'text-white/80';
}

/* -------------------------------------------------------------------------- */
/*                            PANEL BEHAVIOR                                  */
/* -------------------------------------------------------------------------- */
function setupPanelResize(panel) {
  const header = qsi('#dev-header');
  let startY = 0;
  let startHeight = 0;

  header?.addEventListener('mousedown', (e) => {
    if (!(e instanceof MouseEvent)) return;
    isDragging = true;
    startY = e.clientY;
    startHeight = panel.offsetHeight;
    document.addEventListener('mousemove', resizePanel);
    document.addEventListener('mouseup', stopResizing);
  });

  function resizePanel(e) {
    if (!(e instanceof MouseEvent) || !isDragging) return;
    const newHeight = startHeight - (e.clientY - startY);
    panel.style.height = `${Math.max(150, newHeight)}px`;
  }

  function stopResizing() {
    isDragging = false;
    localStorage.setItem('devTools.height', panel.offsetHeight.toString());
    document.removeEventListener('mousemove', resizePanel);
    document.removeEventListener('mouseup', stopResizing);
  }
}

function setupPanelDrag(wrapper) {
  const header = qsi('#dev-header');
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startBottom = 0;

  header?.addEventListener('mousedown', (e) => {
    if (!(e instanceof MouseEvent)) return;
    if (!e.shiftKey) return; // Only drag if Shift is held
    e.preventDefault();
    startX = e.clientX;
    startY = e.clientY;
    const rect = wrapper.getBoundingClientRect();
    startLeft = rect.left;
    startBottom = window.innerHeight - rect.bottom;

    document.addEventListener('mousemove', dragPanel);
    document.addEventListener('mouseup', stopDragging);
  });

  function dragPanel(e) {
    if (!(e instanceof MouseEvent)) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    wrapper.style.left = `${startLeft + dx}px`;
    wrapper.style.bottom = `${startBottom - dy}px`;
  }

  function stopDragging() {
    document.removeEventListener('mousemove', dragPanel);
    document.removeEventListener('mouseup', stopDragging);
  }
}

/* -------------------------------------------------------------------------- */
/*                          AUTO REFRESH LOGS                                 */
/* -------------------------------------------------------------------------- */
function startAutoRefresh() {
  if (!refreshInterval) refreshInterval = setInterval(renderLogs, 1000);
}
function stopAutoRefresh() {
  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = null;
}
