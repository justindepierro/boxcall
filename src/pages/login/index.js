// src/pages/login/index.js
import { signIn } from '@auth/auth.js';
import { authCard } from '@components/AuthCard.js';
import { showToast } from '@utils/toast.js';
import { navigateTo } from '@routes/router.js';
import { formatError } from '@utils/errors.js';

export default function renderLoginPage(container) {
  // Directly render LoginComponent instead of using renderEngine
  container.innerHTML = '';
  container.appendChild(LoginComponent());
}

function LoginComponent() {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = authCard(
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

  wrapper.querySelector('#login-form')?.addEventListener('submit', handleLoginSubmit);
  return wrapper;
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const btn = document.getElementById('login-btn');
  const errorEl = document.getElementById('login-error');

  btn.disabled = true;
  btn.textContent = 'Logging in...';
  errorEl.textContent = '';

  const { error } = await signIn(email, password);
  if (error) {
    const msg = formatError ? formatError(error) : error.message;
    showToast(`❌ ${msg}`, 'error');
    errorEl.textContent = `⚠️ ${msg}`;
    btn.disabled = false;
    btn.textContent = 'Login';
    return;
  }

  showToast('✅ Logged in successfully!', 'success');
  setTimeout(() => navigateTo('dashboard'), 200);
}
