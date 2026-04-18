// // import React, { useState, useEffect, useCallback } from 'react';
// // import { 
// //   Box, Container, Grid, Card, CardContent, Typography, Button, 
// //   LinearProgress, Chip, Stack, Avatar, Alert, Divider,
// //   Drawer, List, ListItem, ListItemIcon, ListItemText,
// //   AppBar, Toolbar, IconButton, useTheme, useMediaQuery, Paper,
// //   Table, TableBody, TableCell, TableContainer, TableHead, TableRow
// // } from '@mui/material';
// // import { 
// //   VolunteerActivism, AccountBalanceWallet, 
// //   CheckCircle, PendingActions, LocationOn,
// //   Dashboard, LocalShipping, Payment, Logout, Menu as MenuIcon,
// //   EmojiEvents, History, AddCircle
// // } from '@mui/icons-material';
// // import { useAuth } from '../context/AuthContext';
// // import { useNavigate } from 'react-router-dom';
// // import api from '../services/api';
// // import { toast } from 'react-toastify';

// // const drawerWidth = 260;

// // const ResidentDashboard = () => {
// //   const { user, logout } = useAuth();
// //   const navigate = useNavigate();
// //   const theme = useTheme();
// //   const isMobile = useMediaQuery(theme.breakpoints.down('md'));

// //   const [mobileOpen, setMobileOpen] = useState(false);
// //   const [programs, setPrograms] = useState([]);
// //   const [loading, setLoading] = useState(true);
  
// //   // Standard fixed fee as requested
// //   const monthlyFee = 1000;

// //   const fetchPrograms = useCallback(async () => {
// //     try {
// //       const res = await api.get('/programs');
// //       setPrograms(res.data.programs);
// //     } catch (err) {
// //       toast.error("Failed to load programs");
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, []);

// //   useEffect(() => {
// //     fetchPrograms();
// //   }, [fetchPrograms]);

// //   const handleJoinProgram = async (programId) => {
// //     try {
// //       await api.post(`/programs/${programId}/join`);
// //       toast.success("Successfully applied as a volunteer!");
// //       fetchPrograms(); // Refresh to update button status
// //     } catch (err) {
// //       toast.error(err.response?.data?.message || "Failed to join program");
// //     }
// //   };

// //   const handleLogout = () => {
// //     logout();
// //     navigate('/login');
// //     toast.success("Logged out successfully");
// //   };

// //   const coinProgress = Math.min((user?.coins || 0) / 1000 * 100, 100);

// //   // ==========================================
// //   // SIDEBAR COMPONENT
// //   // ==========================================
// //   const menuItems = [
// //     { label: 'Dashboard Overview', icon: <Dashboard />, action: () => navigate('/resident/dashboard'), active: true },
// //     { label: 'Request Pickup', icon: <LocalShipping />, action: () => navigate('/request-collection'), active: false },
// //     { label: 'My Collections', icon: <History />, action: () => navigate('/my-collections'), active: false },
// //     { label: 'Khalti Payments', icon: <Payment />, action: () => navigate('/payments'), active: false },
// //   ];

// //   const drawerContent = (
// //     <Box sx={{ height: '100%', bgcolor: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column' }}>
// //       <Toolbar sx={{ px: 3, py: 3 }}>
// //         <Stack direction="row" spacing={1.5} alignItems="center">
// //           <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}><LocationOn fontSize="small" /></Avatar>
// //           <Typography variant="h6" fontWeight="900" sx={{ letterSpacing: 1 }}>RESIDENT</Typography>
// //         </Stack>
// //       </Toolbar>
// //       <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      
// //       <List sx={{ px: 2, mt: 3, flexGrow: 1 }}>
// //         {menuItems.map((item, index) => (
// //           <ListItem 
// //             button 
// //             key={index}
// //             onClick={() => { item.action(); if (isMobile) setMobileOpen(false); }}
// //             sx={{ 
// //               mb: 1.5, borderRadius: 2,
// //               bgcolor: item.active ? 'primary.main' : 'transparent',
// //               '&:hover': { bgcolor: item.active ? 'primary.main' : 'rgba(255,255,255,0.05)' }
// //             }}
// //           >
// //             <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>{item.icon}</ListItemIcon>
// //             <ListItemText primary={<Typography fontWeight={item.active ? 800 : 500} fontSize="0.95rem">{item.label}</Typography>} />
// //           </ListItem>
// //         ))}
// //       </List>

// //       <Box sx={{ p: 2 }}>
// //         <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 2 }} />
// //         <Button 
// //           fullWidth variant="text" color="error" 
// //           startIcon={<Logout />} onClick={handleLogout}
// //           sx={{ fontWeight: 700, justifyContent: 'flex-start', px: 2 }}
// //         >
// //           Sign Out
// //         </Button>
// //       </Box>
// //     </Box>
// //   );

// //   return (
// //     <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f1f5f9' }}>
      
// //       {/* Mobile App Bar */}
// //       <AppBar position="fixed" sx={{ width: { md: `calc(100% - ${drawerWidth}px)` }, ml: { md: `${drawerWidth}px` }, bgcolor: 'white', color: 'text.primary', display: { md: 'none' }, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
// //         <Toolbar>
// //           <IconButton edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2 }}><MenuIcon /></IconButton>
// //           <Typography variant="h6" fontWeight="bold">Resident Portal</Typography>
// //         </Toolbar>
// //       </AppBar>

// //       {/* Sidebar Navigation */}
// //       <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
// //         <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth, borderRight: 'none' } }}>
// //           {drawerContent}
// //         </Drawer>
// //         <Drawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth, borderRight: 'none' } }} open>
// //           {drawerContent}
// //         </Drawer>
// //       </Box>

// //       {/* Main Workspace */}
// //       <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 5 }, width: { md: `calc(100% - ${drawerWidth}px)` }, mt: { xs: 8, md: 0 } }}>
// //         <Container maxWidth="xl" disableGutters>
          
// //           <Typography variant="h4" fontWeight="900" mb={4} color="#0f172a">Welcome, {user?.name?.split(' ')[0]}</Typography>

// //           {/* ==========================================
// //               METRICS HEADER (FEE & COINS)
// //               ========================================== */}
// //           <Grid container spacing={3} mb={5}>
// //             <Grid item xs={12} md={4}>
// //               <Paper elevation={0} sx={{ borderRadius: 4, bgcolor: '#1e293b', color: 'white', height: '100%', p: 3, border: '1px solid #334155' }}>
// //                 <Stack direction="row" spacing={2} alignItems="center" mb={2}>
// //                   <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main', color: 'white', fontWeight: 900, fontSize: '1.5rem' }}>
// //                     {user?.name?.[0]}
// //                   </Avatar>
// //                   <Box>
// //                     <Typography variant="h6" fontWeight="900">{user?.name}</Typography>
// //                     <Typography variant="body2" sx={{ color: '#94a3b8' }} display="flex" alignItems="center">
// //                       <LocationOn fontSize="small" sx={{ mr: 0.5 }} /> 
// //                       Zone: {user?.address?.zone?.toUpperCase() || 'NOT ASSIGNED'}
// //                     </Typography>
// //                   </Box>
// //                 </Stack>
// //                 <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />
// //                 <Typography variant="overline" fontWeight={800} sx={{ color: '#94a3b8' }}>MONTHLY WASTE FEE</Typography>
// //                 <Typography variant="h3" fontWeight={900}>Rs. {monthlyFee}</Typography>
// //                 {user?.monthlyFeePaid && (
// //                   <Chip label="Current Month Paid" color="success" sx={{ mt: 2, fontWeight: 800, borderRadius: 2 }} />
// //                 )}
// //               </Paper>
// //             </Grid>

// //             <Grid item xs={12} md={8}>
// //               <Paper elevation={0} sx={{ borderRadius: 4, height: '100%', border: '1px solid #e2e8f0', p: 4 }}>
// //                 <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
// //                   <Typography variant="h6" fontWeight="900" color="#0f172a" display="flex" alignItems="center" gap={1}>
// //                     <EmojiEvents sx={{ color: '#f59e0b' }} /> Eco-Coin Rewards
// //                   </Typography>
// //                   <Typography variant="h5" fontWeight="900" color="success.main">{user?.coins || 0} / 1000</Typography>
// //                 </Stack>
// //                 <Typography variant="body2" color="text.secondary" mb={4}>
// //                   Earn 100 coins for every verified volunteer program you participate in. Reach 1000 coins to automatically unlock 1 Month of Free Service!
// //                 </Typography>
                
// //                 <Box sx={{ position: 'relative', pt: 1 }}>
// //                   <LinearProgress 
// //                     variant="determinate" 
// //                     value={coinProgress} 
// //                     sx={{ height: 16, borderRadius: 8, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: 'success.main' } }} 
// //                   />
// //                 </Box>
// //               </Paper>
// //             </Grid>
// //           </Grid>

// //           {/* ==========================================
// //               ECO-PROGRAMS (TABLE VIEW)
// //               ========================================== */}
// //           <Typography variant="h5" fontWeight="900" color="#0f172a" mb={3} display="flex" alignItems="center" gap={1}>
// //             <VolunteerActivism color="primary" /> Available Eco-Programs in Your Zone
// //           </Typography>

// //           {loading ? (
// //             <LinearProgress /> 
// //           ) : programs.length === 0 ? (
// //             <Alert severity="info" sx={{ borderRadius: 3, fontWeight: 700, bgcolor: '#e0f2fe', color: '#0369a1' }}>
// //               No active community programs in your zone right now. Check back later!
// //             </Alert>
// //           ) : (
// //             <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
// //               <TableContainer>
// //                 <Table>
// //                   <TableHead sx={{ bgcolor: '#f8fafc' }}>
// //                     <TableRow>
// //                       <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Campaign Title</TableCell>
// //                       <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Organization</TableCell>
// //                       <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Details</TableCell>
// //                       <TableCell sx={{ fontWeight: 800, color: '#475569', textAlign: 'center' }}>Reward</TableCell>
// //                       <TableCell sx={{ fontWeight: 800, color: '#475569', textAlign: 'center' }}>Action</TableCell>
// //                     </TableRow>
// //                   </TableHead>
// //                   <TableBody>
// //                     {programs.map((prog) => (
// //                       <TableRow key={prog._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
// //                         <TableCell sx={{ fontWeight: 700, minWidth: 200 }}>{prog.title}</TableCell>
// //                         <TableCell>
// //                           <Typography variant="caption" fontWeight={800} sx={{ textTransform: 'uppercase', bgcolor: '#f1f5f9', px: 1, py: 0.5, borderRadius: 1 }}>
// //                             {prog.organization || 'SWM Admin'}
// //                           </Typography>
// //                         </TableCell>
// //                         <TableCell sx={{ minWidth: 300, color: '#475569' }}>{prog.description}</TableCell>
// //                         <TableCell align="center">
// //                           <Chip label="+100 Coins" color="success" size="small" sx={{ fontWeight: 800, bgcolor: '#dcfce7', color: '#166534' }} />
// //                         </TableCell>
// //                         <TableCell align="center" sx={{ minWidth: 220 }}>
                          
// //                           {/* Dynamic Button Logic Based on Status */}
// //                           {prog.hasJoined ? (
// //                             prog.volunteerStatus === 'approved' ? (
// //                               <Chip 
// //                                 icon={<CheckCircle fontSize="small" />} 
// //                                 label="Approved & Awarded" 
// //                                 color="success" 
// //                                 sx={{ fontWeight: 800, borderRadius: 2, py: 2.5, width: '100%' }} 
// //                               />
// //                             ) : (
// //                               <Chip 
// //                                 icon={<PendingActions fontSize="small" />} 
// //                                 label="Awaiting Verification" 
// //                                 color="warning" 
// //                                 variant="outlined"
// //                                 sx={{ fontWeight: 800, borderRadius: 2, py: 2.5, width: '100%' }} 
// //                               />
// //                             )
// //                           ) : (
// //                             <Button 
// //                               fullWidth 
// //                               variant="contained" 
// //                               color="primary" 
// //                               startIcon={<AddCircle />}
// //                               onClick={() => handleJoinProgram(prog._id)}
// //                               sx={{ borderRadius: 2, fontWeight: 800, py: 1 }}
// //                             >
// //                               Join Campaign
// //                             </Button>
// //                           )}
                          
