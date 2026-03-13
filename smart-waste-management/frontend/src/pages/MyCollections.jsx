// import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   Typography,
//   Paper,
//   Grid,
//   Card,
//   CardContent,
//   Button,
//   Chip,
//   LinearProgress,
//   Container,
//   Alert,
//   CircularProgress,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   MenuItem,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   IconButton,
//   Tooltip,
//   Avatar,
//   Divider,
//   Stepper,
//   Step,
//   StepLabel,
//   StepContent,
//   StepIcon,
//   StepConnector,
//   stepConnectorClasses,
//   styled,
//   Tab,
//   Tabs,
//   InputAdornment,
//   FormControl,
//   InputLabel,
//   Select,
//   Rating
// } from '@mui/material';
// import {
//   LocalShipping as TruckIcon,
//   CheckCircle as CheckCircleIcon,
//   Cancel as CancelIcon,
//   Pending as PendingIcon,
//   Schedule as ScheduleIcon,
//   Warning as WarningIcon,
//   Info as InfoIcon,
//   Refresh as RefreshIcon,
//   FilterList as FilterIcon,
//   Search as SearchIcon,
//   Download as DownloadIcon,
//   Print as PrintIcon,
//   Visibility as VisibilityIcon,
//   Edit as EditIcon,
//   Delete as DeleteIcon,
//   Add as AddIcon,
//   Close as CloseIcon,
//   ArrowBack as ArrowBackIcon,
//   ArrowForward as ArrowForwardIcon,
//   Home as HomeIcon,
//   LocationOn as LocationIcon,
//   CalendarToday as CalendarIcon,
//   AccessTime as TimeIcon,
//   Person as PersonIcon,
//   Phone as PhoneIcon,
//   Email as EmailIcon,
//   Notes as NotesIcon,
//   AttachFile as AttachFileIcon,
//   Image as ImageIcon,
//   Description as DescriptionIcon,
//   Recycling as RecyclingIcon,
//   Star as StarIcon,
//   Feedback as FeedbackIcon
// } from '@mui/icons-material';
// import { useAuth } from '../context/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import { format, formatDistanceToNow } from 'date-fns';
// import api from '../services/api';
// import { toast } from 'react-toastify';

// // Tab Panel Component
// function TabPanel(props) {
//   const { children, value, index, ...other } = props;
//   return (
//     <div
//       role="tabpanel"
//       hidden={value !== index}
//       id={`collections-tabpanel-${index}`}
//       aria-labelledby={`collections-tab-${index}`}
//       {...other}
//     >
//       {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
//     </div>
//   );
// }

// const MyCollections = () => {
//   const [collections, setCollections] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedCollection, setSelectedCollection] = useState(null);
//   const [detailsOpen, setDetailsOpen] = useState(false);
//   const [requestOpen, setRequestOpen] = useState(false);
//   const [cancelOpen, setCancelOpen] = useState(false);
//   const [rescheduleOpen, setRescheduleOpen] = useState(false);
//   const [tabValue, setTabValue] = useState(0);
//   const [stats, setStats] = useState({
//     total: 0,
//     pending: 0,
//     assigned: 0,
//     inProgress: 0,
//     completed: 0,
//     cancelled: 0,
//     totalCoins: 0
//   });
//   const [requestData, setRequestData] = useState({
//     wasteType: '',
//     weight: '',
//     preferredDate: '',
//     preferredTime: '',
//     notes: ''
//   });
//   const [rescheduleData, setRescheduleData] = useState({
//     preferredDate: '',
//     preferredTime: '',
//     reason: ''
//   });

//   const { user } = useAuth();
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchCollections();
//   }, []);

//   const fetchCollections = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get('/collections/my');
//       const collectionsData = response.data.collections || [];
//       setCollections(collectionsData);
      
//       // Calculate stats
//       const newStats = {
//         total: collectionsData.length,
//         pending: collectionsData.filter(c => c.status === 'pending').length,
//         assigned: collectionsData.filter(c => c.status === 'assigned').length,
//         inProgress: collectionsData.filter(c => c.status === 'in-progress').length,
//         completed: collectionsData.filter(c => c.status === 'completed').length,
//         cancelled: collectionsData.filter(c => c.status === 'cancelled').length,
//         totalCoins: collectionsData.reduce((sum, c) => sum + (c.actualCoins || 0), 0)
//       };
//       setStats(newStats);
//     } catch (error) {
//       console.error('Error fetching collections:', error);
//       toast.error('Failed to load collections');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRequestCollection = async (e) => {
//     e.preventDefault();
//     try {
//       await api.post('/collections/request', {
//         ...requestData,
//         weight: parseFloat(requestData.weight)
//       });
//       toast.success('Collection requested successfully!');
//       setRequestOpen(false);
//       setRequestData({
//         wasteType: '',
//         weight: '',
//         preferredDate: '',
//         preferredTime: '',
//         notes: ''
//       });
//       fetchCollections();
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to request collection');
//     }
//   };

