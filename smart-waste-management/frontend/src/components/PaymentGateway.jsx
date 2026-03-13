import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Paper,
  Typography,
  Box,
  Divider,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  alpha,
  useTheme
} from '@mui/material';
import {
  Payment,
  CreditCard,
  AccountBalance,
  CheckCircle,
  Close
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../services/api';

const PaymentGateway = ({ open, onClose, amount = 1000, onSuccess }) => {
  const theme = useTheme();
  const [method, setMethod] = useState('khalti');
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    name: '',
    phone: ''
  });

  const steps = ['Select Method', 'Enter Details', 'Confirm Payment'];

  const handleMethodChange = (event) => {
    setMethod(event.target.value);
  };

  const handleInputChange = (e) => {
    setPaymentData({
      ...paymentData,
      [e.target.name]: e.target.value
    });
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      // For Khalti, redirect to their payment page
      if (method === 'khalti') {
        const response = await api.post('/payments/initiate', {
          method: 'khalti',
          amount
        });

        // Redirect to Khalti payment page
        window.location.href = response.data.paymentUrl;
        return;
      }

      // For eSewa
      if (method === 'esewa') {
        const response = await api.post('/payments/initiate', {
          method: 'esewa',
          amount
        });

        // Redirect to eSewa payment page
        window.location.href = response.data.paymentUrl;
        return;
      }

      // Simulate successful payment for testing
      setTimeout(() => {
        setLoading(false);
        setStep(2);
        toast.success('Payment successful!');
        if (onSuccess) onSuccess();
      }, 2000);

    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.message || 'Payment failed');
    }
  };

  const handleClose = () => {
    setStep(0);
    setMethod('khalti');
    setPaymentData({
      cardNumber: '',
      expiry: '',
      cvv: '',
      name: '',
      phone: ''
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 2
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <Payment color="primary" />
            <Typography variant="h6" fontWeight={700}>
              Monthly Fee Payment
            </Typography>
          </Box>
          <Button onClick={handleClose}><Close /></Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={step} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {step === 0 && (
          <FormControl component="fieldset" fullWidth>
            <RadioGroup value={method} onChange={handleMethodChange}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 2,
                  borderColor: method === 'khalti' ? theme.palette.primary.main : '#eee',
                  bgcolor: method === 'khalti' ? alpha(theme.palette.primary.main, 0.05) : 'transparent'
                }}
              >
                <FormControlLabel
                  value="khalti"
                  control={<Radio />}
                  label={
                    <Box display="flex" alignItems="center" gap={2}>
                      <img
                        src="/khalti-logo.png"
                        alt="Khalti"
                        style={{ height: 30 }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://khalti.com/favicon.ico';
                        }}
                      />
                      <Box>
                        <Typography fontWeight={600}>Khalti</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Pay via Khalti digital wallet
                        </Typography>
                      </Box>
                    </Box>
                  }
                  sx={{ width: '100%', m: 0 }}
                />
              </Paper>

              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderColor: method === 'esewa' ? theme.palette.primary.main : '#eee',
                  bgcolor: method === 'esewa' ? alpha(theme.palette.primary.main, 0.05) : 'transparent'
                }}
              >
                <FormControlLabel
                  value="esewa"
                  control={<Radio />}
                  label={
                    <Box display="flex" alignItems="center" gap={2}>
                      <img
                        src="/esewa-logo.png"
                        alt="eSewa"
                        style={{ height: 30 }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://esewa.com.np/favicon.ico';
                        }}
                      />
                      <Box>
                        <Typography fontWeight={600}>eSewa</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Pay via eSewa digital wallet
                        </Typography>
                      </Box>
                    </Box>
                  }
                  sx={{ width: '100%', m: 0 }}
                />
              </Paper>
            </RadioGroup>
          </FormControl>
        )}

        {step === 1 && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Amount to pay: Rs. {amount}
            </Alert>
            <TextField
              fullWidth
              label="Name on Card"
              name="name"
              value={paymentData.name}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Card Number"
              name="cardNumber"
              value={paymentData.cardNumber}
              onChange={handleInputChange}
              margin="normal"
              required
              placeholder="**** **** **** ****"
            />
            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                label="Expiry (MM/YY)"
                name="expiry"
                value={paymentData.expiry}
                onChange={handleInputChange}
                margin="normal"
                required
                placeholder="MM/YY"
              />
              <TextField
                fullWidth
                label="CVV"
                name="cvv"
                type="password"
                value={paymentData.cvv}
                onChange={handleInputChange}
                margin="normal"
                required
                placeholder="***"
              />
            </Box>
            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              value={paymentData.phone}
              onChange={handleInputChange}
              margin="normal"
              required
            />
          </Box>
        )}

        {step === 2 && (
          <Box textAlign="center" py={3}>
            <CheckCircle sx={{ fontSize: 64, color: theme.palette.success.main, mb: 2 }} />
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Payment Successful!
            </Typography>
            <Typography color="text.secondary">
              Your monthly fee has been paid. Thank you!
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        {step === 0 && (
          <>
            <Button onClick={handleClose}>Cancel</Button>
            <Button variant="contained" onClick={handleNext}>
              Continue
            </Button>
          </>
        )}

        {step === 1 && (
          <>
            <Button onClick={handleBack}>Back</Button>
            <Button
              variant="contained"
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : `Pay Rs. ${amount}`}
            </Button>
          </>
        )}

        {step === 2 && (
          <Button variant="contained" onClick={handleClose} fullWidth>
            Done
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PaymentGateway;