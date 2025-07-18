import { BaseButton } from '@components/ui/baseButton.js';

/**
 * FieldForm Component
 * -------------------
 * A form for editing and saving football field ranges.
 *
 * @param {Object} options
 * @param {Array} [options.initialRanges=[]] - Initial field ranges
 * @param {Function} [options.onSave] - Callback when the form is saved
 * @param {Function} [options.onCancel] - Callback when the form is canceled
 * @returns {HTMLDivElement} The form element
 */
export function FieldForm(options = {}) {
  const { initialRanges = [], onSave = () => {}, onCancel = () => {} } = options;

  const container = document.createElement('div');
  container.className = 'space-y-4';

  // Title
  const title = document.createElement('h3');
  title.className = 'text-lg font-semibold text-gray-800';
  title.textContent = 'Edit Field Ranges';

  // Range Display
  const rangeContainer = document.createElement('div');
  rangeContainer.className = 'text-sm font-mono bg-gray-100 rounded p-2';
  rangeContainer.textContent = `Current Ranges: ${JSON.stringify(initialRanges)}`;

  // Buttons
  const saveBtn = BaseButton({
    label: 'Save Ranges',
    variant: 'primary',
    size: 'md',
    onClick: () => {
      console.log('💾 Saving ranges:', initialRanges);
      onSave(initialRanges);
    },
  });

  const cancelBtn = BaseButton({
    label: 'Cancel',
    variant: 'secondary',
    size: 'md',
    onClick: () => {
      console.log('❌ Cancel clicked.');
      onCancel();
    },
  });

  const btnRow = document.createElement('div');
  btnRow.className = 'flex gap-2 justify-end';
  btnRow.append(saveBtn, cancelBtn);

  container.append(title, rangeContainer, btnRow);
  return container;
}
