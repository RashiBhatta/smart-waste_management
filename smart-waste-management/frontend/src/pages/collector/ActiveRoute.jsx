import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Stack, Button, Chip, Divider } from '@mui/material';
import { CheckCircle, Info, PendingActions } from '@mui/icons-material';
import api from '../../services/api';
import { toast } from 'react-toastify';

const ActiveRoute = () => {
  const [jobs, setJobs] = useState([]);

  const fetchJobs = async () => {
    const res = await api.get('/collector/zone-jobs');
    setJobs(res.data.jobs);
  };

  useEffect(() => { fetchJobs(); }, []);

  const updateStatus = async (jobId, status) => {
    try {
      await api.put(`/collector/collections/${jobId}/status`, { status });
      toast.success(`Marked as ${status}`);
      fetchJobs(); // Refresh list
    } catch (err) {
      toast.error("Status update failed");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={900} mb={3}>Current Zone Assignments</Typography>
      <Stack spacing={2}>
        {jobs.map((job) => (
          <Card key={job._id} sx={{ borderRadius: 3, borderLeft: '6px solid #2e7d32' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6" fontWeight={800}>{job.resident.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{job.address.street}</Typography>
                </Box>
                <Chip label={job.wasteType} color="primary" variant="outlined" />
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" spacing={1}>
                <Button 
                  variant="contained" color="success" startIcon={<CheckCircle />}
                  onClick={() => updateStatus(job._id, 'Collected')}
                >
                  Collected
                </Button>
                <Button 
                  variant="outlined" color="warning" startIcon={<PendingActions />}
                  onClick={() => updateStatus(job._id, 'Pending')}
                >
                  Pending
                </Button>
                <Button 
                  variant="text" color="error"
                  onClick={() => updateStatus(job._id, 'Skipped')}
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

export default ActiveRoute;