//   const handleCancelCollection = async () => {
//     try {
//       await api.post(`/collections/${selectedCollection._id}/cancel`);
//       toast.success('Collection cancelled successfully');
//       setCancelOpen(false);
//       fetchCollections();
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to cancel collection');
//     }
//   };

//   const handleRescheduleCollection = async (e) => {
//     e.preventDefault();
//     try {
//       await api.put(`/collections/${selectedCollection._id}/reschedule`, rescheduleData);
//       toast.success('Collection rescheduled successfully');
//       setRescheduleOpen(false);
//       setRescheduleData({
//         preferredDate: '',
//         preferredTime: '',
//         reason: ''
//       });
//       fetchCollections();
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to reschedule collection');
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'completed': return 'success';
//       case 'pending': return 'warning';
//       case 'assigned': return 'info';
//       case 'in-progress': return 'primary';
//       case 'cancelled': return 'error';
//       default: return 'default';
//     }
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case 'completed': return <CheckCircleIcon />;
//       case 'pending': return <PendingIcon />;
//       case 'assigned': return <ScheduleIcon />;
//       case 'in-progress': return <RecyclingIcon />;
//       case 'cancelled': return <CancelIcon />;
//       default: return <InfoIcon />;
//     }
//   };

//   const handleTabChange = (event, newValue) => {
//     setTabValue(newValue);
//   };

//   const filteredCollections = collections.filter(collection => {
//     if (tabValue === 0) return true; // All
//     if (tabValue === 1) return collection.status === 'pending' || collection.status === 'assigned';
//     if (tabValue === 2) return collection.status === 'in-progress';
//     if (tabValue === 3) return collection.status === 'completed';
//     if (tabValue === 4) return collection.status === 'cancelled';
//     return true;
//   }).filter(collection => {
//     if (searchTerm) {
//       const search = searchTerm.toLowerCase();
//       return (
//         collection._id?.toLowerCase().includes(search) ||
//         collection.wasteType?.toLowerCase().includes(search) ||
//         collection.status?.toLowerCase().includes(search) ||
//         collection.address?.street?.toLowerCase().includes(search)
//       );
//     }
//     return true;
//   });

//   const wasteTypes = [
//     { value: 'organic', label: 'Organic Waste', icon: '🌱' },
//     { value: 'recyclable', label: 'Recyclable', icon: '♻️' },
//     { value: 'hazardous', label: 'Hazardous', icon: '⚠️' },
//     { value: 'electronic', label: 'Electronic', icon: '💻' },
//     { value: 'general', label: 'General', icon: '🗑️' },
//     { value: 'bulk', label: 'Bulk Items', icon: '📦' }
//   ];

//   if (loading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Container maxWidth="xl" sx={{ py: 4 }}>
//       {/* Header */}
//       <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//         <Box>
//           <Typography variant="h4" fontWeight="bold" gutterBottom>
//             My Collections
//           </Typography>
//           <Typography variant="body1" color="text.secondary">
//             Manage your waste collection requests and track their status
//           </Typography>
//         </Box>
//         <Button
//           variant="contained"
//           startIcon={<AddIcon />}
//           onClick={() => setRequestOpen(true)}
//           sx={{ borderRadius: 2 }}
//         >
//           Request Collection
//         </Button>
//       </Box>

//       {/* Stats Cards */}
//       <Grid container spacing={3} sx={{ mb: 4 }}>
//         <Grid item xs={12} sm={6} md={2.4}>
//           <Card>
//             <CardContent>
//               <Typography color="text.secondary" gutterBottom>
//                 Total
//               </Typography>
//               <Typography variant="h4" fontWeight="bold">
//                 {stats.total}
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//         <Grid item xs={12} sm={6} md={2.4}>
//           <Card sx={{ bgcolor: 'warning.light' }}>
//             <CardContent>
//               <Typography color="warning.dark" gutterBottom>
//                 Pending
//               </Typography>
//               <Typography variant="h4" fontWeight="bold" color="warning.dark">
//                 {stats.pending + stats.assigned}
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//         <Grid item xs={12} sm={6} md={2.4}>
//           <Card sx={{ bgcolor: 'info.light' }}>
//             <CardContent>
//               <Typography color="info.dark" gutterBottom>
//                 In Progress
//               </Typography>
//               <Typography variant="h4" fontWeight="bold" color="info.dark">
//                 {stats.inProgress}
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//         <Grid item xs={12} sm={6} md={2.4}>
//           <Card sx={{ bgcolor: 'success.light' }}>
//             <CardContent>
//               <Typography color="success.dark" gutterBottom>
//                 Completed
//               </Typography>
//               <Typography variant="h4" fontWeight="bold" color="success.dark">
//                 {stats.completed}
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//         <Grid item xs={12} sm={6} md={2.4}>
//           <Card sx={{ bgcolor: 'grey.100' }}>
//             <CardContent>
//               <Typography color="text.secondary" gutterBottom>
//                 Total Coins
//               </Typography>
//               <Typography variant="h4" fontWeight="bold" color="warning.main">
//                 {stats.totalCoins}
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>

