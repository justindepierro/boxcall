// src/pages/login/index.js
import { signIn } from '../../auth/auth.js';
import { authCard } from '../../components/AuthCard.js';

export default function renderLoginPage(container) {
  if (!container) {
    console.error('❌ Missing #app container for login page');
    return;
  }

  container.innerHTML = authCard('Login', `
    <form id="login-form" class="space-y-4">
      <input type="email" id="login-email" placeholder="Email" required class="w-full border p-2 rounded text-black" />
      <input type="password" id="login-password" placeholder="Password" required class="w-full border p-2 rounded text-black" />
      <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded">Login</button>
      <p id="login-error" class="text-red-500 text-sm mt-2"></p>
      <a href="#/forgot" class="text-sm text-blue-500 hover:underline block mt-2">Forgot your password?</a>
    </form>
  `);

  const form = document.getElementById('login-form');
  const errorEl = document.getElementById('login-error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    const { error } = await signIn(email, password);

    if (error) {
      errorEl.textContent = `⚠️ ${error.message}`;
    } else {
      // Optional: navigate + store session
      window.location.hash = '#/dashboard';
    }
  });
}