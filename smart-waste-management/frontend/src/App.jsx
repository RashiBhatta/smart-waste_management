
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Box, CircularProgress, Typography, Button, Alert, Paper } from '@mui/material';

// Route guard
import PrivateRoute from './components/PrivateRoute';

// ── Pages ──────────────────────────────────────────────────────
import LandingPage        from './pages/LandingPage';
import Login              from './pages/Login';
import Register           from './pages/Register';

// Admin
import AdminDashboard     from './pages/AdminDashboard';
import AdminSettings      from './pages/AdminSettings';
import ManagePrograms     from './pages/ManagePrograms';
import Reports            from './pages/Reports';

// Resident
import ResidentDashboard  from './pages/ResidentDashboard';
import ProgramsPage       from './pages/ProgramsPage';
import Programs           from './pages/Programs';         // ✅ Programs page
import RequestCollection  from './pages/RequestCollection';
import MyCollections      from './pages/MyCollections';
import Payments           from './pages/Payments';
import PaymentSuccess     from './pages/PaymentSuccess';
import Feedback           from './pages/Feedback';
import CollectorRegister  from './pages/CollectorRegister';
import RewardWallet       from './pages/RewardWallet';     // ✅ Rewards wallet

// Collector
import CollectorDashboard from './pages/CollectorDashboard';

// Shared
import Profile            from './pages/Profile';
import Notifications      from './pages/Notifications';
import Settings           from './pages/Settings';
import ProgramDetails     from './pages/ProgramDetails';
import CollectionDetails  from './pages/CollectionDetails';

// ── Context Providers ─────────────────────────────────────────
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider }  from './context/NotificationContext';
import { SocketProvider }        from './context/SocketContext';

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

  // ── Loading / connecting screen ───────────────────────────
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

  // ── Backend offline screen ────────────────────────────────
  if (connectionStatus === 'failed') {
    return (
      <Box sx={{ display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', height:'100vh', p:3, bgcolor:'#f8fafc' }}>
        <Alert
          severity="warning"
          variant="filled"
          action={
            <Button color="inherit" size="small" onClick={() => setRetryCount(c => c + 1)}>
              Retry
            </Button>
          }
        >
          Backend server offline. Please check your Node.js terminal.
        </Alert>
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <Routes>

        {/* ── Public ─────────────────────────────────────── */}
        <Route path="/"         element={<LandingPage />} />
        <Route path="/login"    element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

        {/* ── Smart role-based redirect ──────────────────── */}
        <Route path="/dashboard" element={
          user
            ? user.role === 'admin'     ? <Navigate to="/admin/dashboard" />
            : user.role === 'collector' ? <Navigate to="/collector/dashboard" />
            : <Navigate to="/resident/dashboard" />
            : <Navigate to="/login" />
        } />

        {/* ── Admin ──────────────────────────────────────── */}
        <Route path="/admin/dashboard"
          element={<PrivateRoute allowedRoles={['admin']}><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/programs"
          element={<PrivateRoute allowedRoles={['admin']}><ManagePrograms /></PrivateRoute>} />
        <Route path="/admin/reports"
          element={<PrivateRoute allowedRoles={['admin']}><Reports /></PrivateRoute>} />
        <Route path="/admin/settings"
          element={<PrivateRoute allowedRoles={['admin']}><AdminSettings /></PrivateRoute>} />

        {/* ── Resident ───────────────────────────────────── */}
        <Route path="/resident/dashboard"
          element={<PrivateRoute allowedRoles={['resident']}><ResidentDashboard /></PrivateRoute>} />

        {/* ✅ /programs — used by RewardWallet "Earn More" button & sidebar nav */}
        <Route path="/programs"
          element={<PrivateRoute allowedRoles={['resident']}><Programs /></PrivateRoute>} />

        {/* /resident/programs — used by old sidebar links */}
        <Route path="/resident/programs"
          element={<PrivateRoute allowedRoles={['resident']}><ProgramsPage /></PrivateRoute>} />

        <Route path="/request-collection"
          element={<PrivateRoute allowedRoles={['resident']}><RequestCollection /></PrivateRoute>} />
        <Route path="/my-collections"
          element={<PrivateRoute allowedRoles={['resident']}><MyCollections /></PrivateRoute>} />
        <Route path="/payments"
          element={<PrivateRoute allowedRoles={['resident']}><Payments /></PrivateRoute>} />
        <Route path="/payment-success"
          element={<PrivateRoute allowedRoles={['resident']}><PaymentSuccess /></PrivateRoute>} />
        <Route path="/feedback/:collectionId"
          element={<PrivateRoute allowedRoles={['resident']}><Feedback /></PrivateRoute>} />
        <Route path="/collector/register"
          element={<PrivateRoute allowedRoles={['resident']}><CollectorRegister /></PrivateRoute>} />

        {/* ✅ /rewards — RewardWallet page */}
        <Route path="/rewards"
          element={<PrivateRoute allowedRoles={['resident']}><RewardWallet /></PrivateRoute>} />

        {/* ── Collector ──────────────────────────────────── */}
        <Route path="/collector/dashboard"
          element={<PrivateRoute allowedRoles={['collector']}><CollectorDashboard /></PrivateRoute>} />

        {/* ── Shared ─────────────────────────────────────── */}
        <Route path="/profile"
          element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/notifications"
          element={<PrivateRoute><Notifications /></PrivateRoute>} />
        <Route path="/settings"
          element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/programs/:id"
          element={<PrivateRoute><ProgramDetails /></PrivateRoute>} />
        <Route path="/collections/:id"
          element={<PrivateRoute><CollectionDetails /></PrivateRoute>} />

        {/* ── Fallbacks ───────────────────────────────────── */}
        <Route path="/unauthorized" element={
          <Box textAlign="center" py={16}>
            <Typography variant="h2" fontWeight={900} color="#0f172a">403</Typography>
            <Typography variant="h5" color="text.secondary" mb={3}>Access Denied</Typography>
            <Button variant="contained"
              onClick={() => window.location.href='/'}
              sx={{ borderRadius:2, fontWeight:800 }}>
              Go Home
            </Button>
          </Box>
        } />
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>

      <ToastContainer position="top-right" autoClose={3500} theme="light" />
    </ErrorBoundary>
  );
}

// ── Root App ──────────────────────────────────────────────────
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