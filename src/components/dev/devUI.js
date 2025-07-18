// src/components/dev/devUI.js

/**
 * Creates a reusable checkbox component.
 * @param {string} id
 * @param {string} label
 * @param {boolean} [checked=false]
 * @param {(checked: boolean) => void} [onChange=() => {}]
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
  box.className = 'form-checkbox';

  box.addEventListener('change', () => onChange(box.checked));

  const text = document.createElement('span');
  text.textContent = label;

  wrapper.appendChild(box);
  wrapper.appendChild(text);

  return wrapper;
}

/**
 * Creates a styled button with click handler.
 * @param {string} label
 * @param {() => void} onClick
 * @param {string} [className='']
 * @param {string} [title='']
 * @returns {HTMLButtonElement}
 */
export function createButton(label, onClick, className = '', title = '') {
  const btn = document.createElement('button');
  btn.textContent = label;
  btn.className = `px-2 py-1 rounded text-xs ${className}`;
  if (title) btn.title = title;
  btn.setAttribute('aria-label', title || label);
  btn.addEventListener('click', onClick);
  return btn;
}

/**
 * Creates a text input with optional input handler.
 * @param {string} id
 * @param {string} [placeholder='']
 * @param {(value: string) => void} [onInput=() => {}]
 * @returns {HTMLInputElement}
 */
export function createTextInput(id, placeholder = '', onInput = () => {}) {
  /** @type {HTMLInputElement} */
  const input = document.createElement('input');
  input.type = 'text';
  input.id = id;
  input.name = id;
  input.placeholder = placeholder;
  input.className = 'text-black text-xs p-1 rounded w-full';
  input.setAttribute('aria-label', placeholder || id);

  input.addEventListener('input', () => onInput(input.value));
  return input;
}
