// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { 
//   Box, Container, Grid, Paper, AppBar, Typography, Button, Stack, 
//   Avatar, Chip, Drawer, List, ListItem, ListItemIcon, 
//   ListItemText, Toolbar, useMediaQuery, IconButton, Divider,
//   TextField, Switch, FormControlLabel, CircularProgress,
//   Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
//   Dialog, DialogTitle, DialogContent, DialogActions, 
//   Select, MenuItem, InputLabel, FormControl, Alert,
//   Card, CardContent, LinearProgress, Badge, Tooltip,
//   Tabs, Tab, Breadcrumbs, CardActions
// } from '@mui/material';
// import { 
//   Dashboard, VolunteerActivism, Menu as MenuIcon, 
//   LocalShipping, Logout, Refresh, DeleteSweep, TrendingUp, 
//   NotificationsActive, LocationOn, Settings,
//   WarningAmber, ArrowUpward, ArrowDownward, Inventory,
//   CheckCircle, Person, Recycling, Assessment, Map,
//   Speed, Timeline, CalendarToday, AttachMoney,
//   Route, MyLocation, WbSunny, Opacity, Group,
//   Add, Edit, EmojiEvents, Schedule, Description,
//   Cancel, Update, People, Stars
// } from '@mui/icons-material';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { useNavigate } from 'react-router-dom';
// import api from '../services/api';
// import { useAuth } from '../context/AuthContext';
// import NotificationBell from '../components/NotificationBell';

// const drawerWidth = 280;

// const AdminDashboard = () => {
//   const navigate = useNavigate();
//   const { logout, user } = useAuth();
//   const isMobile = useMediaQuery('(max-width:900px)');
  
//   // State Management
//   const [mobileOpen, setMobileOpen] = useState(false);
//   const [activeView, setActiveView] = useState('dashboard'); 
//   const [activeTab, setActiveTab] = useState(0);
//   const [programs, setPrograms] = useState([]);
//   const [reports, setReports] = useState([]);
//   const [collectors, setCollectors] = useState([]);
//   const [stats, setStats] = useState({ activeVolunteers: 0, revenue: 0, totalWaste: 0, efficiency: 0 });
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   // Program Management State
//   const [programDialog, setProgramDialog] = useState({ open: false, mode: 'create', program: null });
//   const [programForm, setProgramForm] = useState({
//     title: '',
//     description: '',
//     organization: 'SWM Admin',
//     zone: '',
//     location: '',
//     startDate: '',
//     endDate: '',
//     maxVolunteers: 20,
//     rewardCoins: 100,
//     requirements: '',
//     benefits: ''
//   });

//   // Selected program for viewing volunteers
//   const [selectedProgram, setSelectedProgram] = useState(null);
//   const [viewProgram, setViewProgram] = useState(null);

//   // Dialog & Selection State
//   const [dispatchDialog, setDispatchDialog] = useState({ open: false, collectionId: null });
//   const [selectedCollector, setSelectedCollector] = useState('');
//   const [detailsDialog, setDetailsDialog] = useState({ open: false, data: null });

//   // Filter States
//   const [zoneFilter, setZoneFilter] = useState('all');
//   const [statusFilter, setStatusFilter] = useState('all');

//   // ==========================================
//   // DATA FETCHING
//   // ==========================================
//   const fetchData = useCallback(async () => {
//     setLoading(true);
//     try {
//       const [progRes, statRes, reportRes, collRes] = await Promise.all([
//         api.get('/programs').catch(() => ({ data: { programs: [] } })),
//         api.get('/admin/stats').catch(() => ({ data: { activeVolunteers: 0, revenue: 0, totalWaste: 0, efficiency: 85 } })),
//         api.get('/admin/collections/reports').catch(() => ({ data: { reports: [] } })),
//         api.get('/users?role=collector').catch(() => ({ data: { users: [] } }))
//       ]);
      
//       setPrograms(progRes.data?.programs || []);
//       setStats(statRes.data || { activeVolunteers: 0, revenue: 0, totalWaste: 0, efficiency: 85 });
//       setReports(reportRes.data?.reports || []);
//       setCollectors(collRes.data?.users || []);
      
//       toast.success('Dashboard data refreshed!');
//     } catch (err) {
//       toast.error("Database sync failed. Using cached data.");
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, []);

//   useEffect(() => { 
//     fetchData(); 
//   }, [fetchData]);

//   const handleRefresh = () => {
//     setRefreshing(true);
//     fetchData();
//   };

//   // ==========================================
//   // PROGRAM MANAGEMENT FUNCTIONS
//   // ==========================================
//   const handleOpenProgramDialog = (program = null) => {
//     if (program) {
//       setProgramForm({
//         title: program.title || '',
//         description: program.description || '',
//         organization: program.organization || 'SWM Admin',
//         zone: program.zone || '',
//         location: program.location || '',
//         startDate: program.startDate ? program.startDate.split('T')[0] : '',
//         endDate: program.endDate ? program.endDate.split('T')[0] : '',
//         maxVolunteers: program.maxVolunteers || 20,
//         rewardCoins: program.rewardCoins || 100,
//         requirements: program.requirements || '',
//         benefits: program.benefits || ''
//       });
//       setProgramDialog({ open: true, mode: 'edit', program });
//     } else {
//       setProgramForm({
//         title: '',
//         description: '',
//         organization: 'SWM Admin',
//         zone: '',
//         location: '',
//         startDate: '',
//         endDate: '',
//         maxVolunteers: 20,
//         rewardCoins: 100,
//         requirements: '',
//         benefits: ''
//       });
//       setProgramDialog({ open: true, mode: 'create', program: null });
//     }
//   };

//   const handleCloseProgramDialog = () => {
//     setProgramDialog({ open: false, mode: 'create', program: null });
//   };

//   const handleSaveProgram = async () => {
//     try {
//       if (programDialog.mode === 'edit') {
//         await api.put(`/programs/${programDialog.program._id}`, programForm);
//         toast.success('✅ Program updated successfully!');
//       } else {
//         await api.post('/programs', programForm);
//         toast.success('✅ New program created successfully!');
//       }
//       handleCloseProgramDialog();
//       fetchData();
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to save program');
//     }
//   };

//   // Approve volunteer function
//   const handleApproveVolunteer = async (programId, userId, userName) => {
//     try {
//       await api.put(`/programs/${programId}/approve/${userId}`);
//       toast.success(`✅ ${userName} approved! 100 coins awarded.`);
//       fetchData();
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Approval failed.");
//     }
//   };

//   // Reject volunteer function
//   const handleRejectVolunteer = async (programId, userId, userName) => {
//     try {
//       await api.put(`/programs/${programId}/reject/${userId}`);
//       toast.warning(`❌ ${userName}'s application rejected.`);
//       fetchData();
//     } catch (err) {
//       toast.error("Rejection failed");
//     }
//   };

//   // ==========================================
//   // COLLECTION MANAGEMENT FUNCTIONS
//   // ==========================================
//   const handleDispatch = async () => {
//     if (!selectedCollector) return toast.warning("Please select a collector");
//     try {
//       await api.patch(`/collections/${dispatchDialog.collectionId}/status`, { 
//         status: 'Scheduled',
//         collector: selectedCollector 
//       });
//       toast.success("🚛 Truck Dispatched & Collector Assigned!");
//       setDispatchDialog({ open: false, collectionId: null });
//       setSelectedCollector('');
//       fetchData();
//     } catch (e) {
//       toast.error("Dispatch failed");
//     }
//   };

//   const handleCompleteCollection = async (collectionId) => {
//     try {
//       await api.patch(`/collections/${collectionId}/status`, { 
//         status: 'Completed'
//       });
//       toast.success("Collection completed!");
//       fetchData();
//     } catch (e) {
//       toast.error("Failed to complete collection");
//     }
//   };

//   const handleDeleteProgram = async (programId) => {
//     if (window.confirm('Are you sure you want to delete this program?')) {
//       try {
//         await api.delete(`/programs/${programId}`);
//         toast.success("Program deleted");
//         fetchData();
//       } catch (e) {
//         toast.error("Delete failed");
//       }
//     }
//   };

//   // ==========================================
//   // ANALYTICS & CALCULATIONS
//   // ==========================================
//   const analytics = useMemo(() => {
//     const totalWaste = reports.reduce((acc, r) => acc + (r.actualWeight || 0), 0);
//     const capacity = Math.min(((totalWaste / 50000) * 100), 100).toFixed(1);
//     const averageEfficiency = stats.efficiency || 85;
    
//     // Calculate pending volunteers
//     const pendingList = [];
//     programs.forEach(prog => {
//       if (prog.volunteers) {
//         prog.volunteers.forEach(v => {
//           if (v.status === 'pending') {
//             pendingList.push({ 
//               progId: prog._id, 
//               progTitle: prog.title, 
//               ...v,
//               user: v.user || { name: 'Unknown', email: '' }
//             });
//           }
//         });
//       }
//     });

//     const wardData = {};
//     const zonePerformance = {};
    
//     reports.forEach(r => {
//       const zone = r.address?.zone || 'Unassigned';
//       wardData[zone] = (wardData[zone] || 0) + (r.actualWeight || 0);
      
//       if (!zonePerformance[zone]) {
//         zonePerformance[zone] = { total: 0, completed: 0, pending: 0 };
//       }
//       zonePerformance[zone].total++;
//       if (r.status === 'Completed') zonePerformance[zone].completed++;
//       else if (r.status === 'Pending') zonePerformance[zone].pending++;
//     });

//     const completedCollections = reports.filter(r => r.status === 'Completed').length;
//     const completionRate = reports.length ? ((completedCollections / reports.length) * 100).toFixed(1) : 0;

//     return { 
//       totalWaste, 
//       capacity, 
//       pendingVolunteers: pendingList.length, 
//       pendingList, 
//       wardData,
//       zonePerformance,
//       averageEfficiency,
//       completionRate,
//       completedCollections,
//       totalCollections: reports.length,
//       totalPrograms: programs.length,
//       activePrograms: programs.filter(p => p.status === 'active').length
//     };
//   }, [reports, programs, stats]);

//   // ==========================================
//   // FILTERED DATA
//   // ==========================================
//   const filteredReports = useMemo(() => {
//     return reports.filter(report => {
//       if (statusFilter !== 'all' && report.status !== statusFilter) return false;
//       if (zoneFilter !== 'all' && report.address?.zone !== zoneFilter) return false;
//       return true;
//     });
//   }, [reports, statusFilter, zoneFilter]);

//   const uniqueZones = useMemo(() => {
//     const zones = new Set(reports.map(r => r.address?.zone).filter(Boolean));
//     return ['all', ...Array.from(zones)];
//   }, [reports]);

//   // ==========================================
//   // RENDER HELPERS
//   // ==========================================
//   const getStatusColor = (status) => {
//     const colors = {
//       'Pending': 'warning',
//       'Scheduled': 'info',
//       'In Progress': 'primary',
//       'Completed': 'success',
//       'Cancelled': 'error',
//       'pending': 'warning',
//       'approved': 'success',
//       'rejected': 'error',
//       'active': 'success',
//       'upcoming': 'info',
//       'completed': 'default'
//     };
//     return colors[status] || 'default';
//   };

//   const getWasteTypeIcon = (type) => {
//     switch(type?.toLowerCase()) {
//       case 'plastic': return <Opacity />;
//       case 'paper': return <Description />;
//       case 'glass': return <WbSunny />;
//       case 'metal': return <Inventory />;
//       default: return <Recycling />;
//     }
//   };

//   const menuItems = [
//     { id: 'dashboard', label: 'Dashboard', icon: <Dashboard />, badge: null },
//     { id: 'fleet', label: 'Fleet Management', icon: <LocalShipping />, badge: reports.filter(r => r.status === 'Pending').length },
//     { id: 'volunteers', label: 'Volunteers', icon: <VolunteerActivism />, badge: analytics.pendingVolunteers },
//     { id: 'analytics', label: 'Analytics', icon: <Assessment />, badge: null },
//     { id: 'locations', label: 'Zone Map', icon: <LocationOn />, badge: null },
//     { id: 'settings', label: 'Settings', icon: <Settings />, badge: null },
//   ];

//   const drawerContent = (
//     <Box sx={{ height: '100%', bgcolor: '#0f172a', display: 'flex', flexDirection: 'column', p: 2 }}>
//       <Toolbar sx={{ mb: 4 }}>
//         <Stack direction="row" spacing={1.5} alignItems="center">
//           <Avatar sx={{ bgcolor: '#10b981', width: 48, height: 48, fontWeight: 900, fontSize: '1.5rem' }}>ECO</Avatar>
//           <Box>
//             <Typography variant="h6" fontWeight="900" color="white" sx={{ lineHeight: 1 }}>WASTE PRO</Typography>
//             <Typography variant="caption" color="#94a3b8">Admin • {user?.name || 'System'}</Typography>
//           </Box>
//         </Stack>
//       </Toolbar>
      
//       <List sx={{ flexGrow: 1 }}>
//         {menuItems.map((item) => (
//           <ListItem 
//             button 
//             key={item.id} 
//             onClick={() => { setActiveView(item.id); if (isMobile) setMobileOpen(false); }}
//             sx={{ 
//               mb: 1, 
//               borderRadius: '12px', 
//               py: 1.5, 
//               bgcolor: activeView === item.id ? '#1e293b' : 'transparent',
//               color: activeView === item.id ? 'white' : '#94a3b8',
//               '&:hover': { 
//                 bgcolor: activeView === item.id ? '#1e293b' : '#1e293b',
//                 color: 'white'
//               },
//               '& .MuiListItemIcon-root': { 
//                 color: activeView === item.id ? '#10b981' : '#64748b',
//                 minWidth: 40
//               }
//             }}
//           >
//             <ListItemIcon>{item.icon}</ListItemIcon>
//             <ListItemText 
//               primary={
//                 <Typography fontWeight={700} fontSize="0.95rem">
//                   {item.label}
//                 </Typography>
//               } 
//             />
//             {item.badge > 0 && (
//               <Chip 
//                 label={item.badge} 
//                 size="small" 
//                 sx={{ 
//                   bgcolor: '#ef4444', 
//                   color: 'white',
//                   fontWeight: 800,
//                   height: 24,
//                   minWidth: 24
//                 }} 
//               />
//             )}
//           </ListItem>
//         ))}
//       </List>
      
//       <Divider sx={{ my: 2, borderColor: '#334155' }} />
      
//       <Box sx={{ px: 2, py: 2, bgcolor: '#1e293b', borderRadius: '16px', mb: 2 }}>
//         <Typography variant="caption" color="#94a3b8">System Status</Typography>
//         <Stack direction="row" justifyContent="space-between" alignItems="center" mt={1}>
//           <Typography variant="body2" color="white">API</Typography>
//           <Chip label="Online" size="small" sx={{ bgcolor: '#10b981', color: 'white', height: 20 }} />
//         </Stack>
//         <Stack direction="row" justifyContent="space-between" alignItems="center" mt={1}>
//           <Typography variant="body2" color="white">Database</Typography>
//           <Chip label="Connected" size="small" sx={{ bgcolor: '#10b981', color: 'white', height: 20 }} />
//         </Stack>
//       </Box>
      
