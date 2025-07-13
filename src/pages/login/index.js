// src/pages/login/index.js
import { signIn } from '@auth/auth.js'; // instead of ../../auth/auth.js
import { authCard } from '../../components/AuthCard.js';
import { showToast } from '../../utils/toast.js';
import { navigateTo } from '../../routes/router.js'; // 🔁 if you have a router
import { formatError } from '../../utils/errors.js'; // 🔁 optional helper

export default function renderLoginPage(container) {
  console.log('🔑 Rendering Login Page');
  container.innerHTML = authCard(
    'Login',
    `
    <form id="login-form" class="space-y-4">
      <input type="email" id="login-email" placeholder="Email" required class="w-full border p-2 rounded" />
      <input type="password" id="login-password" placeholder="Password" required class="w-full border p-2 rounded" />
      <button id="login-btn" type="submit" class="w-full bg-blue-600 text-white py-2 rounded">Login</button>
      <p id="login-error" class="text-red-500 text-sm mt-2"></p>
      <a href="#/forgot" class="text-sm text-blue-500 hover:underline block mt-2">Forgot your password?</a>
    </form>
  `
  );

  const form = document.getElementById('login-form');
  form.addEventListener('submit', handleLoginSubmit);
}

async function handleLoginSubmit(e) {
  e.preventDefault();

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');
  const btn = document.getElementById('login-btn');

  btn.disabled = true;
  btn.textContent = 'Logging in...';
  errorEl.textContent = '';

  const { error } = await signIn(email, password);

  if (error) {
    const msg = formatError ? formatError(error) : error.message;
    showToast('❌ Login failed: ' + msg, 'error');
    errorEl.textContent = '⚠️ ' + msg;
  } else {
    showToast('✅ Login successful!', 'success');
    navigateTo('dashboard'); // more reliable than hash assignment
  }

  btn.disabled = false;
  btn.textContent = 'Login';
}
