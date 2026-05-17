import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { store } from './redux/store';
import './styles/variables.css';
import './styles/globals.css';
import './styles/animations.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--glass-bg)',
              color: 'var(--text-primary)',
              border: '1px solid var(--glass-border)',
              backdropFilter: 'blur(20px)',
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);