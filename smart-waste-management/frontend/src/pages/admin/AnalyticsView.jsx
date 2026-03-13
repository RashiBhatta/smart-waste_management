import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, LinearProgress, Button } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PictureAsPdf } from '@mui/icons-material';
import api from '../../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AnalyticsView = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/admin/analytics').then(res => setData(res.data));
  }, []);

  if (!data) return <LinearProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" mb={4}>
        <Typography variant="h5" fontWeight={900}>Operational Analytics</Typography>
        <Button variant="contained" startIcon={<PictureAsPdf />} sx={{ fontWeight: 800 }}>
          Export Monthly PDF
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Landfill Capacity Tracker */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={800} gutterBottom>Landfill Capacity Status</Typography>
            <LinearProgress 
              variant="determinate" 
              value={data.landfillCapacity.percentage} 
              sx={{ height: 20, borderRadius: 5, my: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              {data.landfillCapacity.used}kg / {data.landfillCapacity.total}kg utilized
            </Typography>
          </Paper>
        </Grid>

        {/* Ward-wise Distribution (Bar Chart) */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 4, height: 400 }}>
            <Typography variant="subtitle1" fontWeight={800} mb={2}>Waste Collected per Ward (kg)</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={data.wardData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="zone" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="weight" fill="#2e7d32" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Contribution Share (Pie Chart) */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 4, height: 400 }}>
            <Typography variant="subtitle1" fontWeight={800} mb={2}>Waste Type Contribution</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie data={data.typeData} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={80} label>
                  {data.typeData.map((entry, index) => <Cell key={idx} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};