// //                         </TableCell>
// //                       </TableRow>
// //                     ))}
// //                   </TableBody>
// //                 </Table>
// //               </TableContainer>
// //             </Paper>
// //           )}

// //         </Container>
// //       </Box>
// //     </Box>
// //   );
// // };

// // export default ResidentDashboard;








// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   Box, Container, Grid, Card, CardContent, Typography, Button,
//   LinearProgress, Chip, Stack, Avatar, Alert, Divider,
//   Drawer, List, ListItem, ListItemIcon, ListItemText,
//   AppBar, Toolbar, IconButton, useTheme, useMediaQuery, Paper,
//   Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
//   Tab, Tabs, Badge, Snackbar, CircularProgress
// } from '@mui/material';
// import {
//   VolunteerActivism, AccountBalanceWallet,
//   CheckCircle, PendingActions, LocationOn,
//   Dashboard, LocalShipping, Payment, Logout, Menu as MenuIcon,
//   EmojiEvents, History, AddCircle, Notifications as NotificationsIcon,
//   Home, Event, Receipt, Info
// } from '@mui/icons-material';
// import { useAuth } from '../context/AuthContext';
// import { useNotifications } from '../context/NotificationContext';
// import { useCoins } from '../context/CoinContext';
// import { useNavigate } from 'react-router-dom';
// import api from '../services/api';
// import { toast } from 'react-toastify';
// import NotificationBell from '../components/NotificationBell';
// import CoinBalance from '../components/CoinBalance';
// import PaymentGateway from '../components/PaymentGateway';

// const drawerWidth = 280;

// const ResidentDashboard = () => {
//   const { user, logout } = useAuth();
//   const { unreadCount } = useNotifications();
//   const { balance, fetchCoinData, isServiceFree, freeServiceUntil } = useCoins();
//   const navigate = useNavigate();
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));

//   const [mobileOpen, setMobileOpen] = useState(false);
//   const [programs, setPrograms] = useState([]);
//   const [myPrograms, setMyPrograms] = useState([]);
//   const [collections, setCollections] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [tabValue, setTabValue] = useState(0);
//   const [paymentOpen, setPaymentOpen] = useState(false);
//   const [stats, setStats] = useState({
//     totalCollections: 0,
//     pendingCollections: 0,
//     completedCollections: 0,
//     totalEarned: 0
//   });

//   const monthlyFee = 1000;
//   const isPaymentDue = !user?.monthlyFeePaid && !isServiceFree;

//   const fetchDashboardData = useCallback(async () => {
//     try {
//       setLoading(true);
//       const [programsRes, myProgramsRes, collectionsRes] = await Promise.all([
//         api.get('/programs'),
//         api.get('/resident/my-programs'),
//         api.get('/resident/collections')
//       ]);

//       setPrograms(programsRes.data.programs || []);
//       setMyPrograms(myProgramsRes.data.programs || []);
//       setCollections(collectionsRes.data.collections || []);

//       // Calculate stats
//       const coll = collectionsRes.data.collections || [];
//       setStats({
//         totalCollections: coll.length,
//         pendingCollections: coll.filter(c => c.status === 'Pending').length,
//         completedCollections: coll.filter(c => c.status === 'Completed').length,
//         totalEarned: myProgramsRes.data.programs?.filter(p => p.status === 'approved').length * 100 || 0
//       });

//     } catch (error) {
//       toast.error('Failed to load dashboard data');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchDashboardData();
//   }, [fetchDashboardData]);

//   const handleJoinProgram = async (programId) => {
//     try {
//       await api.post(`/programs/${programId}/join`);
//       toast.success('Application submitted! Waiting for approval.');
//       fetchDashboardData();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to join program');
//     }
//   };

//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };

//   const getProgramStatusColor = (status) => {
//     switch (status) {
//       case 'approved': return 'success';
//       case 'pending': return 'warning';
//       case 'rejected': return 'error';
//       default: return 'default';
//     }
//   };

//   const menuItems = [
//     { label: 'Dashboard', icon: <Dashboard />, path: '/resident/dashboard' },
//     { label: 'Programs', icon: <VolunteerActivism />, path: '/resident/programs' },
//     { label: 'Request Pickup', icon: <LocalShipping />, path: '/request-collection' },
//     { label: 'My Collections', icon: <History />, path: '/my-collections' },
//     { label: 'Payments', icon: <Payment />, path: '/payments' },
//     { label: 'Notifications', icon: <NotificationsIcon />, path: '/notifications', badge: unreadCount }
//   ];

//   const drawerContent = (
//     <Box sx={{ height: '100%', bgcolor: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column' }}>
//       <Toolbar sx={{ px: 3, py: 3 }}>
//         <Stack direction="row" spacing={1.5} alignItems="center">
//           <Avatar sx={{ bgcolor: '#10b981', width: 48, height: 48 }}><Home /></Avatar>
//           <Box>
//             <Typography variant="h6" fontWeight="900" sx={{ lineHeight: 1 }}>ECO-HOME</Typography>
//             <Typography variant="caption" color="#94a3b8">Resident Portal</Typography>
//           </Box>
//         </Stack>
//       </Toolbar>
//       <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

//       <List sx={{ px: 2, mt: 3, flexGrow: 1 }}>
//         {menuItems.map((item, index) => (
//           <ListItem
//             button
//             key={index}
//             onClick={() => {
//               navigate(item.path);
//               if (isMobile) setMobileOpen(false);
//             }}
//             sx={{
//               mb: 1.5,
//               borderRadius: 2,
//               bgcolor: window.location.pathname === item.path ? '#1e293b' : 'transparent',
//               '&:hover': { bgcolor: '#1e293b' }
//             }}
//           >
//             <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>{item.icon}</ListItemIcon>
//             <ListItemText primary={<Typography>{item.label}</Typography>} />
//             {item.badge > 0 && (
//               <Chip label={item.badge} size="small" sx={{ bgcolor: '#ef4444', color: 'white', fontWeight: 800 }} />
//             )}
//           </ListItem>
//         ))}
//       </List>

//       <Box sx={{ p: 2 }}>
//         <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 2 }} />
//         <Button
//           fullWidth
//           variant="text"
//           color="error"
//           startIcon={<Logout />}
//           onClick={handleLogout}
//           sx={{ fontWeight: 700, justifyContent: 'flex-start', px: 2, color: '#94a3b8' }}
//         >
//           Sign Out
//         </Button>
//       </Box>
//     </Box>
//   );

//   if (loading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
//       {/* Mobile App Bar */}
//       <AppBar
//         position="fixed"
//         sx={{
//           width: { md: `calc(100% - ${drawerWidth}px)` },
//           ml: { md: `${drawerWidth}px` },
//           bgcolor: 'white',
//           color: 'text.primary',
//           display: { md: 'none' },
//           boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
//         }}
//       >
//         <Toolbar>
//           <IconButton edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2 }}>
//             <MenuIcon />
//           </IconButton>
//           <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
//             Resident Portal
//           </Typography>
//           <NotificationBell />
//           <CoinBalance />
//         </Toolbar>
//       </AppBar>

//       {/* Desktop Header */}
//       <Box
//         sx={{
//           width: { md: `calc(100% - ${drawerWidth}px)` },
//           ml: { md: `${drawerWidth}px` },
//           position: 'fixed',
//           top: 0,
//           right: 0,
//           bgcolor: 'white',
//           borderBottom: '1px solid #e2e8f0',
//           zIndex: 1100,
//           display: { xs: 'none', md: 'block' }
//         }}
//       >
//         <Toolbar sx={{ justifyContent: 'flex-end', gap: 2 }}>
//           <CoinBalance />
//           <NotificationBell />
//           <Avatar sx={{ bgcolor: '#10b981' }}>{user?.name?.[0]}</Avatar>
//         </Toolbar>
//       </Box>

//       {/* Sidebar */}
//       <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
//         <Drawer
//           variant={isMobile ? "temporary" : "permanent"}
//           open={isMobile ? mobileOpen : true}
//           onClose={() => setMobileOpen(false)}
//           sx={{
//             '& .MuiDrawer-paper': {
//               width: drawerWidth,
//               border: 'none',
//               bgcolor: '#0f172a'
//             }
//           }}
//         >
//           {drawerContent}
//         </Drawer>
//       </Box>

//       {/* Main Content */}
//       <Box
//         component="main"
//         sx={{
//           flexGrow: 1,
//           p: { xs: 2, md: 4 },
//           width: { md: `calc(100% - ${drawerWidth}px)` },
//           mt: { xs: 8, md: 8 }
//         }}
//       >
//         <Container maxWidth="xl">
//           {/* Payment Due Alert */}
//           {isPaymentDue && (
//             <Alert
//               severity="warning"
//               sx={{ mb: 4, borderRadius: 2 }}
//               action={
//                 <Button color="warning" variant="contained" size="small" onClick={() => setPaymentOpen(true)}>
//                   Pay Now
//                 </Button>
//               }
//             >
//               <Typography fontWeight={600}>Monthly fee of Rs. {monthlyFee} is due</Typography>
//             </Alert>
//           )}

//           {/* Free Service Alert */}
//           {isServiceFree && (
//             <Alert
//               severity="success"
//               sx={{ mb: 4, borderRadius: 2 }}
//               icon={<EmojiEvents />}
//             >
//               <Typography fontWeight={600}>
//                 Free Service Active! Valid until {new Date(freeServiceUntil).toLocaleDateString()}
//               </Typography>
//             </Alert>
//           )}

//           {/* Welcome Section */}
//           <Paper sx={{ p: 4, mb: 4, borderRadius: 3, bgcolor: '#0f172a', color: 'white' }}>
//             <Grid container spacing={3} alignItems="center">
//               <Grid item xs={12} md={8}>
//                 <Typography variant="h4" fontWeight="900" gutterBottom>
//                   Welcome back, {user?.name?.split(' ')[0]}!
//                 </Typography>
//                 <Typography variant="body1" sx={{ opacity: 0.9 }} gutterBottom>
//                   Zone: {user?.address?.zone || 'Not assigned'} • Street: {user?.address?.street || 'N/A'}
//                 </Typography>
//                 <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
//                   <Chip
//                     icon={<AccountBalanceWallet />}
//                     label={`${balance} Coins`}
//                     sx={{ bgcolor: '#f59e0b', color: 'white', fontWeight: 700 }}
//                   />
//                   <Chip
//                     icon={<CheckCircle />}
//                     label={isServiceFree ? 'Free Service' : 'Active Member'}
//                     sx={{ bgcolor: isServiceFree ? '#10b981' : '#3b82f6', color: 'white', fontWeight: 700 }}
//                   />
//                 </Stack>
//               </Grid>
//               <Grid item xs={12} md={4}>
//                 <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', p: 3, borderRadius: 2 }}>
//                   <Typography variant="h6" gutterBottom>Quick Stats</Typography>
//                   <Stack direction="row" justifyContent="space-between">
//                     <Box>
//                       <Typography variant="caption" sx={{ opacity: 0.7 }}>Programs</Typography>
//                       <Typography variant="h5" fontWeight="900">{myPrograms.length}</Typography>
//                     </Box>
//                     <Box>
//                       <Typography variant="caption" sx={{ opacity: 0.7 }}>Collections</Typography>
//                       <Typography variant="h5" fontWeight="900">{stats.totalCollections}</Typography>
//                     </Box>
//                     <Box>
//                       <Typography variant="caption" sx={{ opacity: 0.7 }}>Earned</Typography>
//                       <Typography variant="h5" fontWeight="900">{stats.totalEarned}</Typography>
//                     </Box>
//                   </Stack>
//                 </Box>
//               </Grid>
//             </Grid>
//           </Paper>

//           {/* Stats Cards */}
//           <Grid container spacing={3} sx={{ mb: 4 }}>
//             {[
//               { label: 'Active Programs', value: myPrograms.filter(p => p.status === 'approved').length, icon: <VolunteerActivism />, color: '#3b82f6' },
//               { label: 'Pending Approval', value: myPrograms.filter(p => p.status === 'pending').length, icon: <PendingActions />, color: '#f59e0b' },
//               { label: 'Pending Pickups', value: stats.pendingCollections, icon: <LocalShipping />, color: '#8b5cf6' },
//               { label: 'Completed Pickups', value: stats.completedCollections, icon: <CheckCircle />, color: '#10b981' }
//             ].map((stat, i) => (
//               <Grid item xs={6} md={3} key={i}>
//                 <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #e2e8f0', height: '100%' }}>
//                   <Stack direction="row" justifyContent="space-between" alignItems="center">
//                     <Box>
//                       <Typography variant="caption" color="text.secondary" fontWeight={700}>{stat.label}</Typography>
//                       <Typography variant="h4" fontWeight={900} sx={{ color: stat.color }}>{stat.value}</Typography>
//                     </Box>
//                     <Avatar sx={{ bgcolor: `${stat.color}20`, color: stat.color }}>{stat.icon}</Avatar>
//                   </Stack>
//                 </Paper>
//               </Grid>
//             ))}
//           </Grid>

