import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Temporarily disabled to debug React module issue
// import { setupGlobalErrorHandlers } from "./lib/error-monitoring";

// Temporarily disabled to debug React module issue
// setupGlobalErrorHandlers();

// Register Service Worker for PWA support
if ('serviceWorker' in navigator) {
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

createRoot(document.getElementById("root")!).render(<App />);
