// import React, { useState } from 'react';
// import { Box, Container, Paper, Avatar, Typography, Button, TextField, Stack, Divider } from '@mui/material';
// import { PhotoCamera, Badge, AccountCircle } from '@mui/icons-material';
// import { useAuth } from '../context/AuthContext';
// import api from '../services/api';
// import { toast } from 'react-toastify';

// const Profile = () => {
//   const { user, setUser } = useAuth();
//   const [profileData, setProfileData] = useState({
//     name: user?.name || '',
//     email: user?.email || '',
//     phone: user?.phone || ''
//   });

//   const handleUpdate = async () => {
//     try {
//       const res = await api.put('/auth/update-profile', profileData);
//       setUser(res.data.user);
//       toast.success("Profile updated!");
//     } catch (err) {
//       toast.error("Failed to update profile.");
//     }
//   };

//   return (
//     <Container maxWidth="md" sx={{ mt: 12, mb: 4 }}>
//       <Paper sx={{ p: 4, borderRadius: 6, textAlign: 'center' }}>
//         <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
//           <Avatar 
//             src={user?.avatar} 
//             sx={{ width: 120, height: 120, mx: 'auto', bgcolor: 'primary.main', fontSize: '3rem' }}
//           >
//             {user?.name?.[0]}
//           </Avatar>
//           <IconButton 
//             color="primary" 
//             sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: 'white', boxShadow: 1 }}
//             component="label"
//           >
//             <input hidden accept="image/*" type="file" />
//             <PhotoCamera />
//           </IconButton>
//         </Box>

//         <Typography variant="h5" fontWeight={900}>{user?.name}</Typography>
//         <Typography color="textSecondary" gutterBottom>{user?.role?.toUpperCase()}</Typography>
        
//         {user?.role === 'resident' && (
//           <Chip label={`${user?.coins || 0} Eco-Coins`} color="success" sx={{ fontWeight: 800, mt: 1 }} />
//         )}

//         <Divider sx={{ my: 4 }} />

//         <Stack spacing={3} textAlign="left">
//           <TextField 
//             fullWidth label="Full Name" 
//             value={profileData.name} 
//             onChange={(e) => setProfileData({...profileData, name: e.target.value})} 
//           />
//           <TextField 
//             fullWidth label="Email Address" 
//             value={profileData.email} disabled 
//           />
//           <TextField 
//             fullWidth label="Phone Number" 
//             value={profileData.phone}
//             onChange={(e) => setProfileData({...profileData, phone: e.target.value})} 
//           />
//           <Button variant="contained" size="large" onClick={handleUpdate} sx={{ fontWeight: 800, borderRadius: 3 }}>
//             Save Changes
//           </Button>
//         </Stack>
//       </Paper>
//     </Container>
//   );
// };

// export default Profile;





import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Avatar,
  Chip,
  Divider,
  Alert,
  Snackbar,
  Card,
  CardContent,
  IconButton,
  Stack
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useCoins } from '../context/CoinContext';
import api from '../services/api';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { balance, totalEarned } = useCoins();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: {
      zone: user?.address?.zone || '',
      street: user?.address?.street || ''
    }
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (field) => (event) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: event.target.value
        }
      });
    } else {
      setFormData({ ...formData, [field]: event.target.value });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await api.put('/users/profile', formData);
      if (response.data.success) {
        updateUser(response.data.user);
        setSnackbar({
          open: true,
          message: 'Profile updated successfully!',
          severity: 'success'
        });
        setEditing(false);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update profile',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: {
        zone: user?.address?.zone || '',
        street: user?.address?.street || ''
      }
    });
    setEditing(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">My Profile</Typography>
        {!editing ? (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => setEditing(true)}
          >
            Edit Profile
          </Button>
        ) : (
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Stack>
        )}
      </Box>

      {/* Profile Card */}
      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={4}>
            {/* Avatar Section */}
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Box position="relative" display="inline-block">
                <Avatar
                  sx={{
                    width: 150,
                    height: 150,
                    bgcolor: 'primary.main',
                    fontSize: 48,
                    mb: 2
                  }}
                >
                  {user?.name?.[0]?.toUpperCase()}
                </Avatar>
                {editing && (
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: 16,
                      right: 0,
                      bgcolor: 'background.paper',
                      '&:hover': { bgcolor: 'background.paper' }
                    }}
                  >
                    <PhotoCamera />
                  </IconButton>
                )}
              </Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {user?.name}
              </Typography>
              <Chip
                label={user?.role?.toUpperCase()}
                color={user?.role === 'admin' ? 'error' : user?.role === 'collector' ? 'info' : 'success'}
                sx={{ fontWeight: 700, borderRadius: 2 }}
              />
            </Grid>

            {/* Details Section */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={formData.name}
                    onChange={handleChange('name')}
                    disabled={!editing}
                    InputProps={{
                      startAdornment: <BadgeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    disabled={!editing}
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={formData.phone}
                    onChange={handleChange('phone')}
                    disabled={!editing}
                    InputProps={{
                      startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Zone"
                    value={formData.address.zone}
                    onChange={handleChange('address.zone')}
                    disabled={!editing}
                    InputProps={{
                      startAdornment: <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Street Address"
                    value={formData.address.street}
                    onChange={handleChange('address.street')}
                    disabled={!editing}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Stats Card */}
      <Card sx={{ borderRadius: 3, bgcolor: '#0f172a', color: 'white' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Account Statistics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={6} md={3}>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>Member Since</Typography>
              <Typography variant="h6" fontWeight="bold">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>Coin Balance</Typography>
              <Typography variant="h6" fontWeight="bold" color="warning.main">
                {balance} coins
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>Total Earned</Typography>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                {totalEarned} coins
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>Account Status</Typography>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                Active
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Snackbar for notifications */}
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

export default Profile;