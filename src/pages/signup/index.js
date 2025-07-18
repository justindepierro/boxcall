// src/pages/signup/index.js
import { signUp } from '@auth/auth.js';
import { authCard } from '../../components/AuthCard.js';
import { showToast } from '../../utils/toast.js';
import { formatError } from '../../utils/errors.js';

export default function renderSignupPage(container) {
  container.innerHTML = authCard(
    'Sign Up',
    `
    <form id="signup-form" class="space-y-4">
      <input type="email" id="signup-email" placeholder="Email" required class="w-full border p-2 rounded" />
      <input type="password" id="signup-password" placeholder="Password" required class="w-full border p-2 rounded" />
      <button id="signup-btn" type="submit" class="w-full bg-green-600 text-white py-2 rounded">Create Account</button>
      <p id="signup-error" class="text-red-500 text-sm mt-2"></p>
    </form>
  `
  );

  const form = document.getElementById('signup-form');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Cast inputs and button to their correct types
    const emailInput = /** @type {HTMLInputElement} */ (document.getElementById('signup-email'));
    const passwordInput = /** @type {HTMLInputElement} */ (
      document.getElementById('signup-password')
    );
    const btn = /** @type {HTMLButtonElement} */ (document.getElementById('signup-btn'));
    const errorEl = /** @type {HTMLParagraphElement} */ (document.getElementById('signup-error'));

    const email = emailInput?.value.trim();
    const password = passwordInput?.value;

    btn.disabled = true;
    btn.textContent = 'Creating...';

    const { error } = await signUp(email, password);
    if (error) {
      errorEl.textContent = `⚠️ ${formatError ? formatError(error) : error.message}`;
    } else {
      showToast('✅ Check your email to confirm your account.', 'success');
      errorEl.textContent = '✅ Email sent — check your inbox.';
    }

    btn.disabled = false;
    btn.textContent = 'Create Account';
  });
}