//           {/* Tabs */}
//           <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3, borderBottom: '1px solid #e2e8f0' }}>
//             <Tab label="Available Programs" />
//             <Tab label="My Programs" />
//             <Tab label="Recent Collections" />
//           </Tabs>

//           {/* Available Programs Tab */}
//           {tabValue === 0 && (
//             <Grid container spacing={3}>
//               {programs.filter(p => !p.hasJoined).length === 0 ? (
//                 <Grid item xs={12}>
//                   <Paper sx={{ p: 4, textAlign: 'center' }}>
//                     <Info sx={{ fontSize: 48, color: '#94a3b8', mb: 2 }} />
//                     <Typography>No programs available in your zone</Typography>
//                   </Paper>
//                 </Grid>
//               ) : (
//                 programs.filter(p => !p.hasJoined).map((program) => (
//                   <Grid item xs={12} md={6} lg={4} key={program._id}>
//                     <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
//                       <CardContent sx={{ flexGrow: 1 }}>
//                         <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
//                           <Typography variant="h6" fontWeight={900}>{program.title}</Typography>
//                           <Chip label={program.zone || 'All Zones'} size="small" color="primary" />
//                         </Box>
//                         <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
//                           {program.description?.substring(0, 100)}...
//                         </Typography>
//                         <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
//                           <Chip icon={<EmojiEvents />} label="100 Coins" size="small" color="success" variant="outlined" />
//                           <Chip icon={<LocationOn />} label={program.location || 'TBD'} size="small" variant="outlined" />
//                         </Stack>
//                         <LinearProgress
//                           variant="determinate"
//                           value={(program.currentVolunteers / program.maxVolunteers) * 100}
//                           sx={{ height: 6, borderRadius: 3 }}
//                         />
//                         <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
//                           {program.currentVolunteers}/{program.maxVolunteers} volunteers
//                         </Typography>
//                       </CardContent>
//                       <Box sx={{ p: 2, pt: 0 }}>
//                         <Button
//                           fullWidth
//                           variant="contained"
//                           startIcon={<AddCircle />}
//                           onClick={() => handleJoinProgram(program._id)}
//                         >
//                           Join Program
//                         </Button>
//                       </Box>
//                     </Card>
//                   </Grid>
//                 ))
//               )}
//             </Grid>
//           )}

//           {/* My Programs Tab */}
//           {tabValue === 1 && (
//             <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
//               <Table>
//                 <TableHead sx={{ bgcolor: '#f8fafc' }}>
//                   <TableRow>
//                     <TableCell sx={{ fontWeight: 800 }}>Program</TableCell>
//                     <TableCell sx={{ fontWeight: 800 }}>Organization</TableCell>
//                     <TableCell sx={{ fontWeight: 800 }}>Applied Date</TableCell>
//                     <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
//                     <TableCell sx={{ fontWeight: 800 }}>Reward</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {myPrograms.length === 0 ? (
//                     <TableRow>
//                       <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
//                         <Typography color="text.secondary">You haven't joined any programs yet</Typography>
//                         <Button variant="text" onClick={() => setTabValue(0)} sx={{ mt: 2 }}>
//                           Browse Programs
//                         </Button>
//                       </TableCell>
//                     </TableRow>
//                   ) : (
//                     myPrograms.map((program) => (
//                       <TableRow key={program._id} hover>
//                         <TableCell>
//                           <Typography fontWeight={700}>{program.title}</Typography>
//                           <Typography variant="caption" color="text.secondary">{program.zone}</Typography>
//                         </TableCell>
//                         <TableCell>{program.organization}</TableCell>
//                         <TableCell>{new Date(program.appliedAt).toLocaleDateString()}</TableCell>
//                         <TableCell>
//                           <Chip
//                             label={program.status}
//                             color={getProgramStatusColor(program.status)}
//                             size="small"
//                             sx={{ fontWeight: 700 }}
//                           />
//                         </TableCell>
//                         <TableCell>
//                           {program.status === 'approved' ? (
//                             <Chip icon={<EmojiEvents />} label="+100 Coins" color="success" size="small" />
//                           ) : (
//                             <Typography variant="caption" color="text.secondary">Pending approval</Typography>
//                           )}
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   )}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           )}

//           {/* Recent Collections Tab */}
//           {tabValue === 2 && (
//             <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
//               <Table>
//                 <TableHead sx={{ bgcolor: '#f8fafc' }}>
//                   <TableRow>
//                     <TableCell sx={{ fontWeight: 800 }}>Date</TableCell>
//                     <TableCell sx={{ fontWeight: 800 }}>Waste Type</TableCell>
//                     <TableCell sx={{ fontWeight: 800 }}>Weight</TableCell>
//                     <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
//                     <TableCell sx={{ fontWeight: 800 }}>Collector</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {collections.length === 0 ? (
//                     <TableRow>
//                       <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
//                         <Typography color="text.secondary">No collections yet</Typography>
//                         <Button variant="text" onClick={() => navigate('/request-collection')} sx={{ mt: 2 }}>
//                           Request Pickup
//                         </Button>
//                       </TableCell>
//                     </TableRow>
//                   ) : (
//                     collections.slice(0, 5).map((collection) => (
//                       <TableRow key={collection._id} hover>
//                         <TableCell>{new Date(collection.scheduledDate).toLocaleDateString()}</TableCell>
//                         <TableCell>
//                           <Chip label={collection.wasteType} size="small" variant="outlined" />
//                         </TableCell>
//                         <TableCell>{collection.actualWeight || collection.estimatedWeight || 0} kg</TableCell>
//                         <TableCell>
//                           <Chip
//                             label={collection.status}
//                             color={collection.status === 'Completed' ? 'success' : 'warning'}
//                             size="small"
//                           />
//                         </TableCell>
//                         <TableCell>{collection.collector?.name || 'Not assigned'}</TableCell>
//                       </TableRow>
//                     ))
//                   )}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           )}
//         </Container>
//       </Box>

//       {/* Payment Gateway */}
//       <PaymentGateway
//         open={paymentOpen}
//         onClose={() => setPaymentOpen(false)}
//         amount={monthlyFee}
//         onSuccess={() => {
//           setPaymentOpen(false);
//           window.location.reload();
//         }}
//       />
//     </Box>
//   );
// };

// export default ResidentDashboard;









// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   Box, Container, Grid, Card, CardContent, Typography, Button,
//   LinearProgress, Chip, Stack, Avatar, Alert, Divider,
//   Drawer, List, ListItem, ListItemIcon, ListItemText,
//   AppBar, Toolbar, IconButton, useTheme, useMediaQuery, Paper,
//   Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
//   Tab, Tabs, Badge, Snackbar, CircularProgress, CardActions,
//   Dialog, DialogTitle, DialogContent, DialogActions, TextField,People
// } from '@mui/material';
// import {
//   VolunteerActivism, AccountBalanceWallet,
//   CheckCircle, PendingActions, LocationOn,
//   Dashboard, LocalShipping, Payment, Logout, Menu as MenuIcon,
//   EmojiEvents, History, AddCircle, Notifications as NotificationsIcon,
//   Home, Event, Receipt, Info, Stars, Cancel, Schedule,
//   TrendingUp, Celebration,PeopleAlt as People
// } from '@mui/icons-material';
// import { useAuth } from '../context/AuthContext';
// import { useNotifications } from '../context/NotificationContext';
// import { useCoins } from '../context/CoinContext';
// import { useNavigate } from 'react-router-dom';
// import api from '../services/api';
// import { toast } from 'react-toastify';
// import NotificationBell from '../components/NotificationBell';
// import CoinBalance from '../components/CoinBalance';
// import PaymentGateway from '../components/PaymentGateway';

// const drawerWidth = 280;

// const ResidentDashboard = () => {
//   const { user, logout } = useAuth();
//   const { unreadCount } = useNotifications();
//   const { balance, totalEarned, fetchCoinData, isServiceFree, freeServiceUntil, getProgressToFreeService } = useCoins();
//   const navigate = useNavigate();
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));

//   const [mobileOpen, setMobileOpen] = useState(false);
//   const [programs, setPrograms] = useState([]);
//   const [myPrograms, setMyPrograms] = useState([]);
//   const [collections, setCollections] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [tabValue, setTabValue] = useState(0);
//   const [paymentOpen, setPaymentOpen] = useState(false);
//   const [joinDialog, setJoinDialog] = useState({ open: false, program: null });
//   const [motivation, setMotivation] = useState('');
//   const [joinLoading, setJoinLoading] = useState(false);
//   const [stats, setStats] = useState({
//     totalCollections: 0,
//     pendingCollections: 0,
//     completedCollections: 0,
//     totalEarned: 0,
//     coinsUntilFree: 1000
//   });

//   const monthlyFee = 1000;
//   const isPaymentDue = !user?.monthlyFeePaid && !isServiceFree;
//   const progress = getProgressToFreeService();

//   const fetchDashboardData = useCallback(async () => {
//     try {
//       setLoading(true);
//       const [programsRes, myProgramsRes, collectionsRes, coinsRes] = await Promise.all([
//         api.get('/programs'),
//         api.get('/resident/my-programs'),
//         api.get('/resident/collections'),
//         api.get('/resident/coins').catch(() => ({ data: { balance: 0, totalEarned: 0 } }))
//       ]);

//       setPrograms(programsRes.data.programs || []);
//       setMyPrograms(myProgramsRes.data.programs || []);
//       setCollections(collectionsRes.data.collections || []);

//       // Calculate stats
//       const coll = collectionsRes.data.collections || [];
//       const earnedFromPrograms = myProgramsRes.data.programs?.filter(p => p.volunteerStatus === 'approved').length * 100 || 0;
      
//       setStats({
//         totalCollections: coll.length,
//         pendingCollections: coll.filter(c => c.status === 'Pending').length,
//         completedCollections: coll.filter(c => c.status === 'Completed').length,
//         totalEarned: coinsRes.data.totalEarned || earnedFromPrograms,
//         coinsUntilFree: Math.max(0, 1000 - (coinsRes.data.totalEarned || 0))
//       });

//     } catch (error) {
//       console.error('Failed to load dashboard data:', error);
//       toast.error('Failed to load dashboard data');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchDashboardData();
//   }, [fetchDashboardData]);

//   const handleJoinProgram = async () => {
//     if (!motivation.trim()) {
//       toast.warning('Please tell us why you want to join');
//       return;
//     }

//     try {
//       setJoinLoading(true);
//       await api.post(`/programs/${joinDialog.program._id}/join`, { motivation });
//       toast.success('Application submitted! Waiting for admin approval.');
//       setJoinDialog({ open: false, program: null });
//       setMotivation('');
//       fetchDashboardData();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to join program');
//     } finally {
//       setJoinLoading(false);
//     }
//   };

//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };

//   const getProgramStatusColor = (status) => {
//     switch (status) {
//       case 'approved': return 'success';
//       case 'pending': return 'warning';
//       case 'rejected': return 'error';
//       default: return 'default';
//     }
//   };

//   const getProgramStatusIcon = (status) => {
//     switch (status) {
//       case 'approved': return <CheckCircle />;
//       case 'pending': return <Schedule />;
//       case 'rejected': return <Cancel />;
//       default: return <Info />;
//     }
//   };

//   const menuItems = [
//     { label: 'Dashboard', icon: <Dashboard />, path: '/resident/dashboard' },
//     { label: 'Programs', icon: <VolunteerActivism />, path: '/resident/programs' },
//     { label: 'Request Pickup', icon: <LocalShipping />, path: '/request-collection' },
//     { label: 'My Collections', icon: <History />, path: '/my-collections' },
//     { label: 'Payments', icon: <Payment />, path: '/payments' },
//     { label: 'Notifications', icon: <NotificationsIcon />, path: '/notifications', badge: unreadCount }
//   ];

