import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import './setup/a11y-matchers';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock IndexedDB for tests
const indexedDB = {
  open: () => ({
    result: {},
    addEventListener: () => {},
    removeEventListener: () => {},
  }),
};

(global as unknown as { indexedDB: typeof indexedDB }).indexedDB = indexedDB as unknown as IDBFactory;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

(global as unknown as { localStorage: Storage }).localStorage = localStorageMock as Storage;