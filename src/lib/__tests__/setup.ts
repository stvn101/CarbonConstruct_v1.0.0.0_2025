/**
 * Test setup file - mocks browser globals for Node.js environment
 */

import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  length: 0,
  key: () => null,
};

// @ts-ignore
global.localStorage = localStorageMock;

// Mock window with all necessary methods
// @ts-ignore
global.window = global.window || {};
Object.assign(global.window, {
  localStorage: localStorageMock,
  addEventListener: () => {},
  removeEventListener: () => {},
  location: {
    reload: () => {}
  },
  HTMLElement: class HTMLElement {},
  getSelection: () => null,
  scrollTo: () => {}
});
