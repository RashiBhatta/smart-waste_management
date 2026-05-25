import React, { useState } from 'react';
import { Box, TextField, Button, MenuItem, Typography, Paper, Stack } from '@mui/material';
import { DeleteSweep } from '@mui/icons-material';
import api from '../../services/api';
import { toast } from 'react-toastify';

const RequestCollection = ({ onRequested }) => {
  const [formData, setFormData] = useState({ wasteType: 'Mixed', estimatedWeight: '', notes: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/collections/request', formData);
      toast.success("Pickup Requested! A collector will be notified.");
      setFormData({ wasteType: 'Mixed', estimatedWeight: '', notes: '' });
      if (onRequested) onRequested();
    } catch (err) {
      toast.error("Failed to submit request.");
    }
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #e0e0e0' }} elevation={0}>
      <Typography variant="h6" fontWeight={900} mb={2} display="flex" alignItems="center" gap={1}>
        <DeleteSweep color="primary" /> Schedule a Pickup
      </Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            select
            fullWidth
            label="Waste Type"
            value={formData.wasteType}
            onChange={(e) => setFormData({...formData, wasteType: e.target.value})}
          >
            {['Organic', 'Recyclable', 'Hazardous', 'Mixed'].map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            type="number"
            label="Estimated Weight (kg)"
            value={formData.estimatedWeight}
            onChange={(e) => setFormData({...formData, estimatedWeight: e.target.value})}
            required
          />
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Additional Notes"
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
          />
          <Button type="submit" variant="contained" size="large" sx={{ fontWeight: 800, borderRadius: 2 }}>
            Submit Request
          </Button>
        </Stack>
      </form>
    </Paper>
  );
};

export default RequestCollection;