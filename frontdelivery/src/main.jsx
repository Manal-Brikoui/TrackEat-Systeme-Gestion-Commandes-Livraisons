import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import 'leaflet/dist/leaflet.css'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#1e1e1b',
          color: '#F8F8F8',
          border: '1px solid #2e2e28',
          borderRadius: '8px',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '0.875rem',
        },
        success: { iconTheme: { primary: '#b7ea4e', secondary: '#171714' } },
        error:   { iconTheme: { primary: '#f87171', secondary: '#fff' } },
      }}
    />
  </React.StrictMode>
)