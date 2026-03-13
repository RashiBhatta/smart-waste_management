// import React, { useEffect, useState } from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import { useAuth } from './context/AuthContext';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { Box, CircularProgress, Typography, Button, Alert, Paper } from '@mui/material';

// // Components
// import PrivateRoute from './components/PrivateRoute';

// // Pages
// import LandingPage from './pages/LandingPage';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import AdminDashboard from './pages/AdminDashboard';
// import AdminSettings from './pages/AdminSettings';
// import ResidentDashboard from './pages/ResidentDashboard';
// import CollectorDashboard from './pages/CollectorDashboard';
// import CollectionDetails from './pages/CollectionDetails';
// import CollectorRegister from './pages/CollectorRegister';
// import Feedback from './pages/Feedback';
// import MyCollections from './pages/MyCollections';
// import Notifications from './pages/Notifications';
// import Payments from './pages/Payments';
// import Profile from './pages/Profile';
// import ProgramDetails from './pages/ProgramDetails';
// import Reports from './pages/Reports';
// import RequestCollection from './pages/RequestCollection';
// import Settings from './pages/Settings';
// import ProgramManagement from './pages/ProgramManagement';
// import ProgramsPage from './pages/ProgramsPage';
// import PaymentSuccess from './pages/PaymentSuccess';

// // Context
// import { NotificationProvider } from './context/NotificationContext';

// // API Service
// import api from './services/api';

// class ErrorBoundary extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = { hasError: false, error: null };
//   }
//   static getDerivedStateFromError(error) { return { hasError: true, error }; }
//   componentDidCatch(error, errorInfo) {
//     console.error('❌ UI Crash:', error, errorInfo);
//   }
//   render() {
//     if (this.state.hasError) {
//       return (
//         <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f5f5f5', p: 3 }}>
//           <Paper elevation={3} sx={{ p: 4, maxWidth: 600, textAlign: 'center' }}>
//             <Alert severity="error" sx={{ mb: 3 }}>
//               <Typography variant="h6">Application Error</Typography>
//               <Typography variant="body2">{this.state.error?.message}</Typography>
//             </Alert>
//             <Button variant="contained" onClick={() => window.location.href = '/'}>Return to Home</Button>
//           </Paper>
//         </Box>
//       );
//     }
//     return this.props.children;
//   }
// }

// function AppContent() {
//   const { user, loading } = useAuth();
//   const [connectionStatus, setConnectionStatus] = useState('checking');
//   const [retryCount, setRetryCount] = useState(0);

//   useEffect(() => {
//     const testConnection = async () => {
//       try {
//         setConnectionStatus('checking');
//         const response = await api.get('/health');
//         if (response.data && response.data.success) {
//           setConnectionStatus('connected');
//         } else { throw new Error(); }
//       } catch (error) {
//         setConnectionStatus('failed');
//       }
//     };
//     testConnection();
//   }, [retryCount]);

//   if (loading || connectionStatus === 'checking') {
//     return (
//       <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//         <CircularProgress size={60} thickness={4} />
//         <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold', color: 'primary.main' }}>SWM Portal Initializing...</Typography>
//       </Box>
//     );
//   }

//   if (connectionStatus === 'failed') {
//     return (
//       <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', p: 3 }}>
//         <Alert severity="warning" variant="filled" action={<Button color="inherit" onClick={() => setRetryCount(c => c + 1)}>Retry</Button>}>
//           Backend Server Offline. Please start the server on Port 5000.
//         </Alert>
//       </Box>
//     );
//   }

//   return (
//     <ErrorBoundary>
//       <Routes>
//         {/* --- Public Access --- */}
//         {/* Always show LandingPage at root. No auto-redirect here. */}
//         <Route path="/" element={<LandingPage />} />
        
//         {/* Helper route to redirect logged-in users to their correct dashboard */}
//         <Route path="/dashboard" element={
//           user ? (
//             user.role === 'admin' ? <Navigate to="/admin/dashboard" /> :
//             user.role === 'collector' ? <Navigate to="/collector/dashboard" /> :
//             <Navigate to="/resident/dashboard" />
//           ) : <Navigate to="/login" />
//         } />

//         <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
//         <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

