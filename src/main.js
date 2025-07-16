// src/main.js

// ✅ Import Tailwind and Fonts
import './styles/tailwind.css';
import './styles/fonts.css';

// ✅ Initialize the full app system
import { initApp } from './init.js';

/**
 * DOM Ready Boot Sequence
 */
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 DOM ready — booting BoxCall...');

  // Fallback styles (in case theme is slow to load)
  document.body.classList.add('bg-[var(--color-bg)]', 'text-[var(--color-text)]');

  try {
    await initApp(); // Full async bootstrap
  } catch (err) {
    console.error('❌ BoxCall failed to initialize:', err);
    const root = document.getElementById('page-view') || document.getElementById('app');
    if (root) {
      root.innerHTML = `
        <div class="text-red-500 bg-white p-4 rounded shadow max-w-md mx-auto mt-20">
          <h1 class="text-2xl font-bold mb-2">⚠️ App Failed to Load</h1>
          <p>${err.message || 'Unexpected error during initialization.'}</p>
        </div>
      `;
    }
  }
});