//       {/* Tabs and Search */}
//       <Paper sx={{ mb: 3 }}>
//         <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
//           <Tab label="All" />
//           <Tab label="Active" />
//           <Tab label="In Progress" />
//           <Tab label="Completed" />
//           <Tab label="Cancelled" />
//         </Tabs>

//         <Box sx={{ p: 2 }}>
//           <TextField
//             fullWidth
//             size="small"
//             placeholder="Search collections by ID, waste type, or address..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             InputProps={{
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <SearchIcon />
//                 </InputAdornment>
//               ),
//               endAdornment: searchTerm && (
//                 <InputAdornment position="end">
//                   <IconButton size="small" onClick={() => setSearchTerm('')}>
//                     <CloseIcon />
//                   </IconButton>
//                 </InputAdornment>
//               )
//             }}
//           />
//         </Box>
//       </Paper>

//       {/* Collections List */}
//       {filteredCollections.length === 0 ? (
//         <Paper sx={{ p: 6, textAlign: 'center' }}>
//           <RecyclingIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
//           <Typography variant="h5" color="text.secondary" gutterBottom>
//             No collections found
//           </Typography>
//           <Typography variant="body1" color="text.secondary" paragraph>
//             {searchTerm ? 'Try adjusting your search' : 'Click the button below to request your first collection'}
//           </Typography>
//           <Button
//             variant="contained"
//             startIcon={<AddIcon />}
//             onClick={() => setRequestOpen(true)}
//           >
//             Request Collection
//           </Button>
//         </Paper>
//       ) : (
//         <TableContainer component={Paper}>
//           <Table>
//             <TableHead>
//               <TableRow>
//                 <TableCell>ID</TableCell>
//                 <TableCell>Date</TableCell>
//                 <TableCell>Waste Type</TableCell>
//                 <TableCell>Weight</TableCell>
//                 <TableCell>Address</TableCell>
//                 <TableCell>Status</TableCell>
//                 <TableCell>Coins</TableCell>
//                 <TableCell>Actions</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {filteredCollections.map((collection) => (
//                 <TableRow key={collection._id} hover>
//                   <TableCell>
//                     <Typography variant="body2" fontWeight="500">
//                       #{collection._id?.slice(-6)}
//                     </Typography>
//                   </TableCell>
//                   <TableCell>
//                     <Typography variant="body2">
//                       {collection.scheduledDate ? format(new Date(collection.scheduledDate), 'dd/MM/yyyy') : 'N/A'}
//                     </Typography>
//                     <Typography variant="caption" color="textSecondary">
//                       {collection.timeSlot?.start && collection.timeSlot?.end 
//                         ? `${collection.timeSlot.start} - ${collection.timeSlot.end}`
//                         : 'Time TBD'}
//                     </Typography>
//                   </TableCell>
//                   <TableCell>
//                     <Chip
//                       label={collection.wasteType}
//                       size="small"
//                       color="primary"
//                       variant="outlined"
//                     />
//                   </TableCell>
//                   <TableCell>{collection.weight} kg</TableCell>
//                   <TableCell>
//                     <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
//                       {collection.address?.street}
//                     </Typography>
//                     <Typography variant="caption" color="textSecondary">
//                       {collection.address?.zone}
//                     </Typography>
//                   </TableCell>
//                   <TableCell>
//                     <Chip
//                       label={collection.status}
//                       color={getStatusColor(collection.status)}
//                       size="small"
//                       icon={getStatusIcon(collection.status)}
//                     />
//                   </TableCell>
//                   <TableCell>
//                     {collection.actualCoins ? (
//                       <Typography color="success.main" fontWeight="bold">
//                         +{collection.actualCoins}
//                       </Typography>
//                     ) : collection.estimatedCoins ? (
//                       <Typography color="text.secondary" variant="body2">
//                         Est. {collection.estimatedCoins}
//                       </Typography>
//                     ) : '-'}
//                   </TableCell>
//                   <TableCell>
//                     <Tooltip title="View Details">
//                       <IconButton
//                         size="small"
//                         onClick={() => {
//                           setSelectedCollection(collection);
//                           setDetailsOpen(true);
//                         }}
//                       >
//                         <VisibilityIcon />
//                       </IconButton>
//                     </Tooltip>
//                     {(collection.status === 'pending' || collection.status === 'assigned') && (
//                       <>
//                         <Tooltip title="Reschedule">
//                           <IconButton
//                             size="small"
//                             color="warning"
//                             onClick={() => {
//                               setSelectedCollection(collection);
//                               setRescheduleOpen(true);
//                             }}
//                           >
//                             <EditIcon />
//                           </IconButton>
//                         </Tooltip>
//                         <Tooltip title="Cancel">
//                           <IconButton
//                             size="small"
//                             color="error"
//                             onClick={() => {
//                               setSelectedCollection(collection);
//                               setCancelOpen(true);
//                             }}
//                           >
//                             <CancelIcon />
//                           </IconButton>
//                         </Tooltip>
//                       </>
//                     )}
//                     {collection.status === 'completed' && !collection.feedback && (
//                       <Tooltip title="Leave Feedback">
//                         <IconButton
//                           size="small"
//                           color="success"
//                           onClick={() => navigate(`/feedback/${collection._id}`)}
//                         >
//                           <FeedbackIcon />
//                         </IconButton>
//                       </Tooltip>
//                     )}
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       )}

