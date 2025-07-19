// src/pages/login/index.js
import { signIn } from '@auth/auth.js';
import { authCard } from '@components/AuthCard.js';
import { showToast } from '@utils/toast.js';
import { formatError } from '@utils/errors.js';
import { initializeUser } from '@lib/init/initUser.js';
import { qsInput, qsButton } from '@utils/domHelper.js';
import { BaseButton } from '@components/ui/baseButton.js';
import { createTextInput } from '@components/dev/devUI.js';
import { resetAppToPrivate } from '@render/appReset.js';

/**
 * Renders the login page into the given container.
 * @param {HTMLElement} container
 */
export default function renderLoginPage(container) {
  container.innerHTML = '';
  container.appendChild(LoginComponent());
}

/**
 * Builds the login form component wrapped in authCard.
 */
function LoginComponent() {
  const wrapper = document.createElement('div');

  const form = document.createElement('form');
  form.id = 'login-form';
  form.className = 'space-y-4';

  const emailInput = createTextInput('login-email', 'Email');
  form.appendChild(emailInput);

  const passwordInput = createTextInput('login-password', 'Password');
  passwordInput.type = 'password';
  form.appendChild(passwordInput);

  const loginBtn = BaseButton({
    label: 'Login',
    variant: 'primary',
    fullWidth: true,
    onClick: () => form.requestSubmit(),
  });
  loginBtn.id = 'login-btn';
  form.appendChild(loginBtn);

  const errorEl = document.createElement('p');
  errorEl.id = 'login-error';
  errorEl.className = 'text-red-500 text-sm mt-2';
  form.appendChild(errorEl);

  const forgotLink = document.createElement('a');
  forgotLink.href = '#/forgot';
  forgotLink.className = 'text-sm text-blue-500 hover:underline block mt-2';
  forgotLink.textContent = 'Forgot your password?';
  form.appendChild(forgotLink);

  wrapper.appendChild(authCard('Login', form));

  form.addEventListener('submit', handleLoginSubmit);
  return wrapper;
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const form = e.currentTarget;
  if (!(form instanceof HTMLFormElement)) return;

  const emailInput = qsInput('#login-email', form);
  const passwordInput = qsInput('#login-password', form);
  const btn = qsButton('#login-btn', form);
  const errorEl = form.querySelector('#login-error');

  btn.disabled = true;
  btn.textContent = 'Logging in...';
  if (errorEl) errorEl.textContent = '';

  const { error } = await signIn(emailInput.value.trim(), passwordInput.value);
  if (error) {
    const msg = formatError ? formatError(error) : error.message;
    showToast(`❌ ${msg}`, 'error');
    errorEl.textContent = `⚠️ ${msg}`;
    btn.disabled = false;
    btn.textContent = 'Login';
    return;
  }

  await initializeUser();
  showToast('✅ Logged in successfully!', 'success');

  await resetAppToPrivate('dashboard'); // <-- Switch to private shell
}
