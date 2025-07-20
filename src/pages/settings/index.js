// src/pages/settings/index.js

import { getUser } from '@auth/auth.js';
import { updateUserSettings } from '@lib/teams/user/updateUserSettings.js';
import { updateThemeSettings } from '@lib/teams/user/updateThemeSettings.js';
import { showToast } from '@utils/toast.js';
import { qs } from '@utils/domHelper.js';
import { supabase } from '@auth/supabaseClient.js';

/**
 * Safely retrieves the `.value` of an element by selector.
 * @param {string} selector
 * @returns {string}
 */
function getElementValue(selector) {
  const el = qs(selector);
  if (
    el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    el instanceof HTMLSelectElement
  ) {
    return el.value;
  }
  return '';
}

/**
 * Renders the Profile Settings page.
 * @param {HTMLElement} container
 */
export default async function renderSettingsPage(container) {
  // Render the settings form
  container.innerHTML = `
    <section class="p-6 space-y-6 max-w-xl mx-auto">
      <h2 class="text-2xl font-bold mb-4">⚙️ Profile Settings</h2>
      <form id="settings-form" class="space-y-4">
        <div>
          <label class="block text-sm font-medium">Full Name</label>
          <input type="text" id="full-name" class="border rounded p-2 w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium">Bio</label>
          <textarea id="bio" class="border rounded p-2 w-full h-24"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium">Font Theme</label>
          <select id="font-theme" class="border rounded p-2 w-full">
            <option value="classic">Classic</option>
            <option value="modern">Modern</option>
            <option value="athletic">Athletic</option>
            <option value="tech">Tech</option>
            <option value="casual">Casual</option>
            <option value="professional">Professional</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium">Color Theme</label>
          <select id="color-theme" class="border rounded p-2 w-full">
            <option value="classic">Classic</option>
            <option value="dark">Dark</option>
            <option value="athletic">Athletic</option>
            <option value="tech">Tech</option>
            <option value="casual">Casual</option>
            <option value="professional">Professional</option>
          </select>
        </div>
        <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Save Settings
        </button>
      </form>
    </section>
  `;

  const form = qs('#settings-form');
  const user = await getUser();

  if (!user) {
    showToast('❌ No user found. Please log in.', 'error');
    return;
  }

  // Prefill user data
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('full_name, bio, settings')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('⚠️ Failed to fetch profile:', error);
      showToast('⚠️ Failed to load profile settings.', 'warn');
    } else if (profile) {
      const { full_name, bio, settings = {} } = profile;

      const fullNameEl = qs('#full-name');
      if (fullNameEl instanceof HTMLInputElement) {
        fullNameEl.value = full_name || '';
      }

      const bioEl = qs('#bio');
      if (bioEl instanceof HTMLTextAreaElement) {
        bioEl.value = bio || '';
      }

      const fontThemeEl = qs('#font-theme');
      if (fontThemeEl instanceof HTMLSelectElement) {
        fontThemeEl.value = settings.font_theme || 'classic';
      }

      const colorThemeEl = qs('#color-theme');
      if (colorThemeEl instanceof HTMLSelectElement) {
        colorThemeEl.value = settings.color_theme || 'classic';
      }
    }
  } catch (err) {
    console.error('❌ Error loading profile settings:', err);
    showToast('⚠️ Failed to load profile settings.', 'warn');
  }

  // Handle Save
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const updates = {
      full_name: getElementValue('#full-name'),
      bio: getElementValue('#bio'),
      font_theme: getElementValue('#font-theme'),
      color_theme: getElementValue('#color-theme'),
    };

    try {
      await updateUserSettings(user.id, updates);
      await updateThemeSettings(user.id, {
        font_theme: updates.font_theme,
        color_theme: updates.color_theme,
      });
      showToast('✅ Settings updated successfully!', 'info');
    } catch (err) {
      console.error('❌ Failed to update settings:', err);
      showToast('❌ Failed to update settings.', 'error');
    }
  });
}
