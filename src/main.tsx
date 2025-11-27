// Force complete cache rebuild - v6
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { logger } from "./lib/logger";
import { initializeErrorTracking, trackErrorGlobal } from "./hooks/useErrorTracking";
import "./index.css";

// Initialize global error tracking
initializeErrorTracking();

// Helper function to create safe error notification (prevents XSS)
function createErrorNotification(errorMessage: string): HTMLDivElement {
  const notification = document.createElement('div');
  notification.className = 'fixed top-4 right-4 z-50 bg-destructive text-destructive-foreground px-4 py-3 rounded-lg shadow-lg max-w-md animate-in slide-in-from-top';
  
  const container = document.createElement('div');
  container.className = 'flex items-start gap-2';
  
  // Error icon
  const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  iconSvg.setAttribute('class', 'h-5 w-5 flex-shrink-0 mt-0.5');
  iconSvg.setAttribute('fill', 'none');
  iconSvg.setAttribute('stroke', 'currentColor');
  iconSvg.setAttribute('viewBox', '0 0 24 24');
  const iconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  iconPath.setAttribute('stroke-linecap', 'round');
  iconPath.setAttribute('stroke-linejoin', 'round');
  iconPath.setAttribute('stroke-width', '2');
  iconPath.setAttribute('d', 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z');
  iconSvg.appendChild(iconPath);
  
  // Content container
  const content = document.createElement('div');
  content.className = 'flex-1';
  
  const title = document.createElement('p');
  title.className = 'font-semibold';
  title.textContent = 'Error';
  
  const message = document.createElement('p');
  message.className = 'text-sm';
  message.textContent = errorMessage; // Safe: uses textContent, not innerHTML
  
  content.appendChild(title);
  content.appendChild(message);
  
  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'ml-2 hover:opacity-70';
  closeBtn.addEventListener('click', () => notification.remove());
  
  const closeSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  closeSvg.setAttribute('class', 'h-4 w-4');
  closeSvg.setAttribute('fill', 'none');
  closeSvg.setAttribute('stroke', 'currentColor');
  closeSvg.setAttribute('viewBox', '0 0 24 24');
  const closePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  closePath.setAttribute('stroke-linecap', 'round');
  closePath.setAttribute('stroke-linejoin', 'round');
  closePath.setAttribute('stroke-width', '2');
  closePath.setAttribute('d', 'M6 18L18 6M6 6l12 12');
  closeSvg.appendChild(closePath);
  closeBtn.appendChild(closeSvg);
  
  container.appendChild(iconSvg);
  container.appendChild(content);
  container.appendChild(closeBtn);
  notification.appendChild(container);
  
  return notification;
}

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
  
  // Create a safe toast-like notification (XSS-safe)
  const notification = createErrorNotification(errorMessage);
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
    
    // Create a safe toast-like notification (XSS-safe)
    const notification = createErrorNotification(errorMessage);
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
