// src/config/themes/themeController.js

import { applyTheme } from '../../utils/themeManager.js';

export async function applyContextualTheme() {
  applyTheme('default');
}
