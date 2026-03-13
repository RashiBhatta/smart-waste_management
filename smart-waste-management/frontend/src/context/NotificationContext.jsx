// // import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
// // import { toast } from 'react-toastify';
// // import api from '../services/api';
// // import { useAuth } from './AuthContext';
// // import io from 'socket.io-client';

// // const NotificationContext = createContext();

// // export const NotificationProvider = ({ children }) => {
// //   const { user } = useAuth();
// //   const [notifications, setNotifications] = useState([]);
// //   const [unreadCount, setUnreadCount] = useState(0);
// //   const [socket, setSocket] = useState(null);

// //   // 1. Fetch metadata (unread count) from API
// //   const fetchMetadata = useCallback(async () => {
// //     if (!user) return;
// //     try {
// //       const res = await api.get('/notifications/unread-count');
// //       setUnreadCount(res.data.count || 0);
// //     } catch (err) {
// //       console.error("Failed to fetch notification count");
// //     }
// //   }, [user]);

// //   // 2. Helper to show manual notifications from any component
// //   const showNotification = (message, type = 'info') => {
// //     toast[type](message);
// //   };

// //   // 3. Initialize Socket.io Connection
// //   useEffect(() => {
// //     if (user) {
// //       const newSocket = io('http://localhost:5000', {
// //         transports: ['websocket'],
// //         query: { token: localStorage.getItem('token') }
// //       });

// //       newSocket.on('connect', () => {
// //         console.log('📡 Connected to notification server');
// //         newSocket.emit('authenticate', localStorage.getItem('token'));
// //       });

// //       // Listen for real-time notifications from backend
// //       newSocket.on('newNotification', (notif) => {
// //         setUnreadCount(prev => prev + 1);
// //         setNotifications(prev => [notif, ...prev]);
        
// //         // Priority-based Toasting
// //         if (notif.priority === 'high') {
// //           toast.success(`${notif.title}: ${notif.message}`);
// //         } else {
// //           toast.info(notif.title);
// //         }
// //       });

// //       setSocket(newSocket);
// //       fetchMetadata();

// //       return () => {
// //         if (newSocket) newSocket.close();
// //       };
// //     } else {
// //       setUnreadCount(0);
// //       setNotifications([]);
// //     }
// //   }, [user, fetchMetadata]);

// //   const markAllAsRead = async () => {
// //     try {
// //       await api.put('/notifications/read-all');
// //       setUnreadCount(0);
// //       showNotification("All notifications cleared", "success");
// //     } catch (err) {
// //       showNotification("Failed to clear notifications", "error");
// //     }
// //   };

// //   return (
// //     <NotificationContext.Provider value={{ 
// //       notifications, 
// //       unreadCount, 
// //       setUnreadCount, 
// //       markAllAsRead, 
// //       showNotification, // Now available for ProgramManagement.jsx
// //       fetchMetadata,    // To manually refresh count
// //       socket 
// //     }}>
// //       {children}
// //     </NotificationContext.Provider>
// //   );
// // };

// // // Pluralized hook name used by the rest of the application
// // export const useNotifications = () => {
// //   const context = useContext(NotificationContext);
// //   if (!context) {
// //     throw new Error('useNotifications must be used within a NotificationProvider');
// //   }
// //   return context;
// // };







// import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import { useAuth } from './AuthContext';
// import api from '../services/api';
// import { io } from 'socket.io-client';

// const NotificationContext = createContext();

// export const useNotifications = () => {
//   const context = useContext(NotificationContext);
//   if (!context) {
//     throw new Error('useNotifications must be used within a NotificationProvider');
//   }
//   return context;
// };

// export const NotificationProvider = ({ children }) => {
//   const { user } = useAuth();
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [socket, setSocket] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Initialize socket connection
//   useEffect(() => {
//     if (user) {
//       const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
//         query: { userId: user._id || user.id }
//       });

//       newSocket.on('connect', () => {
//         console.log('🔌 Notification socket connected');
//       });

//       newSocket.on('newNotification', (notification) => {
//         addNotification(notification);
//       });

//       setSocket(newSocket);

//       return () => {
//         newSocket.disconnect();
//       };
//     }
//   }, [user]);

//   // Fetch initial notifications
//   const fetchNotifications = useCallback(async () => {
//     if (!user) return;
    
//     try {
//       setLoading(true);
//       const response = await api.get('/notifications');
//       setNotifications(response.data.notifications || []);
//       setUnreadCount(response.data.unreadCount || 0);
//     } catch (error) {
//       console.error('Failed to fetch notifications:', error);
//     } finally {
//       setLoading(false);
//     }
//   }, [user]);

