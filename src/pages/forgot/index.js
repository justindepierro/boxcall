// src/pages/forgot/index.js
import { resetPassword } from '../../auth/auth.js';
import { authCard } from '../../components/AuthCard.js';
import { showToast } from '../../../utils/toast.js';
import { formatError } from '../../../utils/errors.js';

export default function renderForgotPage(container) {
  container.innerHTML = authCard(
    'Forgot Password',
    `
    <form id="forgot-form" class="space-y-4">
      <input type="email" id="forgot-email" placeholder="Enter your email" required class="w-full border p-2 rounded" />
      <button id="forgot-btn" type="submit" class="w-full bg-yellow-500 text-white py-2 rounded">Send Reset Link</button>
      <p id="forgot-message" class="text-sm mt-2 text-blue-500"></p>
    </form>
    <a href="#/login" class="block mt-4 text-sm text-blue-600 hover:underline">Back to login</a>
  `,
    "We’ll send a password reset link to your email. Check your spam folder if you don't see it within a few minutes."
  );

  const form = document.getElementById('forgot-form');
  form.addEventListener('submit', handleForgotSubmit);
}

async function handleForgotSubmit(e) {
  e.preventDefault();

  const email = document.getElementById('forgot-email').value.trim();
  const btn = document.getElementById('forgot-btn');
  const msg = document.getElementById('forgot-message');

  msg.textContent = '';
  btn.disabled = true;
  btn.textContent = 'Sending...';

  if (!email.includes('@')) {
    msg.textContent = '⚠️ Please enter a valid email address.';
    btn.disabled = false;
    btn.textContent = 'Send Reset Link';
    return;
  }

  const { error } = await resetPassword(email);

  if (error) {
    const formatted = formatError ? formatError(error) : error.message;
    msg.textContent = `⚠️ ${formatted}`;
    showToast('Reset failed: ' + formatted, 'error');
  } else {
    msg.innerHTML = `
      ✅ Reset email sent to <strong>${email}</strong>.<br>
      If you don't see it, check your spam folder or use your school-issued email.<br>
      You can also <a href="#/forgot" class="underline">try again</a> if needed.
    `;
    showToast('Check your inbox for a reset email.', 'success');
  }

  btn.disabled = false;
  btn.textContent = 'Send Reset Link';
}