//       <Button 
//         fullWidth 
//         variant="text" 
//         color="error" 
//         startIcon={<Logout />} 
//         onClick={() => { logout(); navigate('/login'); }} 
//         sx={{ 
//           borderRadius: '12px', 
//           py: 1.5, 
//           fontWeight: 700, 
//           justifyContent: 'flex-start', 
//           px: 2,
//           color: '#94a3b8',
//           '&:hover': {
//             bgcolor: '#ef444420',
//             color: '#ef4444'
//           }
//         }}
//       >
//         Sign Out
//       </Button>
//     </Box>
//   );

//   // Program Card Component
//   const ProgramCard = ({ program }) => {
//     const pendingVolunteers = program.volunteers?.filter(v => v.status === 'pending') || [];
//     const approvedVolunteers = program.volunteers?.filter(v => v.status === 'approved') || [];
//     const totalVolunteers = program.volunteers?.length || 0;

//     return (
//       <Card sx={{ borderRadius: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
//         <CardContent sx={{ flexGrow: 1 }}>
//           <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
//             <Box>
//               <Typography variant="h6" fontWeight={900}>{program.title}</Typography>
//               <Typography variant="caption" color="text.secondary">
//                 {program.organization} • {program.zone || 'All Zones'}
//               </Typography>
//             </Box>
//             <Chip 
//               label={program.status || 'active'} 
//               size="small" 
//               color={getStatusColor(program.status)}
//               sx={{ fontWeight: 700 }}
//             />
//           </Stack>

//           <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 40, overflow: 'hidden' }}>
//             {program.description || 'No description provided'}
//           </Typography>

//           <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
//             <Box>
//               <Typography variant="h6" fontWeight={900} color="#10b981">{approvedVolunteers.length}</Typography>
//               <Typography variant="caption" color="text.secondary">Approved</Typography>
//             </Box>
//             <Box>
//               <Typography variant="h6" fontWeight={900} color="#f59e0b">{pendingVolunteers.length}</Typography>
//               <Typography variant="caption" color="text.secondary">Pending</Typography>
//             </Box>
//           </Stack>

//           <LinearProgress 
//             variant="determinate" 
//             value={(totalVolunteers / (program.maxVolunteers || 20)) * 100} 
//             sx={{ height: 6, borderRadius: 3, mb: 1 }}
//           />
//           <Typography variant="caption" color="text.secondary">
//             {totalVolunteers}/{program.maxVolunteers || 20} total applicants
//           </Typography>
          
//           <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
//             <Chip 
//               icon={<CalendarToday />} 
//               label={program.startDate ? new Date(program.startDate).toLocaleDateString() : 'TBD'} 
//               size="small" 
//               variant="outlined"
//             />
//             <Chip 
//               icon={<EmojiEvents />} 
//               label={`${program.rewardCoins || 100} coins`} 
//               size="small" 
//               color="success" 
//               variant="outlined"
//             />
//           </Stack>
//         </CardContent>

//         <CardActions sx={{ p: 2, pt: 0 }}>
//           <Button 
//             size="small" 
//             variant="contained" 
//             startIcon={<VolunteerActivism />}
//             onClick={() => setSelectedProgram(program)}
//             fullWidth
//             sx={{ mb: 1 }}
//           >
//             Manage Volunteers ({pendingVolunteers.length} pending)
//           </Button>
//           <Stack direction="row" spacing={1} justifyContent="space-between" width="100%">
//             <Button 
//               size="small" 
//               variant="outlined"
//               onClick={() => {
//                 setViewProgram(program);
//                 setActiveView('program-details');
//               }}
//               fullWidth
//             >
//               View Details
//             </Button>
//             <IconButton size="small" onClick={() => handleOpenProgramDialog(program)}>
//               <Edit />
//             </IconButton>
//             <IconButton size="small" color="error" onClick={() => handleDeleteProgram(program._id)}>
//               <DeleteSweep />
//             </IconButton>
//           </Stack>
//         </CardActions>
//       </Card>
//     );
//   };

//   // Volunteers List Dialog
//   const VolunteersDialog = ({ program, onClose }) => {
//     if (!program) return null;

//     const pendingVolunteers = program.volunteers?.filter(v => v.status === 'pending') || [];
//     const approvedVolunteers = program.volunteers?.filter(v => v.status === 'approved') || [];

//     return (
//       <Dialog 
//         open={Boolean(program)} 
//         onClose={onClose}
//         maxWidth="md"
//         fullWidth
//         PaperProps={{ sx: { borderRadius: '24px' } }}
//       >
//         <DialogTitle>
//           <Stack direction="row" justifyContent="space-between" alignItems="center">
//             <Typography variant="h6" fontWeight={900}>{program.title} - Volunteers</Typography>
//             <IconButton onClick={onClose}><Cancel /></IconButton>
//           </Stack>
//         </DialogTitle>
//         <DialogContent>
//           <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
//             <Tab label={`Pending (${pendingVolunteers.length})`} />
//             <Tab label={`Approved (${approvedVolunteers.length})`} />
//           </Tabs>

//           {activeTab === 0 && (
//             <TableContainer>
//               <Table>
//                 <TableHead>
//                   <TableRow>
//                     <TableCell>Volunteer</TableCell>
//                     <TableCell>Applied Date</TableCell>
//                     <TableCell align="center">Actions</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {pendingVolunteers.length === 0 ? (
//                     <TableRow><TableCell colSpan={3} align="center">No pending volunteers</TableCell></TableRow>
//                   ) : (
//                     pendingVolunteers.map((v, idx) => (
//                       <TableRow key={idx}>
//                         <TableCell>
//                           <Stack direction="row" spacing={1} alignItems="center">
//                             <Avatar>{v.user?.name?.[0] || 'V'}</Avatar>
//                             <Box>
//                               <Typography fontWeight={700}>{v.user?.name || 'Unknown'}</Typography>
//                               <Typography variant="caption">{v.user?.email}</Typography>
//                             </Box>
//                           </Stack>
//                         </TableCell>
//                         <TableCell>
//                           {v.appliedAt ? new Date(v.appliedAt).toLocaleDateString() : 'N/A'}
//                         </TableCell>
//                         <TableCell align="center">
//                           <Stack direction="row" spacing={1} justifyContent="center">
//                             <Button
//                               size="small"
//                               variant="contained"
//                               color="success"
//                               onClick={() => {
//                                 handleApproveVolunteer(program._id, v.user?._id || v.user, v.user?.name);
//                                 onClose();
//                               }}
//                             >
//                               Approve (+100)
//                             </Button>
//                             <Button
//                               size="small"
//                               variant="outlined"
//                               color="error"
//                               onClick={() => {
//                                 handleRejectVolunteer(program._id, v.user?._id || v.user, v.user?.name);
//                                 onClose();
//                               }}
//                             >
//                               Reject
//                             </Button>
//                           </Stack>
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   )}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           )}

//           {activeTab === 1 && (
//             <TableContainer>
//               <Table>
//                 <TableHead>
//                   <TableRow>
//                     <TableCell>Volunteer</TableCell>
//                     <TableCell>Approved Date</TableCell>
//                     <TableCell>Coins Earned</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {approvedVolunteers.length === 0 ? (
//                     <TableRow><TableCell colSpan={3} align="center">No approved volunteers</TableCell></TableRow>
//                   ) : (
//                     approvedVolunteers.map((v, idx) => (
//                       <TableRow key={idx}>
//                         <TableCell>
//                           <Stack direction="row" spacing={1} alignItems="center">
//                             <Avatar>{v.user?.name?.[0] || 'V'}</Avatar>
//                             <Typography fontWeight={700}>{v.user?.name || 'Unknown'}</Typography>
//                           </Stack>
//                         </TableCell>
//                         <TableCell>
//                           {v.approvedAt ? new Date(v.approvedAt).toLocaleDateString() : 'N/A'}
//                         </TableCell>
//                         <TableCell>
//                           <Chip icon={<Stars />} label="100 Coins" size="small" color="success" />
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   )}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           )}
//         </DialogContent>
//       </Dialog>
//     );
//   };

//   return (
//     <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
//       <ToastContainer position="top-right" autoClose={3000} />
      
//       {/* Sidebar Navigation */}
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
//             },
//           }}
//         >
//           {drawerContent}
//         </Drawer>
//       </Box>

//       {/* Main Content */}
//       <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 } }}>
//         {isMobile && (
//           <AppBar position="fixed" sx={{ bgcolor: 'white', color: 'black', boxShadow: 'none', borderBottom: '1px solid #e2e8f0' }}>
//             <Toolbar>
//               <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 2 }}>
//                 <MenuIcon />
//               </IconButton>
//               <Typography variant="h6" fontWeight="bold">Waste Pro</Typography>
//               <Box sx={{ flexGrow: 1 }} />
//               <NotificationBell />
//             </Toolbar>
//           </AppBar>
//         )}
        
//         <Container maxWidth="xl" sx={{ mt: isMobile ? 10 : 0 }}>
          
//           {/* Header with Refresh */}
//           <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
//             <Breadcrumbs>
//               <Typography color="text.primary" fontWeight={600}>Admin</Typography>
//               <Typography color="text.secondary">{menuItems.find(i => i.id === activeView)?.label || 'Dashboard'}</Typography>
//             </Breadcrumbs>
            
//             <Stack direction="row" spacing={2}>
//               <NotificationBell />
//               <Button 
//                 variant="outlined" 
//                 startIcon={<Refresh />} 
//                 onClick={handleRefresh}
//                 disabled={refreshing}
//                 sx={{ borderRadius: '12px' }}
//               >
//                 {refreshing ? 'Refreshing...' : 'Refresh Data'}
//               </Button>
//             </Stack>
//           </Stack>
          
//           {/* VIEW: EXECUTIVE DASHBOARD */}
//           {activeView === 'dashboard' && (
//             <>
//               <Box mb={4}>
//                 <Typography variant="h3" fontWeight="900" color="#0f172a" sx={{ letterSpacing: '-1px' }}>
//                   Executive Dashboard
//                 </Typography>
//                 <Typography variant="h6" color="text.secondary" fontWeight={500}>
//                   Real-time waste management overview
//                 </Typography>
//               </Box>

//               {/* Stats Cards */}
//               <Grid container spacing={3} mb={4}>
//                 <Grid item xs={12} sm={6} md={3}>
//                   <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: '#3b82f6', color: 'white', height: '100%' }}>
//                     <Stack spacing={2}>
//                       <Recycling sx={{ fontSize: 40, opacity: 0.8 }} />
//                       <Box>
//                         <Typography variant="subtitle2" fontWeight={700} sx={{ opacity: 0.9 }}>Waste Collected</Typography>
//                         <Typography variant="h3" fontWeight={900}>{analytics.totalWaste.toFixed(1)}kg</Typography>
//                       </Box>
//                       <LinearProgress variant="determinate" value={analytics.capacity} sx={{ bgcolor: '#ffffff30', '& .MuiLinearProgress-bar': { bgcolor: 'white' } }} />
//                       <Typography variant="caption">{analytics.capacity}% capacity</Typography>
//                     </Stack>
//                   </Paper>
//                 </Grid>
                
//                 <Grid item xs={12} sm={6} md={3}>
//                   <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: '#10b981', color: 'white', height: '100%' }}>
//                     <Stack spacing={2}>
//                       <AttachMoney sx={{ fontSize: 40, opacity: 0.8 }} />
//                       <Box>
//                         <Typography variant="subtitle2" fontWeight={700} sx={{ opacity: 0.9 }}>Revenue</Typography>
//                         <Typography variant="h3" fontWeight={900}>Rs. {stats.revenue?.toLocaleString()}</Typography>
//                       </Box>
//                       <Typography variant="caption">↑ 12% from last month</Typography>
//                     </Stack>
//                   </Paper>
//                 </Grid>
                
//                 <Grid item xs={12} sm={6} md={3}>
//                   <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: '#f59e0b', color: 'white', height: '100%' }}>
//                     <Stack spacing={2}>
//                       <Group sx={{ fontSize: 40, opacity: 0.8 }} />
//                       <Box>
//                         <Typography variant="subtitle2" fontWeight={700} sx={{ opacity: 0.9 }}>Active Programs</Typography>
//                         <Typography variant="h3" fontWeight={900}>{analytics.activePrograms}</Typography>
//                       </Box>
//                       <Typography variant="caption">{analytics.totalPrograms} total programs</Typography>
//                     </Stack>
//                   </Paper>
//                 </Grid>
                
//                 <Grid item xs={12} sm={6} md={3}>
//                   <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: '#8b5cf6', color: 'white', height: '100%' }}>
//                     <Stack spacing={2}>
//                       <VolunteerActivism sx={{ fontSize: 40, opacity: 0.8 }} />
//                       <Box>
//                         <Typography variant="subtitle2" fontWeight={700} sx={{ opacity: 0.9 }}>Pending Approval</Typography>
//                         <Typography variant="h3" fontWeight={900}>{analytics.pendingVolunteers}</Typography>
//                       </Box>
//                       <Typography variant="caption">Volunteers waiting</Typography>
//                     </Stack>
//                   </Paper>
//                 </Grid>
//               </Grid>

//               {/* ==========================================
//                   NEW: VOLUNTEER PROGRAMS SECTION
//                   ========================================== */}
//               <Paper sx={{ p: 4, mb: 4, borderRadius: '24px', border: '1px solid #e2e8f0', bgcolor: 'white' }}>
//                 <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
//                   <Box>
//                     <Typography variant="h5" fontWeight="900" color="#0f172a" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                       <Group color="primary" /> Volunteer Programs
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary">
//                       Create and manage volunteer programs - residents can join and earn 100 coins
//                     </Typography>
//                   </Box>
//                   <Button
//                     variant="contained"
//                     startIcon={<Add />}
//                     onClick={() => handleOpenProgramDialog()}
//                     sx={{ borderRadius: '12px', fontWeight: 700, px: 3 }}
//                   >
//                     Create New Program
//                   </Button>
//                 </Stack>

