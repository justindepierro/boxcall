export function logIconError(name: string, error: unknown) {
  if (process.env.NODE_ENV !== "production") {
    // ...existing code...
    console.error(`[IconSystem] Failed to load icon: ${name}`, error);
  }
}
