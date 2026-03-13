import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, Stack, Chip, Divider, List, ListItem, ListItemText, Avatar } from '@mui/material';
import { Add, CheckCircle } from '@mui/icons-material';
import api from '../../services/api';
import { toast } from 'react-toastify';

const ManagePrograms = () => {
  const [programs, setPrograms] = useState([]);

  const fetchData = async () => {
    const res = await api.get('/programs');
    setPrograms(res.data.programs);
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (progId, userId) => {
    try {
      await api.put(`/admin/programs/${progId}/volunteers/${userId}/approve`);
      toast.success("Volunteer Approved & 100 Coins Awarded!");
      fetchData();
    } catch (err) {
      toast.error("Approval failed");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Typography variant="h5" fontWeight={900}>Eco-Program Management</Typography>
        <Button variant="contained" startIcon={<Add />} sx={{ fontWeight: 800 }}>Launch Program</Button>
      </Stack>

      {programs.map((prog) => (
        <Card key={prog._id} sx={{ mb: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={800} color="primary">{prog.title}</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>{prog.description}</Typography>
            
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="subtitle2" fontWeight={800} mb={1}>Pending Volunteers:</Typography>
            <List>
              {prog.volunteers.filter(v => v.status === 'pending').map((v) => (
                <ListItem key={v.user._id} sx={{ bgcolor: '#f8fafc', borderRadius: 2, mb: 1 }}>
                  <ListItemText primary={v.user.name} secondary="Applied for verification" />
                  <Button 
                    variant="contained" color="success" size="small" 
                    startIcon={<CheckCircle />} onClick={() => handleApprove(prog._id, v.user._id)}
                  >
                    Approve
                  </Button>
                </ListItem>
              ))}
              {prog.volunteers.filter(v => v.status === 'pending').length === 0 && (
                <Typography variant="caption" color="text.disabled">No pending requests</Typography>
              )}
            </List>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default ManagePrograms;