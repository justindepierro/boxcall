// src/pages/signup/index.js
import { signUp } from '@auth/auth.js';
import { authCard } from '@components/AuthCard.js';
import { showToast } from '@utils/toast.js';
import { formatError } from '@utils/errors.js';
import { qsInput, qsButton } from '@utils/domHelper.js';
import { BaseButton } from '@components/ui/baseButton.js';
import { createTextInput } from '@components/dev/devUI.js';
import { evaluatePasswordStrength } from '@utils/passwordStrength';
import { delayedRedirect } from '@utils/navigation';

/**
 * Renders the signup page.
 * @param {HTMLElement} container
 */
export default function renderSignupPage(container) {
  container.innerHTML = '';
  container.appendChild(SignupComponent());
}

/**
 * Creates the signup form component.
 * @returns {HTMLDivElement}
 */
function SignupComponent() {
  const wrapper = document.createElement('div');

  const form = document.createElement('form');
  form.id = 'signup-form';
  form.className = 'space-y-4';

  // Email Input
  const emailInput = createTextInput('signup-email', 'Email');
  form.appendChild(emailInput);

  // Password Input
  const passwordInput = createTextInput('signup-password', 'Password');
  passwordInput.type = 'password';
  form.appendChild(passwordInput);

  // Password Strength Indicator
  const passwordStrengthEl = document.createElement('p');
  passwordStrengthEl.id = 'password-strength';
  passwordStrengthEl.className = 'text-xs text-gray-500 transition-colors duration-300';
  passwordStrengthEl.textContent = 'Enter a password';
  form.appendChild(passwordStrengthEl);

  const passwordStrengthBar = document.createElement('div');
  passwordStrengthBar.className = 'h-2 w-full bg-gray-200 rounded overflow-hidden';
  const passwordStrengthFill = document.createElement('div');
  passwordStrengthFill.className = 'h-full w-0 bg-red-500 transition-all duration-300';
  passwordStrengthBar.appendChild(passwordStrengthFill);
  form.appendChild(passwordStrengthBar);

  const passwordSuggestion = document.createElement('p');
  passwordSuggestion.id = 'password-suggestion';
  passwordSuggestion.className = 'text-xs text-gray-400 italic';
  form.appendChild(passwordSuggestion);

  // Submit Button
  const signupBtn = BaseButton({
    label: 'Create Account',
    variant: 'primary',
    size: 'md',
    fullWidth: true,
    onClick: () => form.requestSubmit(),
  });
  signupBtn.id = 'signup-btn';
  form.appendChild(signupBtn);

  // Error Message
  const errorEl = document.createElement('p');
  errorEl.id = 'signup-error';
  errorEl.className = 'text-red-500 text-sm mt-2';
  form.appendChild(errorEl);

  wrapper.appendChild(authCard('Sign Up', form));

  // Live Password Strength Updates
  passwordInput.addEventListener('input', (e) => {
    if (!(e.target instanceof HTMLInputElement)) return;
    const value = e.target.value;
    const strength = evaluatePasswordStrength(value);

    passwordStrengthEl.textContent = strength.text;
    passwordStrengthEl.className = `text-xs font-medium transition-colors duration-300 ${strength.class}`;
    passwordStrengthFill.style.width = `${Math.min(strength.score * 20, 100)}%`;
    passwordStrengthFill.className = `h-full transition-all duration-300 ${
      strength.score <= 2 ? 'bg-red-500' : strength.score === 3 ? 'bg-yellow-500' : 'bg-green-500'
    }`;
    passwordSuggestion.textContent = getPasswordSuggestions(value, strength.score);
  });

  form.addEventListener('submit', handleSignupSubmit);
  return wrapper;
}

/**
 * Suggests improvements for a weak password.
 */
function getPasswordSuggestions(password, score) {
  if (!password) return '';
  const tips = [];
  if (password.length < 8) tips.push('Use at least 8 characters');
  if (!/[A-Z]/.test(password)) tips.push('Add an uppercase letter');
  if (!/[0-9]/.test(password)) tips.push('Add a number');
  if (!/[^A-Za-z0-9]/.test(password)) tips.push('Include a special symbol');
  return score < 4 ? `Tips: ${tips.join(', ')}` : 'Great password!';
}

/**
 * Handles signup submission with delayed redirect.
 */
async function handleSignupSubmit(e) {
  e.preventDefault();

  const form = e.currentTarget;
  if (!(form instanceof HTMLFormElement)) return;

  const emailInput = qsInput('#signup-email', form);
  const passwordInput = qsInput('#signup-password', form);
  const btn = qsButton('#signup-btn', form);
  const errorEl = form.querySelector('#signup-error');

  btn.disabled = true;
  btn.textContent = 'Creating...';
  if (errorEl) errorEl.textContent = '';

  const { error } = await signUp(emailInput.value.trim(), passwordInput.value);

  if (error) {
    const msg = formatError(error);
    showToast(`❌ ${msg}`, 'error');
    if (errorEl) errorEl.textContent = `⚠️ ${msg}`;
    btn.disabled = false;
    btn.textContent = 'Create Account';
    return;
  }

  // Success
  showToast('✅ Check your email to confirm your account.', 'success');
  if (errorEl) errorEl.textContent = '📧 Confirmation email sent. Redirecting...';

  form.querySelectorAll('input, button').forEach((el) => {
    if (el instanceof HTMLInputElement || el instanceof HTMLButtonElement) {
      el.disabled = true;
    }
  });

  // Redirect after delay
  delayedRedirect('login', 3500);
}
