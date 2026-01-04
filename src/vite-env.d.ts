/// <reference types="vite/client" />

// Global type declarations
interface Window {
  gtag?: (
    command: string,
    action: string,
    params: Record<string, string>
  ) => void;
}