//         {/* --- Admin Only --- */}
//         <Route path="/admin/dashboard" element={<PrivateRoute allowedRoles={['admin']}><AdminDashboard /></PrivateRoute>} />
//         <Route path="/admin/reports" element={<PrivateRoute allowedRoles={['admin']}><Reports /></PrivateRoute>} />
//         <Route path="/admin/programs" element={<PrivateRoute allowedRoles={['admin']}><ProgramManagement /></PrivateRoute>} />
//         <Route path="/admin/settings" element={<PrivateRoute allowedRoles={['admin']}><AdminSettings /></PrivateRoute>} />

//         {/* --- Resident Only --- */}
//         <Route path="/resident/dashboard" element={<PrivateRoute allowedRoles={['resident']}><ResidentDashboard /></PrivateRoute>} />
//         <Route path="/request-collection" element={<PrivateRoute allowedRoles={['resident']}><RequestCollection /></PrivateRoute>} />
//         <Route path="/my-collections" element={<PrivateRoute allowedRoles={['resident']}><MyCollections /></PrivateRoute>} />
//         <Route path="/payments" element={<PrivateRoute allowedRoles={['resident']}><Payments /></PrivateRoute>} />
//         <Route path="/payment-success" element={<PrivateRoute allowedRoles={['resident']}><PaymentSuccess /></PrivateRoute>} />
//         <Route path="/feedback/:collectionId" element={<PrivateRoute allowedRoles={['resident']}><Feedback /></PrivateRoute>} />
//         <Route path="/collector/register" element={<PrivateRoute allowedRoles={['resident']}><CollectorRegister /></PrivateRoute>} />
//         <Route path="/resident/programs" element={<PrivateRoute allowedRoles={['resident']}><ProgramsPage /></PrivateRoute>} />

//         {/* --- Collector Only --- */}
//         <Route path="/collector/dashboard" element={<PrivateRoute allowedRoles={['collector']}><CollectorDashboard /></PrivateRoute>} />

//         {/* --- Shared Access --- */}
//         <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
//         <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
//         <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
//         <Route path="/programs/:id" element={<PrivateRoute><ProgramDetails /></PrivateRoute>} />
//         <Route path="/collections/:id" element={<PrivateRoute><CollectionDetails /></PrivateRoute>} />

//         {/* --- Error Handlers --- */}
//         <Route path="/unauthorized" element={<Box textAlign="center" py={10}><Typography variant="h3">Access Denied</Typography><Button onClick={() => window.location.href="/"}>Home</Button></Box>} />
//         <Route path="*" element={<Navigate to="/" />} />
//       </Routes>
      
//       <ToastContainer position="bottom-right" autoClose={3000} />
//     </ErrorBoundary>
//   );
// }

// function App() {
//   return (
//     <NotificationProvider>
//       <AppContent />
//     </NotificationProvider>
//   );
// }

// export default App;






// import React, { useEffect, useState } from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import { useAuth } from './context/AuthContext';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { Box, CircularProgress, Typography, Button, Alert, Paper } from '@mui/material';

// // Components
// import PrivateRoute from './components/PrivateRoute';

// // Pages
// import LandingPage from './pages/LandingPage';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import AdminDashboard from './pages/AdminDashboard';
// import AdminSettings from './pages/AdminSettings';
// import ResidentDashboard from './pages/ResidentDashboard';
// import CollectorDashboard from './pages/Collectordashboard';
// import CollectionDetails from './pages/CollectionDetails';
// import CollectorRegister from './pages/CollectorRegister';
// import Feedback from './pages/Feedback';
// import MyCollections from './pages/MyCollections';
// import Notifications from './pages/Notifications';
// import Payments from './pages/Payments';
// import Profile from './pages/Profile';
// import ProgramDetails from './pages/ProgramDetails';
// import Reports from './pages/Reports';
// import RequestCollection from './pages/RequestCollection';
// import Settings from './pages/Settings';
// import ProgramManagement from './pages/ProgramManagement';
// import ProgramsPage from './pages/ProgramsPage';
// import PaymentSuccess from './pages/PaymentSuccess';

// // Context Providers
// import { AuthProvider } from './context/AuthContext';
// import { NotificationProvider } from './context/NotificationContext';
// import { CoinProvider } from './context/CoinContext';

// // API Service
// import api from './services/api';

// class ErrorBoundary extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = { hasError: false, error: null };
//   }
  
//   static getDerivedStateFromError(error) { 
//     return { hasError: true, error }; 
//   }
  
//   componentDidCatch(error, errorInfo) {
//     console.error('❌ UI Crash:', error, errorInfo);
//   }
  
