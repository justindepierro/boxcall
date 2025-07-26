// src/components/ui/fileUpload.js
// Drag-and-drop file upload component for CSV, images, and documents

// @ts-nocheck
/* eslint-disable */
// TODO: Fix TypeScript errors and component structure
import { formatFileSize } from '@utils/index.js';
import { devLog } from '@utils/devLogger.js';
import { createIcon } from '@utils/iconSystem.js';

/**
 * File Upload Component
 * @param {Object} options - Configuration options
 * @returns {HTMLElement} File upload component
 */
export function FileUpload(options = {}) {
  // Default configuration
  const {
    accept = '.csv,.jpg,.jpeg,.png,.pdf',
    multiple = false,
    maxSizeBytes = 10 * 1024 * 1024, // 10MB
    className = '',
    onFileSelect = () => {},
    onError = () => {},
    disabled = false,
  } = options;

  const acceptedTypes = accept.split(',').map((type) => type.trim());
  const uploadId = `file-upload-${Math.random().toString(36).substr(2, 9)}`;
  let uploadProgress = null;

  function createComponent() {
    return `
      <div class="file-upload-wrapper p-6 ${className}">
        <input 
          type="file" 
          id="${uploadId}"
          class="sr-only" 
          ${multiple ? 'multiple' : ''}
          accept="${acceptedTypes.join(',')}"
          ${disabled ? 'disabled' : ''}
        >
        
        <div class="file-upload-content">
          <div class="icon-placeholder mx-auto text-[var(--color-text-muted)] mb-4 flex justify-center">
            <!-- Icon will be inserted here -->
          </div>
          
          <h3 class="text-lg font-medium text-[var(--color-text)] mb-2">
            ${multiple ? 'Upload Files' : 'Upload File'}
          </h3>
          
          <p class="text-sm text-[var(--color-text-muted)] mb-4">
            Drag and drop your ${multiple ? 'files' : 'file'} here, or click to browse
          </p>
          
          <div class="flex flex-wrap justify-center gap-2 mb-4">
            ${acceptedTypes
              .map(
                (type) => `
              <span class="px-2 py-1 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-muted)]">
                ${type.replace('.', '').toUpperCase()}
              </span>
            `
              )
              .join('')}
          </div>
          
          <p class="text-xs text-[var(--color-text-muted)]">
            Maximum size: ${formatFileSize(maxSizeBytes)}
          </p>
        </div>

        ${uploadProgress !== null ? createProgressBar() : ''}
      </div>
    `;
  }

  function createProgressBar() {
    return `
      <div class="mt-4 w-full bg-[var(--color-border)] rounded-full h-2 overflow-hidden">
        <div 
          class="bg-[var(--color-accent)] h-2 rounded-full transition-all duration-300 progress-bar"
          style="width: ${uploadProgress || 0}%"
        ></div>
      </div>
      <p class="text-sm text-[var(--color-text-muted)] mt-2">
        Uploading... ${Math.round(uploadProgress || 0)}%
      </p>
    `;
  }

  function validateFile(file) {
    const errors = [];

    // Check file type
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    if (!acceptedTypes.includes(fileExt)) {
      errors.push(`File type ${fileExt} not allowed. Accepted types: ${acceptedTypes.join(', ')}`);
    }

    // Check file size
    if (file.size > maxSizeBytes) {
      errors.push(
        `File size ${formatFileSize(file.size)} exceeds maximum ${formatFileSize(maxSizeBytes)}`
      );
    }

    return errors;
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function handleFileSelect(files) {
    if (disabled) return;

    const fileArray = Array.from(files);
    const validFiles = [];
    const errors = [];

    fileArray.forEach((file) => {
      const fileErrors = validateFile(file);
      if (fileErrors.length === 0) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${fileErrors.join(', ')}`);
      }
    });

    if (errors.length > 0) {
      devLog(`❌ File validation errors: ${errors.join(', ')}`, 'error');
      console.warn('File upload errors:', errors);
    }

    if (validFiles.length > 0) {
      devLog(`📁 Valid files selected: ${validFiles.map((f) => f.name).join(', ')}`);
      onFileSelect(multiple ? validFiles : validFiles[0]);
    }
  }

  function setupEventListeners() {
    const dropZone = component.querySelector('[data-upload-zone]');
    const fileInput = component.querySelector(`#${uploadId}`);

    if (!dropZone || !fileInput) return;

    // File input change
    fileInput.addEventListener('change', (e) => {
      const input = e.target;
      if (input?.files) {
        handleFileSelect(input.files);
      }
    });

    // Click to open file dialog
    dropZone.addEventListener('click', (e) => {
      if (disabled) return;
      e.preventDefault();
      const input = fileInput;
      input.click();
    });

    // Drag and drop events
    dropZone.addEventListener('dragenter', (e) => {
      e.preventDefault();
      if (!disabled) {
        dropZone.classList.add('border-[var(--color-accent)]', 'bg-[var(--color-accent)]/10');
      }
    });

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    dropZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      const dragEvent = e;
      if (!dragEvent.relatedTarget || !dropZone.contains(dragEvent.relatedTarget)) {
        dropZone.classList.remove('border-[var(--color-accent)]', 'bg-[var(--color-accent)]/10');
      }
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('border-[var(--color-accent)]', 'bg-[var(--color-accent)]/10');

      if (disabled) return;

      const dropEvent = e;
      if (dropEvent.dataTransfer?.files) {
        handleFileSelect(dropEvent.dataTransfer.files);
      }
    });
  }

  // Render component
  component.innerHTML = createUploadArea();

  // Setup event listeners after render
  setTimeout(setupEventListeners, 0);

  // Extend component with custom methods
  const extendedComponent = component;

  // Custom methods
  extendedComponent.updateProgress = (progress) => {
    const progressContainer = component.querySelector('.progress-bar');
    if (progressContainer) {
      progressContainer.style.width = `${progress}%`;
      const progressText = progressContainer.parentElement?.nextElementSibling;
      if (progressText) {
        progressText.textContent = `Uploading... ${Math.round(progress)}%`;
      }
    }
  };

  extendedComponent.setDisabled = (isDisabled) => {
    disabled = isDisabled;
    const dropZone = component.querySelector('[data-upload-zone]');
    const fileInput = component.querySelector(`#${uploadId}`);

    if (dropZone) {
      dropZone.classList.toggle('opacity-50', isDisabled);
      dropZone.classList.toggle('cursor-not-allowed', isDisabled);
      dropZone.classList.toggle('cursor-pointer', !isDisabled);
    }

    if (fileInput) {
      fileInput.disabled = isDisabled;
    }
  };

  extendedComponent.reset = () => {
    const fileInput = component.querySelector(`#${uploadId}`);
    if (fileInput) {
      fileInput.value = '';
    }

    // Remove progress bar if it exists
    const progressContainer =
      component.querySelector('.progress-bar')?.parentElement?.parentElement;
    if (progressContainer) {
      progressContainer.remove();
    }
  };

  return extendedComponent;
}
