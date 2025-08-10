// Global ambient type extensions
// Allows assigning debug helpers without using `any`.

declare global {
  interface Window {
    runContrastScan?: () => void;
  }
}

export {};
