// ============================================================
// FEATURE 2: Resident Volunteer Participation
// FILE: frontend/src/pages/Programs.jsx
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Grid, Card, CardContent, CardActions,
  Typography, Button, Chip, TextField, InputAdornment,
  LinearProgress, Stack, Avatar, Divider, Paper,
  IconButton, Skeleton, Alert, Tabs, Tab, Badge,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
  Search, FilterList, LocationOn, CalendarToday,
  People, EmojiEvents, CheckCircle, PendingActions,
  Cancel, RecyclingRounded, Logout, Dashboard,
  LocalShipping, Payment, History, AddCircle,
  Close, Info
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { format, isPast, isFuture } from 'date-fns';

// ── Status config ────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:  { label: 'Awaiting Approval', color: 'warning', icon: <PendingActions fontSize="small" /> },
  approved: { label: 'Approved ✓',        color: 'success', icon: <CheckCircle fontSize="small" /> },
  rejected: { label: 'Not Approved',      color: 'error',   icon: <Cancel fontSize="small" /> },
};

const PROGRAM_STATUS_COLOR = {
  upcoming:  '#3b82f6',
  active:    '#16a34a',
  completed: '#94a3b8',
  cancelled: '#ef4444',
};

// ── Program card ─────────────────────────────────────────────
const ProgramCard = ({ program, onJoin, joining, onParticipate }) => {
  const [detailOpen, setDetailOpen] = useState(false);
  const fillPct = Math.min((program.currentVolunteers / program.maxVolunteers) * 100, 100);
  const appStatus = program.volunteerStatus;
  const statusCfg = appStatus ? STATUS_CONFIG[appStatus] : null;

  // Decide button state
  const renderAction = () => {
    if (program.isFull && !program.hasJoined) {
      return (
        <Button fullWidth disabled variant="outlined" sx={{ borderRadius: 2, fontWeight: 700 }}>
          Program Full
        </Button>
      );
    }
    if (!program.hasJoined) {
      return (
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddCircle />}
          disabled={joining === program._id}
          onClick={() => onJoin(program._id)}
          sx={{
            borderRadius: 2, fontWeight: 800,
            bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' },
            '&:disabled': { bgcolor: '#bbf7d0', color: '#166534' },
          }}
        >
          {joining === program._id ? 'Applying...' : 'Join Campaign'}
        </Button>
      );
    }
    if (program.hasJoined) {
      if (program.participationStatus === 'pending') {
        return <Chip fullWidth label="Proof Pending Review" color="warning" sx={{ width: '100%', fontWeight: 800, py: 2.5, borderRadius: 2 }} />;
      }
      if (program.participationStatus === 'approved') {
        return <Chip fullWidth label="Program Completed ✓" color="success" sx={{ width: '100%', fontWeight: 800, py: 2.5, borderRadius: 2 }} />;
      }
      if (program.participationStatus === 'rejected') {
        return (
          <Button fullWidth variant="outlined" color="error" onClick={() => onParticipate(program._id)} sx={{ borderRadius: 2, fontWeight: 800 }}>
            Proof Rejected - Resubmit
          </Button>
        );
      }
      if (appStatus === 'approved') {
        return (
          <Button fullWidth variant="contained" color="primary" onClick={() => onParticipate(program._id)} sx={{ borderRadius: 2, fontWeight: 800 }}>
            Submit Proof
          </Button>
        );
      }
    }

    // Default status chip for pending/rejected program app
    return (
      <Chip
        fullWidth
        icon={statusCfg?.icon}
        label={statusCfg?.label || appStatus}
        color={statusCfg?.color || 'default'}
        sx={{ width: '100%', fontWeight: 800, py: 2.5, borderRadius: 2 }}
      />
    );
  };

  return (
    <>
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: '1px solid #e2e8f0',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.2s',
          '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 32px rgba(0,0,0,0.08)' },
        }}
      >
        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          {/* Top row */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Chip
              label={program.status}
              size="small"
              sx={{
                fontWeight: 700,
                bgcolor: `${PROGRAM_STATUS_COLOR[program.status]}18`,
                color: PROGRAM_STATUS_COLOR[program.status],
                textTransform: 'capitalize',
              }}
            />
            <Chip
              icon={<EmojiEvents sx={{ fontSize: '0.9rem !important' }} />}
              label={`+${program.rewardCoins || 100} coins`}
              size="small"
              sx={{ bgcolor: '#fef9c3', color: '#854d0e', fontWeight: 800 }}
            />
          </Stack>

          {/* Title */}
          <Typography variant="h6" fontWeight={900} color="#0f172a" mb={0.5} sx={{ lineHeight: 1.3 }}>
            {program.title}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {program.organization || 'SWM Admin'}
          </Typography>

          {/* Description */}
          <Typography
            variant="body2" color="text.secondary" mt={1.5} mb={2}
            sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          >
            {program.description}
          </Typography>

          <Divider sx={{ my: 2 }} />

          {/* Meta info */}
          <Stack spacing={1}>
            {program.zone && (
              <Stack direction="row" spacing={1} alignItems="center">
                <LocationOn sx={{ fontSize: '1rem', color: '#94a3b8' }} />
                <Typography variant="body2" color="text.secondary">Zone: <strong>{program.zone}</strong></Typography>
              </Stack>
            )}
            {program.startDate && (
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarToday sx={{ fontSize: '1rem', color: '#94a3b8' }} />
                <Typography variant="body2" color="text.secondary">
                  {format(new Date(program.startDate), 'MMM dd, yyyy')}
                </Typography>
              </Stack>
            )}
            <Stack direction="row" spacing={1} alignItems="center">
              <People sx={{ fontSize: '1rem', color: '#94a3b8' }} />
              <Typography variant="body2" color="text.secondary">
                {program.currentVolunteers}/{program.maxVolunteers} volunteers
                {program.spotsLeft > 0 && (
                  <Typography component="span" color="success.main" fontWeight={700}>
                    {' '}({program.spotsLeft} spots left)
                  </Typography>
                )}
              </Typography>
            </Stack>
          </Stack>

          {/* Fill bar */}
          <Box mt={2}>
            <LinearProgress
              variant="determinate"
              value={fillPct}
              sx={{
                height: 6, borderRadius: 4,
                bgcolor: '#f1f5f9',
                '& .MuiLinearProgress-bar': {
                  bgcolor: fillPct >= 100 ? '#ef4444' : '#16a34a',
                  borderRadius: 4,
                },
              }}
            />
          </Box>
        </CardContent>

        <CardActions sx={{ p: 3, pt: 0, gap: 1 }}>
          {renderAction()}
          <IconButton
            size="small"
            onClick={() => setDetailOpen(true)}
            sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}
          >
            <Info fontSize="small" />
          </IconButton>
        </CardActions>
      </Card>

      {/* ── Detail Dialog ── */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, pr: 6 }}>
          {program.title}
          <IconButton
            onClick={() => setDetailOpen(false)}
            sx={{ position: 'absolute', right: 16, top: 16 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">{program.description}</Typography>
            <Divider />
            {[
              { label: 'Organization',   value: program.organization || 'SWM Admin' },
              { label: 'Zone',           value: program.zone || 'All Zones' },
              { label: 'Start Date',     value: program.startDate ? format(new Date(program.startDate), 'PPP') : 'TBD' },
              { label: 'End Date',       value: program.endDate   ? format(new Date(program.endDate),   'PPP') : 'TBD' },
              { label: 'Reward',         value: `${program.rewardCoins || 100} Eco-Coins` },
              { label: 'Volunteers',     value: `${program.currentVolunteers}/${program.maxVolunteers}` },
              { label: 'Status',         value: program.status },
            ].map(({ label, value }) => (
              <Stack key={label} direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary" fontWeight={700}>{label}</Typography>
                <Typography variant="body2" fontWeight={600} color="#0f172a" sx={{ textTransform: 'capitalize' }}>{value}</Typography>
              </Stack>
            ))}

            {program.hasJoined && (
              <Alert
                severity={appStatus === 'approved' ? 'success' : appStatus === 'rejected' ? 'error' : 'info'}
                sx={{ borderRadius: 3, mt: 1 }}
              >
                Your application is <strong>{appStatus}</strong>.
                {appStatus === 'approved' && ' 100 coins have been added to your wallet!'}
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          {!program.hasJoined && !program.isFull && (
            <Button
              variant="contained"
              onClick={() => { onJoin(program._id); setDetailOpen(false); }}
              sx={{ borderRadius: 2, fontWeight: 800, bgcolor: '#16a34a' }}
            >
              Join Campaign
            </Button>
          )}
          <Button onClick={() => setDetailOpen(false)} sx={{ fontWeight: 700 }}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// ── Main page ─────────────────────────────────────────────────
const VolunteerPrograms = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { socket } = useSocket?.() || {};

  const [programs,    setPrograms]    = useState([]);
  const [filtered,    setFiltered]    = useState([]);
  const [search,      setSearch]      = useState('');
  const [tabValue,    setTabValue]    = useState(0);    // 0=All, 1=My Applications
  const [loading,     setLoading]     = useState(true);
  const [joining,     setJoining]     = useState(null); // programId currently being joined

  const [participateOpen, setParticipateOpen] = useState(false);
  const [participateId, setParticipateId] = useState(null);
  const [proofText, setProofText] = useState('');
  const [submittingProof, setSubmittingProof] = useState(false);

  // Tab 0 = All programs, Tab 1 = My applications
  const myApplications = programs.filter((p) => p.hasJoined);
  const pendingCount   = myApplications.filter((p) => p.volunteerStatus === 'pending').length;

  // ── Fetch programs ─────────────────────────────────────────
  const fetchPrograms = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/programs');
      setPrograms(res.data.programs || []);
    } catch {
      toast.error('Could not load programs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPrograms(); }, [fetchPrograms]);

  // ── Socket: real-time approval notification ────────────────
  useEffect(() => {
    if (!socket) return;
    const handleApproval = () => fetchPrograms(); // Re-fetch to update button state
    socket.on('applicationApproved', handleApproval);
    socket.on('applicationRejected', handleApproval);
    return () => {
      socket.off('applicationApproved', handleApproval);
      socket.off('applicationRejected', handleApproval);
    };
  }, [socket, fetchPrograms]);

  // ── Search filter ──────────────────────────────────────────
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      programs.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.organization?.toLowerCase().includes(q) ||
          p.zone?.toLowerCase().includes(q)
      )
    );
  }, [search, programs]);

  // ── Join handler ───────────────────────────────────────────
  const handleJoin = async (programId) => {
    try {
      setJoining(programId);
      await api.post(`/programs/${programId}/join`);
      toast.success('Application submitted! Waiting for admin approval 🎉');
      // Optimistically update UI — button changes immediately
      setPrograms((prev) =>
        prev.map((p) =>
          p._id === programId
            ? { ...p, hasJoined: true, volunteerStatus: 'pending' }
            : p
        )
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join program');
    } finally {
      setJoining(null);
    }
  };

  // ── Participation handler ────────────────────────────────────
  const handleParticipateOpen = (programId) => {
    setParticipateId(programId);
    setProofText('');
    setParticipateOpen(true);
  };

  const submitParticipation = async () => {
    if (!proofText.trim()) return toast.error('Proof description is required');
    try {
      setSubmittingProof(true);
      await api.post(`/programs/${participateId}/participate`, { proof: proofText });
      toast.success('Participation proof submitted for review!');
      setParticipateOpen(false);
      setPrograms((prev) => prev.map(p => p._id === participateId ? { ...p, participationStatus: 'pending' } : p));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit proof');
    } finally {
      setSubmittingProof(false);
    }
  };

  const displayList = tabValue === 0 ? filtered : myApplications;

  // ── Sidebar items ──────────────────────────────────────────
  const navItems = [
    { label: 'Dashboard',     icon: <Dashboard />,       path: '/resident/dashboard' },
    { label: 'Request Pickup', icon: <LocalShipping />,  path: '/request-collection' },
    { label: 'My Collections', icon: <History />,        path: '/my-collections' },
    { label: 'Eco-Programs',   icon: <RecyclingRounded />, path: '/programs', active: true },
    { label: 'Payments',       icon: <Payment />,         path: '/payments' },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f1f5f9' }}>

      {/* ── Sidebar ── */}
      <Box
        sx={{
          width: 260, flexShrink: 0, bgcolor: '#0f172a', color: 'white',
          display: { xs: 'none', md: 'flex' }, flexDirection: 'column',
          position: 'sticky', top: 0, height: '100vh',
        }}
      >
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
              onClick={() => navigate(item.path)}
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

      {/* ── Main ── */}
      <Box sx={{ flexGrow: 1, p: { xs: 2, md: 5 } }}>
        <Container maxWidth="xl" disableGutters>

          {/* Page header */}
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} mb={4} gap={2}>
            <Box>
              <Typography variant="h4" fontWeight={900} color="#0f172a">Eco-Programs</Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Join campaigns and earn coins — 100 coins per approved program
              </Typography>
            </Box>
            <Chip
              icon={<EmojiEvents sx={{ color: '#f59e0b' }} />}
              label={`${user?.coins || 0} coins earned`}
              sx={{ fontWeight: 800, bgcolor: '#fef9c3', color: '#854d0e', px: 1 }}
            />
          </Stack>

          {/* Tabs */}
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', mb: 4 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} gap={2} p={2}>
              <Tabs
                value={tabValue}
                onChange={(_, v) => setTabValue(v)}
                sx={{ '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', minHeight: 40 } }}
              >
                <Tab label={`All Programs (${programs.length})`} />
                <Tab
                  label={
                    <Badge badgeContent={pendingCount} color="warning" sx={{ pr: pendingCount ? 1.5 : 0 }}>
                      My Applications ({myApplications.length})
                    </Badge>
                  }
                />
              </Tabs>

              <TextField
                size="small"
                placeholder="Search programs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
                  sx: { borderRadius: 2 },
                }}
                sx={{ ml: { sm: 'auto' }, minWidth: 240 }}
              />
            </Stack>
          </Paper>

          {/* Info strip */}
          {tabValue === 0 && (
            <Alert
              severity="info"
              icon={<EmojiEvents />}
              sx={{ borderRadius: 3, mb: 3, bgcolor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}
            >
              Earn <strong>100 Eco-Coins</strong> for every volunteer program the admin approves you for.
              Collect <strong>1,000 coins</strong> to unlock 1 month of <strong>free waste collection</strong>!
            </Alert>
          )}

          {/* Program grid / my applications */}
          {loading ? (
            <Grid container spacing={3}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 4 }} />
                </Grid>
              ))}
            </Grid>
          ) : displayList.length === 0 ? (
            <Paper
              elevation={0}
              sx={{ p: 8, textAlign: 'center', borderRadius: 4, border: '2px dashed #e2e8f0' }}
            >
              <RecyclingRounded sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
              <Typography variant="h6" fontWeight={700} color="text.secondary">
                {tabValue === 0
                  ? search ? 'No programs match your search' : 'No active programs right now'
                  : "You haven't applied to any programs yet"}
              </Typography>
              {tabValue === 1 && (
                <Button
                  variant="contained"
                  onClick={() => setTabValue(0)}
                  sx={{ mt: 2, borderRadius: 2, fontWeight: 700, bgcolor: '#16a34a' }}
                >
                  Browse Programs
                </Button>
              )}
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {displayList.map((program) => (
                <Grid item xs={12} sm={6} md={4} key={program._id}>
                  <ProgramCard
                    program={program}
                    onJoin={handleJoin}
                    joining={joining}
                    onParticipate={handleParticipateOpen}
                  />
                </Grid>
              ))}
            </Grid>
          )}

        </Container>
      </Box>

      {/* ── Submit Proof Dialog ── */}
      <Dialog open={participateOpen} onClose={() => setParticipateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 900 }}>Submit Participation Proof</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Please describe how you participated in this volunteer program to claim your 100 Eco-Coins.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            placeholder="I collected 2 bags of waste at the zone..."
            value={proofText}
            onChange={(e) => setProofText(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setParticipateOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={submitParticipation} variant="contained" disabled={submittingProof || !proofText.trim()}>
            {submittingProof ? 'Submitting...' : 'Submit Proof'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VolunteerPrograms;