import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import OverlayTexturesProvider from './contexts/OverlayTexturesContext.tsx'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OverlayTexturesProvider>
      <App />
    </OverlayTexturesProvider>
  </StrictMode>,
)
