import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, List, ListItem, ListItemText, Divider, Chip } from '@mui/material';
import { CheckCircle, PictureAsPdf } from '@mui/icons-material';
import api from '../../services/api';
import { toast } from 'react-toastify';

const ProgramDetails = ({ programId }) => {
  const [program, setProgram] = useState(null);

  const fetchDetails = async () => {
    const res = await api.get(`/programs/${programId}`);
    setProgram(res.data.program);
  };

  useEffect(() => { fetchDetails(); }, [programId]);

  const approveResident = async (userId) => {
    try {
      await api.put(`/admin/programs/${programId}/approve/${userId}`); // [cite: 55]
      toast.success("Volunteer Approved & Coins Awarded!");
      fetchDetails();
    } catch (err) {
      toast.error("Failed to approve resident");
    }
  };

  if (!program) return null;

  return (
    <Paper sx={{ p: 3, borderRadius: 4 }}>
      <Typography variant="h5" fontWeight={900}>{program.title}</Typography>
      <Typography variant="body1" mb={3}>{program.description}</Typography>
      
      <Divider sx={{ mb: 2 }} />
      <Typography variant="h6" fontWeight={800} gutterBottom>Volunteer Verification Queue</Typography>
      
      <List>
        {program.volunteers.filter(v => v.status === 'pending').map((v) => (
          <ListItem key={v.user._id} sx={{ bgcolor: '#f1f5f9', borderRadius: 2, mb: 1 }}>
            <ListItemText primary={v.user.name} secondary={`Applied: ${new Date(v.appliedAt).toLocaleDateString()}`} />
            <Button 
              variant="contained" color="success" startIcon={<CheckCircle />}
              onClick={() => approveResident(v.user._id)} // [cite: 55, 61]
            >
              Approve (100 Coins)
            </Button>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};