//   render() {
//     if (this.state.hasError) {
//       return (
//         <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f5f5f5', p: 3 }}>
//           <Paper elevation={3} sx={{ p: 4, maxWidth: 600, textAlign: 'center' }}>
//             <Alert severity="error" sx={{ mb: 3 }}>
//               <Typography variant="h6">Application Error</Typography>
//               <Typography variant="body2">{this.state.error?.message}</Typography>
//             </Alert>
//             <Button variant="contained" onClick={() => window.location.href = '/'}>
//               Return to Home
//             </Button>
//           </Paper>
//         </Box>
//       );
//     }
//     return this.props.children;
//   }
// }

// function AppContent() {
//   const { user, loading } = useAuth();
//   const [connectionStatus, setConnectionStatus] = useState('checking');
//   const [retryCount, setRetryCount] = useState(0);

//   useEffect(() => {
//     const testConnection = async () => {
//       try {
//         setConnectionStatus('checking');
//         const response = await api.get('/health');
//         if (response.data && response.data.success) {
//           setConnectionStatus('connected');
//         } else { 
//           throw new Error(); 
//         }
//       } catch (error) {
//         setConnectionStatus('failed');
//       }
//     };
//     testConnection();
//   }, [retryCount]);

//   if (loading || connectionStatus === 'checking') {
//     return (
//       <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//         <CircularProgress size={60} thickness={4} />
//         <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold', color: 'primary.main' }}>
//           SWM Portal Initializing...
//         </Typography>
//       </Box>
//     );
//   }

//   if (connectionStatus === 'failed') {
//     return (
//       <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', p: 3 }}>
//         <Alert 
//           severity="warning" 
//           variant="filled" 
//           action={
//             <Button color="inherit" onClick={() => setRetryCount(c => c + 1)}>
//               Retry
//             </Button>
//           }
//         >
//           Backend Server Offline. Please start the server on Port 5000.
//         </Alert>
//       </Box>
//     );
//   }

//   return (
//     <ErrorBoundary>
//       <Routes>
//         {/* Public Routes */}
//         <Route path="/" element={<LandingPage />} />
        
//         {/* Dashboard Redirect */}
//         <Route path="/dashboard" element={
//           user ? (
//             user.role === 'admin' ? <Navigate to="/admin/dashboard" /> :
//             user.role === 'collector' ? <Navigate to="/collector/dashboard" /> :
//             <Navigate to="/resident/dashboard" />
//           ) : <Navigate to="/login" />
//         } />

//         {/* Auth Routes */}
//         <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
//         <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

//         {/* Admin Routes */}
//         <Route path="/admin/dashboard" element={
//           <PrivateRoute allowedRoles={['admin']}>
//             <AdminDashboard />
//           </PrivateRoute>
//         } />
//         <Route path="/admin/reports" element={
//           <PrivateRoute allowedRoles={['admin']}>
//             <Reports />
//           </PrivateRoute>
//         } />
//         <Route path="/admin/programs" element={
//           <PrivateRoute allowedRoles={['admin']}>
//             <ProgramManagement />
//           </PrivateRoute>
//         } />
//         <Route path="/admin/settings" element={
//           <PrivateRoute allowedRoles={['admin']}>
//             <AdminSettings />
//           </PrivateRoute>
//         } />

//         {/* Resident Routes */}
//         <Route path="/resident/dashboard" element={
//           <PrivateRoute allowedRoles={['resident']}>
//             <ResidentDashboard />
//           </PrivateRoute>
//         } />
//         <Route path="/resident/programs" element={
//           <PrivateRoute allowedRoles={['resident']}>
//             <ProgramsPage />
//           </PrivateRoute>
//         } />
//         <Route path="/request-collection" element={
//           <PrivateRoute allowedRoles={['resident']}>
//             <RequestCollection />
//           </PrivateRoute>
//         } />
//         <Route path="/my-collections" element={
//           <PrivateRoute allowedRoles={['resident']}>
//             <MyCollections />
//           </PrivateRoute>
//         } />
//         <Route path="/payments" element={
//           <PrivateRoute allowedRoles={['resident']}>
//             <Payments />
//           </PrivateRoute>
//         } />
//         <Route path="/payment-success" element={
//           <PrivateRoute allowedRoles={['resident']}>
//             <PaymentSuccess />
//           </PrivateRoute>
//         } />
//         <Route path="/feedback/:collectionId" element={
//           <PrivateRoute allowedRoles={['resident']}>
//             <Feedback />
//           </PrivateRoute>
//         } />
//         <Route path="/collector/register" element={
//           <PrivateRoute allowedRoles={['resident']}>
//             <CollectorRegister />
//           </PrivateRoute>
//         } />

