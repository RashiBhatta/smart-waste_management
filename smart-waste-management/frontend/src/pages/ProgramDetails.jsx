// import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   Container,
//   Grid,
//   Paper,
//   Typography,
//   Button,
//   Chip,
//   Avatar,
//   Divider,
//   List,
//   ListItem,
//   ListItemAvatar,
//   ListItemText,
//   Alert,
//   Skeleton,
//   IconButton,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   useTheme,
//   LinearProgress,
//   Snackbar,
//   CircularProgress,
//   Card,
//   CardContent
// } from '@mui/material';
// import {
//   ArrowBack as ArrowBackIcon,
//   CalendarToday as CalendarIcon,
//   LocationOn as LocationIcon,
//   People as PeopleIcon,
//   Category as CategoryIcon,
//   CheckCircle as CheckCircleIcon,
//   Share as ShareIcon,
//   EmojiEvents as TrophyIcon,
//   AccessTime as TimeIcon
// } from '@mui/icons-material';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import api from '../services/api';
// import { toast } from 'react-toastify';

// // Simple location formatter
// const formatLocation = (location) => {
//   if (!location) return 'Location TBA';
//   if (typeof location === 'string') return location;
//   if (typeof location === 'object') {
//     return location.address || location.venue || location.city || 'Location available';
//   }
//   return String(location);
// };

// const ProgramDetails = () => {
//   const theme = useTheme();
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { user } = useAuth();
  
//   const [program, setProgram] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [openJoinDialog, setOpenJoinDialog] = useState(false);
//   const [joinLoading, setJoinLoading] = useState(false);
//   const [motivation, setMotivation] = useState('');
//   const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

//   useEffect(() => {
//     fetchProgramDetails();
//   }, [id]);

//   const fetchProgramDetails = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get(`/programs/${id}`);
//       setProgram(response.data.program || response.data);
//     } catch (error) {
//       toast.error('Failed to fetch program details');
//       navigate('/programs');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleJoinProgram = async () => {
//     if (!motivation.trim()) {
//       setSnackbar({
//         open: true,
//         message: 'Please tell us why you want to join',
//         severity: 'warning'
//       });
//       return;
//     }

//     try {
//       setJoinLoading(true);
//       await api.post(`/programs/${id}/join`, { motivation });
      
//       toast.success('Application submitted successfully!');
//       setOpenJoinDialog(false);
//       setMotivation('');
//       fetchProgramDetails();
      
//     } catch (error) {
//       const errorMsg = error.response?.data?.message || 'Failed to join program';
//       toast.error(errorMsg);
//       setSnackbar({ open: true, message: errorMsg, severity: 'error' });
//     } finally {
//       setJoinLoading(false);
//     }
//   };

//   const userJoined = program?.volunteers?.find(v => v.user?._id === user?.id);
//   const isFull = program?.currentVolunteers >= program?.maxVolunteers;
//   const spotsLeft = (program?.maxVolunteers || 0) - (program?.currentVolunteers || 0);

//   const getButtonText = () => {
//     if (!user) return 'Login to Join';
//     if (user.role !== 'resident') return 'Residents Only';
//     if (userJoined) {
//       if (userJoined.status === 'pending') return 'Application Pending';
//       if (userJoined.status === 'approved') return 'Already Joined';
//       return 'Already Applied';
//     }
//     if (isFull) return 'Program Full';
//     if (program?.status === 'completed') return 'Completed';
//     if (program?.status === 'cancelled') return 'Cancelled';
//     return 'Join Program';
//   };

//   const isJoinDisabled = () => {
//     if (!user) return true;
//     if (user.role !== 'resident') return true;
//     if (userJoined) return true;
//     if (isFull) return true;
//     if (program?.status === 'completed' || program?.status === 'cancelled') return true;
//     return false;
//   };

//   if (loading) {
//     return (
//       <Container maxWidth="lg" sx={{ py: 4 }}>
//         <Skeleton variant="text" height={60} />
//         <Skeleton variant="rectangular" height={200} sx={{ my: 2 }} />
//         <Skeleton variant="rectangular" height={400} />
//       </Container>
//     );
//   }

//   if (!program) {
//     return (
//       <Container maxWidth="lg" sx={{ py: 4 }}>
//         <Alert severity="error">Program not found</Alert>
//       </Container>
//     );
//   }

