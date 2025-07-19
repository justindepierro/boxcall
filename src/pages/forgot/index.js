// src/pages/forgot/index.js
import { resetPassword } from '@auth/auth.js';
import { showToast } from '@utils/toast.js';
import { qsInput } from '@utils/domHelper.js';
import { resetAppToPublic } from '@render/appReset.js';
import { handleAuthSubmit, resetErrors } from '@utils/authForms.js';
import { createAuthPage } from '@components/AuthFormPage.js';

export default function renderForgotPasswordPage(container) {
  container.innerHTML = '';

  container.appendChild(
    createAuthPage({
      title: 'Forgot Password',
      fields: [{ id: 'forgot-email', label: 'Your Email', type: 'email' }],
      button: { label: 'Send Reset Link', variant: 'warning', fullWidth: true },
      onSubmit: handleForgotSubmit,
      errorId: 'forgot-error',
    })
  );

  qsInput('#forgot-email')?.focus();
}

async function handleForgotSubmit(e, form, forgotBtn, errorEl) {
  e.preventDefault();
  if (!(form instanceof HTMLFormElement) || !(forgotBtn instanceof HTMLButtonElement)) return;

  const email = qsInput('#forgot-email', form).value.trim();
  resetErrors(form);

  await handleAuthSubmit(form, forgotBtn, () => resetPassword(email), {
    loadingText: 'Sending...',
    withOverlay: true,
    overlayMessage: 'Sending reset link...',
    onSuccess: () => {
      showToast('📬 Reset link sent. Check your inbox.', 'success');
      if (errorEl) errorEl.textContent = '✅ Email sent successfully.';
      setTimeout(() => resetAppToPublic('login'), 2500);
    },
    onError: (err) => {
      const msg = err.message || 'Unknown error occurred.';
      showToast(`❌ ${msg}`, 'error');
      if (errorEl) errorEl.textContent = `⚠️ ${msg}`;
    },
  });
}
