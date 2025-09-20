import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { SecureErrorBoundary } from './components/SecureErrorBoundary'

createRoot(document.getElementById("root")!).render(
  <SecureErrorBoundary>
    <App />
  </SecureErrorBoundary>
);
