// src/main.js
import { devLog, devError } from '@utils/devLogger';
// ✅ Import Tailwind and Fonts
import './styles/tailwind.css';
import './styles/fonts.css';

// ✅ Initialize the full app system
import { initApp } from './init.js';

/**
 * DOM Ready Boot Sequence
 */
document.addEventListener('DOMContentLoaded', async () => {
  devLog('🚀 DOM ready — booting BoxCall...');

  // Fallback styles (in case theme is slow to load)
  document.body.classList.add('bg-[var(--color-bg)]', 'text-[var(--color-text)]');

  try {
    await initApp(); // Full async bootstrap
  } catch (err) {
    devError(
      `❌ BoxCall failed to initialize: ${err instanceof Error ? err.message : String(err)}`
    );
    const root = document.getElementById('page-view') || document.getElementById('app');
    if (root) {
      root.innerHTML = `
      <div class="text-red-500 bg-white p-4 rounded shadow max-w-md mx-auto mt-20">
        <h1 class="text-2xl font-bold mb-2">⚠️ App Failed to Load</h1>
        <p>${err instanceof Error ? err.message : 'Unexpected error during initialization.'}</p>
      </div>
    `;
    }
  }
});