//         {/* Collector Routes */}
//         <Route path="/collector/dashboard" element={
//           <PrivateRoute allowedRoles={['collector']}>
//             <CollectorDashboard />
//           </PrivateRoute>
//         } />

//         {/* Shared Routes */}
//         <Route path="/profile" element={
//           <PrivateRoute>
//             <Profile />
//           </PrivateRoute>
//         } />
//         <Route path="/notifications" element={
//           <PrivateRoute>
//             <Notifications />
//           </PrivateRoute>
//         } />
//         <Route path="/settings" element={
//           <PrivateRoute>
//             <Settings />
//           </PrivateRoute>
//         } />
//         <Route path="/programs/:id" element={
//           <PrivateRoute>
//             <ProgramDetails />
//           </PrivateRoute>
//         } />
//         <Route path="/collections/:id" element={
//           <PrivateRoute>
//             <CollectionDetails />
//           </PrivateRoute>
//         } />

//         {/* Error Routes */}
//         <Route path="/unauthorized" element={
//           <Box textAlign="center" py={10}>
//             <Typography variant="h3">Access Denied</Typography>
//             <Button onClick={() => window.location.href = "/"}>Home</Button>
//           </Box>
//         } />
//         <Route path="*" element={<Navigate to="/" />} />
//       </Routes>
      
//       <ToastContainer 
//         position="top-right" 
//         autoClose={3000} 
//         hideProgressBar={false}
//         newestOnTop
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//         theme="light"
//       />
//     </ErrorBoundary>
//   );
// }

// function App() {
//   return (
//     <AuthProvider>
//       <NotificationProvider>
//         <CoinProvider>
//           <AppContent />
//         </CoinProvider>
//       </NotificationProvider>
//     </AuthProvider>
//   );
// }

// export default App;


// import React from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import { useAuth } from './context/AuthContext';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { Box, CircularProgress, Typography, Button, Alert, Paper } from '@mui/material';
// import { useEffect, useState } from 'react';

// // Route guard
// import PrivateRoute from './components/PrivateRoute';

// // ── Pages ──────────────────────────────────────────────────────
// import LandingPage      from './pages/LandingPage';
// import Login            from './pages/Login';
// import Register         from './pages/Register';

// // Admin
// import AdminDashboard   from './pages/AdminDashboard';
// import AdminSettings    from './pages/AdminSettings';
// import ManagePrograms   from './pages/ManagePrograms';
// import Reports          from './pages/Reports';

// // Resident
// import ResidentDashboard from './pages/ResidentDashboard';
// import ProgramsPage      from './pages/ProgramsPage';
// import RequestCollection from './pages/RequestCollection';
// import MyCollections     from './pages/MyCollections';
// import Payments          from './pages/Payments';
// import PaymentSuccess    from './pages/PaymentSuccess';
// import Feedback          from './pages/Feedback';
// import CollectorRegister from './pages/CollectorRegister';

// // Collector
// import CollectorDashboard from './pages/CollectorDashboard';

// // Shared
// import Profile           from './pages/Profile';
// import Notifications     from './pages/Notifications';
// import Settings          from './pages/Settings';
// import ProgramDetails    from './pages/ProgramDetails';
// import CollectionDetails from './pages/CollectionDetails';

// // ── Context Providers ─────────────────────────────────────────
// import { AuthProvider }         from './context/AuthContext';
// import { NotificationProvider } from './context/NotificationContext';
// import { SocketProvider }       from './context/SocketContext';

// // ── API Service ───────────────────────────────────────────────
// import api from './services/api';

// // ── Error Boundary ────────────────────────────────────────────
// class ErrorBoundary extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = { hasError: false, error: null };
//   }
//   static getDerivedStateFromError(error) { return { hasError: true, error }; }
//   componentDidCatch(error, info) { console.error('❌ UI Crash:', error, info); }
//   render() {
//     if (this.state.hasError) {
//       return (
//         <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', bgcolor:'#f8fafc', p:3 }}>
//           <Paper elevation={3} sx={{ p:4, maxWidth:600, textAlign:'center', borderRadius:4 }}>
//             <Alert severity="error" sx={{ mb:3 }}>
//               <Typography variant="h6">Something went wrong</Typography>
//               <Typography variant="body2">{this.state.error?.message}</Typography>
//             </Alert>
//             <Button variant="contained" onClick={() => window.location.href='/'}>Return to Home</Button>
//           </Paper>
//         </Box>
//       );
//     }
//     return this.props.children;
//   }
// }