//       {/* Request Collection Dialog */}
//       <Dialog open={requestOpen} onClose={() => setRequestOpen(false)} maxWidth="sm" fullWidth>
//         <DialogTitle>Request New Collection</DialogTitle>
//         <DialogContent>
//           <Box component="form" onSubmit={handleRequestCollection} sx={{ mt: 2 }}>
//             <FormControl fullWidth sx={{ mb: 2 }}>
//               <InputLabel>Waste Type</InputLabel>
//               <Select
//                 value={requestData.wasteType}
//                 onChange={(e) => setRequestData({ ...requestData, wasteType: e.target.value })}
//                 label="Waste Type"
//                 required
//               >
//                 {wasteTypes.map(type => (
//                   <MenuItem key={type.value} value={type.value}>
//                     <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                       <Typography sx={{ mr: 1 }}>{type.icon}</Typography>
//                       {type.label}
//                     </Box>
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
            
//             <TextField
//               fullWidth
//               required
//               type="number"
//               label="Weight (kg)"
//               value={requestData.weight}
//               onChange={(e) => setRequestData({ ...requestData, weight: e.target.value })}
//               sx={{ mb: 2 }}
//               inputProps={{ min: 0, step: 0.1 }}
//               InputProps={{
//                 endAdornment: <InputAdornment position="end">kg</InputAdornment>
//               }}
//             />
            
//             <TextField
//               fullWidth
//               required
//               type="date"
//               label="Preferred Date"
//               value={requestData.preferredDate}
//               onChange={(e) => setRequestData({ ...requestData, preferredDate: e.target.value })}
//               sx={{ mb: 2 }}
//               InputLabelProps={{ shrink: true }}
//               inputProps={{ min: new Date().toISOString().split('T')[0] }}
//             />
            
//             <TextField
//               fullWidth
//               required
//               type="time"
//               label="Preferred Time"
//               value={requestData.preferredTime}
//               onChange={(e) => setRequestData({ ...requestData, preferredTime: e.target.value })}
//               sx={{ mb: 2 }}
//               InputLabelProps={{ shrink: true }}
//             />
            
//             <TextField
//               fullWidth
//               multiline
//               rows={3}
//               label="Additional Notes"
//               value={requestData.notes}
//               onChange={(e) => setRequestData({ ...requestData, notes: e.target.value })}
//               placeholder="Any special instructions? (gate code, specific location, etc.)"
//             />
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setRequestOpen(false)}>Cancel</Button>
//           <Button onClick={handleRequestCollection} variant="contained">
//             Submit Request
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Collection Details Dialog */}
//       <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
//         <DialogTitle>
//           Collection Details
//           <IconButton
//             onClick={() => setDetailsOpen(false)}
//             sx={{ position: 'absolute', right: 8, top: 8 }}
//           >
//             <CloseIcon />
//           </IconButton>
//         </DialogTitle>
//         <DialogContent dividers>
//           {selectedCollection && (
//             <Grid container spacing={3}>
//               <Grid item xs={12} md={6}>
//                 <Typography variant="subtitle2" color="text.secondary" gutterBottom>
//                   Collection ID
//                 </Typography>
//                 <Typography variant="body1" gutterBottom>
//                   #{selectedCollection._id}
//                 </Typography>

//                 <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
//                   Waste Type
//                 </Typography>
//                 <Chip
//                   label={selectedCollection.wasteType}
//                   color="primary"
//                   sx={{ mb: 2 }}
//                 />

//                 <Typography variant="subtitle2" color="text.secondary" gutterBottom>
//                   Weight
//                 </Typography>
//                 <Typography variant="body1" gutterBottom>
//                   {selectedCollection.weight} kg
//                 </Typography>

//                 <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
//                   Estimated Coins
//                 </Typography>
//                 <Typography variant="body1" color="warning.main" fontWeight="bold">
//                   {selectedCollection.estimatedCoins || 0} coins
//                 </Typography>

//                 {selectedCollection.actualCoins > 0 && (
//                   <>
//                     <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
//                       Actual Coins Earned
//                     </Typography>
//                     <Typography variant="body1" color="success.main" fontWeight="bold">
//                       +{selectedCollection.actualCoins} coins
//                     </Typography>
//                   </>
//                 )}
//               </Grid>
              
