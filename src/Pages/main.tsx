import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignOut from './SignOut/index.tsx';
import App from './App.tsx';
import { AuthProvider } from '../services/contexts/AuthContext.tsx';
import Principal from './Principal/index.tsx';
import Arena from './Arena/index.tsx';
import AdressArena from './AdressArena/index.tsx';
import ClientArena from './ClientArena/index.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path='/' element={<App />} />
          <Route path='/signout' element={<SignOut />} />
          <Route path='/principal' element={<Principal />} />
          <Route path='/arena' element={<Arena />} />
          <Route path='/adress' element={<AdressArena />} />
          <Route path='/client' element={<ClientArena />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);