// // ── App Content ───────────────────────────────────────────────
// function AppContent() {
//   const { user, loading } = useAuth();
//   const [connectionStatus, setConnectionStatus] = useState('checking');
//   const [retryCount,        setRetryCount]       = useState(0);

//   useEffect(() => {
//     const testConnection = async () => {
//       try {
//         setConnectionStatus('checking');
//         const res = await api.get('/health');
//         setConnectionStatus(res.data?.success ? 'connected' : 'failed');
//       } catch {
//         setConnectionStatus('failed');
//       }
//     };
//     testConnection();
//   }, [retryCount]);

//   if (loading || connectionStatus === 'checking') {
//     return (
//       <Box sx={{ display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', height:'100vh', bgcolor:'#f8fafc' }}>
//         <CircularProgress size={56} thickness={4} sx={{ color:'#16a34a' }} />
//         <Typography variant="h6" sx={{ mt:2, fontWeight:900, color:'#0f172a', letterSpacing:-0.5 }}>
//           SWM Portal
//         </Typography>
//         <Typography variant="body2" sx={{ color:'#64748b', mt:0.5 }}>Initializing…</Typography>
//       </Box>
//     );
//   }

//   if (connectionStatus === 'failed') {
//     return (
//       <Box sx={{ display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', height:'100vh', p:3, bgcolor:'#f8fafc' }}>
//         <Alert severity="warning" variant="filled"
//           action={<Button color="inherit" size="small" fontWeight={800} onClick={() => setRetryCount(c => c+1)}>Retry</Button>}>
//           Backend server offline. Please start the server on Port 5000.
//         </Alert>
//       </Box>
//     );
//   }

//   return (
//     <ErrorBoundary>
//       <Routes>
//         {/* ── Public ───────────────────────────────────── */}
//         <Route path="/" element={<LandingPage />} />
//         <Route path="/login"    element={user ? <Navigate to="/dashboard" /> : <Login />} />
//         <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

//         {/* ── Dashboard redirect by role ────────────────── */}
//         <Route path="/dashboard" element={
//           user
//             ? user.role === 'admin'     ? <Navigate to="/admin/dashboard" />
//             : user.role === 'collector' ? <Navigate to="/collector/dashboard" />
//             : <Navigate to="/resident/dashboard" />
//             : <Navigate to="/login" />
//         } />

//         {/* ── Admin ────────────────────────────────────── */}
//         <Route path="/admin/dashboard" element={
//           <PrivateRoute allowedRoles={['admin']}><AdminDashboard /></PrivateRoute>
//         } />
//         <Route path="/admin/programs" element={
//           <PrivateRoute allowedRoles={['admin']}><ManagePrograms /></PrivateRoute>
//         } />
//         <Route path="/admin/reports" element={
//           <PrivateRoute allowedRoles={['admin']}><Reports /></PrivateRoute>
//         } />
//         <Route path="/admin/settings" element={
//           <PrivateRoute allowedRoles={['admin']}><AdminSettings /></PrivateRoute>
//         } />

//         {/* ── Resident ─────────────────────────────────── */}
//         <Route path="/resident/dashboard" element={
//           <PrivateRoute allowedRoles={['resident']}><ResidentDashboard /></PrivateRoute>
//         } />
//         <Route path="/resident/programs" element={
//           <PrivateRoute allowedRoles={['resident']}><ProgramsPage /></PrivateRoute>
//         } />
//         <Route path="/request-collection" element={
//           <PrivateRoute allowedRoles={['resident']}><RequestCollection /></PrivateRoute>
//         } />
//         <Route path="/my-collections" element={
//           <PrivateRoute allowedRoles={['resident']}><MyCollections /></PrivateRoute>
//         } />
//         <Route path="/payments" element={
//           <PrivateRoute allowedRoles={['resident']}><Payments /></PrivateRoute>
//         } />
//         <Route path="/payment-success" element={
//           <PrivateRoute allowedRoles={['resident']}><PaymentSuccess /></PrivateRoute>
//         } />
//         <Route path="/feedback/:collectionId" element={
//           <PrivateRoute allowedRoles={['resident']}><Feedback /></PrivateRoute>
//         } />
//         <Route path="/collector/register" element={
//           <PrivateRoute allowedRoles={['resident']}><CollectorRegister /></PrivateRoute>
//         } />

