import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Typography, Button, Box, Grid, Card, CardContent,
  CardActions, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Chip, IconButton, Tabs, Tab, Avatar, Alert,
  CircularProgress, Divider, List, ListItem, ListItemText, ListItemAvatar,
  ListItemSecondaryAction, ListItemIcon, Badge, Tooltip, FormControl,
  Select, Collapse, CardHeader,Stack
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  People as PeopleIcon, NotificationsActive as NotificationIcon,
  CheckCircle as CheckCircleIcon, Cancel as CancelIcon,
  Pending as PendingIcon, Event as EventIcon, LocationOn as LocationIcon,
  VolunteerActivism as VolunteerIcon, EmojiEvents as RewardIcon,
  MonetizationOn as CoinIcon, CalendarToday as CalendarIcon,
  Close as CloseIcon, Info as InfoIcon, Person as PersonIcon
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { useNotifications } from '../context/NotificationContext'; // Fixed pluralization

const programSchema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  organization: yup.string().required('Organization name is required'),
  zone: yup.string().required('Zone is required'),
  startDate: yup.date().required('Start date is required'),
  endDate: yup.date().required('End date is required')
    .min(yup.ref('startDate'), 'End date must be after start date'),
  volunteerLimit: yup.number().min(1).required('Volunteer limit is required'),
});

const ProgramManagement = () => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications(); // Using the plural hook
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [volunteerRequests, setVolunteerRequests] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [viewProgram, setViewProgram] = useState(null);
  const [stats, setStats] = useState({ totalPrograms: 0, activePrograms: 0, totalVolunteers: 0 });

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm({
    resolver: yupResolver(programSchema),
    defaultValues: { zone: 'central', volunteerLimit: 50 }
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    await Promise.all([fetchPrograms(), fetchVolunteerRequests(), fetchStats()]);
    setLoading(false);
  };

  const fetchPrograms = async () => {
    try {
      const res = await api.get('/programs');
      setPrograms(res.data.programs || []);
    } catch (err) { setError('Failed to fetch programs'); }
  };

  const fetchVolunteerRequests = async () => {
    try {
      const res = await api.get('/programs/volunteer-requests');
      setVolunteerRequests(res.data.requests || []);
    } catch (err) { console.error(err); }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/programs/stats');
      setStats(res.data.stats || {});
    } catch (err) { console.error(err); }
  };

  const handleProcessVolunteer = async (programId, userId, action) => {
    try {
      setProcessingId(`${programId}-${userId}`);
      // Using the generic action endpoint
      await api.put(`/programs/${programId}/volunteer/${userId}`, { action });
      
      setSuccessMessage(action === 'approve' ? 'Volunteer approved! 100 coins rewarded.' : 'Request rejected.');
      loadDashboardData(); // Refresh all stats
    } catch (err) {
      setError('Action failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateStatus = async (programId, status) => {
    try {
      await api.put(`/programs/${programId}/status`, { status });
      setSuccessMessage(`Program marked as ${status}`);
      fetchPrograms();
    } catch (err) { setError('Status update failed'); }
  };

  const handleCreateProgram = async (data) => {
    try {
      if (selectedProgram) {
        await api.put(`/programs/${selectedProgram._id}`, data);
      } else {
        await api.post('/programs', data);
      }
      setSuccessMessage('Program saved successfully');
      setOpenDialog(false);
      loadDashboardData();
    } catch (err) { setError('Save failed'); }
  };

  const handleOpenDialog = (program = null) => {
    if (program) {
      setSelectedProgram(program);
      Object.keys(program).forEach(key => setValue(key, program[key]));
      setValue('startDate', program.startDate?.split('T')[0]);
      setValue('endDate', program.endDate?.split('T')[0]);
    } else {
      reset();
      setSelectedProgram(null);
    }
    setOpenDialog(true);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">Program Management</Typography>
        <Stack direction="row" spacing={2}>
          <Badge badgeContent={unreadCount} color="error">
            <IconButton><NotificationIcon /></IconButton>
          </Badge>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Create Program
          </Button>
        </Stack>
      </Box>

      {/* Stats Summary */}
      <Grid container spacing={3} mb={4}>
        {[
          { label: 'Total', val: stats.totalPrograms, color: 'primary.main' },
          { label: 'Active', val: stats.activePrograms, color: 'success.main' },
          { label: 'Requests', val: volunteerRequests.length, color: 'warning.main' }
        ].map((stat, i) => (
          <Grid item xs={12} md={4} key={i}>
            <Paper sx={{ p: 3, textAlign: 'center', borderLeft: `5px solid ${stat.color}` }}>
              <Typography variant="h3" fontWeight="bold">{stat.val || 0}</Typography>
              <Typography color="textSecondary">{stat.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {successMessage && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>{successMessage}</Alert>}

      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
        <Tab label="Manage Programs" />
        <Tab label={<Badge badgeContent={volunteerRequests.length} color="error" sx={{ px: 2 }}>Volunteer Requests</Badge>} />
      </Tabs>

      {tabValue === 0 ? (
        <Grid container spacing={3}>
          {programs.map((program) => (
            <Grid item xs={12} md={4} key={program._id}>
              <Card elevation={2}>
                <CardHeader 
                  title={program.title} 
                  subheader={program.organization}
                  action={<Chip label={program.status} size="small" color="primary" variant="outlined" />}
                />
                <CardContent>
                  <Typography variant="body2" color="textSecondary" noWrap>{program.description}</Typography>
                  <Divider sx={{ my: 2 }} />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption"><PeopleIcon fontSize="inherit" /> {program.currentVolunteers}/{program.volunteerLimit}</Typography>
                    <Typography variant="caption"><LocationIcon fontSize="inherit" /> {program.zone}</Typography>
                  </Stack>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleOpenDialog(program)}>Edit</Button>
                  <FormControl size="small" sx={{ ml: 'auto', minWidth: 120 }}>
                    <Select value={program.status} onChange={(e) => handleUpdateStatus(program._id, e.target.value)}>
                      <MenuItem value="upcoming">Upcoming</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                    </Select>
                  </FormControl>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 0, borderRadius: 3 }}>
          <List>
            {volunteerRequests.map((req) => (
              <ListItem key={req._id} divider>
                <ListItemAvatar><Avatar><PersonIcon /></Avatar></ListItemAvatar>
                <ListItemText 
                  primary={req.volunteerName} 
                  secondary={`Wants to join: ${req.programTitle}`} 
                />
                <ListItemSecondaryAction>
                  <Button color="success" onClick={() => handleProcessVolunteer(req.programId, req.volunteerId, 'approve')}>Approve</Button>
                  <Button color="error" onClick={() => handleProcessVolunteer(req.programId, req.volunteerId, 'reject')}>Reject</Button>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <form onSubmit={handleSubmit(handleCreateProgram)}>
          <DialogTitle>{selectedProgram ? 'Edit Program' : 'New Program'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} pt={1}>
              <TextField label="Title" fullWidth {...register('title')} error={!!errors.title} />
              <TextField label="Organization" fullWidth {...register('organization')} />
              <TextField label="Description" multiline rows={3} fullWidth {...register('description')} />
              <Grid container spacing={2}>
                <Grid item xs={6}><TextField label="Start" type="date" fullWidth InputLabelProps={{ shrink: true }} {...register('startDate')} /></Grid>
                <Grid item xs={6}><TextField label="End" type="date" fullWidth InputLabelProps={{ shrink: true }} {...register('endDate')} /></Grid>
              </Grid>
              <TextField label="Limit" type="number" {...register('volunteerLimit')} />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default ProgramManagement;