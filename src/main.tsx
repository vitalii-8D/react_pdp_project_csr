import { StrictMode } from 'react';
import { preconnect } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import App from './App';
import { SERVER_URL } from './lib/config';
import './app.css';

// The API lives on a separate origin - open the connection while the app is still booting instead
// of after the first component mounts and fires its query.
preconnect(SERVER_URL, { crossOrigin: 'anonymous' });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