//   const drawerContent = (
//     <Box sx={{ height: '100%', bgcolor: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column' }}>
//       <Toolbar sx={{ px: 3, py: 3 }}>
//         <Stack direction="row" spacing={1.5} alignItems="center">
//           <Avatar sx={{ bgcolor: '#10b981', width: 48, height: 48 }}><Home /></Avatar>
//           <Box>
//             <Typography variant="h6" fontWeight="900" sx={{ lineHeight: 1 }}>ECO-HOME</Typography>
//             <Typography variant="caption" color="#94a3b8">Resident Portal</Typography>
//           </Box>
//         </Stack>
//       </Toolbar>
//       <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

//       <List sx={{ px: 2, mt: 3, flexGrow: 1 }}>
//         {menuItems.map((item, index) => (
//           <ListItem
//             button
//             key={index}
//             onClick={() => {
//               navigate(item.path);
//               if (isMobile) setMobileOpen(false);
//             }}
//             sx={{
//               mb: 1.5,
//               borderRadius: 2,
//               bgcolor: window.location.pathname === item.path ? '#1e293b' : 'transparent',
//               '&:hover': { bgcolor: '#1e293b' }
//             }}
//           >
//             <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>{item.icon}</ListItemIcon>
//             <ListItemText primary={<Typography>{item.label}</Typography>} />
//             {item.badge > 0 && (
//               <Chip label={item.badge} size="small" sx={{ bgcolor: '#ef4444', color: 'white', fontWeight: 800 }} />
//             )}
//           </ListItem>
//         ))}
//       </List>

//       <Box sx={{ p: 2 }}>
//         <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 2 }} />
//         <Button
//           fullWidth
//           variant="text"
//           color="error"
//           startIcon={<Logout />}
//           onClick={handleLogout}
//           sx={{ fontWeight: 700, justifyContent: 'flex-start', px: 2, color: '#94a3b8' }}
//         >
//           Sign Out
//         </Button>
//       </Box>
//     </Box>
//   );

//   if (loading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
//       {/* Mobile App Bar */}
//       <AppBar
//         position="fixed"
//         sx={{
//           width: { md: `calc(100% - ${drawerWidth}px)` },
//           ml: { md: `${drawerWidth}px` },
//           bgcolor: 'white',
//           color: 'text.primary',
//           display: { md: 'none' },
//           boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
//         }}
//       >
//         <Toolbar>
//           <IconButton edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2 }}>
//             <MenuIcon />
//           </IconButton>
//           <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
//             Resident Portal
//           </Typography>
//           <NotificationBell />
//           <CoinBalance />
//         </Toolbar>
//       </AppBar>

//       {/* Desktop Header */}
//       <Box
//         sx={{
//           width: { md: `calc(100% - ${drawerWidth}px)` },
//           ml: { md: `${drawerWidth}px` },
//           position: 'fixed',
//           top: 0,
//           right: 0,
//           bgcolor: 'white',
//           borderBottom: '1px solid #e2e8f0',
//           zIndex: 1100,
//           display: { xs: 'none', md: 'block' }
//         }}
//       >
//         <Toolbar sx={{ justifyContent: 'flex-end', gap: 2 }}>
//           <CoinBalance />
//           <NotificationBell />
//           <Avatar sx={{ bgcolor: '#10b981' }}>{user?.name?.[0]}</Avatar>
//         </Toolbar>
//       </Box>

//       {/* Sidebar */}
//       <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
//         <Drawer
//           variant={isMobile ? "temporary" : "permanent"}
//           open={isMobile ? mobileOpen : true}
//           onClose={() => setMobileOpen(false)}
//           sx={{
//             '& .MuiDrawer-paper': {
//               width: drawerWidth,
//               border: 'none',
//               bgcolor: '#0f172a'
//             }
//           }}
//         >
//           {drawerContent}
//         </Drawer>
//       </Box>

//       {/* Main Content */}
//       <Box
//         component="main"
//         sx={{
//           flexGrow: 1,
//           p: { xs: 2, md: 4 },
//           width: { md: `calc(100% - ${drawerWidth}px)` },
//           mt: { xs: 8, md: 8 }
//         }}
//       >
//         <Container maxWidth="xl">
//           {/* Payment Due Alert */}
//           {isPaymentDue && (
//             <Alert
//               severity="warning"
//               sx={{ mb: 4, borderRadius: 2 }}
//               action={
//                 <Button color="warning" variant="contained" size="small" onClick={() => setPaymentOpen(true)}>
//                   Pay Now
//                 </Button>
//               }
//             >
//               <Typography fontWeight={600}>Monthly fee of Rs. {monthlyFee} is due</Typography>
//             </Alert>
//           )}

//           {/* Free Service Alert */}
//           {isServiceFree && (
//             <Alert
//               severity="success"
//               sx={{ mb: 4, borderRadius: 2 }}
//               icon={<Celebration />}
//             >
//               <Typography fontWeight={600}>
//                 🎉 Congratulations! You have unlocked FREE service until {new Date(freeServiceUntil).toLocaleDateString()}
//               </Typography>
//             </Alert>
//           )}

//           {/* Welcome Section */}
//           <Paper sx={{ p: 4, mb: 4, borderRadius: 3, bgcolor: '#0f172a', color: 'white' }}>
//             <Grid container spacing={3} alignItems="center">
//               <Grid item xs={12} md={8}>
//                 <Typography variant="h4" fontWeight="900" gutterBottom>
//                   Welcome back, {user?.name?.split(' ')[0]}!
//                 </Typography>
//                 <Typography variant="body1" sx={{ opacity: 0.9 }} gutterBottom>
//                   Zone: {user?.address?.zone || 'Not assigned'} • Street: {user?.address?.street || 'N/A'}
//                 </Typography>
//                 <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
//                   <Chip
//                     icon={<AccountBalanceWallet />}
//                     label={`${balance} Coins`}
//                     sx={{ bgcolor: '#f59e0b', color: 'white', fontWeight: 700 }}
//                   />
//                   <Chip
//                     icon={<EmojiEvents />}
//                     label={`${totalEarned} Total Earned`}
//                     sx={{ bgcolor: '#10b981', color: 'white', fontWeight: 700 }}
//                   />
//                   <Chip
//                     icon={<CheckCircle />}
//                     label={isServiceFree ? 'Free Service Active' : 'Active Member'}
//                     sx={{ bgcolor: isServiceFree ? '#10b981' : '#3b82f6', color: 'white', fontWeight: 700 }}
//                   />
//                 </Stack>
//               </Grid>
//               <Grid item xs={12} md={4}>
//                 <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', p: 3, borderRadius: 2 }}>
//                   <Typography variant="h6" gutterBottom>Quick Stats</Typography>
//                   <Stack direction="row" justifyContent="space-between">
//                     <Box>
//                       <Typography variant="caption" sx={{ opacity: 0.7 }}>Programs</Typography>
//                       <Typography variant="h5" fontWeight="900">{myPrograms.length}</Typography>
//                     </Box>
//                     <Box>
//                       <Typography variant="caption" sx={{ opacity: 0.7 }}>Collections</Typography>
//                       <Typography variant="h5" fontWeight="900">{stats.totalCollections}</Typography>
//                     </Box>
//                     <Box>
//                       <Typography variant="caption" sx={{ opacity: 0.7 }}>Earned</Typography>
//                       <Typography variant="h5" fontWeight="900">{stats.totalEarned}</Typography>
//                     </Box>
//                   </Stack>
//                 </Box>
//               </Grid>
//             </Grid>
//           </Paper>

//           {/* Coin Progress Card */}
//           <Paper sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid #e2e8f0' }}>
//             <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
//               <Box display="flex" alignItems="center" gap={1}>
//                 <Stars sx={{ color: '#f59e0b' }} />
//                 <Typography variant="h6" fontWeight={700}>Free Service Progress</Typography>
//               </Box>
//               <Typography variant="h6" fontWeight={900} color={progress.canRedeem ? 'success.main' : 'text.primary'}>
//                 {progress.earned}/1000 coins
//               </Typography>
//             </Stack>
            
//             <LinearProgress
//               variant="determinate"
//               value={progress.percentage}
//               sx={{ height: 10, borderRadius: 5, mb: 2 }}
//               color={progress.canRedeem ? 'success' : 'primary'}
//             />
            
//             <Stack direction="row" justifyContent="space-between" alignItems="center">
//               <Typography variant="body2" color="text.secondary">
//                 Earn 100 coins for each approved volunteer program
//               </Typography>
//               {progress.canRedeem && (
//                 <Button
//                   variant="contained"
//                   color="success"
//                   size="small"
//                   onClick={() => navigate('/payments/redeem')}
//                   startIcon={<Celebration />}
//                 >
//                   Redeem Free Month
//                 </Button>
//               )}
//             </Stack>
//           </Paper>

//           {/* Stats Cards */}
//           <Grid container spacing={3} sx={{ mb: 4 }}>
//             {[
//               { 
//                 label: 'Approved Programs', 
//                 value: myPrograms.filter(p => p.volunteerStatus === 'approved').length, 
//                 icon: <CheckCircle />, 
//                 color: '#10b981' 
//               },
//               { 
//                 label: 'Pending Approval', 
//                 value: myPrograms.filter(p => p.volunteerStatus === 'pending').length, 
//                 icon: <Schedule />, 
//                 color: '#f59e0b' 
//               },
//               { 
//                 label: 'Pending Pickups', 
//                 value: stats.pendingCollections, 
//                 icon: <LocalShipping />, 
//                 color: '#3b82f6' 
//               },
//               { 
//                 label: 'Completed Pickups', 
//                 value: stats.completedCollections, 
//                 icon: <CheckCircle />, 
//                 color: '#8b5cf6' 
//               }
//             ].map((stat, i) => (
//               <Grid item xs={6} md={3} key={i}>
//                 <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #e2e8f0', height: '100%' }}>
//                   <Stack direction="row" justifyContent="space-between" alignItems="center">
//                     <Box>
//                       <Typography variant="caption" color="text.secondary" fontWeight={700}>{stat.label}</Typography>
//                       <Typography variant="h4" fontWeight={900} sx={{ color: stat.color }}>{stat.value}</Typography>
//                     </Box>
//                     <Avatar sx={{ bgcolor: `${stat.color}20`, color: stat.color }}>{stat.icon}</Avatar>
//                   </Stack>
//                 </Paper>
//               </Grid>
//             ))}
//           </Grid>

//           {/* Tabs */}
//           <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3, borderBottom: '1px solid #e2e8f0' }}>
//             <Tab label="Available Programs" />
//             <Tab label="My Programs" />
//             <Tab label="Recent Collections" />
//           </Tabs>

//           {/* Available Programs Tab */}
//           {tabValue === 0 && (
//             <Grid container spacing={3}>
//               {programs.filter(p => !p.hasJoined).length === 0 ? (
//                 <Grid item xs={12}>
//                   <Paper sx={{ p: 6, textAlign: 'center' }}>
//                     <Info sx={{ fontSize: 60, color: '#94a3b8', mb: 2 }} />
//                     <Typography variant="h6" color="text.secondary" gutterBottom>
//                       No programs available in your zone
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary">
//                       Check back later for new volunteer opportunities
//                     </Typography>
//                   </Paper>
//                 </Grid>
//               ) : (
//                 programs.filter(p => !p.hasJoined).map((program) => (
//                   <Grid item xs={12} md={6} lg={4} key={program._id}>
//                     <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
//                       <CardContent sx={{ flexGrow: 1 }}>
//                         <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
//                           <Typography variant="h6" fontWeight={900}>{program.title}</Typography>
//                           <Chip label={program.zone || 'All Zones'} size="small" color="primary" />
//                         </Box>
//                         <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 60, overflow: 'hidden' }}>
//                           {program.description}
//                         </Typography>
                        
//                         <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
//                           <Chip 
//                             icon={<EmojiEvents />} 
//                             label={`${program.rewardCoins || 100} Coins`} 
//                             size="small" 
//                             color="success" 
//                             variant="outlined" 
//                           />
//                           <Chip 
//                             icon={<LocationOn />} 
//                             label={program.location || 'TBD'} 
//                             size="small" 
//                             variant="outlined" 
//                           />
//                         </Stack>

