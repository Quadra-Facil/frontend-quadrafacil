import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SignOut from './SignOut/index.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<App />} />
        <Route path='/signout' element={<SignOut />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)