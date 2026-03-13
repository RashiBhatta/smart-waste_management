// ============================================================
// ADMIN FEATURE 2: Volunteer Program Management
// FILE: frontend/src/pages/ManagePrograms.jsx
// Route: /admin/programs
// ============================================================
// Tabs:
//   0 — Programs List  (cards, create/edit/cancel)
//   1 — Pending Queue  (global approval queue, bulk approve)
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Grid, Paper, Typography, Button,
  Stack, Avatar, Chip, Divider, IconButton, Drawer,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel,
  Alert, Badge, LinearProgress, Skeleton, Card,
  CardContent, CardActions, Tooltip
} from '@mui/material';
import {
  Add, CheckCircle, Cancel, Edit, VolunteerActivism,
  People, EmojiEvents, CalendarToday, LocationOn,
  Dashboard, LocalShipping, Payment, RecyclingRounded,
  Logout, Menu, ArrowBack, TaskAlt, ThumbDown,
  HourglassEmpty, Star, Warning, DoneAll
} from '@mui/icons-material';
import { useAuth }     from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSocket }   from '../context/SocketContext';
import api             from '../services/api';
import { toast }       from 'react-toastify';
import { format, formatDistanceToNow, isPast } from 'date-fns';

// ── Status chip map ───────────────────────────────────────────
const STATUS_CFG = {
  upcoming:  { color: '#3b82f6', bg: '#eff6ff', label: 'Upcoming' },
  active:    { color: '#16a34a', bg: '#f0fdf4', label: 'Active'   },
  completed: { color: '#64748b', bg: '#f8fafc', label: 'Completed'},
  cancelled: { color: '#ef4444', bg: '#fef2f2', label: 'Cancelled'},
};

// ── Empty form state ──────────────────────────────────────────
const EMPTY_FORM = {
  title: '', organization: '', description: '', zone: '',
  location: 'Kathmandu', startDate: '', endDate: '',
  maxVolunteers: 20, rewardCoins: 100,
  requirements: '', benefits: '',
  contactName: '', contactPhone: '', contactEmail: '',
};

