/// <reference types="vite/client" />
// @ts-nocheck

interface ImportMeta {
  glob(pattern: string): Record<string, () => Promise<unknown>>;
}
