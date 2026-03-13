// ============================================================
// FEATURE 4: Payment Success / Verification Page
// FILE: frontend/src/pages/PaymentSuccess.jsx
// Route: /payment-success  (Khalti & eSewa both redirect here)
// ============================================================
// URL params received:
//   Khalti: ?method=khalti&pidx=XXXX&status=Completed&...
//   eSewa:  ?method=esewa&data=BASE64ENCODED
// ============================================================

import React, { useEffect, useState } from 'react';
import {
  Box, Container, Paper, Typography,
  CircularProgress, Button, Stack, Alert, Divider
} from '@mui/material';
import {
  CheckCircle, ErrorOutline, Dashboard, Refresh
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const PaymentSuccess = () => {
  const [phase,      setPhase]      = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [details,    setDetails]    = useState(null);
  const [errMessage, setErrMessage] = useState('');
  const navigate  = useNavigate();
  const location  = useLocation();

  useEffect(() => {
    const verify = async () => {
      const params = new URLSearchParams(location.search);
      const method = params.get('method'); // 'khalti' or 'esewa'

      try {
        let res;

        if (method === 'khalti') {
          // Khalti returns pidx in the query string
          const pidx = params.get('pidx');
          if (!pidx) throw new Error('Missing pidx from Khalti callback');
          res = await api.post('/payments/khalti/verify', { pidx });

        } else if (method === 'esewa') {
          // eSewa returns base64-encoded JSON in `data`
          const encodedData = params.get('data');
          if (!encodedData) throw new Error('Missing data from eSewa callback');
          res = await api.post('/payments/esewa/verify', { encodedData });

        } else {
          throw new Error('Unknown payment method in callback URL');
        }

        if (res.data.success) {
          setDetails(res.data);
          setPhase('success');
          toast.success('Payment verified successfully!');
        } else {
          throw new Error(res.data.message || 'Verification failed');
        }
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Payment could not be verified';
        setErrMessage(msg);
        setPhase('error');
        toast.error(msg);
      }
    };

    verify();
  }, [location]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{ borderRadius: 5, border: '1px solid #e2e8f0', p: { xs: 4, md: 6 }, textAlign: 'center' }}
        >

          {/* ── VERIFYING ── */}
          {phase === 'verifying' && (
            <Stack spacing={3} alignItems="center">
              <CircularProgress size={72} thickness={3} sx={{ color: '#16a34a' }} />
              <Box>
                <Typography variant="h5" fontWeight={900} color="#0f172a">
                  Verifying Payment…
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Please wait — do not close or refresh this page.
                </Typography>
              </Box>
            </Stack>
          )}

          {/* ── SUCCESS ── */}
          {phase === 'success' && (
            <Stack spacing={3} alignItems="center">
              <CheckCircle sx={{ fontSize: 88, color: '#16a34a' }} />
              <Box>
                <Typography variant="h4" fontWeight={900} color="#0f172a">
                  Payment Successful!
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Your monthly waste collection fee has been confirmed.
                </Typography>
              </Box>

              {details?.validUntil && (
                <Paper
                  elevation={0}
                  sx={{ bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 3, p: 3, width: '100%' }}
                >
                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary" fontWeight={700}>Amount Paid</Typography>
                      <Typography variant="body2" fontWeight={900} color="#0f172a">Rs. 1,000</Typography>
                    </Stack>
                    <Divider />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary" fontWeight={700}>Service Valid Until</Typography>
                      <Typography variant="body2" fontWeight={900} color="#16a34a">
                        {format(new Date(details.validUntil), 'MMMM dd, yyyy')}
                      </Typography>
                    </Stack>
                  </Stack>
                </Paper>
              )}

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} width="100%">
                <Button
                  fullWidth variant="contained"
                  startIcon={<Dashboard />}
                  onClick={() => navigate('/resident/dashboard')}
                  sx={{ borderRadius: 2, fontWeight: 800, py: 1.5, bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}
                >
                  Go to Dashboard
                </Button>
                <Button
                  fullWidth variant="outlined"
                  onClick={() => navigate('/payments')}
                  sx={{ borderRadius: 2, fontWeight: 700, py: 1.5, borderColor: '#16a34a', color: '#16a34a' }}
                >
                  View History
                </Button>
              </Stack>
            </Stack>
          )}

          {/* ── ERROR ── */}
          {phase === 'error' && (
            <Stack spacing={3} alignItems="center">
              <ErrorOutline sx={{ fontSize: 88, color: '#ef4444' }} />
              <Box>
                <Typography variant="h4" fontWeight={900} color="#0f172a">
                  Verification Failed
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  We couldn't confirm your payment with the payment provider.
                </Typography>
              </Box>

              <Alert severity="error" sx={{ borderRadius: 3, width: '100%', textAlign: 'left' }}>
                {errMessage}
              </Alert>

              <Alert severity="info" sx={{ borderRadius: 3, width: '100%', textAlign: 'left' }}>
                If money was deducted from your account, please contact support with your transaction ID or screenshot.
                Your payment record has been saved for review.
              </Alert>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} width="100%">
                <Button
                  fullWidth variant="contained"
                  startIcon={<Refresh />}
                  onClick={() => navigate('/payments')}
                  sx={{ borderRadius: 2, fontWeight: 800, py: 1.5, bgcolor: '#16a34a' }}
                >
                  Try Again
                </Button>
                <Button
                  fullWidth variant="outlined"
                  onClick={() => navigate('/resident/dashboard')}
                  sx={{ borderRadius: 2, fontWeight: 700, py: 1.5 }}
                >
                  Back to Dashboard
                </Button>
              </Stack>
            </Stack>
          )}

        </Paper>
      </Container>
    </Box>
  );
};

export default PaymentSuccess;