//   return (
//     <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
//       {/* Header */}
//       <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 4 }}>
//         <Container maxWidth="lg">
//           <IconButton 
//             sx={{ color: 'white', mb: 2 }} 
//             onClick={() => navigate(-1)}
//           >
//             <ArrowBackIcon />
//           </IconButton>
//           <Typography variant="h3" gutterBottom fontWeight="bold">
//             {program.title}
//           </Typography>
//           <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
//             <Chip label={program.status} sx={{ bgcolor: 'white' }} />
//             <Chip icon={<CategoryIcon />} label={program.category || 'General'} sx={{ bgcolor: 'white' }} />
//           </Box>
//         </Container>
//       </Box>

//       <Container maxWidth="lg" sx={{ py: 4 }}>
//         <Grid container spacing={4}>
//           {/* Main Content */}
//           <Grid item xs={12} md={8}>
//             <Paper sx={{ p: 4 }}>
//               <Typography variant="h5" gutterBottom fontWeight="bold">
//                 About the Program
//               </Typography>
//               <Typography variant="body1" paragraph>
//                 {program.description}
//               </Typography>

//               <Divider sx={{ my: 3 }} />

//               <Typography variant="h6" gutterBottom>
//                 Program Details
//               </Typography>
//               <Grid container spacing={2}>
//                 <Grid item xs={6}>
//                   <Typography color="textSecondary">Organization</Typography>
//                   <Typography fontWeight="500">{program.organization}</Typography>
//                 </Grid>
//                 <Grid item xs={6}>
//                   <Typography color="textSecondary">Category</Typography>
//                   <Typography fontWeight="500">{program.category || 'General'}</Typography>
//                 </Grid>
//                 <Grid item xs={6}>
//                   <Typography color="textSecondary">Zone</Typography>
//                   <Typography fontWeight="500">{program.zone || 'All Zones'}</Typography>
//                 </Grid>
//                 <Grid item xs={6}>
//                   <Typography color="textSecondary">Reward</Typography>
//                   <Typography fontWeight="500" color="success.main">
//                     {program.rewardCoins || 100} coins
//                   </Typography>
//                 </Grid>
//               </Grid>
//             </Paper>
//           </Grid>

//           {/* Sidebar with Join Button */}
//           <Grid item xs={12} md={4}>
//             <Card sx={{ position: 'sticky', top: 20 }}>
//               <CardContent>
//                 <List>
//                   <ListItem>
//                     <ListItemAvatar>
//                       <Avatar sx={{ bgcolor: 'info.light' }}>
//                         <CalendarIcon />
//                       </Avatar>
//                     </ListItemAvatar>
//                     <ListItemText 
//                       primary="Date" 
//                       secondary={program.date ? new Date(program.date).toLocaleDateString() : 'TBA'} 
//                     />
//                   </ListItem>
                  
//                   <ListItem>
//                     <ListItemAvatar>
//                       <Avatar sx={{ bgcolor: 'warning.light' }}>
//                         <LocationIcon />
//                       </Avatar>
//                     </ListItemAvatar>
//                     <ListItemText 
//                       primary="Location" 
//                       secondary={formatLocation(program.location)} 
//                     />
//                   </ListItem>
                  
//                   <ListItem>
//                     <ListItemAvatar>
//                       <Avatar sx={{ bgcolor: 'success.light' }}>
//                         <PeopleIcon />
//                       </Avatar>
//                     </ListItemAvatar>
//                     <ListItemText 
//                       primary="Volunteers" 
//                       secondary={`${program.currentVolunteers || 0}/${program.maxVolunteers || 0}`} 
//                     />
//                   </ListItem>

//                   <ListItem>
//                     <ListItemAvatar>
//                       <Avatar sx={{ bgcolor: 'warning.light' }}>
//                         <TrophyIcon />
//                       </Avatar>
//                     </ListItemAvatar>
//                     <ListItemText 
//                       primary="Reward" 
//                       secondary={`${program.rewardCoins || 100} coins`} 
//                     />
//                   </ListItem>
//                 </List>

//                 <Box sx={{ textAlign: 'center', my: 3 }}>
//                   <Typography variant="h3" color="primary" fontWeight="bold">
//                     {spotsLeft}
//                   </Typography>
//                   <Typography color="textSecondary">Spots Available</Typography>
//                 </Box>

//                 <LinearProgress
//                   variant="determinate"
//                   value={((program.currentVolunteers || 0) / (program.maxVolunteers || 1)) * 100}
//                   sx={{ height: 10, borderRadius: 5, mb: 3 }}
//                 />

