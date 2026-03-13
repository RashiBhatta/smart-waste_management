import React, { useState } from 'react';
import {
  Container, Paper, Typography, Box, Grid, Button, 
  Divider, TextField, Stack, Avatar, alpha, useTheme,
  CircularProgress, Card, CardContent, Radio, RadioGroup,
  FormControlLabel, FormControl
} from '@mui/material';
import {
  Payment as PaymentIcon,
  CreditCard as CardIcon,
  AccountBalance as BankIcon,
  VerifiedUser as ShieldIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import api from '../services/api';

const PaymentPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const monthlyFee = 499; // Base fee
  const tax = 65;
  const total = monthlyFee + tax;

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Call the backend to verify/process payment
      const response = await api.put('/resident/verify-payment');
      
      if (response.data.success) {
        // 2. Update local auth state so PrivateRoute lets them through
        updateUser({ ...user, monthlyFeePaid: true });
        
        toast.success("Payment Successful! Dashboard Unlocked.");
        setTimeout(() => navigate('/resident/dashboard'), 2000);
      }
    } catch (err) {
      toast.error("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', py: 8, 
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, #ffffff 100%)` 
    }}>
      <Container maxWidth="md">
        <Grid container spacing={4}>
          {/* Left Side: Order Summary */}
          <Grid item xs={12} md={5}>
            <Typography variant="h5" fontWeight="bold" mb={3}>Service Summary</Typography>
            <Card sx={{ borderRadius: 4, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" mb={2}>
                  <Typography color="textSecondary">Monthly Waste Service</Typography>
                  <Typography fontWeight="bold">₹{monthlyFee}.00</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" mb={2}>
                  <Typography color="textSecondary">GST (13%)</Typography>
                  <Typography fontWeight="bold">₹{tax}.00</Typography>
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" justifyContent="space-between" mb={3}>
                  <Typography variant="h6" fontWeight="bold">Total Amount</Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary">₹{total}.00</Typography>
                </Stack>
                <Box bgcolor={alpha(theme.palette.success.main, 0.1)} p={2} borderRadius={2} display="flex" gap={1}>
                  <ShieldIcon color="success" fontSize="small" />
                  <Typography variant="caption" color="success.dark" fontWeight="bold">
                    Secure recurring billing. Cancel anytime.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Side: Payment Form */}
          <Grid item xs={12} md={7}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #eee' }}>
              <Typography variant="h5" fontWeight="bold" mb={1}>Payment Method</Typography>
              <Typography variant="body2" color="textSecondary" mb={4}>Choose how you want to pay for your monthly subscription</Typography>
              
              <form onSubmit={handlePayment}>
                <FormControl component="fieldset" fullWidth>
                  <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', cursor: 'pointer', borderColor: paymentMethod === 'card' ? 'primary.main' : '#eee' }}>
                          <FormControlLabel value="card" control={<Radio sx={{ display: 'none' }} />} label={
                            <Stack alignItems="center" spacing={1}>
                              <CardIcon color={paymentMethod === 'card' ? 'primary' : 'action'} />
                              <Typography variant="body2" fontWeight="bold">Credit/Debit Card</Typography>
                            </Stack>
                          } sx={{ m: 0, width: '100%' }} />
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', cursor: 'pointer', borderColor: paymentMethod === 'upi' ? 'primary.main' : '#eee' }}>
                          <FormControlLabel value="upi" control={<Radio sx={{ display: 'none' }} />} label={
                            <Stack alignItems="center" spacing={1}>
                              <BankIcon color={paymentMethod === 'upi' ? 'primary' : 'action'} />
                              <Typography variant="body2" fontWeight="bold">UPI / Net Banking</Typography>
                            </Stack>
                          } sx={{ m: 0, width: '100%' }} />
                        </Paper>
                      </Grid>
                    </Grid>
                  </RadioGroup>
                </FormControl>

                <Box mt={4}>
                  <TextField fullWidth label="Cardholder Name" margin="normal" required defaultValue={user?.name} />
                  <TextField fullWidth label="Card Number" placeholder="**** **** **** ****" margin="normal" required />
                  <Grid container spacing={2}>
                    <Grid item xs={6}><TextField fullWidth label="Expiry Date" placeholder="MM/YY" margin="normal" required /></Grid>
                    <Grid item xs={6}><TextField fullWidth label="CVV" placeholder="***" margin="normal" required /></Grid>
                  </Grid>
                </Box>

                <Button 
                  type="submit" fullWidth variant="contained" size="large" 
                  disabled={loading} sx={{ mt: 4, py: 2, borderRadius: 3, fontWeight: 'bold' }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : `PAY ₹${total}.00 NOW`}
                </Button>
                
                <Stack direction="row" spacing={1} justifyContent="center" mt={3} alignItems="center" sx={{ opacity: 0.6 }}>
                  <ShieldIcon fontSize="small" />
                  <Typography variant="caption">Encrypted & Secure Payment Processing</Typography>
                </Stack>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      <ToastContainer position="bottom-right" />
    </Box>
  );
};

export default PaymentPage;