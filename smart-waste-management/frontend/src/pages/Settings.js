import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Chip,
  Tooltip,
  Badge,
  CircularProgress,
  Tab,
  Tabs,
  Radio,
  RadioGroup,
  FormLabel,
  InputAdornment,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Palette as PaletteIcon,
  AccountCircle as AccountIcon,
  VpnKey as PasswordIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  NotificationsActive as NotificationsActiveIcon,
  NotificationsOff as NotificationsOffIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Settings as SettingsIcon,
  Backup as BackupIcon,
  Restore as RestoreIcon,
  ExpandMore as ExpandMoreIcon,
  DataUsage as DataUsageIcon,
  PrivacyTip as PrivacyTipIcon,
  Help as HelpIcon,
  Feedback as FeedbackIcon,
  Download as DownloadIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';

// Tab Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Settings = () => {
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Profile Data
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '9876543210',
    address: '123 Main Street, City, State - 123456',
    bio: 'Environment enthusiast and waste management advocate.',
    profileImage: null
  });

  // Password Data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    collectionReminders: true,
    programUpdates: true,
    rewardAlerts: true,
    volunteerOpportunities: true,
    paymentReminders: true,
    newsletter: false,
    marketingEmails: false
  });

  // Privacy Settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    showAddress: false,
    activityVisible: true,
    dataCollection: true
  });

  // Preferences
  const [preferences, setPreferences] = useState({
    language: 'en',
    theme: 'light',
    fontSize: 'medium',
    timezone: 'IST',
    currency: 'INR',
    distanceUnit: 'km',
    dateFormat: 'DD/MM/YYYY',
    firstDayOfWeek: 'monday'
  });

  // Storage Stats
  const [storageStats, setStorageStats] = useState({
    total: 100,
    used: 45,
    documents: 20,
    images: 15,
    other: 10
  });

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'Hindi' },
    { value: 'ta', label: 'Tamil' },
    { value: 'te', label: 'Telugu' },
    { value: 'kn', label: 'Kannada' },
    { value: 'ml', label: 'Malayalam' },
    { value: 'bn', label: 'Bengali' },
    { value: 'gu', label: 'Gujarati' },
    { value: 'mr', label: 'Marathi' },
    { value: 'pa', label: 'Punjabi' }
  ];

  const timezones = [
    { value: 'IST', label: 'India Standard Time (IST)' },
    { value: 'GMT', label: 'Greenwich Mean Time (GMT)' },
    { value: 'EST', label: 'Eastern Standard Time (EST)' },
    { value: 'PST', label: 'Pacific Standard Time (PST)' },
    { value: 'CST', label: 'Central Standard Time (CST)' },
    { value: 'MST', label: 'Mountain Standard Time (MST)' }
  ];

  const currencies = [
    { value: 'INR', label: 'Indian Rupee (₹)' },
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'JPY', label: 'Japanese Yen (¥)' },
    { value: 'AUD', label: 'Australian Dollar (A$)' }
  ];

  const fontSizes = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
    { value: 'x-large', label: 'Extra Large' }
  ];

  const visibilityOptions = [
    { value: 'public', label: 'Public', description: 'Anyone can see your profile' },
    { value: 'private', label: 'Private', description: 'Only you can see your profile' },
    { value: 'contacts', label: 'Contacts only', description: 'Only approved contacts can see your profile' }
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSnackbar({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success'
      });
      setEditMode(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to update profile',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'Passwords do not match',
        severity: 'error'
      });
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setSnackbar({
        open: true,
        message: 'Password must be at least 8 characters long',
        severity: 'error'
      });
      return;
    }
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSnackbar({
        open: true,
        message: 'Password changed successfully!',
        severity: 'success'
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to change password',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = async () => {
    setLoading(true);
    try {
      setNotificationSettings({
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        collectionReminders: true,
        programUpdates: true,
        rewardAlerts: true,
        volunteerOpportunities: true,
        paymentReminders: true,
        newsletter: false,
        marketingEmails: false
      });
      setPreferences({
        language: 'en',
        theme: 'light',
        fontSize: 'medium',
        timezone: 'IST',
        currency: 'INR',
        distanceUnit: 'km',
        dateFormat: 'DD/MM/YYYY',
        firstDayOfWeek: 'monday'
      });
      setPrivacySettings({
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,
        showAddress: false,
        activityVisible: true,
        dataCollection: true
      });
      setDarkMode(false);
      setSnackbar({
        open: true,
        message: 'Settings reset to default!',
        severity: 'success'
      });
      setOpenResetDialog(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to reset settings',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSnackbar({
        open: true,
        message: 'Account deleted successfully',
        severity: 'success'
      });
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to delete account',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setOpenDeleteDialog(false);
    }
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSnackbar({
        open: true,
        message: 'Data export started. You will receive an email when ready.',
        severity: 'success'
      });
      setOpenExportDialog(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to export data',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'profile', label: 'Profile Information', icon: <AccountIcon /> },
    { id: 'security', label: 'Security & Password', icon: <SecurityIcon /> },
    { id: 'notifications', label: 'Notification Preferences', icon: <NotificationsIcon /> },
    { id: 'privacy', label: 'Privacy & Data', icon: <PrivacyTipIcon /> },
    { id: 'preferences', label: 'App Preferences', icon: <LanguageIcon /> },
    { id: 'appearance', label: 'Appearance', icon: <PaletteIcon /> },
    { id: 'storage', label: 'Storage & Data', icon: <DataUsageIcon /> },
    { id: 'help', label: 'Help & Support', icon: <HelpIcon /> }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight="bold">
          Settings
        </Typography>
      </Box>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage your account settings and preferences
      </Typography>

      <Grid container spacing={3}>
        {/* Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <List>
              {menuItems.map((item) => (
                <ListItem
                  key={item.id}
                  button
                  selected={tabValue === menuItems.findIndex(i => i.id === item.id)}
                  onClick={() => setTabValue(menuItems.findIndex(i => i.id === item.id))}
                  sx={{
                    '&.Mui-selected': {
                      bgcolor: 'primary.light',
                      color: 'primary.main',
                      '& .MuiListItemIcon-root': {
                        color: 'primary.main'
                      }
                    }
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 4, borderRadius: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
              <Tab label="Profile" />
              <Tab label="Security" />
              <Tab label="Notifications" />
              <Tab label="Privacy" />
              <Tab label="Preferences" />
              <Tab label="Appearance" />
              <Tab label="Storage" />
              <Tab label="Help" />
            </Tabs>

            {/* Profile Tab */}
            {tabValue === 0 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" fontWeight="bold">
                    Profile Information
                  </Typography>
                  <Button
                    variant={editMode ? 'contained' : 'outlined'}
                    startIcon={editMode ? <SaveIcon /> : <EditIcon />}
                    onClick={editMode ? handleProfileUpdate : () => setEditMode(true)}
                    disabled={loading}
                  >
                    {editMode ? (loading ? 'Saving...' : 'Save Changes') : 'Edit Profile'}
                  </Button>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} display="flex" justifyContent="center">
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        <IconButton 
                          size="small" 
                          sx={{ bgcolor: 'primary.main', color: 'white' }}
                          disabled={!editMode}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      }
                    >
                      <Avatar
                        sx={{ width: 120, height: 120, fontSize: 48 }}
                        src={profileData.profileImage}
                      >
                        {profileData.name.charAt(0)}
                      </Avatar>
                    </Badge>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      multiline
                      rows={2}
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Bio"
                      multiline
                      rows={3}
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      disabled={!editMode}
                      placeholder="Tell us a little about yourself..."
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Security Tab */}
            {tabValue === 1 && (
              <Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Change Password
                </Typography>

                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type={showPassword ? 'text' : 'password'}
                      label="Current Password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      InputProps={{
                        endAdornment: (
                          <IconButton onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type={showPassword ? 'text' : 'password'}
                      label="New Password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      helperText="Minimum 8 characters with at least one uppercase, one lowercase, and one number"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type={showConfirmPassword ? 'text' : 'password'}
                      label="Confirm New Password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      InputProps={{
                        endAdornment: (
                          <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      onClick={handlePasswordChange}
                      disabled={loading}
                      sx={{ mr: 2 }}
                    >
                      {loading ? 'Changing...' : 'Change Password'}
                    </Button>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                <Typography variant="h5" fontWeight="bold" gutterBottom color="error">
                  Two-Factor Authentication
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Add an extra layer of security to your account by enabling two-factor authentication.
                </Alert>
                <Button variant="outlined" color="primary">
                  Enable 2FA
                </Button>

                <Divider sx={{ my: 4 }} />

                <Typography variant="h5" fontWeight="bold" gutterBottom color="error">
                  Danger Zone
                </Typography>
                <Alert severity="warning" sx={{ mb: 3 }}>
                  These actions are irreversible. Please proceed with caution.
                </Alert>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="warning"
                      startIcon={<RestoreIcon />}
                      onClick={() => setOpenResetDialog(true)}
                      sx={{ py: 1.5, borderRadius: 2 }}
                    >
                      Reset All Settings
                    </Button>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => setOpenDeleteDialog(true)}
                      sx={{ py: 1.5, borderRadius: 2 }}
                    >
                      Delete Account
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Notifications Tab */}
            {tabValue === 2 && (
              <Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Notification Preferences
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Choose how you want to receive notifications
                </Typography>

                <List>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email Notifications"
                      secondary="Receive updates via email"
                    />
                    <Switch
                      edge="end"
                      checked={notificationSettings.emailNotifications}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        emailNotifications: e.target.checked
                      })}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <NotificationsActiveIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Push Notifications"
                      secondary="Receive notifications in your browser"
                    />
                    <Switch
                      edge="end"
                      checked={notificationSettings.pushNotifications}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        pushNotifications: e.target.checked
                      })}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="SMS Notifications"
                      secondary="Receive text message alerts"
                    />
                    <Switch
                      edge="end"
                      checked={notificationSettings.smsNotifications}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        smsNotifications: e.target.checked
                      })}
                    />
                  </ListItem>
                </List>

                <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                  Notification Types
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.collectionReminders}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            collectionReminders: e.target.checked
                          })}
                        />
                      }
                      label="Collection Reminders"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.programUpdates}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            programUpdates: e.target.checked
                          })}
                        />
                      }
                      label="Program Updates"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.rewardAlerts}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            rewardAlerts: e.target.checked
                          })}
                        />
                      }
                      label="Reward Alerts"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.volunteerOpportunities}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            volunteerOpportunities: e.target.checked
                          })}
                        />
                      }
                      label="Volunteer Opportunities"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.paymentReminders}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            paymentReminders: e.target.checked
                          })}
                        />
                      }
                      label="Payment Reminders"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.newsletter}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            newsletter: e.target.checked
                          })}
                        />
                      }
                      label="Monthly Newsletter"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Privacy Tab */}
            {tabValue === 3 && (
              <Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Privacy Settings
                </Typography>

                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Profile Visibility</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <FormControl component="fieldset">
                      <RadioGroup
                        value={privacySettings.profileVisibility}
                        onChange={(e) => setPrivacySettings({ ...privacySettings, profileVisibility: e.target.value })}
                      >
                        {visibilityOptions.map(option => (
                          <FormControlLabel
                            key={option.value}
                            value={option.value}
                            control={<Radio />}
                            label={
                              <Box>
                                <Typography variant="body1">{option.label}</Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {option.description}
                                </Typography>
                              </Box>
                            }
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Personal Information</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List>
                      <ListItem>
                        <ListItemText primary="Show email address on profile" />
                        <Switch
                          checked={privacySettings.showEmail}
                          onChange={(e) => setPrivacySettings({ ...privacySettings, showEmail: e.target.checked })}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Show phone number on profile" />
                        <Switch
                          checked={privacySettings.showPhone}
                          onChange={(e) => setPrivacySettings({ ...privacySettings, showPhone: e.target.checked })}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Show address on profile" />
                        <Switch
                          checked={privacySettings.showAddress}
                          onChange={(e) => setPrivacySettings({ ...privacySettings, showAddress: e.target.checked })}
                        />
                      </ListItem>
                    </List>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Activity & Data</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List>
                      <ListItem>
                        <ListItemText 
                          primary="Show activity status" 
                          secondary="Let others see when you're active"
                        />
                        <Switch
                          checked={privacySettings.activityVisible}
                          onChange={(e) => setPrivacySettings({ ...privacySettings, activityVisible: e.target.checked })}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Data collection for analytics" 
                          secondary="Help us improve by sharing usage data"
                        />
                        <Switch
                          checked={privacySettings.dataCollection}
                          onChange={(e) => setPrivacySettings({ ...privacySettings, dataCollection: e.target.checked })}
                        />
                      </ListItem>
                    </List>
                  </AccordionDetails>
                </Accordion>

                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => setOpenExportDialog(true)}
                    sx={{ mr: 2 }}
                  >
                    Export My Data
                  </Button>
                  <Button variant="outlined" color="error">
                    Request Data Deletion
                  </Button>
                </Box>
              </Box>
            )}

            {/* Preferences Tab */}
            {tabValue === 4 && (
              <Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  App Preferences
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Language</InputLabel>
                      <Select
                        value={preferences.language}
                        onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                        label="Language"
                      >
                        {languages.map(lang => (
                          <MenuItem key={lang.value} value={lang.value}>{lang.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Timezone</InputLabel>
                      <Select
                        value={preferences.timezone}
                        onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                        label="Timezone"
                      >
                        {timezones.map(tz => (
                          <MenuItem key={tz.value} value={tz.value}>{tz.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Currency</InputLabel>
                      <Select
                        value={preferences.currency}
                        onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                        label="Currency"
                      >
                        {currencies.map(curr => (
                          <MenuItem key={curr.value} value={curr.value}>{curr.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Date Format</InputLabel>
                      <Select
                        value={preferences.dateFormat}
                        onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                        label="Date Format"
                      >
                        <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                        <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                        <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Distance Unit</InputLabel>
                      <Select
                        value={preferences.distanceUnit}
                        onChange={(e) => setPreferences({ ...preferences, distanceUnit: e.target.value })}
                        label="Distance Unit"
                      >
                        <MenuItem value="km">Kilometers (km)</MenuItem>
                        <MenuItem value="mi">Miles (mi)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>First Day of Week</InputLabel>
                      <Select
                        value={preferences.firstDayOfWeek}
                        onChange={(e) => setPreferences({ ...preferences, firstDayOfWeek: e.target.value })}
                        label="First Day of Week"
                      >
                        <MenuItem value="monday">Monday</MenuItem>
                        <MenuItem value="sunday">Sunday</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Appearance Tab */}
            {tabValue === 5 && (
              <Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Appearance
                </Typography>

                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    bgcolor: darkMode ? 'grey.900' : 'background.paper',
                    color: darkMode ? 'white' : 'text.primary',
                    mb: 3
                  }}
                  onClick={() => setDarkMode(!darkMode)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {darkMode ? <DarkModeIcon /> : <LightModeIcon />}
                    <Box>
                      <Typography variant="h6">
                        {darkMode ? 'Dark Mode' : 'Light Mode'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {darkMode
                          ? 'Switch to light mode for better visibility in bright environments'
                          : 'Switch to dark mode for reduced eye strain in low light'}
                      </Typography>
                    </Box>
                  </Box>
                  <Switch checked={darkMode} />
                </Paper>

                <Typography variant="subtitle1" gutterBottom>
                  Font Size
                </Typography>
                <Slider
                  value={fontSizes.findIndex(f => f.value === preferences.fontSize) * 25}
                  onChange={(e, val) => {
                    const index = Math.round(val / 25);
                    setPreferences({ ...preferences, fontSize: fontSizes[index].value });
                  }}
                  marks={fontSizes.map((f, i) => ({ value: i * 25, label: f.label }))}
                  step={25}
                  min={0}
                  max={75}
                  valueLabelDisplay="auto"
                  sx={{ mb: 4 }}
                />

                <Typography variant="subtitle1" gutterBottom>
                  Theme Color
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {['#2E7D32', '#1976D2', '#9C27B0', '#ED6C02', '#D32F2F'].map(color => (
                    <Tooltip key={color} title={color}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: color,
                          cursor: 'pointer',
                          border: preferences.theme === color ? 3 : 0,
                          borderColor: 'primary.main',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            transition: 'transform 0.2s'
                          }
                        }}
                        onClick={() => setPreferences({ ...preferences, theme: color })}
                      />
                    </Tooltip>
                  ))}
                </Box>
              </Box>
            )}

            {/* Storage Tab */}
            {tabValue === 6 && (
              <Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Storage & Data
                </Typography>

                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Storage Usage
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">{storageStats.used} MB used</Typography>
                        <Typography variant="body2">{storageStats.total} MB total</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(storageStats.used / storageStats.total) * 100}
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                    </Box>

                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">
                          Documents
                        </Typography>
                        <Typography variant="h6">{storageStats.documents} MB</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">
                          Images
                        </Typography>
                        <Typography variant="h6">{storageStats.images} MB</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">
                          Other
                        </Typography>
                        <Typography variant="h6">{storageStats.other} MB</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Button
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  color="error"
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Clear Cache
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  fullWidth
                  onClick={() => setOpenExportDialog(true)}
                >
                  Export All Data
                </Button>
              </Box>
            )}

            {/* Help Tab */}
            {tabValue === 7 && (
              <Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Help & Support
                </Typography>

                <List>
                  <ListItem button>
                    <ListItemIcon>
                      <HelpIcon />
                    </ListItemIcon>
                    <ListItemText primary="FAQ" secondary="Frequently asked questions" />
                  </ListItem>
                  <ListItem button>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText primary="Contact Support" secondary="Get help from our team" />
                  </ListItem>
                  <ListItem button>
                    <ListItemIcon>
                      <FeedbackIcon />
                    </ListItemIcon>
                    <ListItemText primary="Send Feedback" secondary="Help us improve" />
                  </ListItem>
                  <ListItem button>
                    <ListItemIcon>
                      <InfoIcon />
                    </ListItemIcon>
                    <ListItemText primary="About" secondary="Version 1.0.0" />
                  </ListItem>
                </List>

                <Divider sx={{ my: 3 }} />

                <Typography variant="body2" color="textSecondary" align="center">
                  © 2024 Smart Waste Management System. All rights reserved.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Reset Settings Dialog */}
      <Dialog open={openResetDialog} onClose={() => setOpenResetDialog(false)}>
        <DialogTitle>Reset Settings</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to reset all settings to default? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenResetDialog(false)}>Cancel</Button>
          <Button onClick={handleResetSettings} color="warning" variant="contained">
            Reset All Settings
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            This action is permanent and cannot be undone!
          </Alert>
          <Typography>
            Are you absolutely sure you want to delete your account? This will:
          </Typography>
          <ul>
            <li>Permanently delete all your data</li>
            <li>Remove you from all programs</li>
            <li>Cancel all scheduled collections</li>
            <li>Delete your reward history</li>
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteAccount} color="error" variant="contained">
            Yes, Delete My Account
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Data Dialog */}
      <Dialog open={openExportDialog} onClose={() => setOpenExportDialog(false)}>
        <DialogTitle>Export Your Data</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            You can export all your data in various formats. The export will include:
          </Typography>
          <ul>
            <li>Profile information</li>
            <li>Collection history</li>
            <li>Program participation</li>
            <li>Payment records</li>
            <li>Rewards and achievements</li>
          </ul>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Export Format</InputLabel>
            <Select defaultValue="json" label="Export Format">
              <MenuItem value="json">JSON</MenuItem>
              <MenuItem value="csv">CSV</MenuItem>
              <MenuItem value="pdf">PDF</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenExportDialog(false)}>Cancel</Button>
          <Button onClick={handleExportData} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Export'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Settings;