//                 {/* Program Statistics Cards */}
//                 <Grid container spacing={3} sx={{ mb: 4 }}>
//                   <Grid item xs={12} sm={6} md={3}>
//                     <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
//                       <Typography variant="caption" color="text.secondary" fontWeight={800}>TOTAL PROGRAMS</Typography>
//                       <Typography variant="h4" fontWeight={900} color="#0f172a">{analytics.totalPrograms}</Typography>
//                     </Paper>
//                   </Grid>
//                   <Grid item xs={12} sm={6} md={3}>
//                     <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
//                       <Typography variant="caption" color="text.secondary" fontWeight={800}>ACTIVE PROGRAMS</Typography>
//                       <Typography variant="h4" fontWeight={900} color="#10b981">{analytics.activePrograms}</Typography>
//                     </Paper>
//                   </Grid>
//                   <Grid item xs={12} sm={6} md={3}>
//                     <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
//                       <Typography variant="caption" color="text.secondary" fontWeight={800}>VOLUNTEERS</Typography>
//                       <Typography variant="h4" fontWeight={900} color="#3b82f6">
//                         {programs.reduce((sum, p) => sum + (p.volunteers?.length || 0), 0)}
//                       </Typography>
//                     </Paper>
//                   </Grid>
//                   <Grid item xs={12} sm={6} md={3}>
//                     <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
//                       <Typography variant="caption" color="text.secondary" fontWeight={800}>PENDING APPROVALS</Typography>
//                       <Typography variant="h4" fontWeight={900} color="#f59e0b">{analytics.pendingVolunteers}</Typography>
//                     </Paper>
//                   </Grid>
//                 </Grid>

//                 {/* Program Cards Grid */}
//                 <Typography variant="h6" fontWeight={900} color="#0f172a" mb={2}>
//                   Recent Programs
//                 </Typography>
                
//                 <Grid container spacing={3}>
//                   {programs.length === 0 ? (
//                     <Grid item xs={12}>
//                       <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: '16px' }}>
//                         <Group sx={{ fontSize: 60, color: '#94a3b8', mb: 2 }} />
//                         <Typography variant="h6" color="text.secondary" gutterBottom>
//                           No programs created yet
//                         </Typography>
//                         <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
//                           Create your first volunteer program to start engaging with the community
//                         </Typography>
//                         <Button
//                           variant="contained"
//                           startIcon={<Add />}
//                           onClick={() => handleOpenProgramDialog()}
//                         >
//                           Create Your First Program
//                         </Button>
//                       </Paper>
//                     </Grid>
//                   ) : (
//                     programs.slice(0, 3).map((program) => {
//                       const pendingCount = program.volunteers?.filter(v => v.status === 'pending').length || 0;
//                       const approvedCount = program.volunteers?.filter(v => v.status === 'approved').length || 0;
                      
//                       return (
//                         <Grid item xs={12} md={4} key={program._id}>
//                           <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
//                             <CardContent sx={{ flexGrow: 1 }}>
//                               <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
//                                 <Box>
//                                   <Typography variant="h6" fontWeight={900} color="#0f172a">
//                                     {program.title}
//                                   </Typography>
//                                   <Typography variant="caption" color="text.secondary">
//                                     {program.organization} • {program.zone || 'All Zones'}
//                                   </Typography>
//                                 </Box>
//                                 <Chip 
//                                   label={program.status || 'active'} 
//                                   size="small" 
//                                   color={program.status === 'active' ? 'success' : 'default'}
//                                   sx={{ fontWeight: 700 }}
//                                 />
//                               </Stack>
                              
//                               <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 40, overflow: 'hidden' }}>
//                                 {program.description || 'No description'}
//                               </Typography>
                              
//                               <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
//                                 <Box>
//                                   <Typography variant="h6" fontWeight={900} color="#10b981">{approvedCount}</Typography>
//                                   <Typography variant="caption" color="text.secondary">Approved</Typography>
//                                 </Box>
//                                 <Box>
//                                   <Typography variant="h6" fontWeight={900} color="#f59e0b">{pendingCount}</Typography>
//                                   <Typography variant="caption" color="text.secondary">Pending</Typography>
//                                 </Box>
//                               </Stack>
                              
//                               <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
//                                 <Chip 
//                                   icon={<EmojiEvents />} 
//                                   label={`${program.rewardCoins || 100} coins`} 
//                                   size="small" 
//                                   color="success" 
//                                   variant="outlined"
//                                 />
//                                 <Chip 
//                                   icon={<People />} 
//                                   label={`${program.volunteers?.length || 0}/${program.maxVolunteers || 20}`} 
//                                   size="small" 
//                                   variant="outlined"
//                                 />
//                               </Stack>
                              
//                               <Stack direction="row" spacing={1}>
//                                 <Button 
//                                   size="small" 
//                                   variant="contained" 
//                                   color="primary"
//                                   onClick={() => setSelectedProgram(program)}
//                                   fullWidth
//                                 >
//                                   Manage ({pendingCount} pending)
//                                 </Button>
//                                 <IconButton size="small" onClick={() => handleOpenProgramDialog(program)}>
//                                   <Edit />
//                                 </IconButton>
//                               </Stack>
                              
//                               {pendingCount > 0 && (
//                                 <Button
//                                   size="small"
//                                   variant="text"
//                                   color="warning"
//                                   fullWidth
//                                   sx={{ mt: 1 }}
//                                   onClick={() => setActiveView('volunteers')}
//                                 >
//                                   {pendingCount} pending approval{pendingCount > 1 ? 's' : ''} - Review Now
//                                 </Button>
//                               )}
//                             </CardContent>
//                           </Card>
//                         </Grid>
//                       );
//                     })
//                   )}
//                 </Grid>

//                 {programs.length > 3 && (
//                   <Button
//                     variant="text"
//                     sx={{ mt: 2 }}
//                     onClick={() => setActiveView('volunteers')}
//                   >
//                     View All Programs →
//                   </Button>
//                 )}
//               </Paper>

//               {/* Charts and Tables - Your existing content */}
//               <Grid container spacing={3}>
//                 <Grid item xs={12} md={8}>
//                   <Paper sx={{ p: 3, borderRadius: '24px' }}>
//                     <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
//                       <Typography variant="h6" fontWeight={900}>Collection Performance</Typography>
//                       <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
//                         <Tab label="Daily" />
//                         <Tab label="Weekly" />
//                         <Tab label="Monthly" />
//                       </Tabs>
//                     </Stack>
                    
//                     <TableContainer>
//                       <Table size="small">
//                         <TableHead>
//                           <TableRow>
//                             <TableCell>Zone</TableCell>
//                             <TableCell align="right">Total (kg)</TableCell>
//                             <TableCell align="right">Collections</TableCell>
//                             <TableCell align="right">Completed</TableCell>
//                             <TableCell align="right">Rate</TableCell>
//                           </TableRow>
//                         </TableHead>
//                         <TableBody>
//                           {Object.entries(analytics.zonePerformance).map(([zone, data]) => (
//                             <TableRow key={zone} hover>
//                               <TableCell fontWeight={600}>{zone}</TableCell>
//                               <TableCell align="right">{analytics.wardData[zone]?.toFixed(1)}</TableCell>
//                               <TableCell align="right">{data.total}</TableCell>
//                               <TableCell align="right">{data.completed}</TableCell>
//                               <TableCell align="right">
//                                 {data.total ? ((data.completed / data.total) * 100).toFixed(0) : 0}%
//                               </TableCell>
//                             </TableRow>
//                           ))}
//                         </TableBody>
//                       </Table>
//                     </TableContainer>
//                   </Paper>
//                 </Grid>
                
//                 <Grid item xs={12} md={4}>
//                   <Paper sx={{ p: 3, borderRadius: '24px', height: '100%' }}>
//                     <Typography variant="h6" fontWeight={900} mb={3}>Recent Activity</Typography>
//                     <Stack spacing={2}>
//                       {reports.slice(0, 5).map((r, i) => (
//                         <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//                           <Avatar sx={{ bgcolor: '#f1f5f9', color: '#0f172a' }}>
//                             {getWasteTypeIcon(r.wasteType)}
//                           </Avatar>
//                           <Box flex={1}>
//                             <Typography variant="body2" fontWeight={700}>{r.resident?.name}</Typography>
//                             <Typography variant="caption" color="text.secondary">{r.address?.zone}</Typography>
//                           </Box>
//                           <Chip label={r.status} size="small" color={getStatusColor(r.status)} />
//                         </Box>
//                       ))}
//                     </Stack>
//                   </Paper>
//                 </Grid>
//               </Grid>
//             </>
//           )}

//           {/* VIEW: FLEET MANAGEMENT - Your existing code unchanged */}
//           {activeView === 'fleet' && (
//             <Box>
//               <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
//                 <Typography variant="h4" fontWeight="900" color="#0f172a">
//                   Fleet Dispatch Center
//                 </Typography>
                
//                 <Stack direction="row" spacing={2}>
//                   <FormControl size="small" sx={{ minWidth: 120 }}>
//                     <InputLabel>Zone</InputLabel>
//                     <Select value={zoneFilter} onChange={(e) => setZoneFilter(e.target.value)} label="Zone">
//                       {uniqueZones.map(z => (
//                         <MenuItem key={z} value={z}>{z === 'all' ? 'All Zones' : z}</MenuItem>
//                       ))}
//                     </Select>
//                   </FormControl>
                  
//                   <FormControl size="small" sx={{ minWidth: 120 }}>
//                     <InputLabel>Status</InputLabel>
//                     <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
//                       <MenuItem value="all">All</MenuItem>
//                       <MenuItem value="Pending">Pending</MenuItem>
//                       <MenuItem value="Scheduled">Scheduled</MenuItem>
//                       <MenuItem value="Completed">Completed</MenuItem>
//                     </Select>
//                   </FormControl>
//                 </Stack>
//               </Stack>

//               <Paper sx={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
//                 <TableContainer>
//                   <Table>
//                     <TableHead sx={{ bgcolor: '#f8fafc' }}>
//                       <TableRow>
//                         <TableCell sx={{ fontWeight: 800 }}>Resident</TableCell>
//                         <TableCell sx={{ fontWeight: 800 }}>Zone</TableCell>
//                         <TableCell sx={{ fontWeight: 800 }}>Waste Type</TableCell>
//                         <TableCell sx={{ fontWeight: 800 }}>Weight</TableCell>
//                         <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
//                         <TableCell sx={{ fontWeight: 800 }}>Collector</TableCell>
//                         <TableCell sx={{ fontWeight: 800 }} align="center">Actions</TableCell>
//                       </TableRow>
//                     </TableHead>
//                     <TableBody>
//                       {loading ? (
//                         <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}><CircularProgress /></TableCell></TableRow>
//                       ) : filteredReports.length === 0 ? (
//                         <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}>No collections found</TableCell></TableRow>
//                       ) : (
//                         filteredReports.map((r) => (
//                           <TableRow key={r._id} hover>
//                             <TableCell fontWeight={700}>{r.resident?.name || 'Unknown'}</TableCell>
//                             <TableCell>{r.address?.zone || 'N/A'}</TableCell>
//                             <TableCell>
//                               <Stack direction="row" spacing={1} alignItems="center">
//                                 {getWasteTypeIcon(r.wasteType)}
//                                 <Chip label={r.wasteType || 'Mixed'} size="small" variant="outlined" />
//                               </Stack>
//                             </TableCell>
//                             <TableCell>{r.actualWeight || r.estimatedWeight || 0} kg</TableCell>
//                             <TableCell>
//                               <Chip 
//                                 label={r.status || 'Pending'} 
//                                 color={getStatusColor(r.status)} 
//                                 size="small" 
//                                 sx={{ fontWeight: 700 }}
//                               />
//                             </TableCell>
//                             <TableCell>
//                               {r.collector ? (
//                                 <Chip 
//                                   avatar={<Avatar>{r.collector.name?.[0]}</Avatar>}
//                                   label={r.collector.name}
//                                   size="small"
//                                 />
//                               ) : (
//                                 <Typography variant="caption" color="text.secondary">Unassigned</Typography>
//                               )}
//                             </TableCell>
//                             <TableCell align="center">
//                               <Stack direction="row" spacing={1} justifyContent="center">
//                                 {r.status === 'Pending' && (
//                                   <>
//                                     <Button 
//                                       variant="contained" 
//                                       size="small" 
//                                       onClick={() => setDispatchDialog({ open: true, collectionId: r._id })}
//                                       sx={{ borderRadius: '8px', fontWeight: 700 }}
//                                     >
//                                       Dispatch
//                                     </Button>
//                                     <Button 
//                                       variant="outlined" 
//                                       size="small"
//                                       onClick={() => setDetailsDialog({ open: true, data: r })}
//                                     >
//                                       Details
//                                     </Button>
//                                   </>
//                                 )}
//                                 {r.status === 'Scheduled' && (
//                                   <Button 
//                                     variant="contained" 
//                                     color="success"
//                                     size="small"
//                                     onClick={() => handleCompleteCollection(r._id)}
//                                     sx={{ borderRadius: '8px', fontWeight: 700 }}
//                                   >
//                                     Complete
//                                   </Button>
//                                 )}
//                                 {r.status === 'Completed' && (
//                                   <Chip icon={<CheckCircle />} label="Done" color="success" size="small" />
//                                 )}
//                               </Stack>
//                             </TableCell>
//                           </TableRow>
//                         ))
//                       )}
//                     </TableBody>
//                   </Table>
//                 </TableContainer>
//               </Paper>
//             </Box>
//           )}

//           {/* VIEW: VOLUNTEERS */}
//           {activeView === 'volunteers' && (
//             <Box>
//               <Typography variant="h4" fontWeight="900" color="#0f172a" mb={4}>
//                 Volunteer Applications
//               </Typography>
              
//               <Grid container spacing={3}>
//                 {analytics.pendingList.length === 0 ? (
//                   <Grid item xs={12}>
//                     <Alert severity="success" sx={{ borderRadius: '16px' }}>
//                       No pending volunteer applications. All caught up!
//                     </Alert>
//                   </Grid>
//                 ) : (
//                   analytics.pendingList.map((v, index) => (
//                     <Grid item xs={12} md={6} key={index}>
//                       <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: 'white', border: '1px solid #e2e8f0' }}>
//                         <Stack direction="row" justifyContent="space-between" alignItems="center">
//                           <Stack direction="row" spacing={2} alignItems="center">
//                             <Avatar sx={{ bgcolor: '#3b82f6', width: 56, height: 56, fontWeight: 900 }}>
//                               {(v.user?.name || 'U')[0]}
//                             </Avatar>
//                             <Box>
//                               <Typography fontWeight={900} variant="h6">{v.user?.name || 'Unknown'}</Typography>
//                               <Typography variant="body2" color="text.secondary">{v.user?.email || 'No email'}</Typography>
//                               <Typography variant="caption" color="text.secondary">Program: {v.progTitle}</Typography>
//                             </Box>
//                           </Stack>
                          
//                           <Stack direction="row" spacing={1}>
//                             <Button 
//                               variant="contained" 
//                               color="success"
//                               sx={{ borderRadius: '12px', fontWeight: 800 }}
//                               onClick={() => handleApproveVolunteer(v.progId, v.user?._id || v.user, v.user?.name)}
//                             >
//                               Approve
//                             </Button>
//                             <Button 
//                               variant="outlined" 
//                               color="error"
//                               sx={{ borderRadius: '12px', fontWeight: 800 }}
//                               onClick={() => handleRejectVolunteer(v.progId, v.user?._id || v.user, v.user?.name)}
//                             >
//                               Reject
//                             </Button>
//                           </Stack>
//                         </Stack>
//                       </Paper>
//                     </Grid>
//                   ))
//                 )}
//               </Grid>
//             </Box>
//           )}

//           {/* VIEW: ANALYTICS */}
//           {activeView === 'analytics' && (
//             <Box>
//               <Typography variant="h4" fontWeight="900" color="#0f172a" mb={4}>
//                 Performance Analytics
//               </Typography>
              
//               <Grid container spacing={3}>
//                 <Grid item xs={12} md={6}>
//                   <Paper sx={{ p: 3, borderRadius: '24px' }}>
//                     <Typography variant="h6" fontWeight={900} mb={3}>Zone Performance</Typography>
//                     <TableContainer>
//                       <Table>
//                         <TableHead>
//                           <TableRow>
//                             <TableCell>Zone</TableCell>
//                             <TableCell align="right">Collections</TableCell>
//                             <TableCell align="right">Weight (kg)</TableCell>
//                             <TableCell align="right">Efficiency</TableCell>
//                           </TableRow>
//                         </TableHead>
//                         <TableBody>
//                           {Object.entries(analytics.zonePerformance).map(([zone, data]) => (
//                             <TableRow key={zone}>
//                               <TableCell fontWeight={600}>{zone}</TableCell>
//                               <TableCell align="right">{data.total}</TableCell>
//                               <TableCell align="right">{analytics.wardData[zone]?.toFixed(1) || 0}</TableCell>
//                               <TableCell align="right">
//                                 {data.total ? ((data.completed / data.total) * 100).toFixed(1) : 0}%
//                               </TableCell>
//                             </TableRow>
//                           ))}
//                         </TableBody>
//                       </Table>
//                     </TableContainer>
//                   </Paper>
//                 </Grid>
                
//                 <Grid item xs={12} md={6}>
//                   <Paper sx={{ p: 3, borderRadius: '24px' }}>
//                     <Typography variant="h6" fontWeight={900} mb={3}>Waste Composition</Typography>
//                     <Stack spacing={2}>
//                       {['Plastic', 'Paper', 'Glass', 'Metal', 'Organic'].map(type => {
//                         const amount = reports.filter(r => r.wasteType === type).reduce((a, r) => a + (r.actualWeight || 0), 0);
//                         const percentage = analytics.totalWaste ? ((amount / analytics.totalWaste) * 100).toFixed(1) : 0;
//                         return (
//                           <Box key={type}>
//                             <Stack direction="row" justifyContent="space-between" mb={1}>
//                               <Typography variant="body2">{type}</Typography>
//                               <Typography variant="body2" fontWeight={700}>{amount.toFixed(1)}kg ({percentage}%)</Typography>
//                             </Stack>
//                             <LinearProgress 
//                               variant="determinate" 
//                               value={percentage} 
//                               sx={{ height: 8, borderRadius: 4 }}
//                             />
//                           </Box>
//                         );
//                       })}
//                     </Stack>
//                   </Paper>
//                 </Grid>
//               </Grid>
//             </Box>
//           )}

//           {/* VIEW: ZONE MAP */}
//           {activeView === 'locations' && (
//             <Box>
//               <Typography variant="h4" fontWeight="900" color="#0f172a" mb={4}>
//                 Zone Map
//               </Typography>
//               <Paper sx={{ p: 6, borderRadius: '24px', textAlign: 'center', bgcolor: '#f1f5f9' }}>
//                 <Map sx={{ fontSize: 80, color: '#94a3b8', mb: 2 }} />
//                 <Typography variant="h6" color="text.secondary">Interactive Map View</Typography>
//                 <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto', mt: 1 }}>
//                   Showing {uniqueZones.length - 1} active zones with {reports.length} collection points
//                 </Typography>
//               </Paper>
//             </Box>
//           )}

//           {/* VIEW: SETTINGS */}
//           {activeView === 'settings' && (
//             <Box>
//               <Typography variant="h4" fontWeight="900" color="#0f172a" mb={4}>
//                 System Settings
//               </Typography>
              
//               <Grid container spacing={3}>
//                 <Grid item xs={12} md={6}>
//                   <Paper sx={{ p: 3, borderRadius: '24px' }}>
//                     <Typography variant="h6" fontWeight={900} mb={3}>General Settings</Typography>
//                     <Stack spacing={2}>
//                       <FormControlLabel control={<Switch defaultChecked />} label="Enable Notifications" />
//                       <FormControlLabel control={<Switch defaultChecked />} label="Auto-assign Collectors" />
//                       <FormControlLabel control={<Switch />} label="Maintenance Mode" />
//                       <FormControlLabel control={<Switch defaultChecked />} label="Real-time Tracking" />
//                     </Stack>
//                   </Paper>
//                 </Grid>
                
//                 <Grid item xs={12} md={6}>
//                   <Paper sx={{ p: 3, borderRadius: '24px' }}>
//                     <Typography variant="h6" fontWeight={900} mb={3}>Programs Management</Typography>
//                     <TableContainer>
//                       <Table size="small">
//                         <TableHead>
//                           <TableRow>
//                             <TableCell>Program</TableCell>
//                             <TableCell align="right">Volunteers</TableCell>
//                             <TableCell align="center">Actions</TableCell>
//                           </TableRow>
//                         </TableHead>
//                         <TableBody>
//                           {programs.slice(0, 5).map((prog) => (
//                             <TableRow key={prog._id}>
//                               <TableCell>{prog.title}</TableCell>
//                               <TableCell align="right">{prog.volunteers?.length || 0}</TableCell>
//                               <TableCell align="center">
//                                 <IconButton 
//                                   size="small" 
//                                   color="error"
//                                   onClick={() => handleDeleteProgram(prog._id)}
//                                 >
//                                   <DeleteSweep />
//                                 </IconButton>
//                               </TableCell>
//                             </TableRow>
//                           ))}
//                         </TableBody>
//                       </Table>
//                     </TableContainer>
//                   </Paper>
//                 </Grid>
//               </Grid>
//             </Box>
//           )}
//         </Container>
//       </Box>

//       {/* Program Dialog */}
//       <Dialog 
//         open={programDialog.open} 
//         onClose={handleCloseProgramDialog}
//         maxWidth="md"
//         fullWidth
//         PaperProps={{ sx: { borderRadius: '24px', p: 2 } }}
//       >
//         <DialogTitle sx={{ fontWeight: 900 }}>
//           {programDialog.mode === 'create' ? 'Create New Program' : 'Edit Program'}
//         </DialogTitle>
//         <DialogContent>
//           <Stack spacing={3} sx={{ mt: 2 }}>
//             <TextField
//               label="Program Title"
//               fullWidth
//               value={programForm.title}
//               onChange={(e) => setProgramForm({ ...programForm, title: e.target.value })}
//               required
//             />
            
//             <TextField
//               label="Organization"
//               fullWidth
//               value={programForm.organization}
//               onChange={(e) => setProgramForm({ ...programForm, organization: e.target.value })}
//             />
            
//             <TextField
//               label="Description"
//               fullWidth
//               multiline
//               rows={3}
//               value={programForm.description}
//               onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
//               placeholder="Describe the program and what volunteers will do"
//             />
            
//             <Grid container spacing={2}>
//               <Grid item xs={6}>
//                 <TextField
//                   label="Zone"
//                   fullWidth
//                   value={programForm.zone}
//                   onChange={(e) => setProgramForm({ ...programForm, zone: e.target.value })}
//                   placeholder="e.g., North, Central, South"
//                 />
//               </Grid>
//               <Grid item xs={6}>
//                 <TextField
//                   label="Location"
//                   fullWidth
//                   value={programForm.location}
//                   onChange={(e) => setProgramForm({ ...programForm, location: e.target.value })}
//                   placeholder="e.g., Central Park, Community Center"
//                 />
//               </Grid>
//             </Grid>
            
//             <Grid container spacing={2}>
//               <Grid item xs={6}>
//                 <TextField
//                   label="Start Date"
//                   type="date"
//                   fullWidth
//                   InputLabelProps={{ shrink: true }}
//                   value={programForm.startDate}
//                   onChange={(e) => setProgramForm({ ...programForm, startDate: e.target.value })}
//                 />
//               </Grid>
//               <Grid item xs={6}>
//                 <TextField
//                   label="End Date"
//                   type="date"
//                   fullWidth
//                   InputLabelProps={{ shrink: true }}
//                   value={programForm.endDate}
//                   onChange={(e) => setProgramForm({ ...programForm, endDate: e.target.value })}
//                 />
//               </Grid>
//             </Grid>
            
//             <Grid container spacing={2}>
//               <Grid item xs={6}>
//                 <TextField
//                   label="Max Volunteers"
//                   type="number"
//                   fullWidth
//                   value={programForm.maxVolunteers}
//                   onChange={(e) => setProgramForm({ ...programForm, maxVolunteers: parseInt(e.target.value) })}
//                   InputProps={{ inputProps: { min: 1 } }}
//                 />
//               </Grid>
//               <Grid item xs={6}>
//                 <TextField
//                   label="Reward Coins"
//                   type="number"
//                   fullWidth
//                   value={programForm.rewardCoins}
//                   onChange={(e) => setProgramForm({ ...programForm, rewardCoins: parseInt(e.target.value) })}
//                   InputProps={{ inputProps: { min: 0 } }}
//                   helperText="Residents earn this many coins when approved"
//                 />
//               </Grid>
//             </Grid>
            
//             <TextField
//               label="Requirements"
//               fullWidth
//               multiline
//               rows={2}
//               value={programForm.requirements}
//               onChange={(e) => setProgramForm({ ...programForm, requirements: e.target.value })}
//               placeholder="Any specific requirements for volunteers? (e.g., Must be 18+, Bring own gloves)"
//             />
            
//             <TextField
//               label="Benefits"
//               fullWidth
//               multiline
//               rows={2}
//               value={programForm.benefits}
//               onChange={(e) => setProgramForm({ ...programForm, benefits: e.target.value })}
//               placeholder="What do volunteers gain? (e.g., Certificate, Refreshments)"
//             />
//           </Stack>
//         </DialogContent>
//         <DialogActions sx={{ p: 3 }}>
//           <Button onClick={handleCloseProgramDialog}>Cancel</Button>
//           <Button 
//             variant="contained" 
//             onClick={handleSaveProgram}
//             disabled={!programForm.title}
//           >
//             {programDialog.mode === 'create' ? 'Create Program' : 'Update Program'}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Volunteers List Dialog */}
//       <VolunteersDialog 
//         program={selectedProgram} 
//         onClose={() => setSelectedProgram(null)} 
//       />

//       {/* DISPATCH DIALOG */}
//       <Dialog 
//         open={dispatchDialog.open} 
//         onClose={() => setDispatchDialog({ open: false, collectionId: null })} 
//         PaperProps={{ sx: { borderRadius: '24px', p: 2, minWidth: '400px' } }}
//       >
//         <DialogTitle sx={{ fontWeight: 900 }}>Assign Collector</DialogTitle>
//         <DialogContent>
//           <Typography variant="body2" mb={3}>
//             Select a collector to dispatch to this location.
//           </Typography>
//           <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
//             <InputLabel>Available Collectors</InputLabel>
//             <Select 
//               value={selectedCollector} 
//               onChange={(e) => setSelectedCollector(e.target.value)}
//               label="Available Collectors"
//             >
//               {collectors.length === 0 ? (
//                 <MenuItem disabled>No collectors available</MenuItem>
//               ) : (
//                 collectors.map((c) => (
//                   <MenuItem key={c._id} value={c._id}>
//                     <Stack direction="row" spacing={1} alignItems="center">
//                       <Avatar sx={{ width: 24, height: 24 }}>{c.name?.[0]}</Avatar>
//                       <span>{c.name}</span>
//                     </Stack>
//                   </MenuItem>
//                 ))
//               )}
//             </Select>
//           </FormControl>
//         </DialogContent>
//         <DialogActions sx={{ p: 3 }}>
//           <Button onClick={() => setDispatchDialog({ open: false, collectionId: null })}>
//             Cancel
//           </Button>
//           <Button 
//             variant="contained" 
//             onClick={handleDispatch}
//             disabled={!selectedCollector}
//           >
//             Confirm Dispatch
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* DETAILS DIALOG */}
//       <Dialog 
//         open={detailsDialog.open} 
//         onClose={() => setDetailsDialog({ open: false, data: null })}
//         maxWidth="sm"
//         fullWidth
//         PaperProps={{ sx: { borderRadius: '24px' } }}
//       >
//         {detailsDialog.data && (
//           <>
//             <DialogTitle sx={{ fontWeight: 900 }}>Collection Details</DialogTitle>
//             <DialogContent>
//               <Stack spacing={2} sx={{ mt: 2 }}>
//                 <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                   <Typography fontWeight={700}>Resident:</Typography>
//                   <Typography>{detailsDialog.data.resident?.name || 'Unknown'}</Typography>
//                 </Box>
//                 <Divider />
//                 <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                   <Typography fontWeight={700}>Zone:</Typography>
//                   <Typography>{detailsDialog.data.address?.zone || 'N/A'}</Typography>
//                 </Box>
//                 <Divider />
//                 <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                   <Typography fontWeight={700}>Waste Type:</Typography>
//                   <Chip label={detailsDialog.data.wasteType || 'Mixed'} size="small" />
//                 </Box>
//                 <Divider />
//                 <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                   <Typography fontWeight={700}>Weight:</Typography>
//                   <Typography>{detailsDialog.data.actualWeight || detailsDialog.data.estimatedWeight || 0} kg</Typography>
//                 </Box>
//                 <Divider />
//                 <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                   <Typography fontWeight={700}>Status:</Typography>
//                   <Chip 
//                     label={detailsDialog.data.status} 
//                     color={getStatusColor(detailsDialog.data.status)}
//                     size="small"
//                   />
//                 </Box>
//                 <Divider />
//                 <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                   <Typography fontWeight={700}>Address:</Typography>
//                   <Typography align="right">
//                     {detailsDialog.data.address?.street}, {detailsDialog.data.address?.city}
//                   </Typography>
//                 </Box>
//               </Stack>
//             </DialogContent>
//             <DialogActions>
//               <Button onClick={() => setDetailsDialog({ open: false, data: null })}>Close</Button>
//             </DialogActions>
//           </>
//         )}
//       </Dialog>
//     </Box>
//   );
// };

// export default AdminDashboard;

