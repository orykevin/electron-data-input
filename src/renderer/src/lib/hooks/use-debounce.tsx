import { useEffect, useState } from 'react'

/**
 * A custom hook for debouncing a value.
 *
 * @param value - The value to debounce.
 * @param delay - The debounce delay in milliseconds.
 * @returns The debounced value.
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler) // Cleanup the timeout if value or delay changes
    }
  }, [value, delay])

  return debouncedValue
}

export default useDebounce
