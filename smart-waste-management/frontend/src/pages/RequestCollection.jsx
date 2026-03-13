import React, { useState } from 'react';
import { 
  Box, Container, Grid, Typography, Button, TextField, MenuItem, 
  Select, FormControl, InputLabel, Drawer, List, ListItem, 
  ListItemIcon, ListItemText, AppBar, Toolbar, IconButton, 
  useTheme, useMediaQuery, Paper, Divider, Stack, Avatar
} from '@mui/material';
import { 
  Dashboard, LocalShipping, Payment, Logout, Menu as MenuIcon, 
  LocationOn, History, DeleteOutline
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const drawerWidth = 260;

const RequestCollection = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Form States
  const [wasteType, setWasteType] = useState('Mixed');
  const [actualWeight, setActualWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/collections', {
        wasteType,
        actualWeight: actualWeight ? Number(actualWeight) : undefined,
        notes
      });
      toast.success("Waste pickup requested successfully!");
      navigate('/my-collections'); // Redirect to history after success
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to request pickup");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success("Logged out successfully");
  };

  // ==========================================
  // SIDEBAR COMPONENT
  // ==========================================
  const menuItems = [
    { label: 'Dashboard Overview', icon: <Dashboard />, action: () => navigate('/resident/dashboard'), active: false },
    { label: 'Request Pickup', icon: <LocalShipping />, action: () => navigate('/request-collection'), active: true },
    { label: 'My Collections', icon: <History />, action: () => navigate('/my-collections'), active: false },
    { label: 'Khalti Payments', icon: <Payment />, action: () => navigate('/payments'), active: false },
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', bgcolor: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: 3, py: 3 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}><LocationOn fontSize="small" /></Avatar>
          <Typography variant="h6" fontWeight="900" sx={{ letterSpacing: 1 }}>RESIDENT</Typography>
        </Stack>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      
      <List sx={{ px: 2, mt: 3, flexGrow: 1 }}>
        {menuItems.map((item, index) => (
          <ListItem 
            button 
            key={index}
            onClick={() => { item.action(); if (isMobile) setMobileOpen(false); }}
            sx={{ 
              mb: 1.5, borderRadius: 2,
              bgcolor: item.active ? 'primary.main' : 'transparent',
              '&:hover': { bgcolor: item.active ? 'primary.main' : 'rgba(255,255,255,0.05)' }
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={<Typography fontWeight={item.active ? 800 : 500} fontSize="0.95rem">{item.label}</Typography>} />
          </ListItem>
        ))}
      </List>

      <Box sx={{ p: 2 }}>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 2 }} />
        <Button 
          fullWidth variant="text" color="error" 
          startIcon={<Logout />} onClick={handleLogout}
          sx={{ fontWeight: 700, justifyContent: 'flex-start', px: 2 }}
        >
          Sign Out
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f1f5f9' }}>
      
      {/* Mobile App Bar */}
      <AppBar position="fixed" sx={{ width: { md: `calc(100% - ${drawerWidth}px)` }, ml: { md: `${drawerWidth}px` }, bgcolor: 'white', color: 'text.primary', display: { md: 'none' }, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2 }}><MenuIcon /></IconButton>
          <Typography variant="h6" fontWeight="bold">Request Pickup</Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar Navigation */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth, borderRight: 'none' } }}>
          {drawerContent}
        </Drawer>
        <Drawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth, borderRight: 'none' } }} open>
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Workspace */}
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 5 }, width: { md: `calc(100% - ${drawerWidth}px)` }, mt: { xs: 8, md: 0 } }}>
        <Container maxWidth="md" disableGutters>
          
          <Box mb={4}>
            <Typography variant="h4" fontWeight="900" color="#0f172a">Request Waste Collection</Typography>
            <Typography variant="body1" color="textSecondary" mt={1}>
              Fill out the details below to schedule a pickup for your zone ({user?.address?.zone?.toUpperCase() || 'UNASSIGNED'}).
            </Typography>
          </Box>

          <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', p: { xs: 3, md: 5 } }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={4}>
                
                {/* Waste Type Dropdown */}
                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="waste-type-label" sx={{ fontWeight: 600 }}>Waste Category</InputLabel>
                    <Select
                      labelId="waste-type-label"
                      label="Waste Category"
                      value={wasteType}
                      onChange={(e) => setWasteType(e.target.value)}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="Organic">Organic (Food, Plants)</MenuItem>
                      <MenuItem value="Recyclable">Recyclable (Paper, Plastic, Glass)</MenuItem>
                      <MenuItem value="Hazardous">Hazardous (Batteries, Chemicals)</MenuItem>
                      <MenuItem value="Mixed">Mixed Solid Waste</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Estimated Weight */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Estimated Weight (kg)"
                    type="number"
                    variant="outlined"
                    value={actualWeight}
                    onChange={(e) => setActualWeight(e.target.value)}
                    placeholder="e.g., 5"
                    InputProps={{ inputProps: { min: 0, step: "0.1" } }}
                    helperText="Providing an estimated weight helps collectors plan their truck capacity."
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>

                {/* Additional Notes */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Additional Notes for Collector (Optional)"
                    variant="outlined"
                    multiline
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g., The bags are placed behind the green gate."
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>

                {/* Submit Button */}
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={loading}
                    startIcon={<DeleteOutline />}
                    sx={{ py: 1.5, fontWeight: 800, borderRadius: 2, fontSize: '1.05rem', width: { xs: '100%', md: 'auto' } }}
                  >
                    {loading ? 'Submitting Request...' : 'Schedule Pickup'}
                  </Button>
                </Grid>

              </Grid>
            </form>
          </Paper>

        </Container>
      </Box>
    </Box>
  );
};

export default RequestCollection;