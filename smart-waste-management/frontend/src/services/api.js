import axios from 'axios';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Socket instance
export let socket = null;

// Initialize socket connection
export const initializeSocket = (token) => {
  if (!token) return null;
  
  try {
    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('🔌 Socket connected successfully');
    });

    socket.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });

    socket.on('error', (error) => {
      console.error('🔌 Socket error:', error);
    });

    return socket;
  } catch (error) {
    console.error('Failed to initialize socket:', error);
    return null;
  }
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('🔌 Socket disconnected manually');
  }
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const originalRequest = error.config;

    if (error.response) {
      const status = error.response.status;
      const errorMessage = error.response.data?.message || 'Server error occurred';

      // Handle token expiration
      if (status === 401 && !originalRequest._retry) {
        console.warn('🔑 Session expired. Redirecting to login...');
        localStorage.removeItem('token');
        disconnectSocket();
        originalRequest._retry = true;
        
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?expired=true';
        }
      }
      // Handle permission errors
      else if (status === 403) {
        toast.error('Access Denied: You do not have permission for this action.');
      }
      // Handle validation errors
      else if (status === 400) {
        toast.error(errorMessage);
      }
      // Handle not found
      else if (status === 404) {
        toast.error('Resource not found');
      }
      // Handle server errors
      else if (status >= 500) {
        toast.error('Server error. Please try again later.');
      }
      // Generic error
      else {
        toast.error(errorMessage);
      }
      
    } else if (error.request) {
      // Network error
      console.error('❌ Network Error: Server unreachable');
      toast.error('Network Error: Cannot connect to server. Please check if backend is running.');
    } else {
      toast.error('An unexpected error occurred.');
    }
    
    return Promise.reject(error);
  }
);

export default api;