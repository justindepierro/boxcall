// src/pages/forgot/index.js
import { resetPassword } from '@auth/auth.js';
import { authCard } from '@components/AuthCard.js';
import { showToast } from '@utils/toast.js';
import { qsInput, qsButton } from '@utils/domHelper.js';
import { BaseButton } from '@components/ui/baseButton.js';
import { createTextInput } from '@components/dev/devUI.js';
import { resetAppToPublic } from '@render/appReset.js';

/**
 * Renders the Forgot Password page and handles password reset requests.
 * @param {HTMLElement} container
 */
export default function renderForgotPasswordPage(container) {
  container.innerHTML = '';
  container.appendChild(ForgotComponent());
}

/**
 * Builds the Forgot Password component with reusable UI components.
 * @returns {HTMLDivElement}
 */
function ForgotComponent() {
  const wrapper = document.createElement('div');

  // === Form ===
  const form = document.createElement('form');
  form.id = 'forgot-form';
  form.className = 'space-y-4';

  // Email input
  const emailInput = createTextInput('forgot-email', 'Your email');
  form.appendChild(emailInput);

  // Submit button
  const forgotBtn = BaseButton({
    label: 'Send Reset Link',
    variant: 'warning',
    size: 'md',
    fullWidth: true,
    onClick: () => form.requestSubmit(),
  });
  forgotBtn.id = 'forgot-btn';
  form.appendChild(forgotBtn);

  // Feedback message
  const errorEl = document.createElement('p');
  errorEl.id = 'forgot-error';
  errorEl.className = 'text-red-500 text-sm mt-2';
  form.appendChild(errorEl);

  // Wrap form with authCard
  wrapper.appendChild(authCard('Forgot Password', form));

  // === Event Listener ===
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailField = qsInput('#forgot-email', form);
    const btn = qsButton('#forgot-btn', form);
    const errorEl = form.querySelector('#forgot-error');

    btn.disabled = true;
    btn.textContent = 'Sending...';

    const { error } = await resetPassword(emailField.value.trim());
    if (error) {
      if (errorEl) errorEl.textContent = `⚠️ ${error.message}`;
      showToast(`❌ ${error.message}`, 'error');
    } else {
      showToast('📬 Reset link sent. Check your inbox.', 'success');
      if (errorEl) errorEl.textContent = '✅ Email sent successfully.';

      // Redirect to login page after 2.5s
      setTimeout(() => resetAppToPublic('login'), 2500);
    }

    btn.disabled = false;
    btn.textContent = 'Send Reset Link';
  });

  return wrapper;
}
