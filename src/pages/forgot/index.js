// src/pages/forgot/index.js
import { resetPassword } from '../../auth/auth.js';
import { authCard } from '../../lib/authCard.js';

export default function renderForgotPage(container) {
  container.innerHTML = authCard(
    'Reset Password',
    `
    <form id="reset-form" class="space-y-4">
      <input type="email" id="reset-email" placeholder="Your email address" required class="w-full border p-2 rounded" />
      <button type="submit" class="w-full bg-yellow-500 text-white py-2 rounded">Send Reset Link</button>
      <p id="reset-message" class="text-sm mt-2 text-blue-500"></p>
    </form>
  `
  );

  const form = document.getElementById('reset-form');
  const msg = document.getElementById('reset-message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('reset-email').value.trim();

    const { error } = await resetPassword(email);

    msg.textContent = error ? `⚠️ ${error.message}` : `✅ Check your email for a reset link`;
  });
}
