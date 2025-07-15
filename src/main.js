// src/main.js

// ✅ Tailwind + Font Imports
import './styles/tailwind.css';
import './styles/fonts.css';

// ✅ App Bootstrapping Logic
import { initApp } from './init.js';

// ✅ Start app on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('📦 Initializing BoxCall App...');

  // 🧼 Apply fallback body styling immediately
  document.body.classList.add('bg-[var(--color-bg)]', 'text-[var(--color-text)]');

  try {
    initApp(); // Fully async init system
  } catch (err) {
    console.error('❌ App failed to initialize:', err);
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = `<div class="text-red-500 p-4">Critical error loading app.</div>`;
    }
  }
});
