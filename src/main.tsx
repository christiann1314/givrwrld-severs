import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { SecureErrorBoundary } from './components/SecureErrorBoundary'
import { setupAutomaticCacheRefresh, prefetchCommonData } from '@/lib/cacheUtils'

// Register service worker for caching
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Initialize cache strategies
setupAutomaticCacheRefresh();

// Prefetch common data on app startup
prefetchCommonData().then(() => {
  console.log('Common data prefetched');
});

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SecureErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SecureErrorBoundary>
  </React.StrictMode>
);