//   useEffect(() => {
//     fetchNotifications();
//   }, [fetchNotifications]);

//   // Add new notification
//   const addNotification = (notification) => {
//     setNotifications(prev => [notification, ...prev]);
//     if (!notification.read) {
//       setUnreadCount(prev => prev + 1);
//     }
//   };

//   // Mark notification as read
//   const markAsRead = async (notificationId) => {
//     try {
//       await api.put(`/notifications/${notificationId}/read`);
//       setNotifications(prev =>
//         prev.map(n =>
//           n._id === notificationId ? { ...n, read: true } : n
//         )
//       );
//       setUnreadCount(prev => Math.max(0, prev - 1));
//     } catch (error) {
//       console.error('Failed to mark as read:', error);
//     }
//   };

//   // Mark all as read
//   const markAllAsRead = async () => {
//     try {
//       await api.put('/notifications/read-all');
//       setNotifications(prev =>
//         prev.map(n => ({ ...n, read: true }))
//       );
//       setUnreadCount(0);
//     } catch (error) {
//       console.error('Failed to mark all as read:', error);
//     }
//   };

//   // Delete notification
//   const deleteNotification = async (notificationId) => {
//     try {
//       await api.delete(`/notifications/${notificationId}`);
//       const deleted = notifications.find(n => n._id === notificationId);
//       setNotifications(prev => prev.filter(n => n._id !== notificationId));
//       if (deleted && !deleted.read) {
//         setUnreadCount(prev => Math.max(0, prev - 1));
//       }
//     } catch (error) {
//       console.error('Failed to delete notification:', error);
//     }
//   };

//   // Clear all notifications
//   const clearAll = async () => {
//     try {
//       await api.delete('/notifications');
//       setNotifications([]);
//       setUnreadCount(0);
//     } catch (error) {
//       console.error('Failed to clear notifications:', error);
//     }
//   };

//   const value = {
//     notifications,
//     unreadCount,
//     loading,
//     fetchNotifications,
//     addNotification,
//     markAsRead,
//     markAllAsRead,
//     deleteNotification,
//     clearAll,
//     socket
//   };

//   return (
//     <NotificationContext.Provider value={value}>
//       {children}
//     </NotificationContext.Provider>
//   );
// };







import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { socket } from '../services/api';
import api from '../services/api';
import { toast } from 'react-toastify';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      
      if (response.data.success) {
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Listen for socket events for real-time notifications
  useEffect(() => {
    if (!user || !socket) return;

    fetchNotifications();

    // Handle new notification
    const handleNewNotification = (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show toast based on notification type
      switch (notification.type) {
        case 'volunteer_approved':
          toast.success('🎉 ' + notification.message);
          break;
        case 'volunteer_request':
          toast.info('📝 New volunteer application received');
          break;
        case 'volunteer_rejected':
          toast.warning('❌ ' + notification.message);
          break;
        case 'collection_update':
          toast.info('🚛 ' + notification.message);
          break;
        case 'payment_received':
          toast.success('💰 ' + notification.message);
          break;
        case 'free_service_unlocked':
          toast.success('⭐ ' + notification.message);
          break;
        case 'program_created':
          toast.info('📋 New program created: ' + notification.message);
          break;
        default:
          toast.info(notification.message);
      }
    };

    // Handle application approved event
    const handleApplicationApproved = (data) => {
      toast.success(data.message);
      fetchNotifications();
    };

    // Handle new volunteer application (for admin)
    const handleNewVolunteerApplication = (data) => {
      toast.info(`📝 ${data.userName} applied for ${data.programTitle}`);
      fetchNotifications();
    };

    socket.on('newNotification', handleNewNotification);
    socket.on('applicationApproved', handleApplicationApproved);
    socket.on('newVolunteerApplication', handleNewVolunteerApplication);

    return () => {
      socket.off('newNotification', handleNewNotification);
      socket.off('applicationApproved', handleApplicationApproved);
      socket.off('newVolunteerApplication', handleNewVolunteerApplication);
    };
  }, [user, fetchNotifications]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      
      if (response.data.success) {
        setNotifications(prev =>
          prev.map(n =>
            n._id === notificationId ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await api.put('/notifications/read-all');
      
      if (response.data.success) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, read: true }))
        );
        setUnreadCount(0);
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      
      if (response.data.success) {
        const deleted = notifications.find(n => n._id === notificationId);
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        
        if (deleted && !deleted.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        
        toast.info('Notification deleted');
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // Clear all notifications
  const clearAll = async () => {
    try {
      const response = await api.delete('/notifications/all');
      
      if (response.data.success) {
        setNotifications([]);
        setUnreadCount(0);
        toast.success('All notifications cleared');
      }
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};