//                         <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
//                           <Chip 
//                             icon={<Event />} 
//                             label={program.startDate ? new Date(program.startDate).toLocaleDateString() : 'TBD'} 
//                             size="small" 
//                             variant="outlined" 
//                           />
//                           <Chip 
//                             icon={<People />} 
//                             label={`${program.currentVolunteers || 0}/${program.maxVolunteers || 20}`} 
//                             size="small" 
//                             variant="outlined" 
//                           />
//                         </Stack>

//                         <LinearProgress
//                           variant="determinate"
//                           value={((program.currentVolunteers || 0) / (program.maxVolunteers || 20)) * 100}
//                           sx={{ height: 6, borderRadius: 3, mb: 1 }}
//                         />
//                         <Typography variant="caption" color="text.secondary">
//                           {program.currentVolunteers || 0} volunteers joined
//                         </Typography>
//                       </CardContent>
//                       <Box sx={{ p: 2, pt: 0 }}>
//                         <Button
//                           fullWidth
//                           variant="contained"
//                           startIcon={<AddCircle />}
//                           onClick={() => setJoinDialog({ open: true, program })}
//                           disabled={program.currentVolunteers >= program.maxVolunteers}
//                         >
//                           {program.currentVolunteers >= program.maxVolunteers ? 'Program Full' : 'Join Program'}
//                         </Button>
//                       </Box>
//                     </Card>
//                   </Grid>
//                 ))
//               )}
//             </Grid>
//           )}

//           {/* My Programs Tab */}
//           {tabValue === 1 && (
//             <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
//               <Table>
//                 <TableHead sx={{ bgcolor: '#f8fafc' }}>
//                   <TableRow>
//                     <TableCell sx={{ fontWeight: 800 }}>Program</TableCell>
//                     <TableCell sx={{ fontWeight: 800 }}>Organization</TableCell>
//                     <TableCell sx={{ fontWeight: 800 }}>Applied Date</TableCell>
//                     <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
//                     <TableCell sx={{ fontWeight: 800 }}>Reward</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {myPrograms.length === 0 ? (
//                     <TableRow>
//                       <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
//                         <Typography color="text.secondary" gutterBottom>
//                           You haven't joined any programs yet
//                         </Typography>
//                         <Button variant="text" onClick={() => setTabValue(0)}>
//                           Browse Available Programs
//                         </Button>
//                       </TableCell>
//                     </TableRow>
//                   ) : (
//                     myPrograms.map((program) => (
//                       <TableRow key={program._id} hover>
//                         <TableCell>
//                           <Typography fontWeight={700}>{program.title}</Typography>
//                           <Typography variant="caption" color="text.secondary">{program.zone}</Typography>
//                         </TableCell>
//                         <TableCell>{program.organization}</TableCell>
//                         <TableCell>{new Date(program.appliedAt).toLocaleDateString()}</TableCell>
//                         <TableCell>
//                           <Chip
//                             icon={getProgramStatusIcon(program.volunteerStatus)}
//                             label={program.volunteerStatus?.toUpperCase()}
//                             color={getProgramStatusColor(program.volunteerStatus)}
//                             size="small"
//                             sx={{ fontWeight: 700 }}
//                           />
//                         </TableCell>
//                         <TableCell>
//                           {program.volunteerStatus === 'approved' ? (
//                             <Chip 
//                               icon={<EmojiEvents />} 
//                               label={`+${program.rewardCoins || 100} Coins`} 
//                               color="success" 
//                               size="small" 
//                             />
//                           ) : program.volunteerStatus === 'pending' ? (
//                             <Typography variant="caption" color="text.secondary">
//                               Pending approval
//                             </Typography>
//                           ) : (
//                             <Typography variant="caption" color="error">
//                               Not approved
//                             </Typography>
//                           )}
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   )}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           )}

//           {/* Recent Collections Tab */}
//           {tabValue === 2 && (
//             <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
//               <Table>
//                 <TableHead sx={{ bgcolor: '#f8fafc' }}>
//                   <TableRow>
//                     <TableCell sx={{ fontWeight: 800 }}>Date</TableCell>
//                     <TableCell sx={{ fontWeight: 800 }}>Waste Type</TableCell>
//                     <TableCell sx={{ fontWeight: 800 }}>Weight</TableCell>
//                     <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
//                     <TableCell sx={{ fontWeight: 800 }}>Collector</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {collections.length === 0 ? (
//                     <TableRow>
//                       <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
//                         <Typography color="text.secondary" gutterBottom>
//                           No collections yet
//                         </Typography>
//                         <Button variant="text" onClick={() => navigate('/request-collection')}>
//                           Request Pickup
//                         </Button>
//                       </TableCell>
//                     </TableRow>
//                   ) : (
//                     collections.slice(0, 10).map((collection) => (
//                       <TableRow key={collection._id} hover>
//                         <TableCell>{new Date(collection.scheduledDate).toLocaleDateString()}</TableCell>
//                         <TableCell>
//                           <Chip label={collection.wasteType} size="small" variant="outlined" />
//                         </TableCell>
//                         <TableCell>{collection.actualWeight || collection.estimatedWeight || 0} kg</TableCell>
//                         <TableCell>
//                           <Chip
//                             label={collection.status}
//                             color={collection.status === 'Completed' ? 'success' : 'warning'}
//                             size="small"
//                           />
//                         </TableCell>
//                         <TableCell>{collection.collector?.name || 'Not assigned'}</TableCell>
//                       </TableRow>
//                     ))
//                   )}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           )}
//         </Container>
//       </Box>

//       {/* Join Program Dialog */}
//       <Dialog
//         open={joinDialog.open}
//         onClose={() => setJoinDialog({ open: false, program: null })}
//         maxWidth="sm"
//         fullWidth
//         PaperProps={{ sx: { borderRadius: 3 } }}
//       >
//         <DialogTitle sx={{ fontWeight: 900 }}>
//           Join {joinDialog.program?.title}
//         </DialogTitle>
//         <DialogContent>
//           <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 2 }}>
//             Please tell us why you'd like to join this program. Your application will be reviewed by the admin.
//           </Typography>
//           <TextField
//             fullWidth
//             label="Why do you want to join?"
//             multiline
//             rows={4}
//             value={motivation}
//             onChange={(e) => setMotivation(e.target.value)}
//             placeholder="I want to help clean up my community and earn coins..."
//             required
//           />
//           <Box sx={{ mt: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
//             <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={1}>
//               <EmojiEvents fontSize="inherit" color="success" />
//               You will earn {joinDialog.program?.rewardCoins || 100} coins if approved
//             </Typography>
//           </Box>
//         </DialogContent>
//         <DialogActions sx={{ p: 3 }}>
//           <Button onClick={() => setJoinDialog({ open: false, program: null })}>
//             Cancel
//           </Button>
//           <Button
//             variant="contained"
//             onClick={handleJoinProgram}
//             disabled={!motivation.trim() || joinLoading}
//           >
//             {joinLoading ? <CircularProgress size={24} /> : 'Submit Application'}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Payment Gateway */}
//       <PaymentGateway
//         open={paymentOpen}
//         onClose={() => setPaymentOpen(false)}
//         amount={monthlyFee}
//         onSuccess={() => {
//           setPaymentOpen(false);
//           window.location.reload();
//         }}
//       />
//     </Box>
//   );
// };

// export default ResidentDashboard;


// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   Box, Container, Grid, Card, CardContent, Typography, Button,
//   LinearProgress, Chip, Stack, Avatar, Alert, Divider,
//   Drawer, List, ListItem, ListItemIcon, ListItemText,
//   AppBar, Toolbar, IconButton, useTheme, useMediaQuery, Paper,
//   Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
//   Tab, Tabs, Badge, Snackbar, CircularProgress, CardActions,
//   Dialog, DialogTitle, DialogContent, DialogActions, TextField
//   // ✅ REMOVED: People was incorrectly placed here (it's an icon, not an MUI component)
// } from '@mui/material';
// import {
//   VolunteerActivism, AccountBalanceWallet,
//   CheckCircle, PendingActions, LocationOn,
//   Dashboard, LocalShipping, Payment, Logout, Menu as MenuIcon,
//   EmojiEvents, History, AddCircle, Notifications as NotificationsIcon,
//   Home, Event, Receipt, Info, Stars, Cancel, Schedule,
//   TrendingUp, Celebration,
//   PeopleAlt as People   // ✅ correct: alias PeopleAlt as People (single declaration)
// } from '@mui/icons-material';
// import { useAuth } from '../context/AuthContext';
// import { useNotifications } from '../context/NotificationContext';
// import { useCoins } from '../context/CoinContext';
// import { useNavigate } from 'react-router-dom';
// import api from '../services/api';
// import { toast } from 'react-toastify';
// import NotificationBell from '../components/NotificationBell';
// import CoinBalance from '../components/CoinBalance';
// import PaymentGateway from '../components/PaymentGateway';

// const drawerWidth = 280;

// const ResidentDashboard = () => {
//   const { user, logout } = useAuth();
//   const { unreadCount } = useNotifications();
//   const { balance, totalEarned, fetchCoinData, isServiceFree, freeServiceUntil, getProgressToFreeService } = useCoins();
//   const navigate = useNavigate();
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));

//   const [mobileOpen, setMobileOpen] = useState(false);
//   const [programs, setPrograms] = useState([]);
//   const [myPrograms, setMyPrograms] = useState([]);
//   const [collections, setCollections] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [tabValue, setTabValue] = useState(0);
//   const [paymentOpen, setPaymentOpen] = useState(false);
//   const [joinDialog, setJoinDialog] = useState({ open: false, program: null });
//   const [motivation, setMotivation] = useState('');
//   const [joinLoading, setJoinLoading] = useState(false);
//   const [stats, setStats] = useState({
//     totalCollections: 0,
//     pendingCollections: 0,
//     completedCollections: 0,
//     totalEarned: 0,
//     coinsUntilFree: 1000
//   });

//   const monthlyFee = 1000;
//   const isPaymentDue = !user?.monthlyFeePaid && !isServiceFree;
//   const progress = getProgressToFreeService();

//   const fetchDashboardData = useCallback(async () => {
//     try {
//       setLoading(true);
//       const [programsRes, myProgramsRes, collectionsRes, coinsRes] = await Promise.all([
//         api.get('/programs'),
//         api.get('/resident/my-programs'),
//         api.get('/resident/collections'),
//         api.get('/resident/coins').catch(() => ({ data: { balance: 0, totalEarned: 0 } }))
//       ]);

//       setPrograms(programsRes.data.programs || []);
//       setMyPrograms(myProgramsRes.data.programs || []);
//       setCollections(collectionsRes.data.collections || []);

//       const coll = collectionsRes.data.collections || [];
//       const earnedFromPrograms = myProgramsRes.data.programs?.filter(p => p.volunteerStatus === 'approved').length * 100 || 0;

//       setStats({
//         totalCollections: coll.length,
//         pendingCollections: coll.filter(c => c.status === 'Pending').length,
//         completedCollections: coll.filter(c => c.status === 'Completed').length,
//         totalEarned: coinsRes.data.totalEarned || earnedFromPrograms,
//         coinsUntilFree: Math.max(0, 1000 - (coinsRes.data.totalEarned || 0))
//       });

//     } catch (error) {
//       console.error('Failed to load dashboard data:', error);
//       toast.error('Failed to load dashboard data');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchDashboardData();
//   }, [fetchDashboardData]);

//   const handleJoinProgram = async () => {
//     if (!motivation.trim()) {
//       toast.warning('Please tell us why you want to join');
//       return;
//     }
//     try {
//       setJoinLoading(true);
//       await api.post(`/programs/${joinDialog.program._id}/join`, { motivation });
//       toast.success('Application submitted! Waiting for admin approval.');
//       setJoinDialog({ open: false, program: null });
//       setMotivation('');
//       fetchDashboardData();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to join program');
//     } finally {
//       setJoinLoading(false);
//     }
//   };

//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };

//   const getProgramStatusColor = (status) => {
//     switch (status) {
//       case 'approved': return 'success';
//       case 'pending':  return 'warning';
//       case 'rejected': return 'error';
//       default:         return 'default';
//     }
//   };

//   const getProgramStatusIcon = (status) => {
//     switch (status) {
//       case 'approved': return <CheckCircle />;
//       case 'pending':  return <Schedule />;
//       case 'rejected': return <Cancel />;
//       default:         return <Info />;
//     }
//   };

