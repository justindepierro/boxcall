// src/components/dev/devToolsPanel.js

import { ROLES } from '@utils/roles.js';
import { setOverrideRole, setOverrideTheme } from '@state/devToolState.js';
import { DEV_EMAIL } from '@config/devConfig.js';
import { refreshDevContext } from '@utils/devLogger.js';
import { createButton } from './devUI.js';
import { applyFontTheme, applyColorTheme } from '@config/themes/themeLoader.js';

export function renderDevToolsPanel() {
  const user = window.userSettings || {};
  if (user.email !== DEV_EMAIL) return;
  if (document.getElementById('dev-tools-panel')) return;

  // ⚙️ Toggle button
  const toggleBtn = createButton('⚙️', () => {
    const isHidden = panel.classList.toggle('hidden');
    localStorage.setItem('dev.panelOpen', !isHidden);
  });
  toggleBtn.id = 'dev-tools-toggle';
  toggleBtn.title = 'Dev Tools';
  toggleBtn.className =
    'fixed bottom-4 right-4 z-[9998] bg-black/50 backdrop-blur-sm text-white w-10 h-10 rounded-full shadow-lg hover:bg-black/70';
  document.body.appendChild(toggleBtn);

  // 🧱 Panel
  const panel = document.createElement('div');
  panel.id = 'dev-tools-panel';
  panel.className =
    'fixed bottom-16 right-4 bg-black/60 backdrop-blur-sm text-white p-4 rounded-xl shadow-xl z-[9999] text-sm w-[320px]';
  if (localStorage.getItem('dev.panelOpen') === 'true') {
    panel.classList.remove('hidden');
  } else {
    panel.classList.add('hidden');
  }
  document.body.appendChild(panel);

  // 🪪 Header
  const header = document.createElement('div');
  header.className = 'font-bold mb-2';
  header.textContent = '🛠️ Dev Tools';
  panel.appendChild(header);

  const tabRow = document.createElement('div');
  tabRow.className = 'flex gap-2 mb-2';
  panel.appendChild(tabRow);

  const tabs = ['general'];
  const tabContents = {};

  tabs.forEach((tab, i) => {
    const btn = createButton(tab.charAt(0).toUpperCase() + tab.slice(1), () => {
      Object.values(tabContents).forEach((el) => el.classList.add('hidden'));
      tabContents[tab].classList.remove('hidden');
      tabRow.querySelectorAll('button').forEach((b) => b.classList.remove('bg-gray-800'));
      btn.classList.add('bg-gray-800');
    });
    btn.classList.add('dev-tab-btn', 'bg-gray-700', 'px-2', 'py-1', 'rounded');
    if (i === 0) btn.classList.add('bg-gray-800');
    btn.dataset.tab = tab;
    tabRow.appendChild(btn);

    const tabPane = document.createElement('div');
    tabPane.className = i === 0 ? 'tab-content' : 'tab-content hidden';
    tabPane.id = `tab-${tab}`;
    panel.appendChild(tabPane);
    tabContents[tab] = tabPane;
  });

  // === GENERAL TAB ===
  const general = tabContents.general;

  // Role selector
  const roleLabel = document.createElement('label');
  roleLabel.textContent = 'Override Role:';
  roleLabel.className = 'block mb-1';
  general.appendChild(roleLabel);

  const roleSelect = document.createElement('select');
  roleSelect.className = 'text-black p-1 rounded w-full mb-3';
  roleSelect.id = 'dev-role';
  roleSelect.innerHTML = `
    <option value="">(Clear)</option>
    ${Object.values(ROLES)
      .map((role) => `<option value="${role}">${role}</option>`)
      .join('')}
  `;
  roleSelect.value = localStorage.getItem('dev.overrideRole') || '';
  general.appendChild(roleSelect);

  roleSelect.addEventListener('change', (e) => {
    setOverrideRole(e.target.value || null);
    window.userSettings.role = e.target.value || null;
    refreshDevContext(); // 🧠 updates live logger
  });

  // Theme selector
  const themeLabel = document.createElement('label');
  themeLabel.textContent = 'Override Theme:';
  themeLabel.className = 'block mb-1';
  general.appendChild(themeLabel);

  const themeSelect = document.createElement('select');
  themeSelect.className = 'text-black p-1 rounded w-full mb-3';
  themeSelect.id = 'dev-theme';
  themeSelect.innerHTML = `
    <option value="">(Default)</option>
    <option value="classic">Classic</option>
    <option value="modern">Modern</option>
    <option value="athletic">Athletic</option>
    <option value="tech">Tech</option>
    <option value="casual">Casual</option>
    <option value="professional">Professional</option>
  `;
  themeSelect.value = localStorage.getItem('dev.overrideTheme') || '';
  general.appendChild(themeSelect);

  themeSelect.addEventListener('change', (e) => {
    const newTheme = e.target.value || null;
    setOverrideTheme(newTheme);
    window.userSettings.font_theme = newTheme;
    window.userSettings.color_theme = newTheme;
    applyFontTheme(newTheme);
    applyColorTheme(newTheme);
    refreshDevContext(); // 🧠 updates live logger
  });
}
