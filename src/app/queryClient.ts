import { QueryClient } from "@tanstack/react-query";

/**
 * Enhanced React Query Client with Performance Optimizations
 * 
 * Features:
 * - Request deduplication (automatic with React Query)
 * - Intelligent retry logic (skip 4xx errors)
 * - Optimized cache durations
 * - Refetch on window focus (keep data fresh)
 * - Background refetching (stale-while-revalidate)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache settings
      staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - cache lifetime (formerly cacheTime)
      
      // Refetch settings for freshness
      refetchOnWindowFocus: true, // Refetch when user returns to tab
      refetchOnReconnect: true, // Refetch when network reconnects
      refetchOnMount: true, // Refetch when component mounts
      
      // Request deduplication (built-in)
      // Multiple components requesting same data = single network call
      
      // Retry logic
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors except 408, 429
        if (error instanceof Error && "status" in error) {
          const status = (error as { status: number }).status;
          if (
            status >= 400 &&
            status < 500 &&
            status !== 408 &&
            status !== 429
          ) {
            return false;
          }
        }
        return failureCount < 3;
      },
      
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1, // Retry mutations once
      // Optimistic updates should be implemented per-mutation
    },
  },
});
