// src/components/ui/BaseSlider.js

/**
 * Creates a flexible slider component.
 *
 * @param {Object} options
 * @param {string} [options.label] - Optional label above slider
 * @param {number} [options.min=0]
 * @param {number} [options.max=100]
 * @param {number} [options.step=1]
 * @param {number} [options.value=0]
 * @param {(value: number) => void} [options.onChange] - Called with new value
 * @param {boolean} [options.disabled=false]
 * @param {boolean} [options.showValue=true]
 * @returns {HTMLDivElement}
 */
export function BaseSlider({
  label = '',
  min = 0,
  max = 100,
  step = 1,
  value = 0,
  onChange,
  disabled = false,
  showValue = true,
} = {}) {
  /** @type {HTMLDivElement} */
  const wrapper = document.createElement('div');
  wrapper.className = 'space-y-1 w-full';

  // Label
  if (label) {
    const labelEl = document.createElement('label');
    labelEl.className = 'block text-sm font-medium text-[var(--color-text)]';
    labelEl.textContent = label;
    wrapper.appendChild(labelEl);
  }

  const sliderWrapper = document.createElement('div');
  sliderWrapper.className = 'flex items-center gap-3';

  /** @type {HTMLInputElement} */
  const input = document.createElement('input');
  input.type = 'range';
  input.min = String(min); // ensure string type
  input.max = String(max);
  input.step = String(step);
  input.value = String(value);
  input.disabled = disabled;

  input.className = `
    w-full h-2 rounded-lg appearance-none cursor-pointer transition
    bg-[var(--color-border)]
    focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
  `.trim();

  /** @type {HTMLSpanElement} */
  const valueEl = document.createElement('span');
  valueEl.className = 'text-sm text-[var(--color-muted)] min-w-[2ch] text-right';
  valueEl.textContent = showValue ? String(value) : '';

  // 📈 Change handler
  input.addEventListener('input', (e) => {
    const target = /** @type {HTMLInputElement} */ (e.target);
    valueEl.textContent = showValue ? target.value : '';
    if (onChange) onChange(Number(target.value));
  });

  sliderWrapper.appendChild(input);
  if (showValue) sliderWrapper.appendChild(valueEl);

  wrapper.appendChild(sliderWrapper);
  return wrapper;
}
