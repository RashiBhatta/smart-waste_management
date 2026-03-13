// // import React from 'react';
// // import { Navigate, useLocation } from 'react-router-dom';
// // import { useAuth } from '../context/AuthContext';
// // import { CircularProgress, Box, Typography, Paper, Button, Avatar, Zoom } from '@mui/material';
// // import { WarningAmber as WarningIcon, Logout as LogoutIcon } from '@mui/icons-material';

// // const PrivateRoute = ({ children, allowedRoles = [] }) => {
// //   // 1. Destructure logout from useAuth
// //   const { user, loading, logout } = useAuth(); 
// //   const location = useLocation();

// //   if (loading) {
// //     return (
// //       <Box sx={{ 
// //         display: 'flex', flexDirection: 'column',
// //         justifyContent: 'center', alignItems: 'center', 
// //         height: '100vh', backgroundColor: '#f4f7f6'
// //       }}>
// //         <CircularProgress size={60} thickness={4} />
// //         <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary', fontWeight: 600 }}>
// //           Verifying authentication...
// //         </Typography>
// //       </Box>
// //     );
// //   }

// //   if (!user) {
// //     // Save the attempted location for redirect after login
// //     return <Navigate to="/login" state={{ from: location.pathname }} replace />;
// //   }

// //   // 2. Updated Deactivated Screen with an "Escape Hatch" Button
// //   if (!user.isActive) {
// //     return (
// //       <Box sx={{ 
// //         display: 'flex', justifyContent: 'center', alignItems: 'center', 
// //         height: '100vh', backgroundColor: '#f4f7f6', p: 3
// //       }}>
// //         <Zoom in>
// //           <Paper elevation={24} sx={{ p: 5, maxWidth: 400, textAlign: 'center', borderRadius: 4, border: '2px solid #ef5350' }}>
// //             <Avatar sx={{ bgcolor: 'error.main', width: 70, height: 70, mx: 'auto', mb: 3 }}>
// //               <WarningIcon sx={{ fontSize: 40 }} />
// //             </Avatar>
// //             <Typography variant="h5" fontWeight="900" color="error.dark" gutterBottom>
// //               Account Deactivated
// //             </Typography>
// //             <Typography variant="body1" color="text.secondary" paragraph sx={{ fontWeight: 500 }}>
// //               Your account has been suspended by the administrator. You cannot access this dashboard.
// //             </Typography>
            
// //             <Box sx={{ p: 2, bgcolor: '#fff5f5', borderRadius: 3, mb: 4 }}>
// //               <Typography variant="caption" fontWeight="900" display="block" color="error">
// //                 SUPPORT CONTACT
// //               </Typography>
// //               <Typography variant="body2" fontWeight="bold">
// //                 admin@swm.com
// //               </Typography>
// //             </Box>

// //             {/* CRITICAL FIX: The Sign Out Button */}
// //             <Button 
// //               variant="contained" 
// //               color="error" 
// //               fullWidth 
// //               startIcon={<LogoutIcon />}
// //               onClick={logout}
// //               sx={{ fontWeight: 800, borderRadius: 2, py: 1.5 }}
// //             >
// //               Sign Out & Clear Session
// //             </Button>
// //           </Paper>
// //         </Zoom>
// //       </Box>
// //     );
// //   }

// //   // Check role authorization
// //   if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
// //     console.warn(`Unauthorized access attempt: User with role "${user.role}" tried to access route requiring roles: ${allowedRoles.join(', ')}`);

// //     const dashboardPath = user.role === 'admin' 
// //       ? '/admin/dashboard' 
// //       : user.role === 'collector' 
// //       ? '/collector/dashboard' 
// //       : '/resident/dashboard';

// //     return <Navigate to={dashboardPath} replace />;
// //   }

// //   // Check monthly fee for residents (optional)
// //   if (user.role === 'resident' && !user.monthlyFeePaid && user.freeServiceMonths === 0) {
// //     if (!location.pathname.includes('/payments')) {
// //       console.warn('Monthly fee payment required');
// //     }
// //   }

// //   // Return children with props
// //   return React.cloneElement(children, { user });
// // };

// // export default PrivateRoute;




// import React from 'react';
// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { Box, CircularProgress } from '@mui/material';

// const PrivateRoute = ({ children, allowedRoles = [] }) => {
//   const { user, loading, isAuthenticated } = useAuth();

//   if (loading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
//     return <Navigate to="/unauthorized" replace />;
//   }

//   return children;
// };

// export default PrivateRoute;

// ============================================================
// FILE: frontend/src/components/PrivateRoute.jsx
// A wrapper that enforces authentication + optional role check
// ============================================================

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh' }}>
        <CircularProgress sx={{ color:'#16a34a' }} />
      </Box>
    );
  }

  // Not authenticated → send to login, preserving intended destination
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default PrivateRoute;