//               <Grid item xs={12} md={6}>
//                 <Typography variant="subtitle2" color="text.secondary" gutterBottom>
//                   Status
//                 </Typography>
//                 <Chip
//                   label={selectedCollection.status}
//                   color={getStatusColor(selectedCollection.status)}
//                   icon={getStatusIcon(selectedCollection.status)}
//                   sx={{ mb: 2 }}
//                 />

//                 <Typography variant="subtitle2" color="text.secondary" gutterBottom>
//                   Scheduled Date
//                 </Typography>
//                 <Typography variant="body1" gutterBottom>
//                   {selectedCollection.scheduledDate ? format(new Date(selectedCollection.scheduledDate), 'PPPP') : 'N/A'}
//                 </Typography>

//                 <Typography variant="subtitle2" color="text.secondary" gutterBottom>
//                   Time Slot
//                 </Typography>
//                 <Typography variant="body1" gutterBottom>
//                   {selectedCollection.timeSlot?.start && selectedCollection.timeSlot?.end 
//                     ? `${selectedCollection.timeSlot.start} - ${selectedCollection.timeSlot.end}`
//                     : 'Not specified'}
//                 </Typography>

//                 {selectedCollection.collector && (
//                   <>
//                     <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
//                       Assigned Collector
//                     </Typography>
//                     <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                       <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
//                         {selectedCollection.collector.name?.[0]}
//                       </Avatar>
//                       <Box>
//                         <Typography variant="body2">{selectedCollection.collector.name}</Typography>
//                         <Typography variant="caption" color="textSecondary">
//                           {selectedCollection.collector.phone}
//                         </Typography>
//                       </Box>
//                     </Box>
//                   </>
//                 )}
//               </Grid>

//               <Grid item xs={12}>
//                 <Typography variant="subtitle2" color="text.secondary" gutterBottom>
//                   Address
//                 </Typography>
//                 <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
//                   <Typography variant="body2">
//                     {selectedCollection.address?.street}
//                   </Typography>
//                   <Typography variant="body2">
//                     {selectedCollection.address?.city}, {selectedCollection.address?.state} {selectedCollection.address?.zipCode}
//                   </Typography>
//                   <Typography variant="caption" color="textSecondary">
//                     Zone: {selectedCollection.address?.zone}
//                   </Typography>
//                 </Paper>
//               </Grid>

//               {selectedCollection.notes && (
//                 <Grid item xs={12}>
//                   <Typography variant="subtitle2" color="text.secondary" gutterBottom>
//                     Notes
//                   </Typography>
//                   <Paper variant="outlined" sx={{ p: 2 }}>
//                     <Typography variant="body2">
//                       {selectedCollection.notes}
//                     </Typography>
//                   </Paper>
//                 </Grid>
//               )}

//               {selectedCollection.feedback && (
//                 <Grid item xs={12}>
//                   <Typography variant="subtitle2" color="text.secondary" gutterBottom>
//                     Your Feedback
//                   </Typography>
//                   <Paper variant="outlined" sx={{ p: 2 }}>
//                     <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//                       <Rating value={selectedCollection.feedback.rating} readOnly size="small" />
//                       <Typography variant="caption" sx={{ ml: 1 }}>
//                         {format(new Date(selectedCollection.feedback.submittedAt), 'PPP')}
//                       </Typography>
//                     </Box>
//                     <Typography variant="body2">
//                       {selectedCollection.feedback.comment}
//                     </Typography>
//                   </Paper>
//                 </Grid>
//               )}
//             </Grid>
//           )}
//         </DialogContent>
//         <DialogActions>
//           {(selectedCollection?.status === 'pending' || selectedCollection?.status === 'assigned') && (
//             <>
//               <Button
//                 variant="outlined"
//                 color="warning"
//                 onClick={() => {
//                   setDetailsOpen(false);
//                   setRescheduleOpen(true);
//                 }}
//               >
//                 Reschedule
//               </Button>
//               <Button
//                 variant="outlined"
//                 color="error"
//                 onClick={() => {
//                   setDetailsOpen(false);
//                   setCancelOpen(true);
//                 }}
//               >
//                 Cancel
//               </Button>
//             </>
//           )}
//           {selectedCollection?.status === 'completed' && !selectedCollection?.feedback && (
//             <Button
//               variant="contained"
//               color="primary"
//               onClick={() => {
//                 setDetailsOpen(false);
//                 navigate(`/feedback/${selectedCollection._id}`);
//               }}
//             >
//               Leave Feedback
//             </Button>
//           )}
//           <Button onClick={() => setDetailsOpen(false)}>Close</Button>
//         </DialogActions>
//       </Dialog>

