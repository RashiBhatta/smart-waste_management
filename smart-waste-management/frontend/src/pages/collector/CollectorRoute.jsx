import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Stack, Button, TextField, Divider, Chip } from '@mui/material';
import { CheckCircle, Info, PendingActions, ReportProblem } from '@mui/icons-material';
import api from '../../services/api';
import { toast } from 'react-toastify';

const CollectorRoute = () => {
  const [routeStops, setRouteStops] = useState([]);

  const fetchRoute = async () => {
    try {
      const res = await api.get('/collector/my-route');
      setRouteStops(res.data.jobs);
    } catch (err) {
      toast.error("Could not load assigned route");
    }
  };

  useEffect(() => { fetchRoute(); }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      // Collectors can add reasons/notes as per proposal [cite: 64]
      const notes = status === 'Skipped' ? prompt("Reason for skipping:") : "";
      await api.put(`/collector/collections/${id}/status`, { status, notes });
      toast.success(`Marked as ${status}`);
      fetchRoute(); // Sync instantly 
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  return (
    <Box sx={{ p: 2, bgcolor: '#f8fafc', minHeight: '100vh', mt: 8 }}>
      <Typography variant="h5" fontWeight={900} mb={3} color="primary.dark">
        My Collection Route
      </Typography>

      <Stack spacing={2}>
        {routeStops.map((stop) => (
          <Card key={stop._id} sx={{ borderRadius: 4, borderLeft: '8px solid #1b5e20' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" fontWeight={800}>{stop.resident?.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stop.address?.street}, {stop.address?.zone?.toUpperCase()}
                  </Typography>
                </Box>
                <Chip label={stop.wasteType} size="small" color="secondary" />
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack direction="row" spacing={1}>
                {/* Core buttons: Collected / Skipped / Pending  */}
                <Button 
                  fullWidth variant="contained" color="success" 
                  startIcon={<CheckCircle />} onClick={() => handleStatusUpdate(stop._id, 'Collected')}
                  sx={{ fontWeight: 800 }}
                >
                  Collect
                </Button>
                <Button 
                  fullWidth variant="outlined" color="warning" 
                  startIcon={<PendingActions />} onClick={() => handleStatusUpdate(stop._id, 'Pending')}
                  sx={{ fontWeight: 800 }}
                >
                  Wait
                </Button>
                <Button 
                  fullWidth variant="text" color="error" 
                  startIcon={<ReportProblem />} onClick={() => handleStatusUpdate(stop._id, 'Skipped')}
                  sx={{ fontWeight: 800 }}
                >
                  Skip
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default CollectorRoute;