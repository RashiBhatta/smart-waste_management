// // import React, { createContext, useState, useEffect, useContext } from 'react';
// // import api from '../services/api';

// // const AuthContext = createContext();

// // export const useAuth = () => useContext(AuthContext);

// // export const AuthProvider = ({ children }) => {
// //   const [user, setUser] = useState(null);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     const checkUserLoggedIn = async () => {
// //       try {
// //         const token = localStorage.getItem('token');
// //         if (token) {
// //           api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
// //           const { data } = await api.get('/auth/me');
// //           setUser(data.user);
// //         }
// //       } catch (error) {
// //         localStorage.removeItem('token');
// //         delete api.defaults.headers.common['Authorization'];
// //         setUser(null);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };
    
// //     checkUserLoggedIn();
// //   }, []);

// //   // @desc Login and return user data for immediate routing
// //   const login = async (email, password, role) => {
// //     const response = await api.post('/auth/login', { email, password, role });
    
// //     localStorage.setItem('token', response.data.token);
// //     api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
// //     setUser(response.data.user);
    
// //     return response.data.user; // CRITICAL: Returns data to Login.jsx
// //   };

// //   // @desc Register and return user data
// //   const register = async (userData) => {
// //     const response = await api.post('/auth/register', userData);
    
// //     localStorage.setItem('token', response.data.token);
// //     api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
// //     setUser(response.data.user);
    
// //     return response.data.user;
// //   };

// //   const logout = () => {
// //     localStorage.removeItem('token');
// //     delete api.defaults.headers.common['Authorization'];
// //     setUser(null);
// //   };

// //   return (
// //     <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
// //       {children}
// //     </AuthContext.Provider>
// //   );
// // };










// import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
// import api, { initializeSocket, disconnectSocket } from '../services/api';

// const AuthContext = createContext();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Load user from token
//   const loadUser = useCallback(async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('token');
      
//       if (!token) {
//         setLoading(false);
//         return;
//       }

//       api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//       const { data } = await api.get('/auth/me');
      
//       if (data.success && data.user) {
//         setUser(data.user);
//         // Initialize socket connection for real-time features
//         initializeSocket(token);
//       } else {
//         throw new Error('Invalid response');
//       }
//     } catch (error) {
//       console.error('Failed to load user:', error);
//       localStorage.removeItem('token');
//       delete api.defaults.headers.common['Authorization'];
//       disconnectSocket();
//       setUser(null);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     loadUser();
//   }, [loadUser]);

//   const login = async (email, password, role) => {
//     try {
//       setError(null);
//       const response = await api.post('/auth/login', { email, password, role });
      
//       if (response.data.success && response.data.token) {
//         const { token, user } = response.data;
        
//         localStorage.setItem('token', token);
//         api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//         setUser(user);
        
//         // Initialize socket after login for real-time features
//         initializeSocket(token);
        
//         return { success: true, user };
//       } else {
//         throw new Error(response.data.message || 'Login failed');
//       }
//     } catch (error) {
//       const message = error.response?.data?.message || error.message || 'Login failed';
//       setError(message);
//       return { success: false, error: message };
//     }
//   };

//   const register = async (userData) => {
//     try {
//       setError(null);
//       const response = await api.post('/auth/register', userData);
      
//       if (response.data.success && response.data.token) {
//         const { token, user } = response.data;
        
//         localStorage.setItem('token', token);
//         api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//         setUser(user);
        
//         // Initialize socket after register for real-time features
//         initializeSocket(token);
        
//         return { success: true, user };
//       } else {
//         throw new Error(response.data.message || 'Registration failed');
//       }
//     } catch (error) {
//       const message = error.response?.data?.message || error.message || 'Registration failed';
//       setError(message);
//       return { success: false, error: message };
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem('token');
//     delete api.defaults.headers.common['Authorization'];
//     disconnectSocket();
//     setUser(null);
//   };

//   const updateUser = (userData) => {
//     setUser(prevUser => ({ ...prevUser, ...userData }));
//   };

//   const value = {
//     user,
//     loading,
//     error,
//     login,
//     register,
//     logout,
//     updateUser,
//     isAuthenticated: !!user,
//     isAdmin: user?.role === 'admin',
//     isCollector: user?.role === 'collector',
//     isResident: user?.role === 'resident'
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };


import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // ── Restore session on mount ──────────────────────────────
  useEffect(() => {
    const restore = async () => {
      const stored = localStorage.getItem('token');
      if (stored) {
        api.defaults.headers.common['Authorization'] = `Bearer ${stored}`;
        try {
          const { data } = await api.get('/auth/me');
          setUser(data.user);
          setToken(stored);
        } catch {
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };
    restore();
  }, []);

  // ── Login ─────────────────────────────────────────────────
  const login = async (email, password, role) => {
    const { data } = await api.post('/auth/login', { email, password, role });
    localStorage.setItem('token', data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  // ── Register ──────────────────────────────────────────────
  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    localStorage.setItem('token', data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  // ── Logout ────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};