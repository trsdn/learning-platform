import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

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

(global as any).indexedDB = indexedDB;

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

(global as any).localStorage = localStorageMock;