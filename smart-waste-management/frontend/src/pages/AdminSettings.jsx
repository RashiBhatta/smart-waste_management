// import React, { useState, useEffect } from 'react';
// import { Box, Typography, Paper, TextField, Button, Stack, Divider, Chip, IconButton } from '@mui/material';
// import { Add, Delete, Public } from '@mui/icons-material';
// import api from '../services/api';
// import { toast } from 'react-toastify';

// const AdminSettings = () => {
//   const [zones, setZones] = useState(['Central', 'North', 'South', 'West']);
//   const [newZone, setNewZone] = useState('');

//   const handleAddZone = () => {
//     if (!newZone) return;
//     setZones([...zones, newZone]);
//     setNewZone('');
//     toast.success(`Zone "${newZone}" added to the system.`);
//   };

//   const removeZone = (zoneToDelete) => {
//     setZones(zones.filter(z => z !== zoneToDelete));
//   };

//   return (
//     <Box sx={{ p: 4, mt: 8 }}>
//       <Typography variant="h4" fontWeight={900} mb={4}>System Settings</Typography>
      
//       <Grid container spacing={4}>
//         <Grid item xs={12} md={6}>
//           <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #eee' }}>
//             <Typography variant="h6" fontWeight={800} gutterBottom display="flex" alignItems="center" gap={1}>
//               <Public color="primary" /> Manage Municipal Zones
//             </Typography>
//             <Typography variant="body2" color="textSecondary" mb={3}>
//               Define the wards or zones available for Residents and Collectors.
//             </Typography>
            
//             <Stack direction="row" spacing={1} mb={3}>
//               <TextField 
//                 fullWidth size="small" 
//                 placeholder="Enter Ward/Zone Name" 
//                 value={newZone}
//                 onChange={(e) => setNewZone(e.target.value)}
//               />
//               <Button variant="contained" onClick={handleAddZone} startIcon={<Add />}>Add</Button>
//             </Stack>

//             <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
//               {zones.map((zone) => (
//                 <Chip 
//                   key={zone} 
//                   label={zone} 
//                   onDelete={() => removeZone(zone)} 
//                   color="primary" 
//                   variant="outlined" 
//                   sx={{ fontWeight: 700 }}
//                 />
//               ))}
//             </Box>
//           </Paper>
//         </Grid>

//         <Grid item xs={12} md={6}>
//           <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #eee' }}>
//             <Typography variant="h6" fontWeight={800} gutterBottom>Service Pricing (NPR)</Typography>
//             <TextField 
//               fullWidth label="Monthly Collection Fee" 
//               defaultValue="1000" 
//               InputProps={{ readOnly: true }}
//               helperText="Fixed as per Project Proposal"
//               sx={{ mb: 2, mt: 2 }}
//             />
//             <TextField 
//               fullWidth label="Volunteer Reward (Coins)" 
//               defaultValue="100" 
//               InputProps={{ readOnly: true }}
//               helperText="Fixed as per Project Proposal"
//             />
//           </Paper>
//         </Grid>
//       </Grid>
//     </Box>
//   );
// };

// export default AdminSettings;







import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Snackbar,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  Storage as StorageIcon,
  Backup as BackupIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';

const AdminSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Settings state
  const [settings, setSettings] = useState({
    siteName: 'SWM System',
    siteUrl: 'https://swm.example.com',
    adminEmail: 'admin@swm.com',
    timezone: 'Asia/Kathmandu',
    dateFormat: 'MM/DD/YYYY',
    itemsPerPage: 20,
    enableNotifications: true,
    enableEmailAlerts: true,
    enableSmsAlerts: false,
    maintenanceMode: false,
    debugMode: false,
    theme: 'light',
    primaryColor: '#1976d2',
    backupFrequency: 'daily',
    retentionDays: 30
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSnackbar({
        open: true,
        message: 'Settings saved successfully!',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to save settings',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleOpenDialog = (type) => {
    setDialogType(type);
    setOpenDialog(true);
  };

  const SettingSection = ({ title, icon, children }) => (
    <Card sx={{ mb: 3, borderRadius: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>{icon}</Avatar>
          <Typography variant="h6">{title}</Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {children}
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">System Settings</Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12} md={6}>
          <SettingSection title="General" icon={<LanguageIcon />}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Site Name"
                  value={settings.siteName}
                  onChange={handleChange('siteName')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Site URL"
                  value={settings.siteUrl}
                  onChange={handleChange('siteUrl')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Admin Email"
                  type="email"
                  value={settings.adminEmail}
                  onChange={handleChange('adminEmail')}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={settings.timezone}
                    onChange={handleChange('timezone')}
                    label="Timezone"
                  >
                    <MenuItem value="Asia/Kathmandu">Asia/Kathmandu (UTC+5:45)</MenuItem>
                    <MenuItem value="Asia/Kolkata">Asia/Kolkata (UTC+5:30)</MenuItem>
                    <MenuItem value="UTC">UTC</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Date Format</InputLabel>
                  <Select
                    value={settings.dateFormat}
                    onChange={handleChange('dateFormat')}
                    label="Date Format"
                  >
                    <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                    <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                    <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Items Per Page"
                  value={settings.itemsPerPage}
                  onChange={handleChange('itemsPerPage')}
                />
              </Grid>
            </Grid>
          </SettingSection>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <SettingSection title="Notifications" icon={<NotificationsIcon />}>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Enable Notifications" 
                  secondary="Show notifications in the app"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.enableNotifications}
                    onChange={handleChange('enableNotifications')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Email Alerts" 
                  secondary="Send email notifications"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.enableEmailAlerts}
                    onChange={handleChange('enableEmailAlerts')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="SMS Alerts" 
                  secondary="Send SMS notifications"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.enableSmsAlerts}
                    onChange={handleChange('enableSmsAlerts')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </SettingSection>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <SettingSection title="Security" icon={<SecurityIcon />}>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Maintenance Mode" 
                  secondary="Temporarily disable access"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.maintenanceMode}
                    onChange={handleChange('maintenanceMode')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Debug Mode" 
                  secondary="Enable debugging features"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.debugMode}
                    onChange={handleChange('debugMode')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </SettingSection>
        </Grid>

        {/* Backup Settings */}
        <Grid item xs={12} md={6}>
          <SettingSection title="Backup" icon={<BackupIcon />}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Backup Frequency</InputLabel>
                  <Select
                    value={settings.backupFrequency}
                    onChange={handleChange('backupFrequency')}
                    label="Backup Frequency"
                  >
                    <MenuItem value="hourly">Hourly</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Retention Days"
                  value={settings.retentionDays}
                  onChange={handleChange('retentionDays')}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => handleOpenDialog('backup')}
                >
                  Backup Now
                </Button>
              </Grid>
            </Grid>
          </SettingSection>
        </Grid>

        {/* Appearance Settings */}
        <Grid item xs={12}>
          <SettingSection title="Appearance" icon={<PaletteIcon />}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={settings.theme}
                    onChange={handleChange('theme')}
                    label="Theme"
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="system">System Default</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Primary Color"
                  value={settings.primaryColor}
                  onChange={handleChange('primaryColor')}
                  type="color"
                />
              </Grid>
            </Grid>
          </SettingSection>
        </Grid>
      </Grid>

      {/* Backup Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create Backup</DialogTitle>
        <DialogContent>
          <Typography>
            This will create a complete backup of all system data including:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="User accounts and profiles" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Collection records" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Programs and volunteer data" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Payment history" />
            </ListItem>
            <ListItem>
              <ListItemText primary="System settings" />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            setOpenDialog(false);
            toast.success('Backup created successfully!');
          }}>
            Create Backup
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminSettings;