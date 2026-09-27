import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './i18n';
import './styles/reset.css';

import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { AccessibilityProvider } from './context/AccessibilityContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <AccessibilityProvider>
        <App />
      </AccessibilityProvider>
    </AuthProvider>
  </StrictMode>,
)
