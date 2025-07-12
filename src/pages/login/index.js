// src/pages/login/index.js
import { signIn } from '../../auth/auth.js';
import { authCard } from '../../components/AuthCard.js';
import { showToast } from '../../../utils/toast.js'; // ✅ Import toast  

export default function renderLoginPage(container) {
  console.log('🔑 Login render triggered');
console.log('container:', container);
  container.innerHTML = authCard('Login', `
    <form id="login-form" class="space-y-4">
      <input type="email" id="login-email" placeholder="Email" required class="w-full border p-2 rounded" />
      <input type="password" id="login-password" placeholder="Password" required class="w-full border p-2 rounded" />
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
      showToast('Login failed: ' + error.message, 'error');
    } else {
      showToast('Login successful!', 'success');
      window.location.hash = '#/dashboard';
    }
  });
}