//                 {/* MAIN JOIN BUTTON */}
//                 <Button
//                   fullWidth
//                   variant="contained"
//                   size="large"
//                   onClick={() => setOpenJoinDialog(true)}
//                   disabled={isJoinDisabled()}
//                   sx={{ py: 1.5, fontSize: '1.1rem' }}
//                 >
//                   {joinLoading ? <CircularProgress size={24} /> : getButtonText()}
//                 </Button>

//                 {!user && (
//                   <Button
//                     fullWidth
//                     variant="outlined"
//                     sx={{ mt: 2 }}
//                     onClick={() => navigate('/login')}
//                   >
//                     Login to Join
//                   </Button>
//                 )}

//                 {userJoined?.status === 'pending' && (
//                   <Alert severity="info" sx={{ mt: 2 }}>
//                     Your application is pending approval
//                   </Alert>
//                 )}

//                 {userJoined?.status === 'approved' && (
//                   <Alert severity="success" sx={{ mt: 2 }}>
//                     You are registered for this program!
//                   </Alert>
//                 )}
//               </CardContent>
//             </Card>
//           </Grid>
//         </Grid>
//       </Container>

//       {/* Join Dialog */}
//       <Dialog open={openJoinDialog} onClose={() => setOpenJoinDialog(false)} maxWidth="sm" fullWidth>
//         <DialogTitle>Apply for {program?.title}</DialogTitle>
//         <DialogContent>
//           <Typography variant="body2" color="textSecondary" paragraph sx={{ mt: 2 }}>
//             Please tell us why you'd like to join this program.
//           </Typography>
//           <TextField
//             fullWidth
//             label="Why do you want to join? *"
//             multiline
//             rows={4}
//             value={motivation}
//             onChange={(e) => setMotivation(e.target.value)}
//             required
//             error={!motivation.trim()}
//             helperText={!motivation.trim() ? 'Required' : ''}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenJoinDialog(false)} disabled={joinLoading}>
//             Cancel
//           </Button>
//           <Button
//             onClick={handleJoinProgram}
//             variant="contained"
//             disabled={!motivation.trim() || joinLoading}
//             startIcon={joinLoading ? <CircularProgress size={20} /> : null}
//           >
//             {joinLoading ? 'Submitting...' : 'Submit'}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Snackbar */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={3000}
//         onClose={() => setSnackbar({ ...snackbar, open: false })}
//       >
//         <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default ProgramDetails;

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Grid, Paper, Typography, Button, Chip, Avatar, Divider,
  List, ListItem, ListItemAvatar, ListItemText, Alert, Skeleton, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, useTheme,
  LinearProgress, Snackbar, CircularProgress, Card, CardContent, Stack
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon, CalendarToday as CalendarIcon,
  LocationOn as LocationIcon, People as PeopleIcon, Category as CategoryIcon,
  EmojiEvents as TrophyIcon, Share as ShareIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const ProgramDetails = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openJoinDialog, setOpenJoinDialog] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [motivation, setMotivation] = useState('');

  const fetchProgramDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/programs/${id}`);
      setProgram(response.data.program || response.data);
    } catch (error) {
      toast.error('Failed to load program details');
      navigate('/programs');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchProgramDetails();
  }, [fetchProgramDetails]);

  // Participation Checks
  const userApplication = program?.volunteers?.find(v => v.user?._id === user?._id || v.user === user?._id);
  const isApproved = userApplication?.status === 'approved';
  const isPending = userApplication?.status === 'pending';
  const isFull = program?.currentVolunteers >= (program?.volunteerLimit || program?.maxVolunteers);
  const spotsLeft = Math.max(0, (program?.volunteerLimit || program?.maxVolunteers) - (program?.currentVolunteers || 0));

  const handleJoinProgram = async () => {
    if (!motivation.trim()) return toast.warning("Please provide your motivation");

    try {
      setJoinLoading(true);
      await api.post(`/programs/${id}/join`, { motivation });
      toast.success('Your application was submitted!');
      setOpenJoinDialog(false);
      setMotivation('');
      fetchProgramDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error joining program');
    } finally {
      setJoinLoading(false);
    }
  };

  const getButtonConfig = () => {
    if (!user) return { text: 'Login to Join', disabled: true, color: 'primary' };
    if (user.role !== 'resident') return { text: 'Resident Access Only', disabled: true, color: 'inherit' };
    if (isApproved) return { text: 'Successfully Joined', disabled: true, color: 'success' };
    if (isPending) return { text: 'Application Pending', disabled: true, color: 'warning' };
    if (isFull) return { text: 'Program Full', disabled: true, color: 'error' };
    if (program?.status === 'completed') return { text: 'Program Completed', disabled: true, color: 'inherit' };
    return { text: 'Join This Program', disabled: false, color: 'primary' };
  };

  if (loading) return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 3 }} />
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}><Skeleton variant="rectangular" height={400} /></Grid>
        <Grid item xs={12} md={4}><Skeleton variant="rectangular" height={400} /></Grid>
      </Grid>
    </Container>
  );

  const btnConfig = getButtonConfig();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      {/* Dynamic Header Overlay */}
      <Box sx={{ bgcolor: theme.palette.primary.dark, color: 'white', pt: 4, pb: 8 }}>
        <Container maxWidth="lg">
          <IconButton sx={{ color: 'white', mb: 2 }} onClick={() => navigate(-1)}><ArrowBackIcon /></IconButton>
          <Typography variant="h3" fontWeight="800" gutterBottom>{program.title}</Typography>
          <Stack direction="row" spacing={1}>
            <Chip label={program.status.toUpperCase()} sx={{ bgcolor: 'white', fontWeight: 'bold' }} />
            <Chip icon={<LocationIcon />} label={program.zone?.toUpperCase()} sx={{ bgcolor: 'white' }} />
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -5, pb: 6 }}>
        <Grid container spacing={4}>
          {/* Main Info */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h5" fontWeight="700" gutterBottom>Mission Objective</Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
                {program.description}
              </Typography>
              
              <Divider sx={{ my: 4 }} />
              
              <Typography variant="h6" fontWeight="700" gutterBottom>Incentives & Details</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={4}>
                  <Typography variant="caption" color="textSecondary">HOST ORGANIZATION</Typography>
                  <Typography fontWeight="600">{program.organization}</Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="caption" color="textSecondary">REWARD COINS</Typography>
                  <Typography fontWeight="600" color="success.main">+{program.rewardCoins || 100} Coins</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" color="textSecondary">PROGRAM TYPE</Typography>
                  <Typography fontWeight="600">{program.category || 'Environmental'}</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Registration Sidebar */}
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, position: 'sticky', top: 100 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" align="center" gutterBottom>Availability</Typography>
                <Box sx={{ textAlign: 'center', my: 2 }}>
                  <Typography variant="h2" color="primary" fontWeight="800">{spotsLeft}</Typography>
                  <Typography variant="subtitle2" color="textSecondary">SPOTS REMAINING</Typography>
                </Box>
                
                <LinearProgress 
                  variant="determinate" 
                  value={(program.currentVolunteers / program.volunteerLimit) * 100} 
                  sx={{ height: 10, borderRadius: 5, mb: 4 }}
                />

                <Stack spacing={2}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'info.light' }}><CalendarIcon fontSize="small" /></Avatar>
                    <Box>
                      <Typography variant="caption" color="textSecondary">START DATE</Typography>
                      <Typography variant="body2" fontWeight="600">{format(new Date(program.startDate), 'PPP')}</Typography>
                    </Box>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'warning.light' }}><LocationIcon fontSize="small" /></Avatar>
                    <Box>
                      <Typography variant="caption" color="textSecondary">MEETING POINT</Typography>
                      <Typography variant="body2" fontWeight="600">{program.location?.address || "Zone Specific"}</Typography>
                    </Box>
                  </Box>
                </Stack>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  color={btnConfig.color}
                  disabled={btnConfig.disabled}
                  onClick={() => setOpenJoinDialog(true)}
                  sx={{ mt: 4, py: 1.5, fontWeight: 'bold' }}
                >
                  {btnConfig.text}
                </Button>
                
                {isApproved && (
                  <Alert severity="success" sx={{ mt: 2 }} icon={<PeopleIcon />}>
                    You are confirmed for this event!
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Application Dialog */}
      <Dialog open={openJoinDialog} onClose={() => setOpenJoinDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Volunteer Application</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2 }}>Why do you want to join <b>{program?.title}</b>?</Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="filled"
            placeholder="E.g., I am passionate about keeping my zone clean..."
            value={motivation}
            onChange={(e) => setMotivation(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenJoinDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleJoinProgram}
            disabled={joinLoading}
          >
            {joinLoading ? <CircularProgress size={24} /> : 'Send Application'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProgramDetails;