import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Toodles could not find the #root element to start in.');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register service worker for Progressive Web App (PWA) offline support
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Offline cache optional in development/restricted environments
    });
  });
}