// ============================================================
// ADMIN FEATURE 1: System-Wide Dashboard
// FILE: frontend/src/pages/AdminDashboard.jsx
// Route: /admin/dashboard
// ============================================================
// Tabs:
//   0 — Overview   (KPI cards, live feed, quick actions)
//   1 — Analytics  (30-day charts, zone breakdown, waste types)
//   2 — Users      (searchable, filterable user table)
//   3 — Collections (live collection feed with assign)
// ============================================================

// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   Box, Container, Grid, Paper, Typography, Button,
//   Stack, Avatar, Chip, Divider, Table, TableBody,
//   TableCell, TableContainer, TableHead, TableRow,
//   LinearProgress, Skeleton, Alert, IconButton,
//   Drawer, TextField, InputAdornment, Select,
//   MenuItem, FormControl, InputLabel, Dialog,
//   DialogTitle, DialogContent, DialogActions, Badge
// } from '@mui/material';
// import {
//   Dashboard, People, LocalShipping, Payment,
//   RecyclingRounded, TrendingUp, CheckCircle,
//   PendingActions, Warning, EmojiEvents, Logout,
//   Menu, Search, VolunteerActivism, BarChart,
//   AssignmentTurnedIn, PersonAdd, Refresh, Scale,
//   Circle
// } from '@mui/icons-material';
// import {
//   BarChart as ReBarChart, Bar, XAxis, YAxis,
//   CartesianGrid, Tooltip, ResponsiveContainer,
//   PieChart, Pie, Cell, Legend
// } from 'recharts';
// import { useAuth }     from '../context/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import { useSocket }   from '../context/SocketContext';
// import api             from '../services/api';
// import { toast }       from 'react-toastify';
// import { format, formatDistanceToNow } from 'date-fns';

// // ── Color constants ───────────────────────────────────────────
// const ZONE_COLORS  = ['#16a34a', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];
// const WASTE_COLORS = { Organic:'#16a34a', Recyclable:'#3b82f6', Hazardous:'#ef4444', Mixed:'#64748b', Plastic:'#a855f7', Paper:'#f97316', Glass:'#06b6d4', Metal:'#78716c' };

// const STATUS_COLOR = {
//   Pending: '#f59e0b', Scheduled: '#3b82f6',
//   'In Progress': '#8b5cf6', Collected: '#16a34a', Skipped: '#ef4444',
// };

// // ── KPI card ──────────────────────────────────────────────────
// const KpiCard = ({ icon, label, value, sub, color, alert, loading }) => (
//   <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${alert ? '#fecaca' : '#e2e8f0'}`,
//     bgcolor: alert ? '#fef2f2' : 'white', height: '100%' }}>
//     {loading ? <Skeleton height={80} /> : (
//       <Stack spacing={1.5}>
//         <Stack direction="row" justifyContent="space-between" alignItems="center">
//           <Typography variant="caption" color={alert ? 'error' : 'text.secondary'}
//             fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
//             {label}
//           </Typography>
//           <Avatar sx={{ bgcolor: `${color}15`, color, width: 36, height: 36 }}>{icon}</Avatar>
//         </Stack>
//         <Typography variant="h4" fontWeight={900} color={alert ? 'error.main' : '#0f172a'} lineHeight={1}>
//           {value}
//         </Typography>
//         {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
//       </Stack>
//     )}
//   </Paper>
// );

// // ── Custom tooltip ────────────────────────────────────────────
// const ChartTooltip = ({ active, payload, label }) => {
//   if (!active || !payload?.length) return null;
//   return (
//     <Paper elevation={3} sx={{ p: 2, borderRadius: 2, border: '1px solid #e2e8f0' }}>
//       <Typography variant="caption" fontWeight={800} color="#0f172a">{label}</Typography>
//       {payload.map(p => (
//         <Stack key={p.dataKey} direction="row" spacing={1} alignItems="center" mt={0.5}>
//           <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: p.color }} />
//           <Typography variant="caption" color="text.secondary">
//             {p.name}: <strong>{p.value}{p.dataKey === 'weight' ? ' kg' : p.dataKey === 'revenue' ? ' Rs' : ''}</strong>
//           </Typography>
//         </Stack>
//       ))}
//     </Paper>
//   );
// };

// // ── Main component ─────────────────────────────────────────────
// const AdminDashboard = () => {
//   const { user, logout } = useAuth();
//   const navigate         = useNavigate();
//   const { socket }       = useSocket?.() || {};

//   const [activeTab,     setActiveTab]     = useState(0);
//   const [kpis,          setKpis]          = useState(null);
//   const [recentCols,    setRecentCols]    = useState([]);
//   const [recentPay,     setRecentPay]     = useState([]);
//   const [analytics,     setAnalytics]     = useState(null);
//   const [users,         setUsers]         = useState([]);
//   const [allCollectors, setAllCollectors] = useState([]);
//   const [loading,       setLoading]       = useState(true);
//   const [mobileOpen,    setMobileOpen]    = useState(false);

//   // Users tab filters
//   const [userSearch,  setUserSearch]  = useState('');
//   const [userRole,    setUserRole]    = useState('');
//   const [userStatus,  setUserStatus]  = useState('');

//   // Assign dialog
//   const [assignDialog, setAssignDialog] = useState({ open: false, collectionId: null });
//   const [assignTo,     setAssignTo]     = useState('');
//   const [assigning,    setAssigning]    = useState(false);

//   // ── Fetch ──────────────────────────────────────────────────
//   const fetchDashboard = useCallback(async () => {
//     try {
//       setLoading(true);
//       const res = await api.get('/admin/dashboard');
//       setKpis(res.data.kpis);
//       setRecentCols(res.data.recentCollections || []);
//       setRecentPay(res.data.recentPayments || []);
//     } catch { toast.error('Failed to load dashboard'); }
//     finally { setLoading(false); }
//   }, []);

//   const fetchAnalytics = useCallback(async () => {
//     try {
//       const res = await api.get('/admin/analytics');
//       setAnalytics(res.data);
//     } catch { toast.error('Failed to load analytics'); }
//   }, []);

//   const fetchUsers = useCallback(async () => {
//     try {
//       const params = new URLSearchParams();
//       if (userRole)   params.append('role', userRole);
//       if (userStatus) params.append('paymentStatus', userStatus);
//       if (userSearch) params.append('search', userSearch);
//       const res = await api.get(`/admin/users?${params}`);
//       setUsers(res.data.users || []);
//     } catch { toast.error('Failed to load users'); }
//   }, [userRole, userStatus, userSearch]);

//   const fetchCollectors = useCallback(async () => {
//     try {
//       const res = await api.get('/admin/users?role=collector&limit=50');
//       setAllCollectors(res.data.users || []);
//     } catch {}
//   }, []);

//   useEffect(() => { fetchDashboard(); fetchAnalytics(); fetchCollectors(); }, [fetchDashboard, fetchAnalytics, fetchCollectors]);
//   useEffect(() => { if (activeTab === 2) fetchUsers(); }, [activeTab, fetchUsers]);

//   // ── Socket: real-time collection/payment events ───────────
//   useEffect(() => {
//     if (!socket) return;
//     const refresh = () => fetchDashboard();
//     socket.on('new_collection_request', refresh);
//     socket.on('collection_updated',     refresh);
//     socket.on('payment_success',        refresh);
//     return () => {
//       socket.off('new_collection_request', refresh);
//       socket.off('collection_updated',     refresh);
//       socket.off('payment_success',        refresh);
//     };
//   }, [socket, fetchDashboard]);

//   // ── Assign collection ──────────────────────────────────────
//   const handleAssign = async () => {
//     if (!assignTo) { toast.warning('Select a collector'); return; }
//     try {
//       setAssigning(true);
//       await api.put(`/admin/collections/${assignDialog.collectionId}/assign`, { collectorId: assignTo });
//       toast.success('Collector assigned!');
//       setAssignDialog({ open: false, collectionId: null });
//       setAssignTo('');
//       fetchDashboard();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Assignment failed');
//     } finally { setAssigning(false); }
//   };

//   // ── Sidebar ────────────────────────────────────────────────
//   const navItems = [
//     { label: 'Overview',      icon: <Dashboard />,          tab: 0 },
//     { label: 'Analytics',     icon: <BarChart />,            tab: 1 },
//     { label: 'Users',         icon: <People />,              tab: 2 },
//     { label: 'Collections',   icon: <LocalShipping />,       tab: 3 },
//     { label: 'Programs',      icon: <VolunteerActivism />,   path: '/admin/programs' },
//     { label: 'Payments',      icon: <Payment />,             path: '/admin/payments' },
//   ];

//   const SidebarContent = () => (
//     <Box sx={{ height: '100%', bgcolor: '#0f172a', display: 'flex', flexDirection: 'column' }}>
//       <Box sx={{ px: 3, py: 3.5 }}>
//         <Stack direction="row" spacing={1.5} alignItems="center">
//           <Avatar sx={{ bgcolor: '#16a34a', width: 36, height: 36 }}>
//             <RecyclingRounded fontSize="small" />
//           </Avatar>
//           <Box>
//             <Typography variant="subtitle2" fontWeight={900} color="white">SWMS Admin</Typography>
//             <Typography variant="caption" sx={{ color: '#64748b' }}>Control Panel</Typography>
//           </Box>
//         </Stack>
//       </Box>
//       <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)' }} />
//       <Box sx={{ flexGrow: 1, px: 2, pt: 2 }}>
//         {navItems.map((item) => {
//           const active = item.tab === activeTab;
//           return (
//             <Box key={item.label}
//               onClick={() => { item.tab !== undefined ? setActiveTab(item.tab) : navigate(item.path); setMobileOpen(false); }}
//               sx={{
//                 display: 'flex', alignItems: 'center', gap: 1.5,
//                 px: 2, py: 1.5, borderRadius: 2, mb: 0.5, cursor: 'pointer',
//                 bgcolor: active ? '#16a34a' : 'transparent',
//                 '&:hover': { bgcolor: active ? '#15803d' : 'rgba(255,255,255,0.05)' },
//               }}>
//               <Box sx={{ color: 'white' }}>{item.icon}</Box>
//               <Typography fontSize="0.9rem" fontWeight={active ? 800 : 500} color="white" sx={{ flexGrow: 1 }}>
//                 {item.label}
//               </Typography>
//               {item.label === 'Programs' && kpis?.programs?.pendingApprovals > 0 && (
//                 <Chip label={kpis.programs.pendingApprovals} size="small"
//                   sx={{ bgcolor: '#ef4444', color: 'white', fontWeight: 900, height: 20, fontSize: '0.72rem' }} />
//               )}
//             </Box>
//           );
//         })}
//       </Box>
//       <Box sx={{ p: 2 }}>
//         <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)', mb: 2 }} />
//         <Button fullWidth variant="text" color="error" startIcon={<Logout />}
//           onClick={() => { logout(); navigate('/login'); }}
//           sx={{ fontWeight: 700, justifyContent: 'flex-start', px: 2 }}>
//           Sign Out
//         </Button>
//       </Box>
//     </Box>
//   );

//   return (
//     <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f1f5f9' }}>

//       {/* Mobile Drawer */}
//       <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)}
//         sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: 260, border: 'none' } }}>
//         <SidebarContent />
//       </Drawer>

//       {/* Desktop Sidebar */}
//       <Box sx={{ width: 260, flexShrink: 0, display: { xs: 'none', md: 'block' }, position: 'sticky', top: 0, height: '100vh' }}>
//         <SidebarContent />
//       </Box>

//       {/* Main */}
//       <Box sx={{ flexGrow: 1, p: { xs: 2, md: 5 } }}>
//         <Container maxWidth="xl" disableGutters>

//           {/* Mobile header */}
//           <Box sx={{ display: { md: 'none' }, mb: 2 }}>
//             <IconButton onClick={() => setMobileOpen(true)}><Menu /></IconButton>
//           </Box>

//           {/* Page title */}
//           <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
//             <Box>
//               <Typography variant="h4" fontWeight={900} color="#0f172a">
//                 {['System Overview', 'Analytics', 'User Management', 'Live Collections'][activeTab]}
//               </Typography>
//               <Typography variant="body2" color="text.secondary" mt={0.5}>
//                 Welcome back, {user?.name} · {format(new Date(), 'EEEE, MMMM d')}
//               </Typography>
//             </Box>
//             <Button variant="outlined" startIcon={<Refresh />}
//               onClick={fetchDashboard}
//               sx={{ fontWeight: 700, borderRadius: 2, borderColor: '#16a34a', color: '#16a34a' }}>
//               Refresh
//             </Button>
//           </Stack>

//           {/* ── TAB 0: OVERVIEW ── */}
//           {activeTab === 0 && (
//             <Box>
//               {/* Alert: pending volunteer approvals */}
//               {kpis?.programs?.pendingApprovals > 0 && (
//                 <Alert severity="warning" sx={{ borderRadius: 3, mb: 3, fontWeight: 600 }}
//                   action={<Button size="small" onClick={() => navigate('/admin/programs')} sx={{ fontWeight: 800 }}>Review</Button>}>
//                   {kpis.programs.pendingApprovals} volunteer application{kpis.programs.pendingApprovals > 1 ? 's' : ''} awaiting approval
//                 </Alert>
//               )}
//               {kpis?.users?.unpaid > 0 && (
//                 <Alert severity="info" sx={{ borderRadius: 3, mb: 3, fontWeight: 600 }}>
//                   {kpis.users.unpaid} resident{kpis.users.unpaid > 1 ? 's' : ''} have not yet paid this month's fee
//                 </Alert>
//               )}

//               {/* KPI row 1 */}
//               <Grid container spacing={2} mb={3}>
//                 <Grid item xs={6} sm={3}><KpiCard loading={loading} icon={<People fontSize="small" />} label="Residents" value={kpis?.users?.residents ?? '–'} sub={`${kpis?.users?.collectors ?? 0} collectors`} color="#3b82f6" /></Grid>
//                 <Grid item xs={6} sm={3}><KpiCard loading={loading} icon={<CheckCircle fontSize="small" />} label="Collected Today" value={kpis?.today?.collected ?? '–'} sub={`${kpis?.today?.weight ?? 0} kg`} color="#16a34a" /></Grid>
//                 <Grid item xs={6} sm={3}><KpiCard loading={loading} icon={<PendingActions fontSize="small" />} label="Pending Jobs" value={kpis?.collections?.pending ?? '–'} sub="awaiting collector" color="#f59e0b" alert={(kpis?.collections?.pending ?? 0) > 20} /></Grid>
//                 <Grid item xs={6} sm={3}><KpiCard loading={loading} icon={<Payment fontSize="small" />} label="Revenue (30d)" value={`Rs. ${(kpis?.revenue?.last30Days ?? 0).toLocaleString()}`} sub={`${kpis?.revenue?.freeRedemptions ?? 0} coin redemptions`} color="#16a34a" /></Grid>
//               </Grid>

