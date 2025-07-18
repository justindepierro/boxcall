// src/pages/forgot/index.js
import { resetPassword } from '@auth/auth.js';
import { authCard } from '../../components/AuthCard.js';
import { showToast } from '../../utils/toast.js';

/**
 * Renders the Forgot Password page and handles password reset requests.
 * @param {HTMLElement} container - The DOM container to render the page.
 */
export default function renderForgotPasswordPage(container) {
  container.innerHTML = authCard(
    'Forgot Password',
    `
      <form id="forgot-form" class="space-y-4">
        <input 
          type="email" 
          id="forgot-email" 
          placeholder="Your email" 
          required 
          class="w-full border p-2 rounded" 
        />
        <button 
          id="forgot-btn" 
          type="submit" 
          class="w-full bg-yellow-600 text-white py-2 rounded"
        >
          Send Reset Link
        </button>
        <p id="forgot-error" class="text-red-500 text-sm mt-2"></p>
      </form>
    `
  );

  const form = document.getElementById('forgot-form');
  const emailInput = /** @type {HTMLInputElement} */ (document.getElementById('forgot-email'));
  const btn = /** @type {HTMLButtonElement} */ (document.getElementById('forgot-btn'));
  const errorEl = document.getElementById('forgot-error');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();

    btn.disabled = true;
    btn.textContent = 'Sending...';

    const { error } = await resetPassword(email);
    if (error) {
      errorEl.textContent = `⚠️ ${error.message}`;
    } else {
      showToast('📬 Reset link sent. Check your inbox.', 'success');
      errorEl.textContent = '✅ Email sent successfully.';
    }

    btn.disabled = false;
    btn.textContent = 'Send Reset Link';
  });
}