//         {/* ── Collector ────────────────────────────────── */}
//         <Route path="/collector/dashboard" element={
//           <PrivateRoute allowedRoles={['collector']}><CollectorDashboard /></PrivateRoute>
//         } />

//         {/* ── Shared ───────────────────────────────────── */}
//         <Route path="/profile"       element={<PrivateRoute><Profile /></PrivateRoute>} />
//         <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
//         <Route path="/settings"      element={<PrivateRoute><Settings /></PrivateRoute>} />
//         <Route path="/programs/:id"  element={<PrivateRoute><ProgramDetails /></PrivateRoute>} />
//         <Route path="/collections/:id" element={<PrivateRoute><CollectionDetails /></PrivateRoute>} />

//         {/* ── Errors ───────────────────────────────────── */}
//         <Route path="/unauthorized" element={
//           <Box textAlign="center" py={16}>
//             <Typography variant="h2" fontWeight={900} color="#0f172a">403</Typography>
//             <Typography variant="h5" color="text.secondary" mb={3}>Access Denied</Typography>
//             <Button variant="contained" onClick={() => window.location.href='/'} sx={{ borderRadius:2, fontWeight:800 }}>Go Home</Button>
//           </Box>
//         } />
//         <Route path="*" element={<Navigate to="/" />} />
//       </Routes>

//       <ToastContainer
//         position="top-right" autoClose={3500}
//         hideProgressBar={false} newestOnTop closeOnClick
//         pauseOnFocusLoss draggable pauseOnHover theme="light"
//       />
//     </ErrorBoundary>
//   );
// }

// // ── Root App ──────────────────────────────────────────────────
// function App() {
//   return (
//     <AuthProvider>
//       <NotificationProvider>
//         <SocketProvider>
//           <AppContent />
//         </SocketProvider>
//       </NotificationProvider>
//     </AuthProvider>
//   );
// }

// export default App;

import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Box, CircularProgress, Typography, Button, Alert, Paper } from '@mui/material';

// Route guard
import PrivateRoute from './components/PrivateRoute';

// ── Pages ──────────────────────────────────────────────────────
import LandingPage      from './pages/LandingPage';
import Login            from './pages/Login';
import Register         from './pages/Register';

// Admin
import AdminDashboard   from './pages/AdminDashboard';
import AdminSettings    from './pages/AdminSettings';
import ManagePrograms   from './pages/ManagePrograms';
import Reports          from './pages/Reports';

// Resident
import ResidentDashboard from './pages/ResidentDashboard';
import ProgramsPage      from './pages/ProgramsPage';
import RequestCollection from './pages/RequestCollection';
import MyCollections     from './pages/MyCollections';
import Payments          from './pages/Payments';
import PaymentSuccess    from './pages/PaymentSuccess';
import Feedback          from './pages/Feedback';
import CollectorRegister from './pages/CollectorRegister';

// Collector
import CollectorDashboard from './pages/CollectorDashboard';

// Shared
import Profile           from './pages/Profile';
import Notifications     from './pages/Notifications';
import Settings          from './pages/Settings';
import ProgramDetails    from './pages/ProgramDetails';
import CollectionDetails from './pages/CollectionDetails';

// ── Context Providers ─────────────────────────────────────────
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider }       from './context/SocketContext';

// ── API Service ───────────────────────────────────────────────
import api from './services/api';

// ── Error Boundary ────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('❌ UI Crash:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', bgcolor:'#f8fafc', p:3 }}>
          <Paper elevation={3} sx={{ p:4, maxWidth:600, textAlign:'center', borderRadius:4 }}>
            <Alert severity="error" sx={{ mb:3 }}>
              <Typography variant="h6">Something went wrong</Typography>
              <Typography variant="body2">{this.state.error?.message}</Typography>
            </Alert>
            <Button variant="contained" onClick={() => window.location.href='/'}>Refresh Page</Button>
          </Paper>
        </Box>
      );
    }
    return this.props.children;
  }
}