//               {/* KPI row 2 */}
//               <Grid container spacing={2} mb={4}>
//                 <Grid item xs={6} sm={3}><KpiCard loading={loading} icon={<AssignmentTurnedIn fontSize="small" />} label="Completion Rate" value={`${kpis?.collections?.completionRate ?? 0}%`} sub={`${kpis?.collections?.collected ?? 0} of ${kpis?.collections?.total ?? 0}`} color="#8b5cf6" /></Grid>
//                 <Grid item xs={6} sm={3}><KpiCard loading={loading} icon={<Scale fontSize="small" />} label="Total Weight" value={`${kpis?.collections?.totalWeight ?? 0}kg`} sub="all time" color="#06b6d4" /></Grid>
//                 <Grid item xs={6} sm={3}><KpiCard loading={loading} icon={<VolunteerActivism fontSize="small" />} label="Active Programs" value={kpis?.programs?.active ?? '–'} sub={`${kpis?.programs?.totalVolunteers ?? 0} volunteers`} color="#16a34a" /></Grid>
//                 <Grid item xs={6} sm={3}><KpiCard loading={loading} icon={<EmojiEvents fontSize="small" />} label="Paid Users" value={kpis?.users?.paidThisMonth ?? '–'} sub={`${kpis?.users?.freeService ?? 0} on free service`} color="#f59e0b" /></Grid>
//               </Grid>

//               {/* Recent collections + payments */}
//               <Grid container spacing={3}>
//                 <Grid item xs={12} md={7}>
//                   <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
//                     <Stack direction="row" justifyContent="space-between" alignItems="center" p={3} borderBottom="1px solid #f1f5f9">
//                       <Typography fontWeight={900} color="#0f172a">Recent Collections</Typography>
//                       <Button size="small" onClick={() => setActiveTab(3)} sx={{ fontWeight: 700 }}>View All</Button>
//                     </Stack>
//                     {loading ? <Box p={3}><Skeleton height={40} /><Skeleton height={40} /><Skeleton height={40} /></Box> : (
//                       <TableContainer>
//                         <Table size="small">
//                           <TableHead sx={{ bgcolor: '#f8fafc' }}>
//                             <TableRow>
//                               <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Resident</TableCell>
//                               <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Zone</TableCell>
//                               <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Type</TableCell>
//                               <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Status</TableCell>
//                               <TableCell sx={{ fontWeight: 800, color: '#475569' }}>When</TableCell>
//                             </TableRow>
//                           </TableHead>
//                           <TableBody>
//                             {recentCols.map(c => (
//                               <TableRow key={c._id} hover sx={{ '&:last-child td': { border: 0 } }}>
//                                 <TableCell><Typography variant="body2" fontWeight={700}>{c.resident?.name || '–'}</Typography></TableCell>
//                                 <TableCell><Typography variant="caption">{c.address?.zone?.toUpperCase()}</Typography></TableCell>
//                                 <TableCell><Chip label={c.wasteType} size="small" sx={{ fontWeight: 700 }} /></TableCell>
//                                 <TableCell>
//                                   <Chip label={c.status} size="small"
//                                     sx={{ fontWeight: 700, bgcolor: `${STATUS_COLOR[c.status]}18`, color: STATUS_COLOR[c.status] }} />
//                                 </TableCell>
//                                 <TableCell><Typography variant="caption" color="text.secondary">{formatDistanceToNow(new Date(c.updatedAt), { addSuffix: true })}</Typography></TableCell>
//                               </TableRow>
//                             ))}
//                           </TableBody>
//                         </Table>
//                       </TableContainer>
//                     )}
//                   </Paper>
//                 </Grid>

//                 <Grid item xs={12} md={5}>
//                   <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', overflow: 'hidden', height: '100%' }}>
//                     <Stack direction="row" justifyContent="space-between" alignItems="center" p={3} borderBottom="1px solid #f1f5f9">
//                       <Typography fontWeight={900} color="#0f172a">Recent Payments</Typography>
//                     </Stack>
//                     {loading ? <Box p={3}><Skeleton height={40} /><Skeleton height={40} /></Box> : (
//                       <Stack p={2} spacing={1.5}>
//                         {recentPay.length === 0 ? (
//                           <Typography variant="body2" color="text.secondary" p={2}>No payments yet</Typography>
//                         ) : recentPay.map(p => (
//                           <Stack key={p._id} direction="row" justifyContent="space-between" alignItems="center"
//                             sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2 }}>
//                             <Stack direction="row" spacing={1.5} alignItems="center">
//                               <Avatar sx={{ bgcolor: '#f0fdf4', color: '#16a34a', width: 32, height: 32 }}>
//                                 <Payment fontSize="small" />
//                               </Avatar>
//                               <Box>
//                                 <Typography variant="body2" fontWeight={700}>{p.user?.name || '–'}</Typography>
//                                 <Typography variant="caption" color="text.secondary">
//                                   {p.isFreeService ? 'Coin Redemption' : p.paymentMethod}
//                                 </Typography>
//                               </Box>
//                             </Stack>
//                             <Box textAlign="right">
//                               <Typography variant="body2" fontWeight={900} color="#16a34a">
//                                 {p.isFreeService ? '🎉 FREE' : `Rs. ${p.amount}`}
//                               </Typography>
//                               <Typography variant="caption" color="text.secondary">
//                                 {formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })}
//                               </Typography>
//                             </Box>
//                           </Stack>
//                         ))}
//                       </Stack>
//                     )}
//                   </Paper>
//                 </Grid>
//               </Grid>
//             </Box>
//           )}

//           {/* ── TAB 1: ANALYTICS ── */}
//           {activeTab === 1 && (
//             <Box>
//               {/* Landfill capacity */}
//               {analytics && (
//                 <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', p: 4, mb: 4 }}>
//                   <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
//                     <Typography fontWeight={900} color="#0f172a">Landfill Capacity</Typography>
//                     <Chip
//                       label={`${analytics.landfillCapacity.percentage}% Used`}
//                       color={analytics.landfillCapacity.percentage > 80 ? 'error' : analytics.landfillCapacity.percentage > 60 ? 'warning' : 'success'}
//                       sx={{ fontWeight: 800 }}
//                     />
//                   </Stack>
//                   <LinearProgress variant="determinate" value={analytics.landfillCapacity.percentage}
//                     sx={{ height: 16, borderRadius: 8,
//                       bgcolor: '#e2e8f0',
//                       '& .MuiLinearProgress-bar': {
//                         background: analytics.landfillCapacity.percentage > 80
//                           ? 'linear-gradient(90deg,#ef4444,#dc2626)'
//                           : 'linear-gradient(90deg,#16a34a,#22d3ee)',
//                         borderRadius: 8,
//                       },
//                     }} />
//                   <Typography variant="body2" color="text.secondary" mt={1}>
//                     {analytics.landfillCapacity.used.toLocaleString()} kg of {analytics.landfillCapacity.total.toLocaleString()} kg capacity
//                   </Typography>
//                 </Paper>
//               )}

//               {/* 30-day bar chart */}
//               <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', p: 4, mb: 4 }}>
//                 <Typography fontWeight={900} color="#0f172a" mb={3}>Last 30 Days — Collections & Revenue</Typography>
//                 {!analytics ? <Skeleton height={280} sx={{ borderRadius: 3 }} /> : (
//                   <ResponsiveContainer width="100%" height={280}>
//                     <ReBarChart data={analytics.daily} barSize={10} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
//                       <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval={4} />
//                       <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
//                       <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
//                       <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
//                       <Bar dataKey="collected" name="Collected" fill="#16a34a" radius={[3,3,0,0]} />
//                       <Bar dataKey="skipped"   name="Skipped"   fill="#ef4444" radius={[3,3,0,0]} />
//                     </ReBarChart>
//                   </ResponsiveContainer>
//                 )}
//               </Paper>

//               {/* Zone + Waste type */}
//               <Grid container spacing={3}>
//                 <Grid item xs={12} md={6}>
//                   <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', p: 4 }}>
//                     <Typography fontWeight={900} color="#0f172a" mb={3}>Waste by Zone</Typography>
//                     {!analytics ? <Skeleton height={200} /> : analytics.zones.length === 0 ? (
//                       <Typography color="text.secondary">No data yet</Typography>
//                     ) : (
//                       <Stack spacing={2}>
//                         {analytics.zones.map((z, i) => (
//                           <Box key={z.zone}>
//                             <Stack direction="row" justifyContent="space-between" mb={0.8}>
//                               <Typography variant="body2" fontWeight={700} color="#0f172a">{z.zone}</Typography>
//                               <Stack direction="row" spacing={1.5}>
//                                 <Typography variant="caption" color="text.secondary">{z.weight} kg</Typography>
//                                 <Chip label={`${z.percent}%`} size="small"
//                                   sx={{ fontWeight: 800, bgcolor: `${ZONE_COLORS[i % ZONE_COLORS.length]}15`,
//                                     color: ZONE_COLORS[i % ZONE_COLORS.length], height: 20, fontSize: '0.72rem' }} />
//                               </Stack>
//                             </Stack>
//                             <LinearProgress variant="determinate" value={z.percent}
//                               sx={{ height: 8, borderRadius: 4, bgcolor: `${ZONE_COLORS[i % ZONE_COLORS.length]}15`,
//                                 '& .MuiLinearProgress-bar': { bgcolor: ZONE_COLORS[i % ZONE_COLORS.length], borderRadius: 4 } }} />
//                           </Box>
//                         ))}
//                       </Stack>
//                     )}
//                   </Paper>
//                 </Grid>

//                 <Grid item xs={12} md={6}>
//                   <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', p: 4 }}>
//                     <Typography fontWeight={900} color="#0f172a" mb={3}>Waste Type Distribution</Typography>
//                     {!analytics || analytics.wasteTypes.length === 0 ? (
//                       <Typography color="text.secondary">No data yet</Typography>
//                     ) : (
//                       <ResponsiveContainer width="100%" height={220}>
//                         <PieChart>
//                           <Pie data={analytics.wasteTypes} dataKey="count" nameKey="type"
//                             cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
//                             {analytics.wasteTypes.map((t) => (
//                               <Cell key={t.type} fill={WASTE_COLORS[t.type] || '#64748b'} />
//                             ))}
//                           </Pie>
//                           <Tooltip formatter={(val, name) => [`${val} collections`, name]} />
//                           <Legend
//                             formatter={(v) => <span style={{ fontSize: 12, fontWeight: 600 }}>{v}</span>}
//                           />
//                         </PieChart>
//                       </ResponsiveContainer>
//                     )}
//                   </Paper>
//                 </Grid>
//               </Grid>
//             </Box>
//           )}

//           {/* ── TAB 2: USERS ── */}
//           {activeTab === 2 && (
//             <Box>
//               {/* Filters */}
//               <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3}>
//                 <TextField
//                   size="small" placeholder="Search name or email…"
//                   value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
//                   InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
//                   sx={{ flex: 1 }}
//                 />
//                 <FormControl size="small" sx={{ minWidth: 140 }}>
//                   <InputLabel>Role</InputLabel>
//                   <Select value={userRole} label="Role" onChange={(e) => setUserRole(e.target.value)}>
//                     <MenuItem value="">All Roles</MenuItem>
//                     <MenuItem value="resident">Resident</MenuItem>
//                     <MenuItem value="collector">Collector</MenuItem>
//                     <MenuItem value="admin">Admin</MenuItem>
//                   </Select>
//                 </FormControl>
//                 <FormControl size="small" sx={{ minWidth: 160 }}>
//                   <InputLabel>Payment Status</InputLabel>
//                   <Select value={userStatus} label="Payment Status" onChange={(e) => setUserStatus(e.target.value)}>
//                     <MenuItem value="">All</MenuItem>
//                     <MenuItem value="paid">Paid</MenuItem>
//                     <MenuItem value="pending">Pending</MenuItem>
//                     <MenuItem value="free">Free Service</MenuItem>
//                   </Select>
//                 </FormControl>
//                 <Button variant="contained" onClick={fetchUsers}
//                   sx={{ fontWeight: 800, borderRadius: 2, bgcolor: '#16a34a', minWidth: 100 }}>
//                   Filter
//                 </Button>
//               </Stack>

//               <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
//                 <TableContainer>
//                   <Table>
//                     <TableHead sx={{ bgcolor: '#f8fafc' }}>
//                       <TableRow>
//                         <TableCell sx={{ fontWeight: 800, color: '#475569' }}>User</TableCell>
//                         <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Role</TableCell>
//                         <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Zone</TableCell>
//                         <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Payment</TableCell>
//                         <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Coins</TableCell>
//                         <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Joined</TableCell>
//                       </TableRow>
//                     </TableHead>
//                     <TableBody>
//                       {users.length === 0 ? (
//                         <TableRow>
//                           <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, color: '#94a3b8', fontWeight: 600 }}>
//                             No users found
//                           </TableCell>
//                         </TableRow>
//                       ) : users.map(u => (
//                         <TableRow key={u._id} hover sx={{ '&:last-child td': { border: 0 } }}>
//                           <TableCell>
//                             <Stack direction="row" spacing={1.5} alignItems="center">
//                               <Avatar sx={{ bgcolor: '#eff6ff', color: '#3b82f6', width: 34, height: 34, fontSize: '0.9rem' }}>
//                                 {u.name?.charAt(0)}
//                               </Avatar>
//                               <Box>
//                                 <Typography variant="body2" fontWeight={700}>{u.name}</Typography>
//                                 <Typography variant="caption" color="text.secondary">{u.email}</Typography>
//                               </Box>
//                             </Stack>
//                           </TableCell>
//                           <TableCell>
//                             <Chip label={u.role} size="small"
//                               sx={{ fontWeight: 700, textTransform: 'capitalize',
//                                 bgcolor: u.role === 'admin' ? '#fef9c3' : u.role === 'collector' ? '#eff6ff' : '#f0fdf4',
//                                 color:   u.role === 'admin' ? '#a16207' : u.role === 'collector' ? '#1d4ed8' : '#15803d',
//                               }} />
//                           </TableCell>
//                           <TableCell>{u.address?.zone?.toUpperCase() || '–'}</TableCell>
//                           <TableCell>
//                             {u.role === 'resident' ? (
//                               <Chip
//                                 label={u.isServiceFree ? 'Free' : u.paymentStatus || 'pending'}
//                                 size="small"
//                                 color={u.isServiceFree ? 'success' : u.paymentStatus === 'paid' ? 'success' : 'warning'}
//                                 sx={{ fontWeight: 700 }}
//                               />
//                             ) : '–'}
//                           </TableCell>
//                           <TableCell>
//                             <Typography variant="body2" fontWeight={700} color="#f59e0b">
//                               {u.coins ?? 0}
//                             </Typography>
//                           </TableCell>
//                           <TableCell>
//                             <Typography variant="caption" color="text.secondary">
//                               {format(new Date(u.createdAt), 'MMM dd, yyyy')}
//                             </Typography>
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </TableContainer>
//               </Paper>
//             </Box>
//           )}

