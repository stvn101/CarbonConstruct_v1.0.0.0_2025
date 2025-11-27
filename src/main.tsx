// Force complete cache rebuild - v5
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { logger } from "./lib/logger";
import { initializeErrorTracking, trackErrorGlobal } from "./hooks/useErrorTracking";
import "./index.css";

// Initialize global error tracking
initializeErrorTracking();

// Global error handlers for async errors and promise rejections
window.addEventListener('unhandledrejection', (event) => {
  event.preventDefault();
  logger.error('Unhandled Promise Rejection', event.reason);
  
  // Track globally
  trackErrorGlobal({
    error_type: 'unhandled_promise_rejection',
    error_message: event.reason?.message || String(event.reason),
    stack_trace: event.reason?.stack,
    severity: 'error',
  });
  
  // Show user-friendly error notification
  const errorMessage = event.reason?.message || String(event.reason) || 'An unexpected error occurred';
  
  // Create a toast-like notification
  const notification = document.createElement('div');
  notification.className = 'fixed top-4 right-4 z-50 bg-destructive text-destructive-foreground px-4 py-3 rounded-lg shadow-lg max-w-md animate-in slide-in-from-top';
  notification.innerHTML = `
    <div class="flex items-start gap-2">
      <svg class="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div class="flex-1">
        <p class="font-semibold">Error</p>
        <p class="text-sm">${errorMessage}</p>
      </div>
      <button class="ml-2 hover:opacity-70" onclick="this.parentElement.parentElement.remove()">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  `;
  document.body.appendChild(notification);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    notification.remove();
  }, 5000);
});

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  logger.error('Uncaught Error', event.error);
  
  // Track globally
  trackErrorGlobal({
    error_type: 'uncaught_error',
    error_message: event.error?.message || event.message,
    stack_trace: event.error?.stack,
    severity: 'error',
  });
  
  // Only show notification if it's not already being handled by error boundary
  if (!event.error?.handledByBoundary) {
    const errorMessage = event.error?.message || event.message || 'An unexpected error occurred';
    
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 z-50 bg-destructive text-destructive-foreground px-4 py-3 rounded-lg shadow-lg max-w-md animate-in slide-in-from-top';
    notification.innerHTML = `
      <div class="flex items-start gap-2">
        <svg class="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="flex-1">
          <p class="font-semibold">Error</p>
          <p class="text-sm">${errorMessage}</p>
        </div>
        <button class="ml-2 hover:opacity-70" onclick="this.parentElement.parentElement.remove()">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
});

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

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
