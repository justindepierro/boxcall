/**
 * DOM Helper Utilities
 * ---------------------
 * Provides safe wrappers for querying and working with DOM elements.
 */

/**
 * Shorthand for `document.querySelector`.
 * @template {Element} T
 * @param {string} selector
 * @returns {T|null}
 */
export function qs(selector) {
  return document.querySelector(selector);
}

/**
 * Shorthand for `document.querySelector` with cast safety.
 * Returns element or null, but ensures Element type (e.g., HTMLSelectElement).
 * @template {Element} T
 * @param {string} selector
 * @returns {T|null}
 */
export function qsi(selector) {
  const el = document.querySelector(selector);
  return el ? /** @type {T} */ (el) : null;
}

/**
 * Safely returns the checked state from an event target.
 * @param {Event} e
 * @returns {boolean}
 */
export function getChecked(e) {
  return !!(e.target && /** @type {HTMLInputElement} */ (e.target).checked);
}

/**
 * Get a value from an event target if it's an input/select element.
 * @param {Event} e
 * @returns {string}
 */
export function getValue(e) {
  return e.target && 'value' in e.target ? /** @type {HTMLInputElement} */ (e.target).value : '';
}

/**
 * Safely sets the value of a select element if it exists and is the correct type.
 * @param {Element|null} el
 * @param {string} value
 */
export function setSelectValue(el, value) {
  if (el instanceof HTMLSelectElement) el.value = value;
}
/**
 * Query and cast an input element.
 * Returns null if the element is not found.
 * @param {string} selector - CSS selector for the input.
 * @param {Document | HTMLElement} [parent=document] - Parent to search in.
 * @returns {HTMLInputElement | null}
 */
export function qsInput(selector, parent = document) {
  const el = parent.querySelector(selector);
  return el instanceof HTMLInputElement ? el : null;
}

/**
 * Query and cast a button element.
 * Returns null if the element is not found.
 * @param {string} selector
 * @param {Document | HTMLElement} [parent=document]
 * @returns {HTMLButtonElement | null}
 */
export function qsButton(selector, parent = document) {
  const el = parent.querySelector(selector);
  return el instanceof HTMLButtonElement ? el : null;
}

/**
 * Strict variant of qsInput — throws error if not found.
 * @param {string} selector
 * @param {Document | HTMLElement} [parent=document]
 * @returns {HTMLInputElement}
 */
export function qsInputSafe(selector, parent = document) {
  const input = qsInput(selector, parent);
  if (!input) throw new Error(`Input element not found: ${selector}`);
  return input;
}

/**
 * Strict variant of qsButton — throws error if not found.
 * @param {string} selector
 * @param {Document | HTMLElement} [parent=document]
 * @returns {HTMLButtonElement}
 */
export function qsButtonSafe(selector, parent = document) {
  const button = qsButton(selector, parent);
  if (!button) throw new Error(`Button element not found: ${selector}`);
  return button;
}