//           {/* ── TAB 3: LIVE COLLECTIONS ── */}
//           {activeTab === 3 && (
//             <Box>
//               <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
//                 <Typography variant="h5" fontWeight={900} color="#0f172a">All Collections</Typography>
//                 <Stack direction="row" spacing={1}>
//                   {['Pending', 'Collected', 'Skipped'].map(s => (
//                     <Chip key={s} label={s} size="small"
//                       sx={{ fontWeight: 700, bgcolor: `${STATUS_COLOR[s]}15`, color: STATUS_COLOR[s], cursor: 'default' }} />
//                   ))}
//                 </Stack>
//               </Stack>

//               <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
//                 {loading ? (
//                   <Box p={4}><Skeleton height={50} /><Skeleton height={50} /><Skeleton height={50} /></Box>
//                 ) : (
//                   <TableContainer>
//                     <Table>
//                       <TableHead sx={{ bgcolor: '#f8fafc' }}>
//                         <TableRow>
//                           <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Resident</TableCell>
//                           <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Zone</TableCell>
//                           <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Type</TableCell>
//                           <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Collector</TableCell>
//                           <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Weight</TableCell>
//                           <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Status</TableCell>
//                           <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Actions</TableCell>
//                         </TableRow>
//                       </TableHead>
//                       <TableBody>
//                         {recentCols.map(c => (
//                           <TableRow key={c._id} hover sx={{ '&:last-child td': { border: 0 } }}>
//                             <TableCell><Typography variant="body2" fontWeight={700}>{c.resident?.name || '–'}</Typography></TableCell>
//                             <TableCell><Typography variant="caption">{c.address?.zone?.toUpperCase()}</Typography></TableCell>
//                             <TableCell><Chip label={c.wasteType} size="small" sx={{ fontWeight: 700 }} /></TableCell>
//                             <TableCell>
//                               {c.collector
//                                 ? <Chip label={c.collector.name} size="small" color="info" sx={{ fontWeight: 700 }} />
//                                 : <Typography variant="caption" color="text.disabled">Unassigned</Typography>}
//                             </TableCell>
//                             <TableCell>{c.actualWeight ? `${c.actualWeight} kg` : '–'}</TableCell>
//                             <TableCell>
//                               <Chip label={c.status} size="small"
//                                 sx={{ fontWeight: 700, bgcolor: `${STATUS_COLOR[c.status]}18`, color: STATUS_COLOR[c.status] }} />
//                             </TableCell>
//                             <TableCell>
//                               {!c.collector && !['Collected','Skipped'].includes(c.status) && (
//                                 <Button size="small" variant="contained"
//                                   startIcon={<PersonAdd />}
//                                   onClick={() => { setAssignDialog({ open: true, collectionId: c._id }); setAssignTo(''); }}
//                                   sx={{ borderRadius: 2, fontWeight: 700, bgcolor: '#16a34a', py: 0.5 }}>
//                                   Assign
//                                 </Button>
//                               )}
//                             </TableCell>
//                           </TableRow>
//                         ))}
//                       </TableBody>
//                     </Table>
//                   </TableContainer>
//                 )}
//               </Paper>
//             </Box>
//           )}

//         </Container>
//       </Box>

//       {/* ── Assign collector dialog ── */}
//       <Dialog open={assignDialog.open} onClose={() => setAssignDialog({ open: false, collectionId: null })}
//         PaperProps={{ sx: { borderRadius: 4, p: 1, maxWidth: 400, width: '100%' } }}>
//         <DialogTitle sx={{ fontWeight: 900 }}>Assign Collector</DialogTitle>
//         <DialogContent>
//           <FormControl fullWidth sx={{ mt: 1 }}>
//             <InputLabel>Select Collector</InputLabel>
//             <Select value={assignTo} label="Select Collector" onChange={(e) => setAssignTo(e.target.value)}>
//               {allCollectors.map(c => (
//                 <MenuItem key={c._id} value={c._id}>
//                   {c.name} — Zone {c.address?.zone?.toUpperCase() || '?'}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//         </DialogContent>
//         <DialogActions sx={{ p: 3, gap: 1 }}>
//           <Button onClick={() => setAssignDialog({ open: false, collectionId: null })} sx={{ fontWeight: 700 }}>Cancel</Button>
//           <Button variant="contained" onClick={handleAssign} disabled={assigning || !assignTo}
//             sx={{ fontWeight: 800, borderRadius: 2, bgcolor: '#16a34a' }}>
//             {assigning ? 'Assigning…' : 'Confirm Assignment'}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

// export default AdminDashboard;



import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Grid, Paper, Typography, Button,
  Stack, Avatar, Chip, Divider, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  LinearProgress, Skeleton, Alert, IconButton,
  Drawer, TextField, InputAdornment, Select,
  MenuItem, FormControl, InputLabel, Dialog,
  DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
  Dashboard, People, LocalShipping, Payment,
  RecyclingRounded, CheckCircle,
  PendingActions, EmojiEvents, Logout,
  Menu, Search, VolunteerActivism, BarChart as BarChartIcon,
  AssignmentTurnedIn, PersonAdd, Refresh, Scale
} from '@mui/icons-material';

import { useAuth }      from '../context/AuthContext';
import { useNavigate }  from 'react-router-dom';
import { useSocket }    from '../context/SocketContext';
import api              from '../services/api';
import { toast }        from 'react-toastify';
import { format, formatDistanceToNow } from 'date-fns';

// ── Color constants ───────────────────────────────────────────
const ZONE_COLORS  = ['#16a34a', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];
const WASTE_COLORS = { Organic:'#16a34a', Recyclable:'#3b82f6', Hazardous:'#ef4444', Mixed:'#64748b', Plastic:'#a855f7', Paper:'#f97316', Glass:'#06b6d4', Metal:'#78716c' };

const STATUS_COLOR = {
  Pending: '#f59e0b', Scheduled: '#3b82f6',
  'In Progress': '#8b5cf6', Collected: '#16a34a', Skipped: '#ef4444',
};

// ── KPI card ──────────────────────────────────────────────────
const KpiCard = ({ icon, label, value, sub, color, alert, loading }) => (
  <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${alert ? '#fecaca' : '#e2e8f0'}`,
    bgcolor: alert ? '#fef2f2' : 'white', height: '100%' }}>
    {loading ? <Skeleton height={80} /> : (
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color={alert ? 'error' : 'text.secondary'}
            fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {label}
          </Typography>
          <Avatar sx={{ bgcolor: `${color}15`, color, width: 36, height: 36 }}>{icon}</Avatar>
        </Stack>
        <Typography variant="h4" fontWeight={900} color={alert ? 'error.main' : '#0f172a'} lineHeight={1}>
          {value}
        </Typography>
        {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
      </Stack>
    )}
  </Paper>
);

// ── Main component ─────────────────────────────────────────────
const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const { socket }       = useSocket?.() || {};

  const [activeTab,     setActiveTab]     = useState(0);
  const [kpis,          setKpis]          = useState(null);
  const [recentCols,    setRecentCols]    = useState([]);
  const [recentPay,     setRecentPay]     = useState([]);
  const [analytics,     setAnalytics]     = useState(null);
  const [users,         setUsers]         = useState([]);
  const [allCollectors, setAllCollectors] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [mobileOpen,    setMobileOpen]    = useState(false);

  // Users tab filters
  const [userSearch,  setUserSearch]  = useState('');
  const [userRole,    setUserRole]    = useState('');
  const [userStatus,  setUserStatus]  = useState('');

  // Assign dialog
  const [assignDialog, setAssignDialog] = useState({ open: false, collectionId: null });
  const [assignTo,     setAssignTo]     = useState('');
  const [assigning,    setAssigning]    = useState(false);

  // ── Fetch ──────────────────────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard');
      setKpis(res.data.kpis);
      setRecentCols(res.data.recentCollections || []);
      setRecentPay(res.data.recentPayments || []);
    } catch { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await api.get('/admin/analytics');
      setAnalytics(res.data);
    } catch { toast.error('Failed to load analytics'); }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (userRole)   params.append('role', userRole);
      if (userStatus) params.append('paymentStatus', userStatus);
      if (userSearch) params.append('search', userSearch);
      const res = await api.get(`/admin/users?${params}`);
      setUsers(res.data.users || []);
    } catch { toast.error('Failed to load users'); }
  }, [userRole, userStatus, userSearch]);

  const fetchCollectors = useCallback(async () => {
    try {
      const res = await api.get('/admin/users?role=collector&limit=50');
      setAllCollectors(res.data.users || []);
    } catch {}
  }, []);

  useEffect(() => { fetchDashboard(); fetchAnalytics(); fetchCollectors(); }, [fetchDashboard, fetchAnalytics, fetchCollectors]);
  useEffect(() => { if (activeTab === 2) fetchUsers(); }, [activeTab, fetchUsers]);

  // ── Socket: real-time collection/payment events ───────────
  useEffect(() => {
    if (!socket) return;
    const refresh = () => fetchDashboard();
    socket.on('new_collection_request', refresh);
    socket.on('collection_updated',     refresh);
    socket.on('payment_success',        refresh);
    return () => {
      socket.off('new_collection_request', refresh);
      socket.off('collection_updated',     refresh);
      socket.off('payment_success',        refresh);
    };
  }, [socket, fetchDashboard]);

  // ── Assign collection ──────────────────────────────────────
  const handleAssign = async () => {
    if (!assignTo) { toast.warning('Select a collector'); return; }
    try {
      setAssigning(true);
      await api.put(`/admin/collections/${assignDialog.collectionId}/assign`, { collectorId: assignTo });
      toast.success('Collector assigned!');
      setAssignDialog({ open: false, collectionId: null });
      setAssignTo('');
      fetchDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed');
    } finally { setAssigning(false); }
  };

  // ── Sidebar ────────────────────────────────────────────────
  const navItems = [
    { label: 'Overview',      icon: <Dashboard />,          tab: 0 },
    { label: 'Analytics',     icon: <BarChartIcon />,       tab: 1 },
    { label: 'Users',         icon: <People />,             tab: 2 },
    { label: 'Collections',   icon: <LocalShipping />,      tab: 3 },
    { label: 'Programs',      icon: <VolunteerActivism />,  path: '/admin/programs' },
    { label: 'Payments',      icon: <Payment />,            path: '/admin/reports' }, 
  ];

  const SidebarContent = () => (
    <Box sx={{ height: '100%', bgcolor: '#0f172a', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 3, py: 3.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: '#16a34a', width: 36, height: 36 }}>
            <RecyclingRounded fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={900} color="white">SWMS Admin</Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>Control Panel</Typography>
          </Box>
        </Stack>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)' }} />
      <Box sx={{ flexGrow: 1, px: 2, pt: 2 }}>
        {navItems.map((item) => {
          const active = item.tab === activeTab;
          return (
            <Box key={item.label}
              onClick={() => { item.tab !== undefined ? setActiveTab(item.tab) : navigate(item.path); setMobileOpen(false); }}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5,
                px: 2, py: 1.5, borderRadius: 2, mb: 0.5, cursor: 'pointer',
                bgcolor: active ? '#16a34a' : 'transparent',
                '&:hover': { bgcolor: active ? '#15803d' : 'rgba(255,255,255,0.05)' },
              }}>
              <Box sx={{ color: 'white' }}>{item.icon}</Box>
              <Typography fontSize="0.9rem" fontWeight={active ? 800 : 500} color="white" sx={{ flexGrow: 1 }}>
                {item.label}
              </Typography>
              {item.label === 'Programs' && kpis?.programs?.pendingApprovals > 0 && (
                <Chip label={kpis.programs.pendingApprovals} size="small"
                  sx={{ bgcolor: '#ef4444', color: 'white', fontWeight: 900, height: 20, fontSize: '0.72rem' }} />
              )}
            </Box>
          );
        })}
      </Box>
      <Box sx={{ p: 2 }}>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)', mb: 2 }} />
        <Button fullWidth variant="text" color="error" startIcon={<Logout />}
          onClick={() => { logout(); navigate('/login'); }}
          sx={{ fontWeight: 700, justifyContent: 'flex-start', px: 2 }}>
          Sign Out
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f1f5f9' }}>

      {/* Mobile Drawer */}
      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: 260, border: 'none' } }}>
        <SidebarContent />
      </Drawer>

      {/* Desktop Sidebar */}
      <Box sx={{ width: 260, flexShrink: 0, display: { xs: 'none', md: 'block' }, position: 'sticky', top: 0, height: '100vh' }}>
        <SidebarContent />
      </Box>

      {/* Main */}
      <Box sx={{ flexGrow: 1, p: { xs: 2, md: 5 } }}>
        <Container maxWidth="xl" disableGutters>

          {/* Mobile header */}
          <Box sx={{ display: { md: 'none' }, mb: 2 }}>
            <IconButton onClick={() => setMobileOpen(true)}><Menu /></IconButton>
          </Box>

          {/* Page title */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
            <Box>
              <Typography variant="h4" fontWeight={900} color="#0f172a">
                {['System Overview', 'Analytics', 'User Management', 'Live Collections'][activeTab]}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Welcome back, {user?.name} · {format(new Date(), 'EEEE, MMMM d')}
              </Typography>
            </Box>
            <Button variant="outlined" startIcon={<Refresh />}
              onClick={fetchDashboard}
              sx={{ fontWeight: 700, borderRadius: 2, borderColor: '#16a34a', color: '#16a34a' }}>
              Refresh
            </Button>
          </Stack>

          {/* ── TAB 0: OVERVIEW ── */}
          {activeTab === 0 && (
            <Box>
              {/* Alert: pending volunteer approvals */}
              {kpis?.programs?.pendingApprovals > 0 && (
                <Alert severity="warning" sx={{ borderRadius: 3, mb: 3, fontWeight: 600 }}
                  action={<Button size="small" onClick={() => navigate('/admin/programs')} sx={{ fontWeight: 800 }}>Review</Button>}>
                  {kpis.programs.pendingApprovals} volunteer application{kpis.programs.pendingApprovals > 1 ? 's' : ''} awaiting approval
                </Alert>
              )}
              {kpis?.users?.unpaid > 0 && (
                <Alert severity="info" sx={{ borderRadius: 3, mb: 3, fontWeight: 600 }}>
                  {kpis.users.unpaid} resident{kpis.users.unpaid > 1 ? 's' : ''} have not yet paid this month's fee
                </Alert>
              )}

              {/* KPI row 1 */}
              <Grid container spacing={2} mb={3}>
                <Grid item xs={6} sm={3}><KpiCard loading={loading} icon={<People fontSize="small" />} label="Residents" value={kpis?.users?.residents ?? '–'} sub={`${kpis?.users?.collectors ?? 0} collectors`} color="#3b82f6" /></Grid>
                <Grid item xs={6} sm={3}><KpiCard loading={loading} icon={<CheckCircle fontSize="small" />} label="Collected Today" value={kpis?.today?.collected ?? '–'} sub={`${kpis?.today?.weight ?? 0} kg`} color="#16a34a" /></Grid>
                <Grid item xs={6} sm={3}><KpiCard loading={loading} icon={<PendingActions fontSize="small" />} label="Pending Jobs" value={kpis?.collections?.pending ?? '–'} sub="awaiting collector" color="#f59e0b" alert={(kpis?.collections?.pending ?? 0) > 20} /></Grid>
                <Grid item xs={6} sm={3}><KpiCard loading={loading} icon={<Payment fontSize="small" />} label="Revenue (30d)" value={`Rs. ${(kpis?.revenue?.last30Days ?? 0).toLocaleString()}`} sub={`${kpis?.revenue?.freeRedemptions ?? 0} coin redemptions`} color="#16a34a" /></Grid>
              </Grid>

              {/* KPI row 2 */}
              <Grid container spacing={2} mb={4}>
                <Grid item xs={6} sm={3}><KpiCard loading={loading} icon={<AssignmentTurnedIn fontSize="small" />} label="Completion Rate" value={`${kpis?.collections?.completionRate ?? 0}%`} sub={`${kpis?.collections?.collected ?? 0} of ${kpis?.collections?.total ?? 0}`} color="#8b5cf6" /></Grid>
                <Grid item xs={6} sm={3}><KpiCard loading={loading} icon={<Scale fontSize="small" />} label="Total Weight" value={`${kpis?.collections?.totalWeight ?? 0}kg`} sub="all time" color="#06b6d4" /></Grid>
                <Grid item xs={6} sm={3}><KpiCard loading={loading} icon={<VolunteerActivism fontSize="small" />} label="Active Programs" value={kpis?.programs?.active ?? '–'} sub={`${kpis?.programs?.totalVolunteers ?? 0} volunteers`} color="#16a34a" /></Grid>
                <Grid item xs={6} sm={3}><KpiCard loading={loading} icon={<EmojiEvents fontSize="small" />} label="Paid Users" value={kpis?.users?.paidThisMonth ?? '–'} sub={`${kpis?.users?.freeService ?? 0} on free service`} color="#f59e0b" /></Grid>
              </Grid>

              {/* Recent collections + payments */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                  <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" p={3} borderBottom="1px solid #f1f5f9">
                      <Typography fontWeight={900} color="#0f172a">Recent Collections</Typography>
                      <Button size="small" onClick={() => setActiveTab(3)} sx={{ fontWeight: 700 }}>View All</Button>
                    </Stack>
                    {loading ? <Box p={3}><Skeleton height={40} /><Skeleton height={40} /><Skeleton height={40} /></Box> : (
                      <TableContainer>
                        <Table size="small">
                          <TableHead sx={{ bgcolor: '#f8fafc' }}>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Resident</TableCell>
                              <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Zone</TableCell>
                              <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Type</TableCell>
                              <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Status</TableCell>
                              <TableCell sx={{ fontWeight: 800, color: '#475569' }}>When</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {recentCols.map(c => (
                              <TableRow key={c._id} hover sx={{ '&:last-child td': { border: 0 } }}>
                                <TableCell><Typography variant="body2" fontWeight={700}>{c.resident?.name || '–'}</Typography></TableCell>
                                <TableCell><Typography variant="caption">{c.address?.zone?.toUpperCase()}</Typography></TableCell>
                                <TableCell><Chip label={c.wasteType} size="small" sx={{ fontWeight: 700 }} /></TableCell>
                                <TableCell>
                                  <Chip label={c.status} size="small"
                                    sx={{ fontWeight: 700, bgcolor: `${STATUS_COLOR[c.status]}18`, color: STATUS_COLOR[c.status] }} />
                                </TableCell>
                                <TableCell><Typography variant="caption" color="text.secondary">{formatDistanceToNow(new Date(c.updatedAt), { addSuffix: true })}</Typography></TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Paper>
                </Grid>

                <Grid item xs={12} md={5}>
                  <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', overflow: 'hidden', height: '100%' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" p={3} borderBottom="1px solid #f1f5f9">
                      <Typography fontWeight={900} color="#0f172a">Recent Payments</Typography>
                    </Stack>
                    {loading ? <Box p={3}><Skeleton height={40} /><Skeleton height={40} /></Box> : (
                      <Stack p={2} spacing={1.5}>
                        {recentPay.length === 0 ? (
                          <Typography variant="body2" color="text.secondary" p={2}>No payments yet</Typography>
                        ) : recentPay.map(p => (
                          <Stack key={p._id} direction="row" justifyContent="space-between" alignItems="center"
                            sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2 }}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Avatar sx={{ bgcolor: '#f0fdf4', color: '#16a34a', width: 32, height: 32 }}>
                                <Payment fontSize="small" />
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={700}>{p.user?.name || '–'}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {p.isFreeService ? 'Coin Redemption' : p.paymentMethod}
                                </Typography>
                              </Box>
                            </Stack>
                            <Box textAlign="right">
                              <Typography variant="body2" fontWeight={900} color="#16a34a">
                                {p.isFreeService ? '🎉 FREE' : `Rs. ${p.amount}`}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })}
                              </Typography>
                            </Box>
                          </Stack>
                        ))}
                      </Stack>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* ── TAB 1: ANALYTICS ── */}
          {activeTab === 1 && (
            <Box>
              {/* Landfill capacity */}
              {analytics && (
                <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', p: 4, mb: 4 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography fontWeight={900} color="#0f172a">Landfill Capacity</Typography>
                    <Chip
                      label={`${analytics.landfillCapacity.percentage}% Used`}
                      color={analytics.landfillCapacity.percentage > 80 ? 'error' : analytics.landfillCapacity.percentage > 60 ? 'warning' : 'success'}
                      sx={{ fontWeight: 800 }}
                    />
                  </Stack>
                  <LinearProgress variant="determinate" value={analytics.landfillCapacity.percentage}
                    sx={{ height: 16, borderRadius: 8,
                      bgcolor: '#e2e8f0',
                      '& .MuiLinearProgress-bar': {
                        background: analytics.landfillCapacity.percentage > 80
                          ? 'linear-gradient(90deg,#ef4444,#dc2626)'
                          : 'linear-gradient(90deg,#16a34a,#22d3ee)',
                        borderRadius: 8,
                      },
                    }} />
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    {analytics.landfillCapacity.used.toLocaleString()} kg of {analytics.landfillCapacity.total.toLocaleString()} kg capacity
                  </Typography>
                </Paper>
              )}

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', p: 4 }}>
                    <Typography fontWeight={900} color="#0f172a" mb={3}>Waste by Zone</Typography>
                    {!analytics ? <Skeleton height={200} /> : analytics.zones.length === 0 ? (
                      <Typography color="text.secondary">No data yet</Typography>
                    ) : (
                      <Stack spacing={2}>
                        {analytics.zones.map((z, i) => (
                          <Box key={z.zone}>
                            <Stack direction="row" justifyContent="space-between" mb={0.8}>
                              <Typography variant="body2" fontWeight={700} color="#0f172a">{z.zone}</Typography>
                              <Stack direction="row" spacing={1.5}>
                                <Typography variant="caption" color="text.secondary">{z.weight} kg</Typography>
                                <Chip label={`${z.percent}%`} size="small"
                                  sx={{ fontWeight: 800, bgcolor: `${ZONE_COLORS[i % ZONE_COLORS.length]}15`,
                                    color: ZONE_COLORS[i % ZONE_COLORS.length], height: 20, fontSize: '0.72rem' }} />
                              </Stack>
                            </Stack>
                            <LinearProgress variant="determinate" value={z.percent}
                              sx={{ height: 8, borderRadius: 4, bgcolor: `${ZONE_COLORS[i % ZONE_COLORS.length]}15`,
                                '& .MuiLinearProgress-bar': { bgcolor: ZONE_COLORS[i % ZONE_COLORS.length], borderRadius: 4 } }} />
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', p: 4 }}>
                    <Typography fontWeight={900} color="#0f172a" mb={3}>Waste Type Distribution</Typography>
                    {!analytics || analytics.wasteTypes.length === 0 ? (
                      <Typography color="text.secondary">No data yet</Typography>
                    ) : (
                      <Stack spacing={2}>
                         {analytics.wasteTypes.map((t, i) => (
                          <Box key={t.type}>
                            <Stack direction="row" justifyContent="space-between" mb={0.8}>
                              <Typography variant="body2" fontWeight={700} color="#0f172a">{t.type}</Typography>
                              <Typography variant="caption" color="text.secondary">{t.count} pickups</Typography>
                            </Stack>
                            <LinearProgress variant="determinate" value={Math.min((t.count / 100) * 100, 100)} 
                              sx={{ height: 8, borderRadius: 4, bgcolor: '#f1f5f9',
                                '& .MuiLinearProgress-bar': { bgcolor: WASTE_COLORS[t.type] || '#64748b', borderRadius: 4 } }} />
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* ── TAB 2: USERS ── */}
          {activeTab === 2 && (
            <Box>
              {/* Filters */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3}>
                <TextField
                  size="small" placeholder="Search name or email…"
                  value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
                  sx={{ flex: 1 }}
                />
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Role</InputLabel>
                  <Select value={userRole} label="Role" onChange={(e) => setUserRole(e.target.value)}>
                    <MenuItem value="">All Roles</MenuItem>
                    <MenuItem value="resident">Resident</MenuItem>
                    <MenuItem value="collector">Collector</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Payment Status</InputLabel>
                  <Select value={userStatus} label="Payment Status" onChange={(e) => setUserStatus(e.target.value)}>
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="paid">Paid</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="free">Free Service</MenuItem>
                  </Select>
                </FormControl>
                <Button variant="contained" onClick={fetchUsers}
                  sx={{ fontWeight: 800, borderRadius: 2, bgcolor: '#16a34a', minWidth: 100 }}>
                  Filter
                </Button>
              </Stack>

              <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, color: '#475569' }}>User</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Role</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Zone</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Payment</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Coins</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Joined</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, color: '#94a3b8', fontWeight: 600 }}>
                            No users found
                          </TableCell>
                        </TableRow>
                      ) : users.map(u => (
                        <TableRow key={u._id} hover sx={{ '&:last-child td': { border: 0 } }}>
                          <TableCell>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Avatar sx={{ bgcolor: '#eff6ff', color: '#3b82f6', width: 34, height: 34, fontSize: '0.9rem' }}>
                                {u.name?.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={700}>{u.name}</Typography>
                                <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Chip label={u.role} size="small"
                              sx={{ fontWeight: 700, textTransform: 'capitalize',
                                bgcolor: u.role === 'admin' ? '#fef9c3' : u.role === 'collector' ? '#eff6ff' : '#f0fdf4',
                                color:   u.role === 'admin' ? '#a16207' : u.role === 'collector' ? '#1d4ed8' : '#15803d',
                              }} />
                          </TableCell>
                          <TableCell>{u.address?.zone?.toUpperCase() || '–'}</TableCell>
                          <TableCell>
                            {u.role === 'resident' ? (
                              <Chip
                                label={u.isServiceFree ? 'Free' : u.paymentStatus || 'pending'}
                                size="small"
                                color={u.isServiceFree ? 'success' : u.paymentStatus === 'paid' ? 'success' : 'warning'}
                                sx={{ fontWeight: 700 }}
                              />
                            ) : '–'}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={700} color="#f59e0b">
                              {u.coins ?? 0}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {format(new Date(u.createdAt), 'MMM dd, yyyy')}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          )}

          {/* ── TAB 3: LIVE COLLECTIONS ── */}
          {activeTab === 3 && (
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight={900} color="#0f172a">All Collections</Typography>
                <Stack direction="row" spacing={1}>
                  {['Pending', 'Collected', 'Skipped'].map(s => (
                    <Chip key={s} label={s} size="small"
                      sx={{ fontWeight: 700, bgcolor: `${STATUS_COLOR[s]}15`, color: STATUS_COLOR[s], cursor: 'default' }} />
                  ))}
                </Stack>
              </Stack>

              <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                {loading ? (
                  <Box p={4}><Skeleton height={50} /><Skeleton height={50} /><Skeleton height={50} /></Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Resident</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Zone</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Collector</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Weight</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentCols.map(c => (
                          <TableRow key={c._id} hover sx={{ '&:last-child td': { border: 0 } }}>
                            <TableCell><Typography variant="body2" fontWeight={700}>{c.resident?.name || '–'}</Typography></TableCell>
                            <TableCell><Typography variant="caption">{c.address?.zone?.toUpperCase()}</Typography></TableCell>
                            <TableCell><Chip label={c.wasteType} size="small" sx={{ fontWeight: 700 }} /></TableCell>
                            <TableCell>
                              {c.collector
                                ? <Chip label={c.collector.name} size="small" color="info" sx={{ fontWeight: 700 }} />
                                : <Typography variant="caption" color="text.disabled">Unassigned</Typography>}
                            </TableCell>
                            <TableCell>{c.actualWeight ? `${c.actualWeight} kg` : '–'}</TableCell>
                            <TableCell>
                              <Chip label={c.status} size="small"
                                sx={{ fontWeight: 700, bgcolor: `${STATUS_COLOR[c.status]}18`, color: STATUS_COLOR[c.status] }} />
                            </TableCell>
                            <TableCell>
                              {!c.collector && !['Collected','Skipped'].includes(c.status) && (
                                <Button size="small" variant="contained"
                                  startIcon={<PersonAdd />}
                                  onClick={() => { setAssignDialog({ open: true, collectionId: c._id }); setAssignTo(''); }}
                                  sx={{ borderRadius: 2, fontWeight: 700, bgcolor: '#16a34a', py: 0.5 }}>
                                  Assign
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </Box>
          )}

        </Container>
      </Box>

      {/* ── Assign collector dialog ── */}
      <Dialog open={assignDialog.open} onClose={() => setAssignDialog({ open: false, collectionId: null })}
        PaperProps={{ sx: { borderRadius: 4, p: 1, maxWidth: 400, width: '100%' } }}>
        <DialogTitle sx={{ fontWeight: 900 }}>Assign Collector</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Select Collector</InputLabel>
            <Select value={assignTo} label="Select Collector" onChange={(e) => setAssignTo(e.target.value)}>
              {allCollectors.map(c => (
                <MenuItem key={c._id} value={c._id}>
                  {c.name} — Zone {c.address?.zone?.toUpperCase() || '?'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={() => setAssignDialog({ open: false, collectionId: null })} sx={{ fontWeight: 700 }}>Cancel</Button>
          <Button variant="contained" onClick={handleAssign} disabled={assigning || !assignTo}
            sx={{ fontWeight: 800, borderRadius: 2, bgcolor: '#16a34a' }}>
            {assigning ? 'Assigning…' : 'Confirm Assignment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;