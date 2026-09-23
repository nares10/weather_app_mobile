import { useEffect, useState } from "react";

// Returns `value`, but only after it has stopped changing for `delayMs`.
// Typing "Jaipur" quickly makes one search request instead of six.
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    // Each keystroke cancels the previous timer.
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