//   const menuItems = [
//     { label: 'Dashboard',      icon: <Dashboard />,        path: '/resident/dashboard' },
//     { label: 'Programs',       icon: <VolunteerActivism />, path: '/resident/programs' },
//     { label: 'Request Pickup', icon: <LocalShipping />,    path: '/request-collection' },
//     { label: 'My Collections', icon: <History />,          path: '/my-collections' },
//     { label: 'Payments',       icon: <Payment />,          path: '/payments' },
//     { label: 'Notifications',  icon: <NotificationsIcon />, path: '/notifications', badge: unreadCount }
//   ];

//   const drawerContent = (
//     <Box sx={{ height: '100%', bgcolor: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column' }}>
//       <Toolbar sx={{ px: 3, py: 3 }}>
//         <Stack direction="row" spacing={1.5} alignItems="center">
//           <Avatar sx={{ bgcolor: '#10b981', width: 48, height: 48 }}><Home /></Avatar>
//           <Box>
//             <Typography variant="h6" fontWeight="900" sx={{ lineHeight: 1 }}>ECO-HOME</Typography>
//             <Typography variant="caption" color="#94a3b8">Resident Portal</Typography>
//           </Box>
//         </Stack>
//       </Toolbar>
//       <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

//       <List sx={{ px: 2, mt: 3, flexGrow: 1 }}>
//         {menuItems.map((item, index) => (
//           <ListItem
//             button
//             key={index}
//             onClick={() => {
//               navigate(item.path);
//               if (isMobile) setMobileOpen(false);
//             }}
//             sx={{
//               mb: 1.5, borderRadius: 2,
//               bgcolor: window.location.pathname === item.path ? '#1e293b' : 'transparent',
//               '&:hover': { bgcolor: '#1e293b' }
//             }}
//           >
//             <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>{item.icon}</ListItemIcon>
//             <ListItemText primary={<Typography>{item.label}</Typography>} />
//             {item.badge > 0 && (
//               <Chip label={item.badge} size="small" sx={{ bgcolor: '#ef4444', color: 'white', fontWeight: 800 }} />
//             )}
//           </ListItem>
//         ))}
//       </List>

//       <Box sx={{ p: 2 }}>
//         <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 2 }} />
//         <Button
//           fullWidth variant="text" color="error" startIcon={<Logout />}
//           onClick={handleLogout}
//           sx={{ fontWeight: 700, justifyContent: 'flex-start', px: 2, color: '#94a3b8' }}
//         >
//           Sign Out
//         </Button>
//       </Box>
//     </Box>
//   );

//   if (loading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>

//       {/* Mobile App Bar */}
//       <AppBar
//         position="fixed"
//         sx={{
//           width: { md: `calc(100% - ${drawerWidth}px)` },
//           ml: { md: `${drawerWidth}px` },
//           bgcolor: 'white', color: 'text.primary',
//           display: { md: 'none' },
//           boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
//         }}
//       >
//         <Toolbar>
//           <IconButton edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2 }}>
//             <MenuIcon />
//           </IconButton>
//           <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>Resident Portal</Typography>
//           <NotificationBell />
//           <CoinBalance />
//         </Toolbar>
//       </AppBar>

//       {/* Desktop Header */}
//       <Box sx={{
//         width: { md: `calc(100% - ${drawerWidth}px)` },
//         ml: { md: `${drawerWidth}px` },
//         position: 'fixed', top: 0, right: 0,
//         bgcolor: 'white', borderBottom: '1px solid #e2e8f0',
//         zIndex: 1100, display: { xs: 'none', md: 'block' }
//       }}>
//         <Toolbar sx={{ justifyContent: 'flex-end', gap: 2 }}>
//           <CoinBalance />
//           <NotificationBell />
//           <Avatar sx={{ bgcolor: '#10b981' }}>{user?.name?.[0]}</Avatar>
//         </Toolbar>
//       </Box>

//       {/* Sidebar */}
//       <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
//         <Drawer
//           variant={isMobile ? 'temporary' : 'permanent'}
//           open={isMobile ? mobileOpen : true}
//           onClose={() => setMobileOpen(false)}
//           sx={{ '& .MuiDrawer-paper': { width: drawerWidth, border: 'none', bgcolor: '#0f172a' } }}
//         >
//           {drawerContent}
//         </Drawer>
//       </Box>

//       {/* Main Content */}
//       <Box
//         component="main"
//         sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, width: { md: `calc(100% - ${drawerWidth}px)` }, mt: { xs: 8, md: 8 } }}
//       >
//         <Container maxWidth="xl">

//           {/* Payment Due Alert */}
//           {isPaymentDue && (
//             <Alert
//               severity="warning" sx={{ mb: 4, borderRadius: 2 }}
//               action={<Button color="warning" variant="contained" size="small" onClick={() => setPaymentOpen(true)}>Pay Now</Button>}
//             >
//               <Typography fontWeight={600}>Monthly fee of Rs. {monthlyFee} is due</Typography>
//             </Alert>
//           )}

//           {/* Free Service Alert */}
//           {isServiceFree && (
//             <Alert severity="success" sx={{ mb: 4, borderRadius: 2 }} icon={<Celebration />}>
//               <Typography fontWeight={600}>
//                 🎉 Congratulations! You have unlocked FREE service until {new Date(freeServiceUntil).toLocaleDateString()}
//               </Typography>
//             </Alert>
//           )}

//           {/* Welcome Section */}
//           <Paper sx={{ p: 4, mb: 4, borderRadius: 3, bgcolor: '#0f172a', color: 'white' }}>
//             <Grid container spacing={3} alignItems="center">
//               <Grid item xs={12} md={8}>
//                 <Typography variant="h4" fontWeight="900" gutterBottom>
//                   Welcome back, {user?.name?.split(' ')[0]}!
//                 </Typography>
//                 <Typography variant="body1" sx={{ opacity: 0.9 }} gutterBottom>
//                   Zone: {user?.address?.zone || 'Not assigned'} • Street: {user?.address?.street || 'N/A'}
//                 </Typography>
//                 <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
//                   <Chip icon={<AccountBalanceWallet />} label={`${balance} Coins`}
//                     sx={{ bgcolor: '#f59e0b', color: 'white', fontWeight: 700 }} />
//                   <Chip icon={<EmojiEvents />} label={`${totalEarned} Total Earned`}
//                     sx={{ bgcolor: '#10b981', color: 'white', fontWeight: 700 }} />
//                   <Chip icon={<CheckCircle />} label={isServiceFree ? 'Free Service Active' : 'Active Member'}
//                     sx={{ bgcolor: isServiceFree ? '#10b981' : '#3b82f6', color: 'white', fontWeight: 700 }} />
//                 </Stack>
//               </Grid>
//               <Grid item xs={12} md={4}>
//                 <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', p: 3, borderRadius: 2 }}>
//                   <Typography variant="h6" gutterBottom>Quick Stats</Typography>
//                   <Stack direction="row" justifyContent="space-between">
//                     <Box>
//                       <Typography variant="caption" sx={{ opacity: 0.7 }}>Programs</Typography>
//                       <Typography variant="h5" fontWeight="900">{myPrograms.length}</Typography>
//                     </Box>
//                     <Box>
//                       <Typography variant="caption" sx={{ opacity: 0.7 }}>Collections</Typography>
//                       <Typography variant="h5" fontWeight="900">{stats.totalCollections}</Typography>
//                     </Box>
//                     <Box>
//                       <Typography variant="caption" sx={{ opacity: 0.7 }}>Earned</Typography>
//                       <Typography variant="h5" fontWeight="900">{stats.totalEarned}</Typography>
//                     </Box>
//                   </Stack>
//                 </Box>
//               </Grid>
//             </Grid>
//           </Paper>

//           {/* Coin Progress */}
//           <Paper sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid #e2e8f0' }}>
//             <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
//               <Box display="flex" alignItems="center" gap={1}>
//                 <Stars sx={{ color: '#f59e0b' }} />
//                 <Typography variant="h6" fontWeight={700}>Free Service Progress</Typography>
//               </Box>
//               <Typography variant="h6" fontWeight={900} color={progress.canRedeem ? 'success.main' : 'text.primary'}>
//                 {progress.earned}/1000 coins
//               </Typography>
//             </Stack>
//             <LinearProgress
//               variant="determinate" value={progress.percentage}
//               sx={{ height: 10, borderRadius: 5, mb: 2 }}
//               color={progress.canRedeem ? 'success' : 'primary'}
//             />
//             <Stack direction="row" justifyContent="space-between" alignItems="center">
//               <Typography variant="body2" color="text.secondary">
//                 Earn 100 coins for each approved volunteer program
//               </Typography>
//               {progress.canRedeem && (
//                 <Button variant="contained" color="success" size="small"
//                   onClick={() => navigate('/payments/redeem')} startIcon={<Celebration />}>
//                   Redeem Free Month
//                 </Button>
//               )}
//             </Stack>
//           </Paper>

//           {/* Stats Cards */}
//           <Grid container spacing={3} sx={{ mb: 4 }}>
//             {[
//               { label: 'Approved Programs',  value: myPrograms.filter(p => p.volunteerStatus === 'approved').length, icon: <CheckCircle />, color: '#10b981' },
//               { label: 'Pending Approval',   value: myPrograms.filter(p => p.volunteerStatus === 'pending').length,  icon: <Schedule />,    color: '#f59e0b' },
//               { label: 'Pending Pickups',    value: stats.pendingCollections,                                         icon: <LocalShipping />,color: '#3b82f6' },
//               { label: 'Completed Pickups',  value: stats.completedCollections,                                       icon: <CheckCircle />, color: '#8b5cf6' }
//             ].map((stat, i) => (
//               <Grid item xs={6} md={3} key={i}>
//                 <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #e2e8f0', height: '100%' }}>
//                   <Stack direction="row" justifyContent="space-between" alignItems="center">
//                     <Box>
//                       <Typography variant="caption" color="text.secondary" fontWeight={700}>{stat.label}</Typography>
//                       <Typography variant="h4" fontWeight={900} sx={{ color: stat.color }}>{stat.value}</Typography>
//                     </Box>
//                     <Avatar sx={{ bgcolor: `${stat.color}20`, color: stat.color }}>{stat.icon}</Avatar>
//                   </Stack>
//                 </Paper>
//               </Grid>
//             ))}
//           </Grid>

//           {/* Tabs */}
//           <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3, borderBottom: '1px solid #e2e8f0' }}>
//             <Tab label="Available Programs" />
//             <Tab label="My Programs" />
//             <Tab label="Recent Collections" />
//           </Tabs>

//           {/* Tab 0 — Available Programs */}
//           {tabValue === 0 && (
//             <Grid container spacing={3}>
//               {programs.filter(p => !p.hasJoined).length === 0 ? (
//                 <Grid item xs={12}>
//                   <Paper sx={{ p: 6, textAlign: 'center' }}>
//                     <Info sx={{ fontSize: 60, color: '#94a3b8', mb: 2 }} />
//                     <Typography variant="h6" color="text.secondary" gutterBottom>
//                       No programs available in your zone
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary">
//                       Check back later for new volunteer opportunities
//                     </Typography>
//                   </Paper>
//                 </Grid>
//               ) : (
//                 programs.filter(p => !p.hasJoined).map((program) => (
//                   <Grid item xs={12} md={6} lg={4} key={program._id}>
//                     <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
//                       <CardContent sx={{ flexGrow: 1 }}>
//                         <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
//                           <Typography variant="h6" fontWeight={900}>{program.title}</Typography>
//                           <Chip label={program.zone || 'All Zones'} size="small" color="primary" />
//                         </Box>
//                         <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 60, overflow: 'hidden' }}>
//                           {program.description}
//                         </Typography>
//                         <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
//                           <Chip icon={<EmojiEvents />} label={`${program.rewardCoins || 100} Coins`} size="small" color="success" variant="outlined" />
//                           <Chip icon={<LocationOn />} label={program.location?.city || program.location?.address || 'TBD'} size="small" variant="outlined" />
//                         </Stack>
//                         <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
//                           <Chip icon={<Event />} label={program.startDate ? new Date(program.startDate).toLocaleDateString() : 'TBD'} size="small" variant="outlined" />
//                           {/* ✅ People is now correctly defined as PeopleAlt alias */}
//                           <Chip icon={<People />} label={`${program.currentVolunteers || 0}/${program.volunteerLimit || 20}`} size="small" variant="outlined" />
//                         </Stack>
//                         <LinearProgress
//                           variant="determinate"
//                           value={((program.currentVolunteers || 0) / (program.volunteerLimit || 20)) * 100}
//                           sx={{ height: 6, borderRadius: 3, mb: 1 }}
//                         />
//                         <Typography variant="caption" color="text.secondary">
//                           {program.currentVolunteers || 0} volunteers joined
//                         </Typography>
//                       </CardContent>
//                       <Box sx={{ p: 2, pt: 0 }}>
//                         <Button
//                           fullWidth variant="contained" startIcon={<AddCircle />}
//                           onClick={() => setJoinDialog({ open: true, program })}
//                           disabled={program.status === 'cancelled' || (program.currentVolunteers >= (program.volunteerLimit || 20))}
//                         >
//                           {program.currentVolunteers >= (program.volunteerLimit || 20) ? 'Program Full' : 'Join Program'}
//                         </Button>
//                       </Box>
//                     </Card>
//                   </Grid>
//                 ))
//               )}
//             </Grid>
//           )}

