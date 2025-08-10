export {}; // ensure this file is a module

declare global {
  interface Window {
    __BUILD_META__?: { buildTime: string; mode: string };
  }
  // Vite define injection
  const __BUILD_TIME__: string;
}
// Global ambient type extensions
// Allows assigning debug helpers without using `any`.

declare global {
  interface Window {
    runContrastScan?: () => void;
  }
}

export {};
