// src/js/main.js
import '../src/styles/tailwind.css'; // ✅ ENSURE Tailwind loads
import { initApp } from './init.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('📦 Initializing BoxCall App...');
  try {
    initApp();
  } catch (err) {
    console.error('❌ App failed to initialize:', err);
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = `<div class="text-red-500 p-4">Critical error loading app.</div>`;
    }
  }
});