//       {/* Cancel Confirmation Dialog */}
//       <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)}>
//         <DialogTitle>Cancel Collection</DialogTitle>
//         <DialogContent>
//           <Typography>
//             Are you sure you want to cancel this collection? This action cannot be undone.
//           </Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setCancelOpen(false)}>No, Keep It</Button>
//           <Button onClick={handleCancelCollection} color="error" variant="contained">
//             Yes, Cancel Collection
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Reschedule Dialog */}
//       <Dialog open={rescheduleOpen} onClose={() => setRescheduleOpen(false)} maxWidth="sm" fullWidth>
//         <DialogTitle>Reschedule Collection</DialogTitle>
//         <DialogContent>
//           <Box component="form" onSubmit={handleRescheduleCollection} sx={{ mt: 2 }}>
//             <TextField
//               fullWidth
//               required
//               type="date"
//               label="New Date"
//               value={rescheduleData.preferredDate}
//               onChange={(e) => setRescheduleData({ ...rescheduleData, preferredDate: e.target.value })}
//               sx={{ mb: 2 }}
//               InputLabelProps={{ shrink: true }}
//               inputProps={{ min: new Date().toISOString().split('T')[0] }}
//             />
//             <TextField
//               fullWidth
//               required
//               type="time"
//               label="New Time"
//               value={rescheduleData.preferredTime}
//               onChange={(e) => setRescheduleData({ ...rescheduleData, preferredTime: e.target.value })}
//               sx={{ mb: 2 }}
//               InputLabelProps={{ shrink: true }}
//             />
//             <TextField
//               fullWidth
//               multiline
//               rows={3}
//               label="Reason for Rescheduling"
//               value={rescheduleData.reason}
//               onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
//               required
//               placeholder="Please let us know why you need to reschedule..."
//             />
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setRescheduleOpen(false)}>Cancel</Button>
//           <Button onClick={handleRescheduleCollection} variant="contained">
//             Confirm Reschedule
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Container>
//   );
// };

// export default MyCollections;


// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   Box, Typography, Paper, Grid, Card, CardContent, Button, Chip,
//   Container, CircularProgress, Dialog, DialogTitle, DialogContent,
//   DialogActions, TextField, MenuItem, Table, TableBody, TableCell,
//   TableContainer, TableHead, TableRow, IconButton, Tooltip, Avatar,
//   Divider, Tabs, Tab, InputAdornment, FormControl, InputLabel, Select
// } from '@mui/material';
// import {
//   CheckCircle as CheckCircleIcon, Cancel as CancelIcon, Pending as PendingIcon,
//   Schedule as ScheduleIcon, Refresh as RefreshIcon, Search as SearchIcon,
//   Visibility as VisibilityIcon, Edit as EditIcon, Add as AddIcon,
//   Close as CloseIcon, Recycling as RecyclingIcon, Feedback as FeedbackIcon
// } from '@mui/icons-material';
// import { useAuth } from '../context/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import { format } from 'date-fns';
// import api from '../services/api';
// import { toast } from 'react-toastify';

// const MyCollections = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   // State Management
//   const [collections, setCollections] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [tabValue, setTabValue] = useState(0);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, coins: 0 });

//   // Dialog State
//   const [requestOpen, setRequestOpen] = useState(false);
//   const [detailsOpen, setDetailsOpen] = useState(false);
//   const [selectedCollection, setSelectedCollection] = useState(null);
//   const [requestData, setRequestData] = useState({
//     wasteType: 'general', weight: '', preferredDate: '', preferredTime: '', notes: ''
//   });

//   const fetchCollections = useCallback(async () => {
//     try {
//       setLoading(true);
//       const res = await api.get('/collections/my');
//       const data = res.data.collections || [];
//       setCollections(data);
      
//       // Calculate derived stats
//       setStats({
//         total: data.length,
//         active: data.filter(c => ['pending', 'assigned', 'in-progress'].includes(c.status)).length,
//         completed: data.filter(c => c.status === 'completed').length,
//         coins: data.reduce((sum, c) => sum + (c.actualCoins || 0), 0)
//       });
//     } catch (err) {
//       toast.error("Failed to load your collection history");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => { fetchCollections(); }, [fetchCollections]);

//   const handleRequestCollection = async (e) => {
//     e.preventDefault();
//     try {
//       const payload = {
//         wasteType: requestData.wasteType,
//         weight: parseFloat(requestData.weight),
//         scheduledDate: requestData.preferredDate,
//         timeSlot: { start: requestData.preferredTime, end: "17:00" }, // Standard window
//         notes: requestData.notes,
//         address: user.address // Auto-inject user's registered address
//       };
//       await api.post('/collections/request', payload);
//       toast.success("Request submitted successfully!");
//       setRequestOpen(false);
//       fetchCollections();
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Request failed");
//     }
//   };

//   const getStatusProps = (status) => {
//     const map = {
//       completed: { color: 'success', icon: <CheckCircleIcon /> },
//       pending: { color: 'warning', icon: <PendingIcon /> },
//       assigned: { color: 'info', icon: <ScheduleIcon /> },
//       'in-progress': { color: 'primary', icon: <RecyclingIcon /> },
//       cancelled: { color: 'error', icon: <CancelIcon /> }
//     };
//     return map[status] || { color: 'default', icon: null };
//   };

