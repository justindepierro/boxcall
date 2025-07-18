// src/dev/devToolsPanel.js

import { DEV_EMAIL } from '@config/devConfig.js';
import { setOverrideRole, setOverrideTheme } from '@state/devToolState.js';
import { refreshDevContext } from '@utils/devLogger.js';
import { applyTheme } from '@utils/themeManager.js';
import { ROLES } from '@utils/roles.js';

/**
 * Injects the full Dev Tools panel, including:
 * - Log viewer
 * - Role & theme override controls
 * Safe to call multiple times.
 *
 * @param {object} [user={}]
 * @param {string} [user.email]
 */
export function renderDevToolsPanel(user = {}) {
  if (user.email !== DEV_EMAIL) return;
  if (document.getElementById('dev-tools-panel')) return;

  const panel = document.createElement('div');
  panel.id = 'dev-tools-panel';
  panel.className = `
    fixed bottom-0 left-0 w-full max-h-[40vh] bg-black text-white text-xs
    overflow-y-auto z-[9999] border-t border-gray-700
  `.trim();

  panel.innerHTML = `
    <!-- Header -->
    <div class="p-2 flex justify-between items-center border-b border-gray-600">
      <strong class="text-green-400">🛠️ Dev Logs</strong>
      <button
        onclick="document.getElementById('dev-tools-panel')?.remove()"
        class="text-red-400 text-xs"
      >
        Close
      </button>
    </div>

    <!-- Role/Theme Controls -->
    <div id="log-context" class="p-2 border-b border-gray-700 text-white/70 font-mono text-xs">
      ${getRoleThemeControlsHTML()}
    </div>

    <!-- Console Output -->
    <div id="dev-log-console" class="p-2 space-y-1 font-mono text-xs leading-tight"></div>
  `;

  document.body.appendChild(panel);
  setupControlListeners();
}

/**
 * Builds the role/theme dropdown HTML.
 * @returns {string}
 */
function getRoleThemeControlsHTML() {
  return `
    <label class="mr-2">Role:</label>
    <select id="dev-role" class="text-black text-xs px-1">
      <option value="">(none)</option>
      ${Object.values(ROLES)
        .map((r) => `<option value="${r}">${r}</option>`)
        .join('')}
    </select>

    <label class="ml-4 mr-2">Theme:</label>
    <select id="dev-theme" class="text-black text-xs px-1">
      <option value="">(default)</option>
      <option value="classic">Classic</option>
      <option value="modern">Modern</option>
      <option value="athletic">Athletic</option>
      <option value="tech">Tech</option>
      <option value="casual">Casual</option>
      <option value="professional">Professional</option>
    </select>
  `;
}

/**
 * Helper to cast query results to HTMLSelectElement.
 * @param {string} id
 * @returns {HTMLSelectElement}
 */
function getSelectElement(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element: ${id}`);
  return /** @type {HTMLSelectElement} */ (el);
}

/**
 * Safely extract value from an event target (as HTMLSelectElement).
 * @param {Event} e
 * @returns {string}
 */
function getSelectValue(e) {
  return /** @type {HTMLSelectElement} */ (e.target).value || '';
}

// 🔁 Binds dropdowns to devToolState
function setupControlListeners() {
  const roleSelect = getSelectElement('dev-role');
  const themeSelect = getSelectElement('dev-theme');

  // Pre-fill values
  roleSelect.value = localStorage.getItem('dev.overrideRole') || '';
  themeSelect.value = localStorage.getItem('dev.overrideTheme') || '';

  // Role change
  roleSelect.addEventListener('change', (e) => {
    setOverrideRole(getSelectValue(e) || null);
    refreshDevContext();
  });

  // Theme change
  themeSelect.addEventListener('change', (e) => {
    const theme = getSelectValue(e) || null;
    setOverrideTheme(theme);
    applyTheme(theme);
    refreshDevContext();
  });
}
