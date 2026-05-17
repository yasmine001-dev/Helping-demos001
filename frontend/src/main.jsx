import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '14px',
                borderRadius: '0',
                background: '#1B2A4A',
                color: '#fff',
                padding: '14px 18px',
              },
              success: {
                iconTheme: { primary: '#D4A853', secondary: '#1B2A4A' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
                style: { background: '#fff', color: '#1B2A4A', border: '1px solid #ef4444' },
              },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
