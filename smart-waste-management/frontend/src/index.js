import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Theme & Styling
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { CoinProvider } from './context/CoinContext';

// Global styles for toast notifications
import 'react-toastify/dist/ReactToastify.css';

// Create a custom Eco-Friendly Theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // Forest Green
      light: '#60ad5e',
      dark: '#005005',
    },
    secondary: {
      main: '#ffd700', // Gold for coins/rewards
    },
    background: {
      default: '#f8f9fa',
    },
  },
  typography: {
    fontFamily: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h5: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <NotificationProvider>
            <CoinProvider>
              <App />
            </CoinProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);