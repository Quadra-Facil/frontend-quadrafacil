import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignOut from './SignOut/index.tsx';
import App from './App.tsx';
import { AuthProvider } from '../services/contexts/AuthContext.tsx';
import Principal from './Principal/index.tsx';
import Arena from './Arena/index.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path='/' element={<App />} />
          <Route path='/signout' element={<SignOut />} />
          <Route path='/principal' element={<Principal />} />
          <Route path='/arena' element={<Arena />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);