// ── Program card ──────────────────────────────────────────────
const ProgramCard = ({ prog, onEdit, onCancel, onApprove, onReject }) => {
  const cfg   = STATUS_CFG[prog.status] || STATUS_CFG.upcoming;
  const fill  = prog.maxVolunteers > 0 ? Math.round((prog.approvedCount / prog.maxVolunteers) * 100) : 0;

  return (
    <Card elevation={0} sx={{
      borderRadius: 4, border: '1px solid #e2e8f0', height: '100%',
      display: 'flex', flexDirection: 'column',
      transition: 'all 0.2s',
      '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.08)' },
    }}>
      <CardContent sx={{ p: 3, flexGrow: 1 }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Chip label={cfg.label} size="small"
            sx={{ fontWeight: 800, bgcolor: cfg.bg, color: cfg.color }} />
          {prog.pendingCount > 0 && (
            <Chip label={`${prog.pendingCount} pending`} size="small" color="warning"
              icon={<HourglassEmpty sx={{ fontSize: '0.9rem !important' }} />}
              sx={{ fontWeight: 800 }} />
          )}
        </Stack>

        <Typography variant="h6" fontWeight={900} color="#0f172a" mb={0.5} lineHeight={1.3}>
          {prog.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" fontWeight={700}>
          {prog.organization}
        </Typography>

        <Typography variant="body2" color="text.secondary" mt={1.5} mb={2}
          sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {prog.description || 'No description provided.'}
        </Typography>

        {/* Meta info */}
        <Stack spacing={1} mb={2.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <LocationOn sx={{ fontSize: 16, color: '#94a3b8' }} />
            <Typography variant="caption" color="text.secondary">
              Zone {(prog.zone || 'All').toUpperCase()} · {prog.location}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <CalendarToday sx={{ fontSize: 16, color: '#94a3b8' }} />
            <Typography variant="caption" color="text.secondary">
              {prog.startDate ? format(new Date(prog.startDate), 'MMM dd') : '?'} –{' '}
              {prog.endDate   ? format(new Date(prog.endDate),   'MMM dd, yyyy') : '?'}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <EmojiEvents sx={{ fontSize: 16, color: '#f59e0b' }} />
            <Typography variant="caption" fontWeight={700} color="#f59e0b">
              {prog.rewardCoins} coins per volunteer
            </Typography>
          </Stack>
        </Stack>

        {/* Volunteer capacity bar */}
        <Box>
          <Stack direction="row" justifyContent="space-between" mb={0.8}>
            <Typography variant="caption" fontWeight={700} color="text.secondary">
              Volunteers
            </Typography>
            <Typography variant="caption" fontWeight={800} color="#0f172a">
              {prog.approvedCount} / {prog.maxVolunteers}
            </Typography>
          </Stack>
          <LinearProgress variant="determinate" value={Math.min(fill, 100)}
            sx={{ height: 6, borderRadius: 3,
              bgcolor: '#e2e8f0',
              '& .MuiLinearProgress-bar': {
                bgcolor: fill >= 100 ? '#ef4444' : '#16a34a', borderRadius: 3,
              },
            }} />
        </Box>
      </CardContent>

      <CardActions sx={{ px: 3, pb: 3, pt: 0, gap: 1, flexWrap: 'wrap' }}>
        {prog.status !== 'cancelled' && prog.status !== 'completed' && (
          <>
            <Button size="small" startIcon={<Edit />} variant="outlined"
              onClick={() => onEdit(prog)}
              sx={{ borderRadius: 2, fontWeight: 700, flex: 1 }}>
              Edit
            </Button>
            <Button size="small" startIcon={<Cancel />} variant="outlined" color="error"
              onClick={() => onCancel(prog)}
              sx={{ borderRadius: 2, fontWeight: 700, flex: 1 }}>
              Cancel
            </Button>
          </>
        )}
        {prog.pendingCount > 0 && (
          <Button size="small" startIcon={<HourglassEmpty />} variant="contained"
            onClick={() => onApprove(prog)}
            sx={{ borderRadius: 2, fontWeight: 800, bgcolor: '#f59e0b', color: 'white',
              '&:hover': { bgcolor: '#d97706' }, width: '100%' }}>
            Review {prog.pendingCount} Application{prog.pendingCount > 1 ? 's' : ''}
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

// ── Main component ────────────────────────────────────────────
const ManagePrograms = () => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const { socket }       = useSocket?.() || {};

  const [activeTab,    setActiveTab]    = useState(0);
  const [programs,     setPrograms]     = useState([]);
  const [pendingQueue, setPendingQueue] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [mobileOpen,   setMobileOpen]   = useState(false);

  // Create/edit dialog
  const [formDialog,   setFormDialog]   = useState({ open: false, editing: null });
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [submitting,   setSubmitting]   = useState(false);

  // Cancel dialog
  const [cancelDialog, setCancelDialog] = useState({ open: false, prog: null });
  const [cancelReason, setCancelReason] = useState('');

  // Volunteer review dialog (single program)
  const [reviewDialog, setReviewDialog] = useState({ open: false, prog: null });

  // Action in progress
  const [acting, setActing] = useState(null); // `${programId}-${userId}`

  // ── Fetch ─────────────────────────────────────────────────
  const fetchPrograms = useCallback(async () => {
    try {
      setLoading(true);
      const [progRes, pendRes] = await Promise.all([
        api.get('/admin/programs'),
        api.get('/admin/programs/pending'),
      ]);
      setPrograms(progRes.data.programs || []);
      setPendingQueue(pendRes.data.queue || []);
    } catch { toast.error('Failed to load programs'); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { fetchPrograms(); }, [fetchPrograms]);

  // Socket: new application
  useEffect(() => {
    if (!socket) return;
    const refresh = () => fetchPrograms();
    socket.on('newVolunteerApplication', refresh);
    return () => socket.off('newVolunteerApplication', refresh);
  }, [socket, fetchPrograms]);

  // ── Form helpers ──────────────────────────────────────────
  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormDialog({ open: true, editing: null });
  };

  const openEdit = (prog) => {
    setForm({
      title:        prog.title || '',
      organization: prog.organization || '',
      description:  prog.description || '',
      zone:         prog.zone || '',
      location:     prog.location || 'Kathmandu',
      startDate:    prog.startDate ? prog.startDate.slice(0, 10) : '',
      endDate:      prog.endDate   ? prog.endDate.slice(0, 10)   : '',
      maxVolunteers: prog.maxVolunteers || 20,
      rewardCoins:   prog.rewardCoins   || 100,
      requirements: (prog.requirements || []).join('\n'),
      benefits:     (prog.benefits     || []).join('\n'),
      contactName:  prog.contactPerson?.name  || '',
      contactPhone: prog.contactPerson?.phone || '',
      contactEmail: prog.contactPerson?.email || '',
    });
    setFormDialog({ open: true, editing: prog });
  };

  const handleFormChange = (field) => (e) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmitForm = async () => {
    if (!form.title.trim())  { toast.warning('Title is required');      return; }
    if (!form.startDate)     { toast.warning('Start date is required'); return; }
    if (!form.endDate)       { toast.warning('End date is required');   return; }

    const payload = {
      title:        form.title.trim(),
      organization: form.organization.trim() || 'SWM Admin',
      description:  form.description.trim(),
      zone:         form.zone,
      location:     form.location.trim(),
      startDate:    form.startDate,
      endDate:      form.endDate,
      maxVolunteers: Number(form.maxVolunteers),
      rewardCoins:   Number(form.rewardCoins),
      requirements:  form.requirements.split('\n').map(s => s.trim()).filter(Boolean),
      benefits:      form.benefits.split('\n').map(s => s.trim()).filter(Boolean),
      contactPerson: {
        name:  form.contactName.trim(),
        phone: form.contactPhone.trim(),
        email: form.contactEmail.trim(),
      },
    };

    try {
      setSubmitting(true);
      if (formDialog.editing) {
        await api.put(`/admin/programs/${formDialog.editing._id}`, payload);
        toast.success('Program updated!');
      } else {
        await api.post('/admin/programs', payload);
        toast.success('Program created and residents notified!');
      }
      setFormDialog({ open: false, editing: null });
      fetchPrograms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save program');
    } finally { setSubmitting(false); }
  };

  // ── Cancel program ────────────────────────────────────────
  const handleCancel = async () => {
    try {
      setSubmitting(true);
      await api.put(`/admin/programs/${cancelDialog.prog._id}/cancel`, { reason: cancelReason });
      toast.success('Program cancelled');
      setCancelDialog({ open: false, prog: null });
      setCancelReason('');
      fetchPrograms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    } finally { setSubmitting(false); }
  };

  // ── Approve single volunteer ──────────────────────────────
  const handleApprove = async (programId, userId) => {
    const key = `${programId}-${userId}`;
    try {
      setActing(key);
      const res = await api.put(`/admin/programs/${programId}/volunteers/${userId}/approve`);
      toast.success(res.data.message);
      fetchPrograms();
      // Refresh review dialog if open
      if (reviewDialog.prog?._id === programId) {
        const updated = await api.get('/admin/programs');
        const prog = updated.data.programs.find(p => p._id === programId);
        if (prog) setReviewDialog(d => ({ ...d, prog }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed');
    } finally { setActing(null); }
  };

  // ── Reject volunteer ──────────────────────────────────────
  const handleReject = async (programId, userId) => {
    const key = `${programId}-${userId}`;
    try {
      setActing(key);
      await api.put(`/admin/programs/${programId}/volunteers/${userId}/reject`);
      toast.success('Application rejected');
      fetchPrograms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed');
    } finally { setActing(null); }
  };

  // ── Bulk approve ──────────────────────────────────────────
  const handleBulkApprove = async (programId) => {
    try {
      setActing(`bulk-${programId}`);
      const res = await api.put(`/admin/programs/${programId}/volunteers/bulk-approve`);
      toast.success(res.data.message);
      fetchPrograms();
      setReviewDialog({ open: false, prog: null });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk approval failed');
    } finally { setActing(null); }
  };

  const totalPending = pendingQueue.length;

  // ── Sidebar ───────────────────────────────────────────────
  const navItems = [
    { label: 'Dashboard',   icon: <Dashboard />,        path: '/admin/dashboard' },
    { label: 'Programs',    icon: <VolunteerActivism />, path: '/admin/programs', active: true },
    { label: 'Collections', icon: <LocalShipping />,    path: '/admin/dashboard' },
    { label: 'Payments',    icon: <Payment />,           path: '/admin/payments' },
  ];

  const SidebarContent = () => (
    <Box sx={{ height: '100%', bgcolor: '#0f172a', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 3, py: 3.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: '#16a34a', width: 36, height: 36 }}>
            <RecyclingRounded fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={900} color="white">SWMS Admin</Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>Program Manager</Typography>
          </Box>
        </Stack>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)' }} />
      <Box sx={{ flexGrow: 1, px: 2, pt: 2 }}>
        {navItems.map(item => (
          <Box key={item.label}
            onClick={() => { navigate(item.path); setMobileOpen(false); }}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1.5,
              px: 2, py: 1.5, borderRadius: 2, mb: 0.5, cursor: 'pointer',
              bgcolor: item.active ? '#16a34a' : 'transparent',
              '&:hover': { bgcolor: item.active ? '#15803d' : 'rgba(255,255,255,0.05)' },
            }}>
            <Box sx={{ color: 'white' }}>{item.icon}</Box>
            <Typography fontSize="0.9rem" fontWeight={item.active ? 800 : 500} color="white" sx={{ flexGrow: 1 }}>
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ p: 2 }}>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)', mb: 2 }} />
        <Button fullWidth variant="text" color="error" startIcon={<Logout />}
          onClick={() => { logout(); navigate('/login'); }}
          sx={{ fontWeight: 700, justifyContent: 'flex-start', px: 2 }}>
          Sign Out
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f1f5f9' }}>

      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: 260, border: 'none' } }}>
        <SidebarContent />
      </Drawer>

      <Box sx={{ width: 260, flexShrink: 0, display: { xs: 'none', md: 'block' }, position: 'sticky', top: 0, height: '100vh' }}>
        <SidebarContent />
      </Box>

      <Box sx={{ flexGrow: 1, p: { xs: 2, md: 5 } }}>
        <Container maxWidth="xl" disableGutters>

          <Box sx={{ display: { md: 'none' }, mb: 2 }}>
            <IconButton onClick={() => setMobileOpen(true)}><Menu /></IconButton>
          </Box>

          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="h4" fontWeight={900} color="#0f172a">Program Management</Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                {programs.length} programs · {totalPending} pending approval{totalPending !== 1 ? 's' : ''}
              </Typography>
            </Box>
            <Button variant="contained" startIcon={<Add />} onClick={openCreate}
              sx={{ fontWeight: 800, borderRadius: 2, bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' }, px: 3, py: 1.2 }}>
              Create Program
            </Button>
          </Stack>

          {/* Tab switcher */}
          <Stack direction="row" spacing={1} mb={4}>
            <Button
              variant={activeTab === 0 ? 'contained' : 'outlined'}
              onClick={() => setActiveTab(0)}
              sx={{ borderRadius: 2, fontWeight: 800,
                bgcolor: activeTab === 0 ? '#0f172a' : 'white',
                color:   activeTab === 0 ? 'white' : '#0f172a',
                borderColor: '#e2e8f0' }}>
              All Programs ({programs.length})
            </Button>
            <Badge badgeContent={totalPending} color="error" max={99}>
              <Button
                variant={activeTab === 1 ? 'contained' : 'outlined'}
                onClick={() => setActiveTab(1)}
                sx={{ borderRadius: 2, fontWeight: 800,
                  bgcolor: activeTab === 1 ? '#f59e0b' : 'white',
                  color:   activeTab === 1 ? 'white' : '#0f172a',
                  borderColor: '#e2e8f0' }}>
                Pending Approvals
              </Button>
            </Badge>
          </Stack>

          {/* ── TAB 0: ALL PROGRAMS ── */}
          {activeTab === 0 && (
            <>
              {totalPending > 0 && (
                <Alert severity="warning" sx={{ borderRadius: 3, mb: 3, fontWeight: 600 }}
                  action={<Button size="small" onClick={() => setActiveTab(1)} sx={{ fontWeight: 800 }}>Review Now</Button>}>
                  {totalPending} volunteer application{totalPending > 1 ? 's' : ''} waiting for your review
                </Alert>
              )}

              {loading ? (
                <Grid container spacing={3}>
                  {[1,2,3].map(i => <Grid item xs={12} md={6} lg={4} key={i}><Skeleton variant="rectangular" height={360} sx={{ borderRadius: 4 }} /></Grid>)}
                </Grid>
              ) : programs.length === 0 ? (
                <Paper elevation={0} sx={{ p: 8, textAlign: 'center', borderRadius: 4, border: '2px dashed #e2e8f0' }}>
                  <VolunteerActivism sx={{ fontSize: 72, color: '#cbd5e1', mb: 2 }} />
                  <Typography variant="h5" fontWeight={900} color="#0f172a">No programs yet</Typography>
                  <Typography color="text.secondary" mt={1}>Create the first volunteer program to get started.</Typography>
                  <Button variant="contained" startIcon={<Add />} onClick={openCreate}
                    sx={{ mt: 3, borderRadius: 2, fontWeight: 800, bgcolor: '#16a34a' }}>
                    Create Program
                  </Button>
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  {programs.map(prog => (
                    <Grid item xs={12} md={6} lg={4} key={prog._id}>
                      <ProgramCard
                        prog={prog}
                        onEdit={openEdit}
                        onCancel={(p) => { setCancelDialog({ open: true, prog: p }); setCancelReason(''); }}
                        onApprove={(p) => setReviewDialog({ open: true, prog: p })}
                        onReject={handleReject}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}

          {/* ── TAB 1: PENDING QUEUE ── */}
          {activeTab === 1 && (
            <>
              {totalPending === 0 ? (
                <Paper elevation={0} sx={{ p: 8, textAlign: 'center', borderRadius: 4, border: '2px dashed #e2e8f0' }}>
                  <CheckCircle sx={{ fontSize: 72, color: '#bbf7d0', mb: 2 }} />
                  <Typography variant="h5" fontWeight={900} color="#0f172a">All Clear!</Typography>
                  <Typography color="text.secondary" mt={1}>No pending applications right now.</Typography>
                </Paper>
              ) : (
                <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" p={3} borderBottom="1px solid #f1f5f9">
                    <Typography fontWeight={900} color="#0f172a">
                      {totalPending} Application{totalPending !== 1 ? 's' : ''} Awaiting Review
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Oldest first (FIFO)</Typography>
                  </Stack>

                  <Stack spacing={0}>
                    {pendingQueue.map((item, idx) => (
                      <Box key={`${item.programId}-${item.userId}`}
                        sx={{ p: 3, borderBottom: idx < pendingQueue.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ bgcolor: '#eff6ff', color: '#3b82f6', width: 44, height: 44 }}>
                              {item.userName?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography fontWeight={800} color="#0f172a">{item.userName}</Typography>
                              <Typography variant="caption" color="text.secondary">{item.userEmail}</Typography>
                              <Stack direction="row" spacing={1} mt={0.5}>
                                <Chip label={item.programTitle} size="small"
                                  sx={{ fontWeight: 700, bgcolor: '#f0fdf4', color: '#16a34a', maxWidth: 200,
                                    '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' } }} />
                                <Chip label={`Zone ${(item.zone || '').toUpperCase()}`} size="small" sx={{ fontWeight: 700 }} />
                                <Chip icon={<EmojiEvents sx={{ fontSize: '0.85rem !important' }} />}
                                  label={`+${item.rewardCoins} coins`} size="small"
                                  sx={{ fontWeight: 700, bgcolor: '#fef9c3', color: '#a16207' }} />
                              </Stack>
                              <Typography variant="caption" color="text.disabled" display="block" mt={0.5}>
                                Applied {formatDistanceToNow(new Date(item.appliedAt), { addSuffix: true })}
                                {' · '}{item.userCoins} coins currently
                              </Typography>
                            </Box>
                          </Stack>

                          <Stack direction="row" spacing={1} flexShrink={0}>
                            <Button
                              variant="contained" size="small"
                              startIcon={acting === `${item.programId}-${item.userId}` ? null : <TaskAlt />}
                              disabled={!!acting}
                              onClick={() => handleApprove(item.programId, item.userId)}
                              sx={{ borderRadius: 2, fontWeight: 800, bgcolor: '#16a34a',
                                '&:hover': { bgcolor: '#15803d' }, minWidth: 110 }}>
                              {acting === `${item.programId}-${item.userId}` ? 'Approving…' : 'Approve'}
                            </Button>
                            <Button
                              variant="outlined" size="small" color="error"
                              startIcon={<ThumbDown />}
                              disabled={!!acting}
                              onClick={() => handleReject(item.programId, item.userId)}
                              sx={{ borderRadius: 2, fontWeight: 800 }}>
                              Reject
                            </Button>
                          </Stack>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              )}
            </>
          )}

        </Container>
      </Box>

      {/* ── Create / Edit dialog ── */}
      <Dialog open={formDialog.open} onClose={() => !submitting && setFormDialog({ open: false, editing: null })}
        maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 900, pb: 1 }}>
          {formDialog.editing ? '✏️ Edit Program' : '🌿 Create New Program'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2.5} mt={0.5}>
            <Grid item xs={12} sm={8}>
              <TextField fullWidth label="Title *" variant="filled" value={form.title}
                onChange={handleFormChange('title')} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Organization" variant="filled" value={form.organization}
                onChange={handleFormChange('organization')} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={3} label="Description" variant="filled"
                value={form.description} onChange={handleFormChange('description')} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth variant="filled">
                <InputLabel>Zone</InputLabel>
                <Select value={form.zone} onChange={(e) => setForm(p => ({ ...p, zone: e.target.value }))}>
                  <MenuItem value="">All Zones</MenuItem>
                  {['north','south','east','west','central'].map(z => (
                    <MenuItem key={z} value={z}>{z.charAt(0).toUpperCase() + z.slice(1)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Location / Venue" variant="filled"
                value={form.location} onChange={handleFormChange('location')} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Reward Coins" type="number" variant="filled"
                value={form.rewardCoins} onChange={handleFormChange('rewardCoins')}
                inputProps={{ min: 1 }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Start Date *" type="date" variant="filled"
                value={form.startDate} onChange={handleFormChange('startDate')}
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="End Date *" type="date" variant="filled"
                value={form.endDate} onChange={handleFormChange('endDate')}
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Max Volunteers" type="number" variant="filled"
                value={form.maxVolunteers} onChange={handleFormChange('maxVolunteers')}
                inputProps={{ min: 1 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth multiline rows={3} label="Requirements (one per line)" variant="filled"
                value={form.requirements} onChange={handleFormChange('requirements')}
                placeholder="e.g. Minimum age 18&#10;Bring gloves&#10;Be on time" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth multiline rows={3} label="Benefits (one per line)" variant="filled"
                value={form.benefits} onChange={handleFormChange('benefits')}
                placeholder="e.g. 100 Eco-Coins&#10;Certificate&#10;Refreshments" />
            </Grid>
            <Grid item xs={12}>
              <Divider><Typography variant="caption" color="text.secondary" fontWeight={700}>CONTACT PERSON (optional)</Typography></Divider>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Name" variant="filled" value={form.contactName}
                onChange={handleFormChange('contactName')} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Phone" variant="filled" value={form.contactPhone}
                onChange={handleFormChange('contactPhone')} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Email" variant="filled" value={form.contactEmail}
                onChange={handleFormChange('contactEmail')} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={() => setFormDialog({ open: false, editing: null })} disabled={submitting} sx={{ fontWeight: 700 }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmitForm} disabled={submitting}
            sx={{ fontWeight: 800, borderRadius: 2, px: 3, bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}>
            {submitting ? 'Saving…' : formDialog.editing ? 'Save Changes' : 'Create Program'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Cancel dialog ── */}
      <Dialog open={cancelDialog.open} onClose={() => !submitting && setCancelDialog({ open: false, prog: null })}
        PaperProps={{ sx: { borderRadius: 4, p: 1, maxWidth: 440, width: '100%' } }}>
        <DialogTitle sx={{ fontWeight: 900, color: '#ef4444' }}>Cancel Program?</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ borderRadius: 2, mb: 2 }}>
            All enrolled volunteers will be notified of this cancellation.
          </Alert>
          <TextField fullWidth multiline rows={3} label="Cancellation Reason (optional)" variant="filled"
            value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
            placeholder="e.g. Weather conditions, venue unavailable…" />
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={() => setCancelDialog({ open: false, prog: null })} disabled={submitting} sx={{ fontWeight: 700 }}>
            Keep Program
          </Button>
          <Button variant="contained" color="error" onClick={handleCancel} disabled={submitting}
            sx={{ fontWeight: 800, borderRadius: 2 }}>
            {submitting ? 'Cancelling…' : 'Confirm Cancel'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Review volunteers dialog (single program) ── */}
      <Dialog open={reviewDialog.open} onClose={() => setReviewDialog({ open: false, prog: null })}
        maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 900, pb: 1 }}>
          Review Applications — {reviewDialog.prog?.title}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {reviewDialog.prog && (
            <>
              {reviewDialog.prog.volunteers.filter(v => v.status === 'pending').length > 1 && (
                <Button fullWidth variant="contained" startIcon={<DoneAll />}
                  disabled={!!acting}
                  onClick={() => handleBulkApprove(reviewDialog.prog._id)}
                  sx={{ mb: 2, fontWeight: 800, borderRadius: 2, bgcolor: '#16a34a' }}>
                  {acting === `bulk-${reviewDialog.prog._id}` ? 'Approving all…' : `Approve All ${reviewDialog.prog.volunteers.filter(v => v.status === 'pending').length} Pending`}
                </Button>
              )}
              <Stack spacing={1.5}>
                {reviewDialog.prog.volunteers.filter(v => v.status === 'pending').map(v => (
                  <Stack key={v._id} direction="row" justifyContent="space-between" alignItems="center"
                    sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 3 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{ bgcolor: '#eff6ff', color: '#3b82f6', width: 36, height: 36 }}>
                        {v.user?.name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={700}>{v.user?.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Zone {v.user?.address?.zone?.toUpperCase() || '?'} · {v.user?.coins || 0} coins
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" variant="contained"
                        disabled={!!acting}
                        onClick={() => handleApprove(reviewDialog.prog._id, v.user?._id)}
                        sx={{ borderRadius: 2, fontWeight: 800, bgcolor: '#16a34a', minWidth: 90 }}>
                        Approve
                      </Button>
                      <Button size="small" variant="outlined" color="error"
                        disabled={!!acting}
                        onClick={() => handleReject(reviewDialog.prog._id, v.user?._id)}
                        sx={{ borderRadius: 2, fontWeight: 700 }}>
                        Reject
                      </Button>
                    </Stack>
                  </Stack>
                ))}
                {reviewDialog.prog.volunteers.filter(v => v.status === 'pending').length === 0 && (
                  <Alert severity="success" sx={{ borderRadius: 2 }}>All applications have been reviewed!</Alert>
                )}
              </Stack>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setReviewDialog({ open: false, prog: null })} sx={{ fontWeight: 700 }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManagePrograms;