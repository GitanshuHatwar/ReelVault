import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
<<<<<<< HEAD
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
=======
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './auth/AuthContext.jsx'
import { LanguageProvider } from './preferences/LanguageContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider><AuthProvider><App /></AuthProvider></LanguageProvider>
    </BrowserRouter>
>>>>>>> fd51086672cdf4b251101f31a71c4ef5d5d1dd02
  </StrictMode>,
)
