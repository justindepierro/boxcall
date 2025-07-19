// src/utils/sessionHelper.js

/**
 * Sets session persistence depending on the "Remember Me" flag.
 * If rememberMe is false, store session in sessionStorage only.
 * Otherwise, store in localStorage for persistence.
 *
 * @param {boolean} rememberMe
 */
export function setSessionPersistence(rememberMe) {
  if (!rememberMe) {
    console.log('⚠️ Session will NOT persist beyond this session.');
    sessionStorage.setItem('supabase-temporary', 'true');
    localStorage.removeItem('supabase-temporary');
  } else {
    console.log('✅ Persistent session enabled.');
    localStorage.setItem('supabase-temporary', 'false');
    sessionStorage.removeItem('supabase-temporary');
  }
}

/**
 * Checks if the session is temporary (non-persistent).
 * @returns {boolean}
 */
export function isTemporarySession() {
  return sessionStorage.getItem('supabase-temporary') === 'true';
}

// src/utils/sessionHelper.js

/**
 * Marks the session as temporary if "Remember Me" is unchecked.
 * @param {boolean} isTemporary - Whether the session should be temporary.
 */
export function markTemporarySession(isTemporary = true) {
  if (isTemporary) {
    localStorage.setItem('supabase-temporary', 'true');
  } else {
    localStorage.setItem('supabase-temporary', 'false');
  }
}

/**
 * Clears the session flag (e.g., on logout).
 */
export function clearTemporarySession() {
  localStorage.removeItem('supabase-temporary');
}
