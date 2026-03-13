import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Paper, Typography, Box, List, ListItem, ListItemAvatar,
  ListItemText, Avatar, IconButton, Chip, Tabs, Tab, Button,
  Divider, CircularProgress, alpha, useTheme, Stack, Tooltip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Delete as DeleteIcon,
  Drafts as ReadIcon,
  EmojiEvents as RewardIcon,
  LocalShipping as TruckIcon,
  Info as InfoIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  CheckCircle as DoneIcon
} from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import api from '../services/api';
import { format } from 'date-fns';

const Notifications= () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [tabValue, setTabValue] = useState('all');
  const [stats, setStats] = useState({ unread: 0, total: 0 });

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/notifications?filter=${tabValue}`);
      setNotifications(res.data.notifications || []);
      setStats({
        unread: res.data.unreadCount || 0,
        total: res.data.pagination?.total || 0
      });
    } catch (err) {
      toast.error("Could not load notifications");
    } finally {
      setLoading(false);
    }
  }, [tabValue]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      toast.success("All caught up!");
      fetchNotifications();
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.info("Notification removed");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'reward': return <RewardIcon sx={{ color: '#FFD700' }} />;
      case 'collection': return <TruckIcon sx={{ color: theme.palette.primary.main }} />;
      default: return <InfoIcon color="action" />;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #eee' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
              <NotificationsIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">Notification Center</Typography>
              <Typography variant="body2" color="textSecondary">
                You have {stats.unread} unread messages
              </Typography>
            </Box>
          </Box>
          {stats.unread > 0 && (
            <Button startIcon={<DoneIcon />} onClick={handleMarkAllRead} size="small" variant="outlined">
              Mark all as read
            </Button>
          )}
        </Stack>

        <Tabs 
          value={tabValue} 
          onChange={(e, v) => setTabValue(v)} 
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab label="All" value="all" />
          <Tab label="Unread" value="unread" />
          <Tab label="Archived" value="archived" />
        </Tabs>

        {loading ? (
          <Box textAlign="center" py={10}><CircularProgress /></Box>
        ) : (
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {notifications.map((n) => (
              <React.Fragment key={n._id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{ 
                    borderRadius: 2, 
                    mb: 1, 
                    bgcolor: n.read ? 'transparent' : alpha(theme.palette.primary.main, 0.03),
                    transition: '0.2s',
                    '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.05) }
                  }}
                  secondaryAction={
                    <Stack direction="row" spacing={1}>
                      {!n.read && (
                        <Tooltip title="Mark as Read">
                          <IconButton size="small" onClick={() => handleMarkAsRead(n._id)}><ReadIcon fontSize="small" /></IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDelete(n._id)} color="error"><DeleteIcon fontSize="small" /></IconButton>
                      </Tooltip>
                    </Stack>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'white', border: '1px solid #eee' }}>
                      {getIcon(n.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography fontWeight={n.read ? "500" : "bold"}>{n.title}</Typography>
                        {!n.read && <Chip label="New" color="primary" size="small" sx={{ height: 16, fontSize: '0.6rem' }} />}
                      </Stack>
                    }
                    secondary={
                      <Box component="span" sx={{ display: 'block' }}>
                        <Typography variant="body2" color="textPrimary" sx={{ my: 0.5 }}>{n.message}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {format(new Date(n.createdAt), 'PPp')}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
            {notifications.length === 0 && (
              <Box textAlign="center" py={10}>
                <InfoIcon sx={{ fontSize: 50, color: '#ccc', mb: 2 }} />
                <Typography color="textSecondary">No notifications found.</Typography>
              </Box>
            )}
          </List>
        )}
      </Paper>
      <ToastContainer position="bottom-right" />
    </Container>
  );
};

export default Notifications;