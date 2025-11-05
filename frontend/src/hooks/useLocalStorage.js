import { useState, useEffect, useCallback } from 'react';

/**
 * Custom React Hook: useLocalStorage
 *
 * This hook manages state that persists in the browser's `localStorage`.
 * It works similarly to `useState`, but automatically reads and writes values
 * from/to localStorage using the provided key. 
 *
 * Key Features:
 * - Reads the initial value from localStorage on mount (if it exists)
 * - Updates localStorage whenever the state changes
 * - Keeps values in sync across browser tabs via the `storage` event
 *
 * @param {string} key - The key used to store and retrieve data from localStorage.
 * @param {*} initialValue - The default value used if no stored value is found.
 * @returns {[any, Function]} A stateful value and a setter function, similar to `useState`.
 * 
 *
 */
export function useLocalStorage(key, initialValue) {
  // Initialize state with a value from localStorage if available
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  /**
   * Setter function that updates both React state and localStorage.
   * Accepts either a direct value or an updater function.
   */
  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  /**
   * Sync localStorage changes between multiple browser tabs.
   * When a `storage` event occurs for the same key, update local state.
   */
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing storage event for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}
