import React from 'react';
import { Box, Avatar } from '@mui/material';

export const Timeline = ({ children }) => {
  return (
    <Box sx={{ position: 'relative' }}>
      {children}
    </Box>
  );
};

export const TimelineItem = ({ children, isLast = false }) => {
  return (
    <Box sx={{ display: 'flex', mb: isLast ? 0 : 3, position: 'relative' }}>
      {children}
    </Box>
  );
};

export const TimelineSeparator = ({ children, color = 'primary' }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2 }}>
      <Avatar sx={{ bgcolor: `${color}.main`, width: 32, height: 32 }}>
        {children}
      </Avatar>
    </Box>
  );
};

export const TimelineContent = ({ children }) => {
  return (
    <Box sx={{ flex: 1 }}>
      {children}
    </Box>
  );
};

export const TimelineConnector = () => {
  return (
    <Box sx={{ width: 2, height: 30, bgcolor: 'divider', mt: 0.5 }} />
  );
};

export const TimelineDot = ({ color = 'primary', children }) => {
  return (
    <Avatar sx={{ bgcolor: `${color}.main`, width: 32, height: 32 }}>
      {children}
    </Avatar>
  );
};

export const TimelineOppositeContent = ({ children }) => {
  return (
    <Box sx={{ minWidth: 80, textAlign: 'right', pr: 2 }}>
      {children}
    </Box>
  );
};