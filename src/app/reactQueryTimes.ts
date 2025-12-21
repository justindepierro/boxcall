// Centralized React Query timing constants.
// Keep these consistent with `src/app/queryClient.ts` defaults.

export const RQ_STALE = {
  DEFAULT: 10 * 60 * 1000, // 10 minutes
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  SHORT: 60 * 1000, // 1 minute
} as const;

export const RQ_GC = {
  DEFAULT: 30 * 60 * 1000, // 30 minutes
  SHORT: 10 * 60 * 1000, // 10 minutes
} as const;