//           {/* Tab 1 — My Programs */}
//           {tabValue === 1 && (
//             <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
//               <Table>
//                 <TableHead sx={{ bgcolor: '#f8fafc' }}>
//                   <TableRow>
//                     <TableCell sx={{ fontWeight: 800 }}>Program</TableCell>
//                     <TableCell sx={{ fontWeight: 800 }}>Organization</TableCell>
//                     <TableCell sx={{ fontWeight: 800 }}>Applied Date</TableCell>
//                     <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
//                     <TableCell sx={{ fontWeight: 800 }}>Reward</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {myPrograms.length === 0 ? (
//                     <TableRow>
//                       <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
//                         <Typography color="text.secondary" gutterBottom>You haven't joined any programs yet</Typography>
//                         <Button variant="text" onClick={() => setTabValue(0)}>Browse Available Programs</Button>
//                       </TableCell>
//                     </TableRow>
//                   ) : (
//                     myPrograms.map((program) => (
//                       <TableRow key={program._id} hover>
//                         <TableCell>
//                           <Typography fontWeight={700}>{program.title}</Typography>
//                           <Typography variant="caption" color="text.secondary">{program.zone}</Typography>
//                         </TableCell>
//                         <TableCell>{program.organization}</TableCell>
//                         <TableCell>{program.appliedAt ? new Date(program.appliedAt).toLocaleDateString() : '–'}</TableCell>
//                         <TableCell>
//                           <Chip
//                             icon={getProgramStatusIcon(program.volunteerStatus)}
//                             label={program.volunteerStatus?.toUpperCase()}
//                             color={getProgramStatusColor(program.volunteerStatus)}
//                             size="small" sx={{ fontWeight: 700 }}
//                           />
//                         </TableCell>
//                         <TableCell>
//                           {program.volunteerStatus === 'approved' ? (
//                             <Chip icon={<EmojiEvents />} label={`+${program.rewardCoins || 100} Coins`} color="success" size="small" />
//                           ) : program.volunteerStatus === 'pending' ? (
//                             <Typography variant="caption" color="text.secondary">Pending approval</Typography>
//                           ) : (
//                             <Typography variant="caption" color="error">Not approved</Typography>
//                           )}
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   )}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           )}

//           {/* Tab 2 — Recent Collections */}
//           {tabValue === 2 && (
//             <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
//               <Table>
//                 <TableHead sx={{ bgcolor: '#f8fafc' }}>
//                   <TableRow>
//                     <TableCell sx={{ fontWeight: 800 }}>Date</TableCell>
//                     <TableCell sx={{ fontWeight: 800 }}>Waste Type</TableCell>
//                     <TableCell sx={{ fontWeight: 800 }}>Weight</TableCell>
//                     <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
//                     <TableCell sx={{ fontWeight: 800 }}>Collector</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {collections.length === 0 ? (
//                     <TableRow>
//                       <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
//                         <Typography color="text.secondary" gutterBottom>No collections yet</Typography>
//                         <Button variant="text" onClick={() => navigate('/request-collection')}>Request Pickup</Button>
//                       </TableCell>
//                     </TableRow>
//                   ) : (
//                     collections.slice(0, 10).map((collection) => (
//                       <TableRow key={collection._id} hover>
//                         <TableCell>{new Date(collection.scheduledDate).toLocaleDateString()}</TableCell>
//                         <TableCell><Chip label={collection.wasteType} size="small" variant="outlined" /></TableCell>
//                         <TableCell>{collection.actualWeight || collection.estimatedWeight || 0} kg</TableCell>
//                         <TableCell>
//                           <Chip
//                             label={collection.status}
//                             color={collection.status === 'Completed' ? 'success' : 'warning'}
//                             size="small"
//                           />
//                         </TableCell>
//                         <TableCell>{collection.collector?.name || 'Not assigned'}</TableCell>
//                       </TableRow>
//                     ))
//                   )}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           )}

//         </Container>
//       </Box>

//       {/* Join Program Dialog */}
//       <Dialog
//         open={joinDialog.open}
//         onClose={() => setJoinDialog({ open: false, program: null })}
//         maxWidth="sm" fullWidth
//         PaperProps={{ sx: { borderRadius: 3 } }}
//       >
//         <DialogTitle sx={{ fontWeight: 900 }}>Join {joinDialog.program?.title}</DialogTitle>
//         <DialogContent>
//           <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 2 }}>
//             Please tell us why you'd like to join this program. Your application will be reviewed by the admin.
//           </Typography>
//           <TextField
//             fullWidth label="Why do you want to join?" multiline rows={4}
//             value={motivation} onChange={(e) => setMotivation(e.target.value)}
//             placeholder="I want to help clean up my community and earn coins..."
//             required
//           />
//           <Box sx={{ mt: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
//             <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={1}>
//               <EmojiEvents fontSize="inherit" color="success" />
//               You will earn {joinDialog.program?.rewardCoins || 100} coins if approved
//             </Typography>
//           </Box>
//         </DialogContent>
//         <DialogActions sx={{ p: 3 }}>
//           <Button onClick={() => setJoinDialog({ open: false, program: null })}>Cancel</Button>
//           <Button
//             variant="contained" onClick={handleJoinProgram}
//             disabled={!motivation.trim() || joinLoading}
//           >
//             {joinLoading ? <CircularProgress size={24} /> : 'Submit Application'}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Payment Gateway */}
//       <PaymentGateway
//         open={paymentOpen}
//         onClose={() => setPaymentOpen(false)}
//         amount={monthlyFee}
//         onSuccess={() => { setPaymentOpen(false); window.location.reload(); }}
//       />
//     </Box>
//   );
// };

// export default ResidentDashboard;


import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Grid, Card, CardContent, Typography, Button,
  LinearProgress, Chip, Stack, Avatar, Alert, Divider,
  Drawer, List, ListItem, ListItemIcon, ListItemText,
  AppBar, Toolbar, IconButton, useTheme, useMediaQuery, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tab, Tabs, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import {
  VolunteerActivism, AccountBalanceWallet,
  CheckCircle, LocationOn,
  Dashboard, LocalShipping, Payment, Logout, Menu as MenuIcon,
  EmojiEvents, History, AddCircle, Notifications as NotificationsIcon,
  Home, Event, Info, Stars, Cancel, Schedule,
  Celebration, PeopleAlt as People
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useCoins } from '../context/CoinContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import NotificationBell from '../components/NotificationBell';
import CoinBalance from '../components/CoinBalance';
import PaymentGateway from '../components/PaymentGateway';

const drawerWidth = 280;
const THRESHOLD   = 1000;

