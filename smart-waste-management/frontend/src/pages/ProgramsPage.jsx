// ============================================================
// FEATURE 4: Standardized Billing (eSewa / Khalti)
// FILE: frontend/src/pages/PaymentPage.jsx
// Route: /payments
// ============================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Container, Grid, Paper, Typography, Button,
  Stack, Avatar, Chip, Divider, Alert, CircularProgress,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle,
  DialogContent, DialogActions, Drawer, IconButton
} from '@mui/material';
import {
  Payment, CheckCircle, PendingActions, ErrorOutline,
  EmojiEvents, CardGiftcard, Dashboard, LocalShipping,
  History, RecyclingRounded, Logout, Menu,
  CreditCard, Shield, AccessTime, Stars,
  WorkspacePremium
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { format, formatDistanceToNow } from 'date-fns';

const MONTHLY_FEE = 1000;

// ── Payment method badge colors ──────────────────────────────
const METHOD_CONFIG = {
  khalti:      { label: 'Khalti',      color: '#5C2D91', bg: '#f3e8ff' },
  esewa:       { label: 'eSewa',       color: '#60BB46', bg: '#f0fdf4' },
  coin_redeem: { label: 'Coins',       color: '#f59e0b', bg: '#fef9c3' },
  cash:        { label: 'Cash',        color: '#6b7280', bg: '#f3f4f6' },
};

// ── Status chip ───────────────────────────────────────────────
const statusChip = (status) => {
  const map = {
    completed: { color: 'success', label: 'Paid' },
    pending:   { color: 'warning', label: 'Pending' },
    failed:    { color: 'error',   label: 'Failed' },
    refunded:  { color: 'info',    label: 'Refunded' },
  };
  const cfg = map[status] || { color: 'default', label: status };
  return <Chip label={cfg.label} color={cfg.color} size="small" sx={{ fontWeight: 700 }} />;
};

// ── eSewa hidden-form auto-submit ─────────────────────────────
const EsewaAutoForm = ({ fields, url, onCancel }) => {
  const formRef = useRef(null);

  useEffect(() => {
    // Small delay so user sees the "redirecting" message
    const t = setTimeout(() => formRef.current?.submit(), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <Box textAlign="center" py={4}>
      <CircularProgress sx={{ color: '#60BB46', mb: 2 }} />
      <Typography fontWeight={700} color="#0f172a">Redirecting to eSewa...</Typography>
      <Typography variant="body2" color="text.secondary" mt={1} mb={3}>
        You will be redirected to the eSewa payment portal.
      </Typography>
      <form ref={formRef} method="POST" action={url} style={{ display: 'none' }}>
        {Object.entries(fields).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
      </form>
      <Button variant="text" color="error" onClick={onCancel}>Cancel</Button>
    </Box>
  );
};

// ── Main component ────────────────────────────────────────────
const PaymentPage = () => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const { socket }       = useSocket?.() || {};

  const [billing,      setBilling]      = useState(null);
  const [history,      setHistory]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [paying,       setPaying]       = useState(null);  // 'khalti' | 'esewa' | 'redeem'
  const [mobileOpen,   setMobileOpen]   = useState(false);
  // eSewa redirect state
  const [esewaData,    setEsewaData]    = useState(null);  // { fields, url }
  // Confirm redeem dialog
  const [redeemDialog, setRedeemDialog] = useState(false);

  // ── Fetch billing status + history ────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const [statusRes, histRes] = await Promise.all([
        api.get('/payments/status'),
        api.get('/payments/history'),
      ]);
      setBilling(statusRes.data.billing);
      setHistory(histRes.data.payments || []);
    } catch {
      toast.error('Failed to load payment information');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Socket: payment confirmed in real-time ─────────────────
  useEffect(() => {
    if (!socket) return;
    const onSuccess = () => { fetchData(); toast.success('🎉 Payment confirmed!'); };
    const onFree    = () => { fetchData(); toast.success('🎁 Free service activated!'); };
    socket.on('payment_success',      onSuccess);
    socket.on('free_service_unlocked', onFree);
    return () => {
      socket.off('payment_success',      onSuccess);
      socket.off('free_service_unlocked', onFree);
    };
  }, [socket, fetchData]);

  // ── Khalti payment ─────────────────────────────────────────
  const handleKhalti = async () => {
    try {
      setPaying('khalti');
      const res = await api.post('/payments/khalti/initiate');
      // Redirect to Khalti portal — they come back to /payment-success?method=khalti&pidx=...
      window.location.href = res.data.payment_url;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Khalti initiation failed');
      setPaying(null);
    }
  };

  // ── eSewa payment ──────────────────────────────────────────
  const handleEsewa = async () => {
    try {
      setPaying('esewa');
      const res = await api.post('/payments/esewa/initiate');
      // Store form fields — EsewaAutoForm will auto-POST
      setEsewaData({ fields: res.data.formFields, url: res.data.esewaUrl });
    } catch (err) {
      toast.error(err.response?.data?.message || 'eSewa initiation failed');
      setPaying(null);
    }
  };

  // ── Coin redemption ────────────────────────────────────────
  const handleRedeem = async () => {
    try {
      setPaying('redeem');
      setRedeemDialog(false);
      const res = await api.post('/payments/redeem');
      toast.success(res.data.message);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Redemption failed');
    } finally {
      setPaying(null);
    }
  };

  // ── Sidebar ────────────────────────────────────────────────
  const navItems = [
    { label: 'Dashboard',      icon: <Dashboard />,        path: '/resident/dashboard' },
    { label: 'Request Pickup', icon: <LocalShipping />,    path: '/request-collection' },
    { label: 'My Collections', icon: <History />,          path: '/my-collections' },
    { label: 'Eco-Programs',   icon: <RecyclingRounded />, path: '/programs' },
    { label: 'Rewards',        icon: <EmojiEvents />,      path: '/rewards' },
    { label: 'Payments',       icon: <Payment />,          path: '/payments', active: true },
  ];

  const SidebarContent = () => (
    <Box sx={{ height: '100%', bgcolor: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 3, py: 3.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: '#16a34a', width: 36, height: 36 }}>
            <RecyclingRounded fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={900} color="white">SWMS</Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>Resident Portal</Typography>
          </Box>
        </Stack>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)' }} />
      <Box sx={{ flexGrow: 1, px: 2, pt: 2 }}>
        {navItems.map((item) => (
          <Box
            key={item.path}
            onClick={() => { navigate(item.path); setMobileOpen(false); }}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1.5,
              px: 2, py: 1.5, borderRadius: 2, mb: 0.5, cursor: 'pointer',
              bgcolor: item.active ? '#16a34a' : 'transparent',
              '&:hover': { bgcolor: item.active ? '#15803d' : 'rgba(255,255,255,0.05)' },
            }}
          >
            <Box sx={{ color: 'white' }}>{item.icon}</Box>
            <Typography fontSize="0.9rem" fontWeight={item.active ? 800 : 500} color="white">
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ p: 2 }}>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)', mb: 2 }} />
        <Button
          fullWidth variant="text" color="error" startIcon={<Logout />}
          onClick={() => { logout(); navigate('/login'); }}
          sx={{ fontWeight: 700, justifyContent: 'flex-start', px: 2 }}
        >
          Sign Out
        </Button>
      </Box>
    </Box>
  );

  // ── eSewa redirect in progress ─────────────────────────────
  if (esewaData) {
    return (
      <Container maxWidth="sm" sx={{ mt: 15 }}>
        <Paper sx={{ borderRadius: 4, p: 4, border: '1px solid #e2e8f0' }}>
          <EsewaAutoForm
            fields={esewaData.fields}
            url={esewaData.url}
            onCancel={() => { setEsewaData(null); setPaying(null); }}
          />
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f1f5f9' }}>

      {/* Mobile Drawer */}
      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: 260, border: 'none' } }}
      >
        <SidebarContent />
      </Drawer>

      {/* Desktop Sidebar */}
      <Box sx={{ width: 260, flexShrink: 0, display: { xs: 'none', md: 'block' }, position: 'sticky', top: 0, height: '100vh' }}>
        <SidebarContent />
      </Box>

      {/* Main */}
      <Box sx={{ flexGrow: 1, p: { xs: 2, md: 5 } }}>
        <Container maxWidth="xl" disableGutters>

          {/* Mobile header */}
          <Box sx={{ display: { md: 'none' }, mb: 2 }}>
            <IconButton onClick={() => setMobileOpen(true)}><Menu /></IconButton>
          </Box>

          {/* Page title */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
            <Box>
              <Typography variant="h4" fontWeight={900} color="#0f172a">Billing & Payments</Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Monthly waste collection fee — Rs. {MONTHLY_FEE.toLocaleString()} fixed
              </Typography>
            </Box>
            {billing?.isFreeActive && (
              <Chip
                icon={<WorkspacePremium />}
                label="Free Service Active"
                color="success"
                sx={{ fontWeight: 800, px: 1 }}
              />
            )}
          </Stack>

          {/* ── Free service active banner ── */}
          {billing?.isFreeActive && (
            <Alert
              severity="success"
              icon={<WorkspacePremium />}
              sx={{ borderRadius: 3, mb: 4, fontWeight: 600 }}
            >
              🎁 <strong>Your service is FREE</strong> this month — courtesy of your Eco-Coin rewards!
              Expires on <strong>{format(new Date(billing.freeServiceUntil), 'MMMM dd, yyyy')}</strong>.
              No payment needed.
            </Alert>
          )}

          {/* ── TOP ROW: Status + Payment options ── */}
          <Grid container spacing={3} mb={4}>

            {/* Current status card */}
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{ borderRadius: 4, bgcolor: '#0f172a', color: 'white', p: 4, height: '100%', border: '1px solid #1e293b' }}
              >
                <Typography variant="overline" sx={{ color: '#64748b', letterSpacing: 1, fontWeight: 700 }}>
                  This Month
                </Typography>

                {loading ? (
                  <CircularProgress sx={{ color: '#16a34a', mt: 2 }} />
                ) : (
                  <>
                    <Typography variant="h2" fontWeight={900} color="white" mt={1} lineHeight={1}>
                      Rs. {MONTHLY_FEE.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5, mb: 3 }}>
                      Fixed monthly collection fee
                    </Typography>

                    {billing?.isFreeActive ? (
                      <Chip
                        icon={<CheckCircle />}
                        label="Free This Month 🎉"
                        color="success"
                        sx={{ fontWeight: 800, width: '100%', py: 2.5, borderRadius: 2 }}
                      />
                    ) : billing?.paymentStatus === 'paid' ? (
                      <Chip
                        icon={<CheckCircle />}
                        label="Paid ✓"
                        color="success"
                        sx={{ fontWeight: 800, width: '100%', py: 2.5, borderRadius: 2 }}
                      />
                    ) : (
                      <Chip
                        icon={<PendingActions />}
                        label="Payment Due"
                        color="warning"
                        sx={{ fontWeight: 800, width: '100%', py: 2.5, borderRadius: 2 }}
                      />
                    )}

                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 3 }} />

                    {[
                      {
                        label: 'Last Paid',
                        value: billing?.lastPaymentDate
                          ? format(new Date(billing.lastPaymentDate), 'MMM dd, yyyy')
                          : 'Never',
                      },
                      {
                        label: 'Next Due',
                        value: billing?.nextPaymentDue
                          ? format(new Date(billing.nextPaymentDue), 'MMM dd, yyyy')
                          : 'ASAP',
                      },
                      {
                        label: 'Coin Balance',
                        value: `${billing?.coinBalance || 0} coins`,
                      },
                    ].map(({ label, value }) => (
                      <Stack key={label} direction="row" justifyContent="space-between" mb={1.5}>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {label}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#e2e8f0', fontWeight: 600 }}>{value}</Typography>
                      </Stack>
                    ))}
                  </>
                )}
              </Paper>
            </Grid>

            {/* Payment options */}
            <Grid item xs={12} md={8}>
              <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', p: 4, height: '100%' }}>
                <Typography variant="h6" fontWeight={900} color="#0f172a" mb={0.5}>
                  Choose Payment Method
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Pay your Rs. {MONTHLY_FEE} monthly fee securely.
                  {billing?.canRedeem && ' You can also use your coins instead.'}
                </Typography>

                {billing?.isFreeActive || billing?.paymentStatus === 'paid' ? (
                  <Alert severity="success" icon={<CheckCircle />} sx={{ borderRadius: 3 }}>
                    No payment needed this month. You're all set!
                  </Alert>
                ) : (
                  <Stack spacing={2}>

                    {/* Khalti */}
                    <Paper
                      elevation={0}
                      sx={{
                        borderRadius: 3, p: 3,
                        border: '2px solid',
                        borderColor: paying === 'khalti' ? '#5C2D91' : '#e2e8f0',
                        transition: 'border-color 0.2s',
                      }}
                    >
                      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ bgcolor: '#f3e8ff', width: 48, height: 48, borderRadius: 2 }}>
                            <Typography fontWeight={900} fontSize="1rem" color="#5C2D91">K</Typography>
                          </Avatar>
                          <Box>
                            <Typography fontWeight={800} color="#0f172a">Pay with Khalti</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Digital wallet · Secure redirect
                            </Typography>
                          </Box>
                        </Stack>
                        <Button
                          variant="contained"
                          onClick={handleKhalti}
                          disabled={!!paying}
                          sx={{
                            bgcolor: '#5C2D91', '&:hover': { bgcolor: '#4a2475' },
                            borderRadius: 2, fontWeight: 800, px: 3, py: 1.2, minWidth: 160,
                          }}
                        >
                          {paying === 'khalti' ? <CircularProgress size={20} color="inherit" /> : `Pay Rs. ${MONTHLY_FEE}`}
                        </Button>
                      </Stack>
                    </Paper>

                    {/* eSewa */}
                    <Paper
                      elevation={0}
                      sx={{
                        borderRadius: 3, p: 3,
                        border: '2px solid',
                        borderColor: paying === 'esewa' ? '#60BB46' : '#e2e8f0',
                        transition: 'border-color 0.2s',
                      }}
                    >
                      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ bgcolor: '#f0fdf4', width: 48, height: 48, borderRadius: 2 }}>
                            <Typography fontWeight={900} fontSize="1rem" color="#60BB46">e</Typography>
                          </Avatar>
                          <Box>
                            <Typography fontWeight={800} color="#0f172a">Pay with eSewa</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Nepal's #1 payment gateway
                            </Typography>
                          </Box>
                        </Stack>
                        <Button
                          variant="contained"
                          onClick={handleEsewa}
                          disabled={!!paying}
                          sx={{
                            bgcolor: '#60BB46', '&:hover': { bgcolor: '#4a9a35' },
                            borderRadius: 2, fontWeight: 800, px: 3, py: 1.2, minWidth: 160,
                          }}
                        >
                          {paying === 'esewa' ? <CircularProgress size={20} color="inherit" /> : `Pay Rs. ${MONTHLY_FEE}`}
                        </Button>
                      </Stack>
                    </Paper>

                    {/* Coin redemption */}
                    {billing?.canRedeem && (
                      <Paper
                        elevation={0}
                        sx={{
                          borderRadius: 3, p: 3,
                          border: '2px solid',
                          borderColor: paying === 'redeem' ? '#f59e0b' : '#e2e8f0',
                          background: 'linear-gradient(135deg, #fffbeb, #fef9c3)',
                        }}
                      >
                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ bgcolor: '#fef9c3', width: 48, height: 48, borderRadius: 2 }}>
                              <EmojiEvents sx={{ color: '#f59e0b' }} />
                            </Avatar>
                            <Box>
                              <Typography fontWeight={800} color="#0f172a">
                                Redeem Eco-Coins 🎉
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Use {MONTHLY_FEE} coins for 1 free month · Balance: {billing?.coinBalance} coins
                              </Typography>
                            </Box>
                          </Stack>
                          <Button
                            variant="contained"
                            onClick={() => setRedeemDialog(true)}
                            disabled={!!paying}
                            sx={{
                              bgcolor: '#f59e0b', '&:hover': { bgcolor: '#d97706' },
                              borderRadius: 2, fontWeight: 800, px: 3, py: 1.2, minWidth: 160, color: '#fff',
                            }}
                          >
                            {paying === 'redeem' ? <CircularProgress size={20} color="inherit" /> : 'Use Coins'}
                          </Button>
                        </Stack>
                      </Paper>
                    )}

                    {/* Security note */}
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ pt: 1 }}>
                      <Shield sx={{ fontSize: '1rem', color: '#94a3b8' }} />
                      <Typography variant="caption" color="text.secondary">
                        All payments are processed securely. You will be redirected to the payment portal and brought back upon completion.
                      </Typography>
                    </Stack>
                  </Stack>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* ── Payment history table ── */}
          <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" p={3} borderBottom="1px solid #f1f5f9">
              <Typography variant="h6" fontWeight={900} color="#0f172a">Payment History</Typography>
              <Chip label={`${history.length} records`} size="small" sx={{ fontWeight: 700 }} />
            </Stack>

            {loading ? (
              <Box p={4}><CircularProgress /></Box>
            ) : history.length === 0 ? (
              <Box p={6} textAlign="center">
                <Payment sx={{ fontSize: 56, color: '#cbd5e1', mb: 1 }} />
                <Typography color="text.secondary" fontWeight={600}>No payment history yet.</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Month</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Method</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Valid Until</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {history.map((p) => {
                      const method = METHOD_CONFIG[p.paymentMethod] || METHOD_CONFIG.cash;
                      return (
                        <TableRow key={p._id} hover sx={{ '&:last-child td': { border: 0 } }}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={700} color="#0f172a">
                              {p.forMonth || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={method.label}
                              size="small"
                              sx={{ fontWeight: 700, bgcolor: method.bg, color: method.color }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={800} color="#0f172a">
                              {p.isFreeService
                                ? <span style={{ color: '#16a34a' }}>FREE 🎉</span>
                                : `Rs. ${p.amount?.toLocaleString()}`}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {p.validUntil ? format(new Date(p.validUntil), 'MMM dd, yyyy') : '–'}
                            </Typography>
                          </TableCell>
                          <TableCell>{statusChip(p.status)}</TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>

        </Container>
      </Box>

      {/* ── Confirm redeem dialog ── */}
      <Dialog
        open={redeemDialog}
        onClose={() => setRedeemDialog(false)}
        PaperProps={{ sx: { borderRadius: 4, p: 1, maxWidth: 420 } }}
      >
        <DialogTitle sx={{ fontWeight: 900 }}>Confirm Coin Redemption</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              You are about to spend <strong>1,000 coins</strong> for <strong>1 month of free waste collection</strong>.
            </Alert>
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary" fontWeight={700}>Current balance</Typography>
              <Typography fontWeight={800}>{billing?.coinBalance} coins</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary" fontWeight={700}>Cost</Typography>
              <Typography fontWeight={800} color="#ef4444">– 1,000 coins</Typography>
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary" fontWeight={700}>After redemption</Typography>
              <Typography fontWeight={800} color="#16a34a">
                {(billing?.coinBalance || 0) - 1000} coins remaining
              </Typography>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={() => setRedeemDialog(false)} sx={{ fontWeight: 700 }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleRedeem}
            sx={{ bgcolor: '#f59e0b', '&:hover': { bgcolor: '#d97706' }, fontWeight: 800, borderRadius: 2 }}
          >
            Confirm — Use 1,000 Coins
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentPage;