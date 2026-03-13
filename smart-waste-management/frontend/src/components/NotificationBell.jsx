import React, { useState } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Avatar,
  Divider,
  Button,
  ListItemIcon,
  ListItemText,
  Chip,
  alpha,
  useTheme
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle,
  Info,
  LocalShipping,
  EmojiEvents,
  Delete,
  DoneAll,
  Schedule
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }
    
    // Navigate based on notification type
    if (notification.data?.programId) {
      navigate(`/programs/${notification.data.programId}`);
    } else if (notification.data?.collectionId) {
      navigate(`/collections/${notification.data.collectionId}`);
    } else if (notification.type === 'payment_received') {
      navigate('/payments');
    }
    
    handleClose();
  };

  const handleViewAll = () => {
    navigate('/notifications');
    handleClose();
  };

  const getIcon = (type) => {
    switch (type) {
      case 'volunteer_approved':
      case 'volunteer_request':
        return <EmojiEvents sx={{ color: '#FFD700' }} />;
      case 'collection_update':
        return <LocalShipping sx={{ color: theme.palette.primary.main }} />;
      case 'payment_received':
        return <CheckCircle sx={{ color: '#4caf50' }} />;
      case 'free_service_unlocked':
        return <EmojiEvents sx={{ color: '#9c27b0' }} />;
      default:
        return <Info sx={{ color: theme.palette.info.main }} />;
    }
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="large"
        sx={{
          color: open ? 'primary.main' : 'inherit',
          bgcolor: open ? alpha(theme.palette.primary.main, 0.1) : 'transparent'
        }}
      >
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480,
            borderRadius: 2,
            mt: 1.5,
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<DoneAll />}
              onClick={markAllAsRead}
              sx={{ textTransform: 'none' }}
            >
              Mark all read
            </Button>
          )}
        </Box>

        <Divider />

        <Box sx={{ maxHeight: 360, overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <NotificationsIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
              <Typography color="text.secondary">No notifications</Typography>
            </Box>
          ) : (
            notifications.slice(0, 5).map((notification) => (
              <MenuItem
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  py: 2,
                  px: 2,
                  borderBottom: '1px solid #eee',
                  bgcolor: notification.read ? 'transparent' : alpha(theme.palette.primary.main, 0.05),
                  '&:hover': {
                    bgcolor: notification.read ? alpha(theme.palette.action.hover, 0.1) : alpha(theme.palette.primary.main, 0.1)
                  }
                }}
              >
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: 'transparent' }}>
                    {getIcon(notification.type)}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography fontWeight={notification.read ? 500 : 700}>
                      {notification.title}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <Schedule fontSize="inherit" />
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </Typography>
                    </Box>
                  }
                />
                {!notification.read && (
                  <Chip
                    label="New"
                    color="primary"
                    size="small"
                    sx={{ height: 20, fontSize: '0.6rem', ml: 1 }}
                  />
                )}
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification._id);
                  }}
                  sx={{ ml: 1 }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </MenuItem>
            ))
          )}
        </Box>

        {notifications.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1 }}>
              <Button fullWidth onClick={handleViewAll}>
                View All Notifications
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;