const ResidentDashboard = () => {
  const { user, logout }   = useAuth();
  const { unreadCount }    = useNotifications();
  const {
    balance, totalEarned,
    isServiceFree, freeServiceUntil,
    fetchCoinData, getProgressToFreeService
  } = useCoins();

  const navigate  = useNavigate();
  const theme     = useTheme();
  const isMobile  = useMediaQuery(theme.breakpoints.down('md'));

  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [programs,    setPrograms]    = useState([]);
  const [myPrograms,  setMyPrograms]  = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [tabValue,    setTabValue]    = useState(0);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [joinDialog,  setJoinDialog]  = useState({ open: false, program: null });
  const [motivation,  setMotivation]  = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [stats, setStats] = useState({
    totalCollections: 0, pendingCollections: 0, completedCollections: 0
  });

  const monthlyFee   = 1000;
  const isPaymentDue = !user?.monthlyFeePaid && !isServiceFree;
  const progress     = getProgressToFreeService();

  // ── fetch all dashboard data ────────────────────────────────
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [programsRes, myProgramsRes, collectionsRes] = await Promise.all([
        api.get('/programs'),
        api.get('/resident/my-programs'),
        api.get('/resident/collections')
      ]);

      setPrograms(programsRes.data.programs     || []);
      setMyPrograms(myProgramsRes.data.programs || []);
      setCollections(collectionsRes.data.collections || []);

      const coll = collectionsRes.data.collections || [];
      setStats({
        totalCollections:     coll.length,
        pendingCollections:   coll.filter(c => c.status === 'Pending').length,
        completedCollections: coll.filter(c => c.status === 'Completed').length
      });

      // ✅ Refresh coin data so progress bar updates
      await fetchCoinData();
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [fetchCoinData]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  // ── join program ────────────────────────────────────────────
  const handleJoinProgram = async () => {
    if (!motivation.trim()) { toast.warning('Please tell us why you want to join'); return; }
    try {
      setJoinLoading(true);
      await api.post(`/programs/${joinDialog.program._id}/join`, { motivation });
      toast.success('Application submitted! Waiting for admin approval.');
      setJoinDialog({ open: false, program: null });
      setMotivation('');
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join program');
    } finally {
      setJoinLoading(false);
    }
  };

  const getProgramStatusColor = s => ({ approved: 'success', pending: 'warning', rejected: 'error' }[s] || 'default');
  const getProgramStatusIcon  = s => ({ approved: <CheckCircle />, pending: <Schedule />, rejected: <Cancel /> }[s] || <Info />);

  const menuItems = [
    { label: 'Dashboard',      icon: <Dashboard />,         path: '/resident/dashboard' },
    { label: 'Programs',       icon: <VolunteerActivism />,  path: '/resident/programs' },
    { label: 'Request Pickup', icon: <LocalShipping />,      path: '/request-collection' },
    { label: 'My Collections', icon: <History />,            path: '/my-collections' },
    { label: 'Payments',       icon: <Payment />,            path: '/payments' },
    { label: 'Rewards',        icon: <EmojiEvents />,        path: '/rewards' },
    { label: 'Notifications',  icon: <NotificationsIcon />,  path: '/notifications', badge: unreadCount }
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', bgcolor: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: 3, py: 3 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: '#10b981', width: 48, height: 48 }}><Home /></Avatar>
          <Box>
            <Typography variant="h6" fontWeight="900" sx={{ lineHeight: 1 }}>ECO-HOME</Typography>
            <Typography variant="caption" color="#94a3b8">Resident Portal</Typography>
          </Box>
        </Stack>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      <List sx={{ px: 2, mt: 3, flexGrow: 1 }}>
        {menuItems.map((item, i) => (
          <ListItem button key={i}
            onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
            sx={{ mb: 1.5, borderRadius: 2, bgcolor: window.location.pathname === item.path ? '#1e293b' : 'transparent', '&:hover': { bgcolor: '#1e293b' } }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={<Typography>{item.label}</Typography>} />
            {item.badge > 0 && <Chip label={item.badge} size="small" sx={{ bgcolor: '#ef4444', color: 'white', fontWeight: 800 }} />}
          </ListItem>
        ))}
      </List>
      <Box sx={{ p: 2 }}>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 2 }} />
        <Button fullWidth variant="text" color="error" startIcon={<Logout />}
          onClick={() => { logout(); navigate('/login'); }}
          sx={{ fontWeight: 700, justifyContent: 'flex-start', px: 2, color: '#94a3b8' }}>
          Sign Out
        </Button>
      </Box>
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>

      {/* Mobile AppBar */}
      <AppBar position="fixed" sx={{ width: { md: `calc(100% - ${drawerWidth}px)` }, ml: { md: `${drawerWidth}px` }, bgcolor: 'white', color: 'text.primary', display: { md: 'none' }, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2 }}><MenuIcon /></IconButton>
          <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>Resident Portal</Typography>
          <NotificationBell /><CoinBalance />
        </Toolbar>
      </AppBar>

      {/* Desktop header */}
      <Box sx={{ width: { md: `calc(100% - ${drawerWidth}px)` }, ml: { md: `${drawerWidth}px` }, position: 'fixed', top: 0, right: 0, bgcolor: 'white', borderBottom: '1px solid #e2e8f0', zIndex: 1100, display: { xs: 'none', md: 'block' } }}>
        <Toolbar sx={{ justifyContent: 'flex-end', gap: 2 }}>
          <CoinBalance /><NotificationBell />
          <Avatar sx={{ bgcolor: '#10b981' }}>{user?.name?.[0]}</Avatar>
        </Toolbar>
      </Box>

      {/* Sidebar */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer variant={isMobile ? 'temporary' : 'permanent'} open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          sx={{ '& .MuiDrawer-paper': { width: drawerWidth, border: 'none', bgcolor: '#0f172a' } }}>
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main */}
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, width: { md: `calc(100% - ${drawerWidth}px)` }, mt: { xs: 8, md: 8 } }}>
        <Container maxWidth="xl">

          {/* Alerts */}
          {isPaymentDue && (
            <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}
              action={<Button color="warning" variant="contained" size="small" onClick={() => setPaymentOpen(true)}>Pay Now</Button>}>
              <Typography fontWeight={600}>Monthly fee of Rs. {monthlyFee} is due</Typography>
            </Alert>
          )}

          {isServiceFree && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} icon={<Celebration />}>
              <Typography fontWeight={600}>
                🎉 Free service active until {freeServiceUntil ? new Date(freeServiceUntil).toLocaleDateString() : '—'}!
              </Typography>
            </Alert>
          )}

          {/* Welcome */}
          <Paper sx={{ p: 4, mb: 4, borderRadius: 3, bgcolor: '#0f172a', color: 'white' }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography variant="h4" fontWeight="900" gutterBottom>
                  Welcome back, {user?.name?.split(' ')[0]}!
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Zone: {user?.address?.zone || 'Not assigned'} • Street: {user?.address?.street || 'N/A'}
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Chip icon={<AccountBalanceWallet />} label={`${balance} Coins`}         sx={{ bgcolor: '#f59e0b', color: 'white', fontWeight: 700 }} />
                  <Chip icon={<EmojiEvents />}          label={`${totalEarned} Total Earned`} sx={{ bgcolor: '#10b981', color: 'white', fontWeight: 700 }} />
                  <Chip icon={<CheckCircle />}           label={isServiceFree ? 'Free Service Active' : 'Active Member'} sx={{ bgcolor: isServiceFree ? '#10b981' : '#3b82f6', color: 'white', fontWeight: 700 }} />
                </Stack>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>Quick Stats</Typography>
                  <Stack direction="row" justifyContent="space-between">
                    <Box><Typography variant="caption" sx={{ opacity: 0.7 }}>Programs</Typography><Typography variant="h5" fontWeight="900">{myPrograms.length}</Typography></Box>
                    <Box><Typography variant="caption" sx={{ opacity: 0.7 }}>Pickups</Typography><Typography variant="h5" fontWeight="900">{stats.totalCollections}</Typography></Box>
                    <Box><Typography variant="caption" sx={{ opacity: 0.7 }}>Coins</Typography><Typography variant="h5" fontWeight="900">{totalEarned}</Typography></Box>
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* ── Coin Progress Card ── */}
          <Paper sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <Stars sx={{ color: '#f59e0b' }} />
                <Typography variant="h6" fontWeight={700}>Free Service Progress</Typography>
              </Box>
              {/* ✅ Shows actual totalEarned / 1000 */}
              <Typography variant="h6" fontWeight={900} color={progress.canRedeem ? 'success.main' : 'text.primary'}>
                {progress.earned} / {THRESHOLD} coins
              </Typography>
            </Stack>

            {/* ✅ Progress bar uses real percentage from API */}
            <LinearProgress
              variant="determinate"
              value={progress.percentage}
              sx={{
                height: 14, borderRadius: 7, mb: 1,
                bgcolor: '#e2e8f0',
                '& .MuiLinearProgress-bar': {
                  background: progress.canRedeem
                    ? 'linear-gradient(90deg, #16a34a, #22d3ee)'
                    : 'linear-gradient(90deg, #3b82f6, #10b981)',
                  borderRadius: 7
                }
              }}
            />

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                {progress.canRedeem
                  ? '🎉 You have unlocked a free month! Claim it below.'
                  : `${progress.coinsUntilFree} more coins needed for 1 free month`}
              </Typography>
              {progress.canRedeem ? (
                <Button variant="contained" color="success" size="small"
                  onClick={() => navigate('/rewards')} startIcon={<Celebration />}>
                  Claim Free Month
                </Button>
              ) : (
                <Button variant="outlined" size="small" onClick={() => navigate('/programs')}
                  startIcon={<VolunteerActivism />}>
                  Earn Coins
                </Button>
              )}
            </Stack>

            {/* Milestone dots */}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
              {[100, 300, 500, 750, 1000].map(milestone => (
                <Box key={milestone} sx={{ textAlign: 'center' }}>
                  <Box sx={{
                    width: 12, height: 12, borderRadius: '50%', mx: 'auto', mb: 0.5,
                    bgcolor: progress.earned >= milestone ? '#16a34a' : '#e2e8f0',
                    border: progress.earned >= milestone ? '2px solid #16a34a' : '2px solid #cbd5e1'
                  }} />
                  <Typography variant="caption" color={progress.earned >= milestone ? '#16a34a' : 'text.disabled'} fontWeight={600}>
                    {milestone}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Stats cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              { label: 'Approved Programs', value: myPrograms.filter(p => p.volunteerStatus === 'approved').length, icon: <CheckCircle />, color: '#10b981' },
              { label: 'Pending Approval',  value: myPrograms.filter(p => p.volunteerStatus === 'pending').length,  icon: <Schedule />,    color: '#f59e0b' },
              { label: 'Pending Pickups',   value: stats.pendingCollections,                                          icon: <LocalShipping />,color: '#3b82f6' },
              { label: 'Completed Pickups', value: stats.completedCollections,                                        icon: <CheckCircle />, color: '#8b5cf6' }
            ].map((s, i) => (
              <Grid item xs={6} md={3} key={i}>
                <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #e2e8f0', height: '100%' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>{s.label}</Typography>
                      <Typography variant="h4" fontWeight={900} sx={{ color: s.color }}>{s.value}</Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: `${s.color}20`, color: s.color }}>{s.icon}</Avatar>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Tabs */}
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 3, borderBottom: '1px solid #e2e8f0' }}>
            <Tab label="Available Programs" />
            <Tab label="My Programs" />
            <Tab label="Recent Collections" />
          </Tabs>

          {/* Tab 0: Available Programs */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
              {programs.filter(p => !p.hasJoined).length === 0 ? (
                <Grid item xs={12}>
                  <Paper sx={{ p: 6, textAlign: 'center' }}>
                    <Info sx={{ fontSize: 60, color: '#94a3b8', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>No programs available</Typography>
                    <Typography variant="body2" color="text.secondary">Check back later for new volunteer opportunities</Typography>
                  </Paper>
                </Grid>
              ) : programs.filter(p => !p.hasJoined).map(program => (
                <Grid item xs={12} md={6} lg={4} key={program._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" fontWeight={900}>{program.title}</Typography>
                        <Chip label={program.zone || 'All Zones'} size="small" color="primary" />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 60, overflow: 'hidden' }}>
                        {program.description}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
                        <Chip icon={<EmojiEvents />} label={`${program.rewardCoins || 100} Coins`} size="small" color="success" variant="outlined" />
                        <Chip icon={<LocationOn />}  label={program.location?.city || program.location?.address || 'TBD'} size="small" variant="outlined" />
                      </Stack>
                      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
                        <Chip icon={<Event />}   label={program.startDate ? new Date(program.startDate).toLocaleDateString() : 'TBD'} size="small" variant="outlined" />
                        <Chip icon={<People />}  label={`${program.currentVolunteers || 0}/${program.volunteerLimit || 20}`} size="small" variant="outlined" />
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={((program.currentVolunteers || 0) / (program.volunteerLimit || 20)) * 100}
                        sx={{ height: 6, borderRadius: 3, mb: 0.5 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {program.currentVolunteers || 0} volunteers joined
                      </Typography>
                    </CardContent>
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Button fullWidth variant="contained" startIcon={<AddCircle />}
                        onClick={() => setJoinDialog({ open: true, program })}
                        disabled={program.status === 'cancelled' || (program.currentVolunteers >= (program.volunteerLimit || 20))}>
                        {program.currentVolunteers >= (program.volunteerLimit || 20) ? 'Program Full' : 'Join Program'}
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Tab 1: My Programs */}
          {tabValue === 1 && (
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    {['Program', 'Organization', 'Applied', 'Status', 'Reward'].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 800 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {myPrograms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary" gutterBottom>You haven't joined any programs yet</Typography>
                        <Button variant="text" onClick={() => setTabValue(0)}>Browse Available Programs</Button>
                      </TableCell>
                    </TableRow>
                  ) : myPrograms.map(p => (
                    <TableRow key={p._id} hover>
                      <TableCell><Typography fontWeight={700}>{p.title}</Typography><Typography variant="caption" color="text.secondary">{p.zone}</Typography></TableCell>
                      <TableCell>{p.organization}</TableCell>
                      <TableCell>{p.appliedAt ? new Date(p.appliedAt).toLocaleDateString() : '–'}</TableCell>
                      <TableCell>
                        <Chip icon={getProgramStatusIcon(p.volunteerStatus)} label={p.volunteerStatus?.toUpperCase()} color={getProgramStatusColor(p.volunteerStatus)} size="small" sx={{ fontWeight: 700 }} />
                      </TableCell>
                      <TableCell>
                        {p.volunteerStatus === 'approved'
                          ? <Chip icon={<EmojiEvents />} label={`+${p.rewardCoins || 100} Coins`} color="success" size="small" />
                          : p.volunteerStatus === 'pending'
                            ? <Typography variant="caption" color="text.secondary">Pending approval</Typography>
                            : <Typography variant="caption" color="error">Not approved</Typography>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Tab 2: Recent Collections */}
          {tabValue === 2 && (
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    {['Date', 'Waste Type', 'Weight', 'Status', 'Collector'].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 800 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {collections.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary" gutterBottom>No collections yet</Typography>
                        <Button variant="text" onClick={() => navigate('/request-collection')}>Request Pickup</Button>
                      </TableCell>
                    </TableRow>
                  ) : collections.slice(0, 10).map(c => (
                    <TableRow key={c._id} hover>
                      <TableCell>{new Date(c.scheduledDate).toLocaleDateString()}</TableCell>
                      <TableCell><Chip label={c.wasteType} size="small" variant="outlined" /></TableCell>
                      <TableCell>{c.actualWeight || c.estimatedWeight || 0} kg</TableCell>
                      <TableCell><Chip label={c.status} color={c.status === 'Completed' ? 'success' : 'warning'} size="small" /></TableCell>
                      <TableCell>{c.collector?.name || 'Not assigned'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

        </Container>
      </Box>

      {/* Join Dialog */}
      <Dialog open={joinDialog.open} onClose={() => setJoinDialog({ open: false, program: null })} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 900 }}>Join {joinDialog.program?.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 2 }}>
            Tell us why you'd like to join. Your application will be reviewed by admin.
          </Typography>
          <TextField fullWidth label="Why do you want to join?" multiline rows={4}
            value={motivation} onChange={e => setMotivation(e.target.value)}
            placeholder="I want to help clean up my community and earn coins..." required />
          <Box sx={{ mt: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={1}>
              <EmojiEvents fontSize="inherit" color="success" />
              You will earn {joinDialog.program?.rewardCoins || 100} coins if approved
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setJoinDialog({ open: false, program: null })}>Cancel</Button>
          <Button variant="contained" onClick={handleJoinProgram} disabled={!motivation.trim() || joinLoading}>
            {joinLoading ? <CircularProgress size={24} /> : 'Submit Application'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Gateway */}
      <PaymentGateway open={paymentOpen} onClose={() => setPaymentOpen(false)} amount={monthlyFee}
        onSuccess={() => { setPaymentOpen(false); window.location.reload(); }} />
    </Box>
  );
};

export default ResidentDashboard;