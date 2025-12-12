/**
 * Test setup file - mocks browser globals for Node.js environment
 */

import '@testing-library/jest-dom';
import { vi, beforeEach, afterEach } from 'vitest';

// Re-export testing utilities for consistent imports
export { render, renderHook, act, cleanup } from '@testing-library/react';
export { screen, fireEvent, within } from '@testing-library/dom';

// Mock @radix-ui/react-tooltip to avoid provider errors in tests
vi.mock('@radix-ui/react-tooltip', () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => children,
  Tooltip: ({ children }: { children: React.ReactNode }) => children,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => children,
  TooltipContent: ({ children }: { children: React.ReactNode }) => children,
  TooltipPortal: ({ children }: { children: React.ReactNode }) => children,
}));

// Custom waitFor implementation
export const waitFor = async (
  callback: () => void | Promise<void>,
  options: { timeout?: number; interval?: number } = {}
): Promise<void> => {
  const { timeout = 1000, interval = 50 } = options;
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      await callback();
      return;
    } catch {
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
  
  // Final attempt
  await callback();
};

// Mock localStorage with actual storage functionality
const createLocalStorageMock = () => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  };
};

const localStorageMock = createLocalStorageMock();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock window.location
const locationMock = {
  reload: vi.fn(),
  href: 'http://localhost:3000',
  origin: 'http://localhost:3000',
  pathname: '/',
  search: '',
  hash: ''
};

Object.defineProperty(window, 'location', {
  value: locationMock,
  writable: true
});

// Mock window methods
Object.assign(window, {
  localStorage: localStorageMock,
  scrollTo: vi.fn(),
  getSelection: vi.fn(() => null),
  matchMedia: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
  ResizeObserver: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
  IntersectionObserver: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
});

// Mock HTMLElement methods used by Radix UI
HTMLElement.prototype.scrollIntoView = vi.fn();
HTMLElement.prototype.hasPointerCapture = vi.fn();
HTMLElement.prototype.releasePointerCapture = vi.fn();
HTMLElement.prototype.setPointerCapture = vi.fn();

// Suppress specific React warnings during tests, but restore console.error after each test
const originalConsoleError = console.error;

beforeEach(() => {
  console.error = (...args: unknown[]) => {
    const message = args[0];
    if (
      typeof message === 'string' &&
      (message.includes('Warning: ReactDOM.render') ||
        message.includes('Warning: An update to') ||
        message.includes('act(...)'))
    ) {
      return;
    }
    originalConsoleError(...args);
  };
});

afterEach(() => {
  console.error = originalConsoleError;
});
