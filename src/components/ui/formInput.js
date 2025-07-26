/**
 * Standardized Form Input Component
 * Creates consistent form inputs with proper Tailwind styling and validation
 */

import { createIcon } from '@utils/iconSystem.js';

/**
 * Creates a standardized form input with label and validation
 * @param {Object} options - Form input configuration
 * @param {string} [options.type='text'] - Input type (text, email, password, etc.)
 * @param {string} [options.name] - Input name attribute
 * @param {string} [options.label] - Field label text
 * @param {string} [options.placeholder] - Input placeholder
 * @param {boolean} [options.required=false] - Whether field is required
 * @param {string} [options.value] - Initial value
 * @param {string} [options.icon] - Lucide icon name for field
 * @param {string} [options.helpText] - Help text below field
 * @param {string} [options.errorText] - Error message
 * @param {Function} [options.onInput] - Input event handler
 * @param {Function} [options.onValidate] - Validation function
 * @returns {HTMLElement} Complete form input element
 */
export function FormInput({
  type = 'text',
  name = '',
  label = '',
  placeholder = '',
  required = false,
  value = '',
  icon = '',
  helpText = '',
  errorText = '',
  onInput = null,
  onValidate = null,
} = {}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-input space-y-2';

  // Label
  const labelEl = document.createElement('label');
  labelEl.className = 'block text-sm font-medium text-[var(--color-text)]';
  labelEl.setAttribute('for', name);
  labelEl.textContent = label + (required ? ' *' : '');

  // Input container (for icon support)
  const inputContainer = document.createElement('div');
  inputContainer.className = 'relative';

  // Input field
  const input = document.createElement('input');
  input.type = type;
  input.name = name;
  input.id = name;
  input.placeholder = placeholder;
  input.value = value;
  input.required = required;

  const inputClasses = [
    'w-full px-3 py-2 border border-[var(--color-border)]',
    'rounded-md shadow-sm',
    'bg-[var(--color-bg)] text-[var(--color-text)]',
    'placeholder-[var(--color-text-muted)]',
    'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]',
    'focus:border-[var(--color-accent)]',
    'transition-colors duration-200',
  ];

  if (icon) {
    inputClasses.push('pl-10'); // Space for icon
  }

  input.className = inputClasses.join(' ');

  // Icon (if provided)
  if (icon) {
    const iconEl = createIcon(icon, {
      size: 'h-5 w-5',
      color: 'text-[var(--color-text-muted)]',
      className: 'absolute left-3 top-2.5',
    });
    inputContainer.appendChild(iconEl);
  }

  inputContainer.appendChild(input);

  // Help text
  let helpEl;
  if (helpText) {
    helpEl = document.createElement('p');
    helpEl.className = 'text-xs text-[var(--color-text-muted)]';
    helpEl.textContent = helpText;
  }

  // Error text
  let errorEl;
  if (errorText) {
    errorEl = document.createElement('p');
    errorEl.className = 'text-xs text-[var(--color-danger)] form-error';
    errorEl.textContent = errorText;
    errorEl.style.display = 'none';
  }

  // Event handlers
  if (onInput) {
    input.addEventListener('input', (e) => onInput(e));
  }

  if (onValidate) {
    input.addEventListener('blur', () => {
      const isValid = onValidate(input.value);
      if (!isValid && errorEl) {
        errorEl.style.display = 'block';
        input.classList.add('border-[var(--color-danger)]');
      } else if (errorEl) {
        errorEl.style.display = 'none';
        input.classList.remove('border-[var(--color-danger)]');
      }
    });
  }

  // Assemble field
  wrapper.appendChild(labelEl);
  wrapper.appendChild(inputContainer);
  if (helpEl) wrapper.appendChild(helpEl);
  if (errorEl) wrapper.appendChild(errorEl);

  return wrapper;
}

/**
 * Creates a select dropdown with standardized styling
 */
export function FormSelect({
  name = '',
  label = '',
  options = [],
  required = false,
  value = '',
  helpText = '',
  onInput = null,
} = {}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-select space-y-2';

  const labelEl = document.createElement('label');
  labelEl.className = 'block text-sm font-medium text-[var(--color-text)]';
  labelEl.setAttribute('for', name);
  labelEl.textContent = label + (required ? ' *' : '');

  const select = document.createElement('select');
  select.name = name;
  select.id = name;
  select.required = required;
  select.className = [
    'w-full px-3 py-2 border border-[var(--color-border)]',
    'rounded-md shadow-sm',
    'bg-[var(--color-bg)] text-[var(--color-text)]',
    'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]',
    'focus:border-[var(--color-accent)]',
    'transition-colors duration-200',
  ].join(' ');

  // Add options
  options.forEach((option) => {
    const optionEl = document.createElement('option');
    if (typeof option === 'string') {
      optionEl.value = option;
      optionEl.textContent = option;
    } else {
      optionEl.value = option.value;
      optionEl.textContent = option.label;
    }
    if (option.value === value || option === value) {
      optionEl.selected = true;
    }
    select.appendChild(optionEl);
  });

  if (onInput) {
    select.addEventListener('change', (e) => onInput(e));
  }

  wrapper.appendChild(labelEl);
  wrapper.appendChild(select);

  if (helpText) {
    const helpEl = document.createElement('p');
    helpEl.className = 'text-xs text-[var(--color-text-muted)]';
    helpEl.textContent = helpText;
    wrapper.appendChild(helpEl);
  }

  return wrapper;
}
