import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { setupGlobalErrorHandlers } from "./lib/error-monitoring";

// Initialize global error monitoring
setupGlobalErrorHandlers();

// Register Service Worker for PWA support (production only)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('ServiceWorker registration successful:', registration.scope);
      },
      (error) => {
        console.log('ServiceWorker registration failed:', error);
      }
    );
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
