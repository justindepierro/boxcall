import { supabase } from '../../auth/supabaseClient.js';
import { fetchThemeSettings } from '../../config/themes/fetchThemeSettings.js';
import { applyContextualTheme } from '../../config/themes/themeController.js';

const fontThemes = ['classic', 'modern', 'professional', 'athletic', 'tech', 'casual'];
const colorThemes = ['classic', 'dark', 'professional', 'athletic', 'tech', 'casual'];

export function renderSettingsPage() {
  const container = document.getElementById('page-view');
  const session = JSON.parse(localStorage.getItem('supabaseSession') || 'null');
  const userId = session?.user?.id;

  if (!userId) {
    if (container) container.innerHTML = '<p class="text-red-500">Not logged in</p>';
    return;
  }

  fetchThemeSettings(userId).then(({ font, color }) => {
    if (!container) return;

    container.innerHTML = `
      <section class="p-6 space-y-6">
        <h2 class="text-2xl font-bold">🎨 Theme Settings</h2>

        <label class="block">
          <span class="text-sm text-gray-600">Font Theme</span>
          <select id="font-theme" class="mt-1 w-full p-2 border rounded">
            ${fontThemes
              .map(
                (f) =>
                  `<option value="${f}" ${f === font ? 'selected' : ''}>${capitalize(f)}</option>`
              )
              .join('')}
          </select>
        </label>

        <label class="block">
          <span class="text-sm text-gray-600">Color Theme</span>
          <select id="color-theme" class="mt-1 w-full p-2 border rounded">
            ${colorThemes
              .map(
                (c) =>
                  `<option value="${c}" ${c === color ? 'selected' : ''}>${capitalize(c)}</option>`
              )
              .join('')}
          </select>
        </label>

        <button id="save-theme-btn" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">💾 Save Theme</button>
        <p id="save-status" class="text-sm mt-2 text-green-600 hidden">✅ Saved!</p>
      </section>
    `;

    // Save button event
    const saveBtn = document.getElementById('save-theme-btn');
    saveBtn?.addEventListener('click', async () => {
      const fontSelect = /** @type {HTMLSelectElement} */ (document.getElementById('font-theme'));
      const colorSelect = /** @type {HTMLSelectElement} */ (document.getElementById('color-theme'));

      const font_theme = fontSelect?.value;
      const color_theme = colorSelect?.value;

      const { error } = await supabase
        .from('user_settings')
        .update({ font_theme, color_theme })
        .eq('user_id', userId);

      if (!error) {
        document.getElementById('save-status')?.classList.remove('hidden');
        await applyContextualTheme();
      } else {
        alert('❌ Failed to save theme.');
      }
    });
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
