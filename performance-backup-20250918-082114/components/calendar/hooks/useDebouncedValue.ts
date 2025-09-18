import { useEffect, useState } from "react";

/**
 * useDebouncedValue
 * Returns a debounced copy of the provided value after the specified delay.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default useDebouncedValue;
