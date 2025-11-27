/**
 * Test setup file - mocks browser globals for Node.js environment
 */

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

// Mock window if needed
// @ts-ignore
global.window = {
  localStorage: localStorageMock,
};
