//D:\Aplikasi website\metronic-v9.2.9\metronic-v9.2.9\metronic-tailwind-react-starter-kit\typescript\vite\src\main.tsx
import './styles/globals.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
