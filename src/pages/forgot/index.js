// src/pages/forgot/index.js
import { resetPassword } from '@auth/auth.js';
import { showToast } from '@utils/toast.js';
import { qsInput } from '@utils/domHelper.js';
import { resetAppToPublic } from '@render/appReset.js';
import { resetErrors, handleAuthSubmit } from '@utils/authForms.js';
import { createAuthPage } from '@components/AuthFormPage.js';
import { createBackToLoginLink } from '@components/ui/backToLogin.js'; // New helper

export default function renderForgotPasswordPage(container) {
  container.innerHTML = '';

  container.appendChild(
    createAuthPage({
      title: 'Forgot Password',
      fields: [{ id: 'forgot-email', label: 'Your Email', type: 'email' }],
      button: { label: 'Send Reset Link', variant: 'warning', fullWidth: true },
      extraElements: [createBackToLoginLink()],
      onSubmit: async (e, form, forgotBtn, errorEl) => {
        e.preventDefault();
        const emailField = qsInput('#forgot-email', form);

        resetErrors(form);
        await handleAuthSubmit(form, forgotBtn, () => resetPassword(emailField.value.trim()), {
          loadingText: 'Sending...',
          withOverlay: true,
          onSuccess: () => {
            showToast('📬 Reset link sent. Check your inbox.', 'success');
            if (errorEl) errorEl.textContent = '✅ Email sent successfully.';
            setTimeout(() => resetAppToPublic('login'), 2500);
          },
          onError: (err) => {
            const msg = err.message || 'Unknown error occurred';
            showToast(`❌ ${msg}`, 'error');
            if (errorEl) errorEl.textContent = `⚠️ ${msg}`;
          },
        });
      },
    })
  );

  qsInput('#forgot-email')?.focus();
}
