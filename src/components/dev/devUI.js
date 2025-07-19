// src/components/dev/devUI.js

import { getChecked } from '@utils/domHelper.js';

/**
 * Creates a reusable, styled checkbox component with label and callback.
 *
 * @param {string} id - The element ID.
 * @param {string} label - The label text next to the checkbox.
 * @param {boolean} [checked=false] - Initial checked state.
 * @param {(checked: boolean) => void} [onChange=() => {}] - Callback triggered on change.
 * @returns {HTMLLabelElement}
 */
export function createCheckbox(id, label, checked = false, onChange = () => {}) {
  const wrapper = document.createElement('label');
  wrapper.className = 'flex items-center gap-2 text-xs cursor-pointer';
  wrapper.htmlFor = id;

  /** @type {HTMLInputElement} */
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.id = id;
  box.name = id;
  box.checked = checked;
  box.className = 'form-checkbox accent-blue-600';

  // Use `getChecked` for type-safe state retrieval
  box.addEventListener('change', (e) => onChange(getChecked(e)));

  const text = document.createElement('span');
  text.textContent = label;

  wrapper.append(box, text);
  return wrapper;
}

/**
 * Creates a styled button with an accessible click handler.
 *
 * @param {string} label - Button text.
 * @param {() => void} onClick - Click handler function.
 * @param {string} [className=''] - Additional Tailwind classes.
 * @param {string} [title=''] - Tooltip/ARIA label.
 * @returns {HTMLButtonElement}
 */
export function createButton(label, onClick, className = '', title = '') {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = label;
  btn.className = `px-2 py-1 rounded text-xs ${className}`.trim();
  btn.setAttribute('aria-label', title || label);
  if (title) btn.title = title;

  btn.addEventListener('click', onClick);
  return btn;
}

/**
 * Creates a reusable text input with optional callback for input events.
 *
 * @param {string} id - The input element ID.
 * @param {string} [placeholder=''] - Placeholder text.
 * @param {(value: string) => void} [onInput=() => {}] - Callback triggered on input.
 * @returns {HTMLInputElement}
 */
export function createTextInput(id, placeholder = '', onInput = () => {}) {
  /** @type {HTMLInputElement} */
  const input = document.createElement('input');
  input.type = 'text';
  input.id = id;
  input.name = id;
  input.placeholder = placeholder;
  input.className = 'text-black text-xs p-1 rounded w-full border border-gray-300';
  input.setAttribute('aria-label', placeholder || id);

  input.addEventListener('input', () => onInput(input.value));
  return input;
}
