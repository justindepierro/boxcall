import { useState, useEffect } from "react";

/**
 * Returns a debounced version of the input value that only updates after the specified delay.
 * Useful for search inputs, filters, and other frequently changing values.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns The debounced value
 *
 * @example
 * ```tsx
 * const [searchQuery, setSearchQuery] = useState("");
 * const debouncedSearch = useDebouncedValue(searchQuery, 300);
 *
 * // Pass debouncedSearch to expensive operations
 * <PlayList searchQuery={debouncedSearch} />
 * ```
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up the timeout
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up timeout if value changes (debounce logic)
    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
}