// ── App Content ───────────────────────────────────────────────
function AppContent() {
  const { user, loading } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [retryCount,        setRetryCount]       = useState(0);

  useEffect(() => {
    const testConnection = async () => {
      try {
        setConnectionStatus('checking');
        const res = await api.get('/health');
        setConnectionStatus(res.data?.success ? 'connected' : 'failed');
      } catch {
        setConnectionStatus('failed');
      }
    };
    testConnection();
  }, [retryCount]);

  if (loading || connectionStatus === 'checking') {
    return (
      <Box sx={{ display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', height:'100vh', bgcolor:'#f8fafc' }}>
        <CircularProgress size={56} thickness={4} sx={{ color:'#16a34a' }} />
        <Typography variant="h6" sx={{ mt:2, fontWeight:900, color:'#0f172a', letterSpacing:-0.5 }}>
          SWM Portal
        </Typography>
        <Typography variant="body2" sx={{ color:'#64748b', mt:0.5 }}>Initializing…</Typography>
      </Box>
    );
  }

  if (connectionStatus === 'failed') {
    return (
      <Box sx={{ display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', height:'100vh', p:3, bgcolor:'#f8fafc' }}>
        <Alert severity="warning" variant="filled"
          action={<Button color="inherit" size="small" fontWeight={800} onClick={() => setRetryCount(c => c+1)}>Retry</Button>}>
          Backend server offline. Please check your Node.js terminal.
        </Alert>
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login"    element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

        <Route path="/dashboard" element={
          user
            ? user.role === 'admin'     ? <Navigate to="/admin/dashboard" />
            : user.role === 'collector' ? <Navigate to="/collector/dashboard" />
            : <Navigate to="/resident/dashboard" />
            : <Navigate to="/login" />
        } />

        {/* ── Admin ────────────────────────────────────── */}
        <Route path="/admin/dashboard" element={<PrivateRoute allowedRoles={['admin']}><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/programs" element={<PrivateRoute allowedRoles={['admin']}><ManagePrograms /></PrivateRoute>} />
        <Route path="/admin/reports" element={<PrivateRoute allowedRoles={['admin']}><Reports /></PrivateRoute>} />
        <Route path="/admin/settings" element={<PrivateRoute allowedRoles={['admin']}><AdminSettings /></PrivateRoute>} />

        {/* ── Resident ─────────────────────────────────── */}
        <Route path="/resident/dashboard" element={<PrivateRoute allowedRoles={['resident']}><ResidentDashboard /></PrivateRoute>} />
        <Route path="/resident/programs" element={<PrivateRoute allowedRoles={['resident']}><ProgramsPage /></PrivateRoute>} />
        <Route path="/request-collection" element={<PrivateRoute allowedRoles={['resident']}><RequestCollection /></PrivateRoute>} />
        <Route path="/my-collections" element={<PrivateRoute allowedRoles={['resident']}><MyCollections /></PrivateRoute>} />
        <Route path="/payments" element={<PrivateRoute allowedRoles={['resident']}><Payments /></PrivateRoute>} />
        <Route path="/payment-success" element={<PrivateRoute allowedRoles={['resident']}><PaymentSuccess /></PrivateRoute>} />
        <Route path="/feedback/:collectionId" element={<PrivateRoute allowedRoles={['resident']}><Feedback /></PrivateRoute>} />
        <Route path="/collector/register" element={<PrivateRoute allowedRoles={['resident']}><CollectorRegister /></PrivateRoute>} />

        {/* ── Collector ────────────────────────────────── */}
        <Route path="/collector/dashboard" element={<PrivateRoute allowedRoles={['collector']}><CollectorDashboard /></PrivateRoute>} />

        {/* ── Shared ───────────────────────────────────── */}
        <Route path="/profile"       element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
        <Route path="/settings"      element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/programs/:id"  element={<PrivateRoute><ProgramDetails /></PrivateRoute>} />
        <Route path="/collections/:id" element={<PrivateRoute><CollectionDetails /></PrivateRoute>} />

        <Route path="/unauthorized" element={
          <Box textAlign="center" py={16}>
            <Typography variant="h2" fontWeight={900} color="#0f172a">403</Typography>
            <Typography variant="h5" color="text.secondary" mb={3}>Access Denied</Typography>
            <Button variant="contained" onClick={() => window.location.href='/'} sx={{ borderRadius:2, fontWeight:800 }}>Go Home</Button>
          </Box>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={3500} theme="light" />
    </ErrorBoundary>
  );
}

// ── Root App ──────────────────────────────────────────────────
// FIX: Removed BrowserRouter from here because it's already in index.js!
function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;