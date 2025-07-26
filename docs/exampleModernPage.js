/**
 * EXAMPLE: Modernized Page Implementation
 * Shows how to use the component system properly
 */

import { createPage } from '@utils/pageFactory.js';
import { BaseButton, FormInput, Card, Modal } from '@components/index.js';
import { showToast, createLoadingOverlay, setButtonLoading } from '@utils/index.js';

/**
 * Example of a properly modernized page using the component system
 */
function ExampleModernPage() {
  return `
    <div class="space-y-6">
      <!-- Page Header -->
      <header class="pb-4 border-b border-[var(--color-border)]">
        <h1 class="text-2xl md:text-3xl font-bold text-[var(--color-text)]">
          Modern Page Example
        </h1>
        <p class="text-sm md:text-base text-[var(--color-text-muted)] mt-2">
          Demonstrating proper component usage and Tailwind patterns
        </p>
      </header>

      <!-- Content Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        
        <!-- Form Card -->
        ${Card({
          title: 'Modern Form Example',
          icon: 'user',
          content: '<div id="form-container" class="space-y-4"></div>',
          variant: 'default',
          size: 'md',
        })}

        <!-- Button Examples Card -->
        ${Card({
          title: 'Button Components',
          icon: 'click',
          content: '<div id="button-container" class="space-y-3"></div>',
          variant: 'default',
          size: 'md',
        })}

        <!-- Interactive Demo Card -->
        ${Card({
          title: 'Interactive Demo',
          icon: 'zap',
          content: '<div id="demo-container" class="space-y-3"></div>',
          variant: 'accent',
          size: 'md',
        })}

      </div>
    </div>
  `;
}

/**
 * Page interactions using modern component system
 */
function initExamplePage(page) {
  // Form Container - Using FormInput components
  const formContainer = page.querySelector('#form-container');
  if (formContainer) {
    const nameField = FormInput({
      name: 'name',
      label: 'Full Name',
      type: 'text',
      placeholder: 'Enter your name',
      required: true,
      icon: 'user',
      helpText: 'This will be displayed on your profile',
      onInput: (e) => {
        // Input validation logic here
        console.warn('Name input:', e.target.value);
      },
      onValidate: (value) => value.length >= 2,
    });

    const emailField = FormInput({
      name: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'Enter your email',
      required: true,
      icon: 'mail',
      onValidate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    });

    const submitBtn = BaseButton({
      label: 'Submit Form',
      variant: 'primary',
      size: 'md',
      icon: 'send',
      onClick: async () => {
        const overlay = createLoadingOverlay(formContainer, 'Submitting...');

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));

        overlay.remove();
        showToast('Form submitted successfully!', 'success');
      },
    });

    formContainer.appendChild(nameField);
    formContainer.appendChild(emailField);
    formContainer.appendChild(submitBtn);
  }

  // Button Container - Various button examples
  const buttonContainer = page.querySelector('#button-container');
  if (buttonContainer) {
    const buttons = [
      BaseButton({
        label: 'Primary Action',
        variant: 'primary',
        size: 'md',
        icon: 'check',
        onClick: () => showToast('Primary action clicked!', 'info'),
      }),
      BaseButton({
        label: 'Secondary',
        variant: 'secondary',
        size: 'md',
        icon: 'settings',
        onClick: () => showToast('Secondary action clicked!', 'info'),
      }),
      BaseButton({
        label: 'Outline Button',
        variant: 'outline',
        size: 'sm',
        iconEnd: 'external-link',
        onClick: () => showToast('Outline button clicked!', 'info'),
      }),
    ];

    buttons.forEach((btn) => {
      buttonContainer.appendChild(btn);
    });
  }

  // Demo Container - Interactive examples
  const demoContainer = page.querySelector('#demo-container');
  if (demoContainer) {
    const modalBtn = BaseButton({
      label: 'Open Modal',
      variant: 'primary',
      size: 'md',
      icon: 'square',
      onClick: () => {
        const modal = Modal({
          title: 'Example Modal',
          content: `
            <div class="space-y-4">
              <p class="text-[var(--color-text)]">
                This is a modal created with the Modal component.
              </p>
              <div class="flex space-x-2">
                <button class="bg-[var(--color-accent)] text-white px-3 py-1 rounded">
                  Action
                </button>
                <button class="bg-gray-200 text-gray-800 px-3 py-1 rounded" data-modal-close>
                  Cancel
                </button>
              </div>
            </div>
          `,
          onClose: () => showToast('Modal closed', 'info'),
        });

        document.body.appendChild(modal);
      },
    });

    const toastBtn = BaseButton({
      label: 'Show Toast',
      variant: 'secondary',
      size: 'md',
      icon: 'bell',
      onClick: () => showToast('This is a toast notification!', 'info'),
    });

    const loadingBtn = BaseButton({
      label: 'Loading Demo',
      variant: 'outline',
      size: 'md',
      icon: 'loader',
      onClick: async (e) => {
        const btn = e.target.closest('button');
        const restoreBtn = setButtonLoading(btn, 'Loading...');

        await new Promise((resolve) => setTimeout(resolve, 3000));

        restoreBtn();
        showToast('Loading complete!', 'success');
      },
    });

    demoContainer.appendChild(modalBtn);
    demoContainer.appendChild(toastBtn);
    demoContainer.appendChild(loadingBtn);
  }
}

// Export using modern page factory
export default createPage(ExampleModernPage, {
  title: 'Modern Page Example',
  init: initExamplePage,
  className: 'example-page',
});
