// src/pages/login/index.js
import { signIn } from '@auth/auth.js';
import { showToast } from '@utils/toast.js';
import { qsInput } from '@utils/domHelper.js';
import { initializeUser } from '@lib/init/initUser.js';
import { resetAppToPrivate } from '@render/appReset.js';
import { markTemporarySession } from '@utils/sessionHelper';
import { handleAuthSubmit } from '@utils/authForms.js';
import { createAuthPage } from '@components/AuthFormPage.js';
import { createRememberMe } from '@components/ui/rememberMe.js';

export default function renderLoginPage(container) {
  container.innerHTML = '';

  const forgotLink = document.createElement('a');
  forgotLink.href = '#/forgot';
  forgotLink.className = 'text-sm text-blue-500 hover:underline block mt-2';
  forgotLink.textContent = 'Forgot your password?';

  const signupLink = document.createElement('a');
  signupLink.href = '#/signup';
  signupLink.className = 'text-sm text-blue-500 hover:underline block mt-2';
  signupLink.textContent = "Don't have an account? Sign up here.";

  container.appendChild(
    createAuthPage({
      title: 'Login',
      fields: [
        { id: 'login-email', label: 'Email' },
        { id: 'login-password', label: 'Password', type: 'password' },
      ],
      button: { label: 'Login', variant: 'primary', fullWidth: true },
      extraElements: [createRememberMe(), forgotLink, signupLink],
      onSubmit: async (e, form, loginBtn, errorEl) => {
        e.preventDefault();
        const email = qsInput('#login-email', form).value.trim();
        const password = qsInput('#login-password', form).value;

        await handleAuthSubmit(form, loginBtn, () => signIn(email, password), {
          loadingText: 'Logging in...',
          withOverlay: true,
          onSuccess: async () => {
            const rememberMeEl = form.querySelector('#remember-me');
            const rememberMe =
              rememberMeEl instanceof HTMLInputElement ? rememberMeEl.checked : false;
            markTemporarySession(!rememberMe);

            await initializeUser();
            showToast('✅ Logged in successfully!', 'success');
            await resetAppToPrivate('dashboard');
          },
          onError: (err) => {
            const msg = err.message || 'Login failed.';
            if (errorEl) errorEl.textContent = `⚠️ ${msg}`;
            showToast(`❌ ${msg}`, 'error');
          },
        });
      },
    })
  );
}
