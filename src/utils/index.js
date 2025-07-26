/**
 * Barrel Export for Common Utilities
 * Consolidates frequently used utilities for cleaner imports
 */

// DOM utilities
export { qs, qsi, qsInput, getValue, getChecked, setSelectValue } from './domHelper.js';

// Development utilities
export { devLog, devWarn, devError } from './devLogger.js';

// UI utilities
export { showToast } from './toast.js';
export { initPageUI } from './initPageUI.js';
export { fadeIn, fadeOut } from './pageTransitions.js';
export { showSpinner, hideSpinner, createLoadingOverlay, setButtonLoading } from './spinner.js';

// Theme utilities
export { applyTheme, logAppliedFonts } from './themeManager.js';

// Icon utilities
export { createIcon, CommonIcons, IconPresets } from './iconSystem.js';

// Auth utilities
export { handleAuthSubmit, resetErrors, disableForm } from './authForms.js';
export { evaluatePasswordStrength } from './passwordStrength.js';

// Page utilities
export { createPage, wrapLegacyPage } from './pageFactory.js';

// Interaction utilities
export { initTooltips } from './tooltipInteractions.js';
export { initModals } from './modalInteractions.js';
