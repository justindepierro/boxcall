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
 * @param {string} selector - CSS selector for the input.
 * @param {Document | HTMLElement} [parent=document] - Parent to search in.
 * @returns {HTMLInputElement} - The matched input element.
 */
export function qsInput(selector, parent = document) {
  const el = parent.querySelector(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  return /** @type {HTMLInputElement} */ (el);
}

/**
 * Query and cast a button element.
 * @param {string} selector
 * @param {Document | HTMLElement} [parent=document]
 * @returns {HTMLButtonElement}
 */
export function qsButton(selector, parent = document) {
  const el = parent.querySelector(selector);
  if (!el) throw new Error(`Button not found: ${selector}`);
  return /** @type {HTMLButtonElement} */ (el);
}
