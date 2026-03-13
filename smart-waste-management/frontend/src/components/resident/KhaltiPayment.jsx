import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import api from '../../services/api';
import { toast } from 'react-toastify';

const KhaltiPayment = () => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await api.post('/payments/khalti/init');
      if (res.data.payment_url) {
        window.location.href = res.data.payment_url; // Redirect to Khalti Portal
      }
    } catch (err) {
      toast.error("Could not initialize Khalti payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="contained" 
      fullWidth 
      onClick={handlePayment} 
      disabled={loading}
      sx={{ 
        bgcolor: '#5C2D91', 
        '&:hover': { bgcolor: '#4a2475' }, 
        fontWeight: 900, 
        py: 1.5,
        borderRadius: 2
      }}
    >
      {loading ? <CircularProgress size={24} color="inherit" /> : "PAY 1000 WITH KHALTI"}
    </Button>
  );
};

export default KhaltiPayment;