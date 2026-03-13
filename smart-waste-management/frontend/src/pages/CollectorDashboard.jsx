// ============================================================
// COLLECTOR FEATURE 1: Route Execution
// FILE: frontend/src/pages/CollectorDashboard.jsx
// ============================================================
// Tabs:
//   0 — Active Route   (assigned jobs, mark status)
//   1 — Zone Board     (unclaimed pickups to claim)
//   2 — History        (completed / skipped)
//   3 — Performance    (stats + analytics)
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Grid, Paper, Typography, Button,
  Stack, Avatar, Chip, Divider, Card, CardContent,
  Skeleton, Alert, LinearProgress, IconButton,
  Drawer, Badge, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField,
  InputAdornment, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow
} from '@mui/material';
import {
  LocalShipping, CheckCircle, PendingActions,
  LocationOn, Scale, Speed, TrendingUp,
  Assignment, Layers, Timeline, Logout,
  Menu, RecyclingRounded, Phone, Person,
  AddCircle, History, BarChart
} from '@mui/icons-material';
import { useAuth }          from '../context/AuthContext';
import { useNavigate }      from 'react-router-dom';
import { useSocket }        from '../context/SocketContext';
import api                  from '../services/api';
import { toast }            from 'react-toastify';
import { format, formatDistanceToNow } from 'date-fns';

// ── Status color map ─────────────────────────────────────────
const STATUS_COLOR = {
  Pending:     '#f59e0b',
  Scheduled:   '#3b82f6',
  'In Progress':'#8b5cf6',
  Collected:   '#16a34a',
  Skipped:     '#ef4444',
};

// ── Small stat card ───────────────────────────────────────────
const StatCard = ({ icon, label, value, color, loading }) => (
  <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
    {loading ? (
      <Skeleton height={60} />
    ) : (
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar sx={{ bgcolor: `${color}18`, color, width: 44, height: 44 }}>{icon}</Avatar>
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={700}
            sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {label}
          </Typography>
          <Typography variant="h5" fontWeight={900} color="#0f172a">{value}</Typography>
        </Box>
      </Stack>
    )}
  </Paper>
);

// ── Job card (active route) ──────────────────────────────────
const JobCard = ({ job, onUpdateStatus }) => (
  <Card elevation={0} sx={{
    borderRadius: 4, border: '1px solid #e2e8f0',
    borderLeft: `5px solid ${STATUS_COLOR[job.status] || '#e2e8f0'}`,
    transition: 'all 0.2s',
    '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.08)' },
  }}>
    <CardContent sx={{ p: 3 }}>
      {/* Header row */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Chip
          label={job.wasteType}
          size="small"
          sx={{ fontWeight: 700, bgcolor: '#eff6ff', color: '#3b82f6' }}
        />
        <Typography variant="caption" fontWeight={700} color="text.secondary">
          #{job._id.slice(-6).toUpperCase()}
        </Typography>
      </Stack>

      {/* Resident info */}
      <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
        <Avatar sx={{ bgcolor: '#f1f5f9', color: '#475569', width: 36, height: 36 }}>
          <Person fontSize="small" />
        </Avatar>
        <Box>
          <Typography variant="body1" fontWeight={800} color="#0f172a">
            {job.resident?.name || 'Resident'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {job.resident?.phone || 'No phone'}
          </Typography>
        </Box>
      </Stack>

      {/* Address */}
      <Stack direction="row" spacing={1} alignItems="center" mb={2}
        sx={{ bgcolor: '#f8fafc', borderRadius: 2, p: 1.5 }}>
        <LocationOn fontSize="small" color="primary" />
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {job.address?.street}, Zone {job.address?.zone?.toUpperCase()}
        </Typography>
      </Stack>

      <Stack direction="row" justifyContent="space-between" mb={2.5}>
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>Est. Weight</Typography>
          <Typography variant="body2" fontWeight={800}>{job.estimatedWeight || '–'} kg</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>Scheduled</Typography>
          <Typography variant="body2" fontWeight={800}>
            {format(new Date(job.scheduledDate || job.createdAt), 'MMM dd')}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>Status</Typography>
          <Chip
            label={job.status}
            size="small"
            sx={{ fontWeight: 700, bgcolor: `${STATUS_COLOR[job.status]}18`, color: STATUS_COLOR[job.status] }}
          />
        </Box>
      </Stack>

      {/* Action buttons */}
      <Stack direction="row" spacing={1}>
        <Button
          variant="contained" size="small" startIcon={<CheckCircle />}
          onClick={() => onUpdateStatus(job, 'Collected')}
          sx={{ flex: 1, borderRadius: 2, fontWeight: 800, bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}
        >
          Collected
        </Button>
        <Button
          variant="outlined" size="small" startIcon={<PendingActions />}
          onClick={() => onUpdateStatus(job, 'Pending')}
          sx={{ flex: 1, borderRadius: 2, fontWeight: 700, borderColor: '#f59e0b', color: '#f59e0b' }}
        >
          Pending
        </Button>
        <Button
          variant="text" size="small" color="error"
          onClick={() => onUpdateStatus(job, 'Skipped')}
          sx={{ fontWeight: 700 }}
        >
          Skip
        </Button>
      </Stack>
    </CardContent>
  </Card>
);

// ── Main component ────────────────────────────────────────────
const CollectorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const { socket }       = useSocket?.() || {};

  const [activeTab,    setActiveTab]    = useState(0);
  const [stats,        setStats]        = useState(null);
  const [myRoute,      setMyRoute]      = useState([]);
  const [zoneBoard,    setZoneBoard]    = useState([]);
  const [history,      setHistory]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [claiming,     setClaiming]     = useState(null);  // collectionId being claimed

  // Status update dialog
  const [statusDialog, setStatusDialog] = useState({ open: false, job: null, targetStatus: '' });
  const [weightInput,  setWeightInput]  = useState('');
  const [notesInput,   setNotesInput]   = useState('');
  const [submitting,   setSubmitting]   = useState(false);

  // ── Fetch all data ─────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, routeRes, boardRes, histRes] = await Promise.all([
        api.get('/collector/stats'),
        api.get('/collector/my-route'),
        api.get('/collector/zone-board'),
        api.get('/collector/history'),
      ]);
      setStats(statsRes.data.stats);
      setMyRoute(routeRes.data.collections || []);
      setZoneBoard(boardRes.data.collections || []);
      setHistory(histRes.data.collections || []);
    } catch {
      toast.error('Failed to sync route data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Socket: new job assigned or pickup claimed ─────────────
  useEffect(() => {
    if (!socket) return;
    socket.on('pickup_claimed', () => fetchAll());
    socket.on('new_collection_request', () => fetchAll());
    return () => {
      socket.off('pickup_claimed');
      socket.off('new_collection_request');
    };
  }, [socket, fetchAll]);

  // ── Claim a pickup ─────────────────────────────────────────
  const handleClaim = async (collectionId) => {
    try {
      setClaiming(collectionId);
      await api.put(`/collector/claim/${collectionId}`);
      toast.success('Pickup added to your route!');
      fetchAll();
      setActiveTab(0); // jump to Active Route tab
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not claim pickup');
    } finally {
      setClaiming(null);
    }
  };

  // ── Open confirm-status dialog ─────────────────────────────
  const handleUpdateStatus = (job, targetStatus) => {
    setStatusDialog({ open: true, job, targetStatus });
    setWeightInput(job.estimatedWeight ? String(job.estimatedWeight) : '');
    setNotesInput('');
  };

  // ── Submit status update ───────────────────────────────────
  const handleSubmitStatus = async () => {
    const { job, targetStatus } = statusDialog;
    if (targetStatus === 'Collected' && !weightInput) {
      toast.warning('Please enter the actual weight');
      return;
    }
    try {
      setSubmitting(true);
      // FIX: Changed to api.patch to match the backend route perfectly
      // FIX: Ensure the URL correctly points to the collection routes
      await api.patch(`/collections/${job._id}/status`, {
        status:       targetStatus,
        actualWeight: weightInput ? Number(weightInput) : undefined,
        notes:        notesInput || undefined,
      });
      
      toast.success(`Marked as ${targetStatus}`);
      setStatusDialog({ open: false, job: null, targetStatus: '' });
      fetchAll();
    } catch (err) {
      console.error("Status Update Error:", err);
      toast.error(err.response?.data?.message || 'Status update failed');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Sidebar items ──────────────────────────────────────────
  const tabs = [
    { label: 'Active Route',  icon: <Assignment />,   badge: myRoute.length },
    { label: 'Zone Board',    icon: <Layers />,        badge: zoneBoard.length },
    { label: 'History',       icon: <History />,       badge: 0 },
    { label: 'Performance',   icon: <BarChart />,      badge: 0 },
  ];

  const SidebarContent = () => (
    <Box sx={{ height: '100%', bgcolor: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 3, py: 3.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: '#16a34a', width: 36, height: 36 }}>
            <LocalShipping fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={900} color="white">SWMS</Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>Collector Portal</Typography>
          </Box>
        </Stack>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)' }} />

      {/* Collector info */}
      <Box sx={{ px: 3, py: 2.5, bgcolor: '#1e293b', mx: 2, borderRadius: 2, mt: 2 }}>
        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Assigned Zone
        </Typography>
        <Typography variant="body1" fontWeight={900} color="white" mt={0.3}>
          {user?.address?.zone?.toUpperCase() || 'UNASSIGNED'}
        </Typography>
      </Box>

      <Box sx={{ flexGrow: 1, px: 2, pt: 2 }}>
        {tabs.map((item, idx) => (
          <Box
            key={idx}
            onClick={() => { setActiveTab(idx); setMobileOpen(false); }}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1.5,
              px: 2, py: 1.5, borderRadius: 2, mb: 0.5, cursor: 'pointer',
              bgcolor: activeTab === idx ? '#16a34a' : 'transparent',
              '&:hover': { bgcolor: activeTab === idx ? '#15803d' : 'rgba(255,255,255,0.05)' },
            }}
          >
            <Box sx={{ color: 'white' }}>{item.icon}</Box>
            <Typography fontSize="0.9rem" fontWeight={activeTab === idx ? 800 : 500} color="white" sx={{ flexGrow: 1 }}>
              {item.label}
            </Typography>
            {item.badge > 0 && (
              <Chip label={item.badge} size="small"
                sx={{ bgcolor: '#ef4444', color: 'white', fontWeight: 900, height: 20, fontSize: '0.72rem' }} />
            )}
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

      {/* Mobile Drawer */}
      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: 260, border: 'none' } }}>
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

          {/* Page heading */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
            <Box>
              <Typography variant="h4" fontWeight={900} color="#0f172a">
                Welcome, {user?.name?.split(' ')[0]} 👋
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Zone {user?.address?.zone?.toUpperCase() || 'N/A'} · Today's route
              </Typography>
            </Box>
            <Chip
              icon={<LocalShipping />}
              label={`${myRoute.length} active job${myRoute.length !== 1 ? 's' : ''}`}
              color={myRoute.length > 0 ? 'warning' : 'default'}
              sx={{ fontWeight: 800 }}
            />
          </Stack>

          {/* ── Stats row ── */}
          <Grid container spacing={2} mb={4}>
            {[
              { icon: <Assignment />, label: 'Active Jobs',      value: loading ? '–' : myRoute.length,           color: '#3b82f6' },
              { icon: <CheckCircle />, label: 'Done Today',      value: loading ? '–' : stats?.collectedToday ?? 0, color: '#16a34a' },
              { icon: <Scale />,       label: 'Weight Today',    value: loading ? '–' : `${stats?.weightToday ?? 0}kg`, color: '#8b5cf6' },
              { icon: <Speed />,       label: 'Completion Rate', value: loading ? '–' : `${stats?.completionRate ?? 0}%`, color: '#f59e0b' },
            ].map((s) => (
              <Grid item xs={6} md={3} key={s.label}>
                <StatCard {...s} loading={loading} />
              </Grid>
            ))}
          </Grid>

          {/* ── TAB 0: ACTIVE ROUTE ── */}
          {activeTab === 0 && (
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight={900} color="#0f172a">
                  Active Route
                </Typography>
                <Button variant="outlined" size="small" startIcon={<Layers />}
                  onClick={() => setActiveTab(1)}
                  sx={{ fontWeight: 700, borderRadius: 2, borderColor: '#16a34a', color: '#16a34a' }}>
                  Zone Board ({zoneBoard.length})
                </Button>
              </Stack>

              {loading ? (
                <Grid container spacing={3}>
                  {[1, 2, 3].map((i) => (
                    <Grid item xs={12} md={6} lg={4} key={i}>
                      <Skeleton variant="rectangular" height={240} sx={{ borderRadius: 4 }} />
                    </Grid>
                  ))}
                </Grid>
              ) : myRoute.length === 0 ? (
                <Paper elevation={0} sx={{ p: 8, textAlign: 'center', borderRadius: 4, border: '2px dashed #e2e8f0' }}>
                  <CheckCircle sx={{ fontSize: 72, color: '#bbf7d0', mb: 2 }} />
                  <Typography variant="h5" fontWeight={900} color="#0f172a">Route Complete!</Typography>
                  <Typography color="text.secondary" mt={1}>No active jobs. Check the Zone Board for new pickups.</Typography>
                  <Button variant="contained" startIcon={<Layers />} onClick={() => setActiveTab(1)}
                    sx={{ mt: 3, borderRadius: 2, fontWeight: 800, bgcolor: '#16a34a' }}>
                    Open Zone Board
                  </Button>
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  {myRoute.map((job) => (
                    <Grid item xs={12} md={6} lg={4} key={job._id}>
                      <JobCard job={job} onUpdateStatus={handleUpdateStatus} />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {/* ── TAB 1: ZONE BOARD ── */}
          {activeTab === 1 && (
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography variant="h5" fontWeight={900} color="#0f172a">Zone Board</Typography>
                  <Typography variant="body2" color="text.secondary" mt={0.3}>
                    Unclaimed pickups in Zone {user?.address?.zone?.toUpperCase()}
                  </Typography>
                </Box>
                <Button variant="text" size="small" onClick={fetchAll} sx={{ fontWeight: 700 }}>
                  Refresh
                </Button>
              </Stack>

              {loading ? (
                <Stack spacing={2}>{[1, 2, 3].map((i) => <Skeleton key={i} height={80} sx={{ borderRadius: 3 }} />)}</Stack>
              ) : zoneBoard.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 3, fontWeight: 600 }}>
                  No unclaimed pickups in your zone right now. Check back later.
                </Alert>
              ) : (
                <Stack spacing={2}>
                  {zoneBoard.map((job) => (
                    <Paper key={job._id} elevation={0}
                      sx={{ borderRadius: 3, border: '1px solid #e2e8f0', p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: '#eff6ff', color: '#3b82f6' }}>
                          <LocationOn />
                        </Avatar>
                        <Box>
                          <Typography fontWeight={800} color="#0f172a">
                            {job.address?.street}, Zone {job.address?.zone?.toUpperCase()}
                          </Typography>
                          <Stack direction="row" spacing={1} mt={0.5}>
                            <Chip label={job.wasteType} size="small" sx={{ fontWeight: 700, bgcolor: '#f1f5f9', color: '#475569' }} />
                            <Typography variant="caption" color="text.secondary">
                              ~{job.estimatedWeight || '?'} kg ·{' '}
                              {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                            </Typography>
                          </Stack>
                        </Box>
                      </Stack>
                      <Button
                        variant="contained"
                        startIcon={<AddCircle />}
                        disabled={claiming === job._id}
                        onClick={() => handleClaim(job._id)}
                        sx={{ borderRadius: 2, fontWeight: 800, bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' }, minWidth: 140 }}
                      >
                        {claiming === job._id ? 'Claiming…' : 'Claim Pickup'}
                      </Button>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Box>
          )}

          {/* ── TAB 2: HISTORY ── */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h5" fontWeight={900} color="#0f172a" mb={3}>Collection History</Typography>
              <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                {loading ? (
                  <Box p={4}><Skeleton height={60} /><Skeleton height={60} /><Skeleton height={60} /></Box>
                ) : history.length === 0 ? (
                  <Box p={6} textAlign="center">
                    <Timeline sx={{ fontSize: 56, color: '#cbd5e1', mb: 1 }} />
                    <Typography color="text.secondary" fontWeight={600}>No completed collections yet.</Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Resident</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Zone</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Weight</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {history.map((c) => (
                          <TableRow key={c._id} hover sx={{ '&:last-child td': { border: 0 } }}>
                            <TableCell>
                              <Typography variant="body2" fontWeight={700}>{c.resident?.name || '–'}</Typography>
                            </TableCell>
                            <TableCell>{c.address?.zone?.toUpperCase()}</TableCell>
                            <TableCell>
                              <Chip label={c.wasteType} size="small" sx={{ fontWeight: 700 }} />
                            </TableCell>
                            <TableCell fontWeight={700}>{c.actualWeight || 0} kg</TableCell>
                            <TableCell>
                              <Chip
                                label={c.status}
                                size="small"
                                sx={{ fontWeight: 700,
                                  bgcolor: `${STATUS_COLOR[c.status] || '#e2e8f0'}18`,
                                  color: STATUS_COLOR[c.status] || '#475569' }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" color="text.secondary">
                                {c.completedDate
                                  ? format(new Date(c.completedDate), 'MMM dd, yyyy')
                                  : formatDistanceToNow(new Date(c.updatedAt), { addSuffix: true })}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </Box>
          )}

          {/* ── TAB 3: PERFORMANCE ── */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h5" fontWeight={900} color="#0f172a" mb={3}>My Performance</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: '#0f172a', color: 'white', border: '1px solid #1e293b' }}>
                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, mb: 1 }}>
                      Completion Rate
                    </Typography>
                    <Typography variant="h2" fontWeight={900} color="white" lineHeight={1}>
                      {stats?.completionRate ?? 0}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={stats?.completionRate ?? 0}
                      sx={{ mt: 2, height: 10, borderRadius: 5,
                        bgcolor: '#1e293b',
                        '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg,#16a34a,#22d3ee)', borderRadius: 5 }
                      }}
                    />
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e2e8f0' }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1 }}>
                      Avg Weight / Stop
                    </Typography>
                    <Typography variant="h2" fontWeight={900} color="#0f172a" lineHeight={1}>
                      {stats?.avgWeight ?? 0} <Typography component="span" variant="h5" color="text.secondary">kg</Typography>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={2}>
                      Based on {stats?.totalCollected ?? 0} completed collections
                    </Typography>
                  </Paper>
                </Grid>
                {[
                  { label: 'Total Assigned',  value: stats?.totalAssigned ?? 0,  color: '#3b82f6', icon: <Assignment /> },
                  { label: 'Total Collected', value: stats?.totalCollected ?? 0, color: '#16a34a', icon: <CheckCircle /> },
                  { label: 'Total Skipped',   value: stats?.totalSkipped ?? 0,   color: '#ef4444', icon: <PendingActions /> },
                  { label: 'Total Weight',    value: `${stats?.totalWeight ?? 0}kg`, color: '#8b5cf6', icon: <Scale /> },
                ].map((s) => (
                  <Grid item xs={6} md={3} key={s.label}>
                    <StatCard {...s} loading={loading} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

        </Container>
      </Box>

      {/* ── Status Update Dialog ── */}
      <Dialog
        open={statusDialog.open}
        onClose={() => !submitting && setStatusDialog({ open: false, job: null, targetStatus: '' })}
        PaperProps={{ sx: { borderRadius: 4, p: 1, maxWidth: 440, width: '100%' } }}
      >
        <DialogTitle sx={{ fontWeight: 900 }}>
          Confirm — Mark as {statusDialog.targetStatus}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} mt={1}>
            {statusDialog.targetStatus === 'Collected' && (
              <TextField
                fullWidth
                label="Actual Weight (kg) *"
                type="number"
                variant="filled"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                InputProps={{ endAdornment: <InputAdornment position="end">kg</InputAdornment> }}
                helperText="Required for completed collections"
              />
            )}
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notes (optional)"
              variant="filled"
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder={
                statusDialog.targetStatus === 'Skipped'
                  ? 'Reason for skipping…'
                  : 'Any remarks about this collection…'
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={() => setStatusDialog({ open: false, job: null, targetStatus: '' })}
            disabled={submitting}
            sx={{ fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitStatus}
            disabled={submitting}
            sx={{
              fontWeight: 800, borderRadius: 2, px: 3,
              bgcolor: statusDialog.targetStatus === 'Collected' ? '#16a34a'
                     : statusDialog.targetStatus === 'Skipped'   ? '#ef4444' : '#f59e0b',
            }}
          >
            {submitting ? 'Saving…' : `Confirm ${statusDialog.targetStatus}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CollectorDashboard;