//   const filteredData = collections.filter(c => {
//     const matchesTab = 
//       tabValue === 0 || 
//       (tabValue === 1 && ['pending', 'assigned'].includes(c.status)) ||
//       (tabValue === 2 && c.status === 'in-progress') ||
//       (tabValue === 3 && c.status === 'completed');
    
//     const matchesSearch = c.wasteType.toLowerCase().includes(searchTerm.toLowerCase()) || 
//                           c._id.slice(-6).includes(searchTerm);
    
//     return matchesTab && matchesSearch;
//   });

//   if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

//   return (
//     <Container maxWidth="xl" sx={{ py: 4 }}>
//       {/* Header & Stats Row */}
//       <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
//         <Box>
//           <Typography variant="h4" fontWeight="bold">My Pickups</Typography>
//           <Typography color="textSecondary">Track and manage your waste disposal requests</Typography>
//         </Box>
//         <Button variant="contained" startIcon={<AddIcon />} onClick={() => setRequestOpen(true)} sx={{ borderRadius: 2, px: 3 }}>
//           Request New Pickup
//         </Button>
//       </Box>

//       <Grid container spacing={3} sx={{ mb: 4 }}>
//         {[
//           { label: 'Total Requests', val: stats.total, color: 'primary.main' },
//           { label: 'Active Tasks', val: stats.active, color: 'warning.main' },
//           { label: 'Completed', val: stats.completed, color: 'success.main' },
//           { label: 'Coins Earned', val: stats.coins, color: 'orange' }
//         ].map((stat, i) => (
//           <Grid item xs={12} sm={6} md={3} key={i}>
//             <Paper sx={{ p: 2, borderLeft: `5px solid`, borderColor: stat.color }}>
//               <Typography variant="body2" color="textSecondary">{stat.label}</Typography>
//               <Typography variant="h4" fontWeight="bold">{stat.val}</Typography>
//             </Paper>
//           </Grid>
//         ))}
//       </Grid>

//       {/* Main List & Controls */}
//       <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
//         <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ px: 2, pt: 1, borderBottom: 1, borderColor: 'divider' }}>
//           <Tab label="All History" />
//           <Tab label="Pending/Assigned" />
//           <Tab label="In Progress" />
//           <Tab label="Completed" />
//         </Tabs>
        
//         <Box p={2} display="flex" gap={2}>
//           <TextField 
//             fullWidth size="small" placeholder="Filter by waste type or short ID..." 
//             InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} /> }}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//           <IconButton onClick={fetchCollections}><RefreshIcon /></IconButton>
//         </Box>

//         <TableContainer>
//           <Table>
//             <TableHead sx={{ bgcolor: 'action.hover' }}>
//               <TableRow>
//                 <TableCell>ID</TableCell>
//                 <TableCell>Scheduled Date</TableCell>
//                 <TableCell>Waste Type</TableCell>
//                 <TableCell>Est. Weight</TableCell>
//                 <TableCell>Status</TableCell>
//                 <TableCell align="right">Actions</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {filteredData.map((row) => (
//                 <TableRow key={row._id} hover>
//                   <TableCell>#{row._id.slice(-6).toUpperCase()}</TableCell>
//                   <TableCell>{row.scheduledDate ? format(new Date(row.scheduledDate), 'dd MMM yyyy') : 'TBD'}</TableCell>
//                   <TableCell><Chip label={row.wasteType} size="small" variant="outlined" color="primary" /></TableCell>
//                   <TableCell>{row.weight} kg</TableCell>
//                   <TableCell>
//                     <Chip 
//                       label={row.status.toUpperCase()} 
//                       size="small" 
//                       color={getStatusProps(row.status).color} 
//                       icon={getStatusProps(row.status).icon} 
//                     />
//                   </TableCell>
//                   <TableCell align="right">
//                     <Tooltip title="View Tracking"><IconButton onClick={() => navigate(`/collections/${row._id}`)}><VisibilityIcon color="primary" /></IconButton></Tooltip>
//                     {row.status === 'completed' && !row.feedback && (
//                       <Tooltip title="Rate Driver"><IconButton onClick={() => navigate(`/feedback/${row._id}`)}><FeedbackIcon color="success" /></IconButton></Tooltip>
//                     )}
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//           {filteredData.length === 0 && (
//             <Box textAlign="center" py={5} color="text.secondary">
//               <RecyclingIcon sx={{ fontSize: 50, mb: 1, opacity: 0.5 }} />
//               <Typography>No matching records found.</Typography>
//             </Box>
//           )}
//         </TableContainer>
//       </Paper>

//       {/* New Request Dialog */}
//       <Dialog open={requestOpen} onClose={() => setRequestOpen(false)} fullWidth maxWidth="xs">
//         <form onSubmit={handleRequestCollection}>
//           <DialogTitle>New Waste Collection</DialogTitle>
//           <DialogContent dividers>
//             <FormControl fullWidth margin="dense">
//               <InputLabel>Waste Category</InputLabel>
//               <Select value={requestData.wasteType} label="Waste Category" onChange={(e) => setRequestData({...requestData, wasteType: e.target.value})}>
//                 {['organic', 'recyclable', 'hazardous', 'electronic', 'general', 'bulk'].map(t => (
//                   <MenuItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//             <TextField fullWidth label="Approx Weight (kg)" type="number" margin="dense" required onChange={(e) => setRequestData({...requestData, weight: e.target.value})} />
//             <TextField fullWidth type="date" label="Preferred Date" margin="dense" required InputLabelProps={{ shrink: true }} onChange={(e) => setRequestData({...requestData, preferredDate: e.target.value})} inputProps={{ min: new Date().toISOString().split('T')[0] }} />
//             <TextField fullWidth type="time" label="Preferred Time" margin="dense" required InputLabelProps={{ shrink: true }} onChange={(e) => setRequestData({...requestData, preferredTime: e.target.value})} />
//             <TextField fullWidth label="Instructions for driver" multiline rows={2} margin="dense" onChange={(e) => setRequestData({...requestData, notes: e.target.value})} />
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setRequestOpen(false)}>Cancel</Button>
//             <Button type="submit" variant="contained">Submit Request</Button>
//           </DialogActions>
//         </form>
//       </Dialog>
//     </Container>
//   );
// };

// export default MyCollections;


import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Container, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip,Button, IconButton, 
  Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, 
  Toolbar, Stack, Avatar, useTheme, useMediaQuery, Divider, CircularProgress
} from '@mui/material';
import { 
  Dashboard, LocalShipping, Payment, Logout, Menu as MenuIcon, 
  LocationOn, History, Visibility, Refresh
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const drawerWidth = 260;

const MyCollections = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/collections/my');
      setCollections(res.data.collections || []);
    } catch (err) {
      toast.error("Failed to load collection history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Collected': return 'success';
      case 'Pending': return 'warning';
      case 'Scheduled': return 'info';
      case 'Skipped': return 'error';
      default: return 'default';
    }
  };

  const menuItems = [
    { label: 'Dashboard Overview', icon: <Dashboard />, action: () => navigate('/resident/dashboard'), active: false },
    { label: 'Request Pickup', icon: <LocalShipping />, action: () => navigate('/request-collection'), active: false },
    { label: 'My Collections', icon: <History />, action: () => navigate('/my-collections'), active: true },
    { label: 'Khalti Payments', icon: <Payment />, action: () => navigate('/payments'), active: false },
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', bgcolor: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: 3, py: 3 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}><LocationOn fontSize="small" /></Avatar>
          <Typography variant="h6" fontWeight="900">RESIDENT</Typography>
        </Stack>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      <List sx={{ px: 2, mt: 3, flexGrow: 1 }}>
        {menuItems.map((item, idx) => (
          <ListItem button key={idx} onClick={() => { item.action(); if (isMobile) setMobileOpen(false); }}
            sx={{ mb: 1.5, borderRadius: 2, bgcolor: item.active ? 'primary.main' : 'transparent' }}>
            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={<Typography fontWeight={item.active ? 800 : 500}>{item.label}</Typography>} />
          </ListItem>
        ))}
      </List>
      <Box sx={{ p: 2 }}>
        <Button fullWidth color="error" startIcon={<Logout />} onClick={handleLogout}>Sign Out</Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f1f5f9' }}>
      <AppBar position="fixed" sx={{ width: { md: `calc(100% - ${drawerWidth}px)` }, ml: { md: `${drawerWidth}px` }, bgcolor: 'white', color: 'text.primary', display: { md: 'none' } }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 2 }}><MenuIcon /></IconButton>
          <Typography variant="h6" fontWeight="bold">My History</Typography>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth } }}>{drawerContent}</Drawer>
        <Drawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth, borderRight: 'none' } }} open>{drawerContent}</Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 5 }, mt: { xs: 8, md: 0 } }}>
        <Container maxWidth="xl" disableGutters>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography variant="h4" fontWeight="900">Collection History</Typography>
            <IconButton onClick={fetchHistory}><Refresh /></IconButton>
          </Stack>

          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>Date Requested</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Waste Type</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Weight (kg)</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Collector</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}><CircularProgress size={24} /></TableCell></TableRow>
                ) : collections.length === 0 ? (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}>No history found.</TableCell></TableRow>
                ) : (
                  collections.map((row) => (
                    <TableRow key={row._id} hover>
                      <TableCell>{new Date(row.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{row.wasteType}</TableCell>
                      <TableCell>{row.actualWeight || 0}</TableCell>
                      <TableCell>
                        <Chip label={row.status} color={getStatusColor(row.status)} size="small" sx={{ fontWeight: 800 }} />
                      </TableCell>
                      <TableCell>{row.collector?.name || 'Pending assignment'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      </Box>
    </Box>
  );
};

export default MyCollections;