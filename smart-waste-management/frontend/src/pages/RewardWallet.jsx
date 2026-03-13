// ============================================================
// FEATURE 3: Gamified Reward System
// FILE: frontend/src/pages/RewardWallet.jsx
// Route: /rewards  (add to App.js as a ResidentRoute)
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Grid, Paper, Typography, Button,
  Stack, Avatar, Chip, Divider, LinearProgress,
  List, ListItem, ListItemAvatar, ListItemText,
  Skeleton, Alert, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Tooltip,
  Drawer, IconButton
} from '@mui/material';
import {
  EmojiEvents, Stars, LocalFireDepartment,
  CheckCircle, RecyclingRounded, Dashboard,
  LocalShipping, Payment, History, Logout, Menu,
  WorkspacePremium, TrendingUp, CardGiftcard,
  Celebration, AccessTime
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { format, formatDistanceToNow } from 'date-fns';

// ── Constants ────────────────────────────────────────────────
const THRESHOLD = 1000;

// ── Milestone definitions ─────────────────────────────────────
const MILESTONES = [
  { coins: 100,  label: 'First Step',    icon: '🌱', color: '#86efac' },
  { coins: 300,  label: 'Getting Warm',  icon: '🔥', color: '#fcd34d' },
  { coins: 500,  label: 'Halfway Hero',  icon: '⚡', color: '#93c5fd' },
  { coins: 750,  label: 'Almost There',  icon: '🚀', color: '#c4b5fd' },
  { coins: 1000, label: 'Free Service!', icon: '🎉', color: '#6ee7b7' },
];

// ── Animated progress ring (SVG) ─────────────────────────────
const ProgressRing = ({ percent, coins, threshold }) => {
  const r = 70;
  const circ = 2 * Math.PI * r;
  const dash = circ - (percent / 100) * circ;

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="180" height="180" style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle cx="90" cy="90" r={r} fill="none" stroke="#1e293b" strokeWidth="12" />
        {/* Progress */}
        <circle
          cx="90" cy="90" r={r}
          fill="none"
          stroke="url(#coinGrad)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={dash}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <defs>
          <linearGradient id="coinGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#16a34a" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>
      {/* Center text */}
      <Box sx={{ position: 'absolute', textAlign: 'center' }}>
        <Typography variant="h4" fontWeight={900} color="#fff" lineHeight={1}>
          {coins}
        </Typography>
        <Typography variant="caption" color="#64748b" fontWeight={700} letterSpacing={0.5}>
          / {threshold}
        </Typography>
        <Typography variant="caption" color="#22d3ee" display="block" fontWeight={700} mt={0.3}>
          COINS
        </Typography>
      </Box>
    </Box>
  );
};

// ── Transaction row ───────────────────────────────────────────
const TxRow = ({ tx }) => {
  const isEarned = tx.type === 'coin_earned';
  return (
    <TableRow hover sx={{ '&:last-child td': { border: 0 } }}>
      <TableCell>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            sx={{
              width: 36, height: 36,
              bgcolor: isEarned ? 'rgba(22,163,74,0.12)' : 'rgba(239,68,68,0.12)',
              color: isEarned ? '#16a34a' : '#ef4444',
            }}
          >
            {isEarned ? <EmojiEvents fontSize="small" /> : <Stars fontSize="small" />}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={700} color="#0f172a">
              {tx.description}
            </Typography>
            {tx.reference?.programId?.title && (
              <Typography variant="caption" color="text.secondary">
                {tx.reference.programId.title}
              </Typography>
            )}
          </Box>
        </Stack>
      </TableCell>
      <TableCell align="center">
        <Chip
          label={isEarned ? `+${tx.amount}` : `-${tx.amount}`}
          size="small"
          sx={{
            fontWeight: 800, fontSize: '0.85rem',
            bgcolor: isEarned ? '#dcfce7' : '#fee2e2',
            color:   isEarned ? '#166534' : '#991b1b',
          }}
        />
      </TableCell>
      <TableCell align="right">
        <Typography variant="caption" color="text.secondary">
          {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
        </Typography>
      </TableCell>
    </TableRow>
  );
};

// ── Main component ────────────────────────────────────────────
const RewardWallet = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { socket } = useSocket?.() || {};

  const [wallet,       setWallet]       = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [leaderboard,  setLeaderboard]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  // Live "coins just awarded" flash
  const [flashCoins,   setFlashCoins]   = useState(null);

  // ── Fetch wallet ───────────────────────────────────────────
  const fetchWallet = useCallback(async () => {
    try {
      const [walletRes, lbRes] = await Promise.all([
        api.get('/rewards/wallet'),
        api.get('/rewards/leaderboard'),
      ]);
      setWallet(walletRes.data.wallet);
      setTransactions(walletRes.data.transactions || []);
      setLeaderboard(lbRes.data.leaderboard || []);
    } catch {
      toast.error('Failed to load reward wallet');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWallet(); }, [fetchWallet]);

  // ── Real-time: coins awarded socket event ──────────────────
  useEffect(() => {
    if (!socket) return;

    const handleCoins = (data) => {
      // Show flash banner
      setFlashCoins(data);
      setTimeout(() => setFlashCoins(null), 6000);
      // Refresh wallet data
      fetchWallet();
      toast.success(`🎉 +${data.coinsAwarded} coins added to your wallet!`);
    };

    socket.on('coinsAwarded', handleCoins);
    return () => socket.off('coinsAwarded', handleCoins);
  }, [socket, fetchWallet]);

  const pct       = wallet?.progressPercent || 0;
  const balance   = wallet?.coinBalance     || 0;
  const total     = wallet?.totalCoinsEarned || 0;
  const isFree    = wallet?.freeService?.isActive;
  const freeUntil = wallet?.freeService?.expiresAt;

  // ── Sidebar nav ────────────────────────────────────────────
  const navItems = [
    { label: 'Dashboard',      icon: <Dashboard />,         path: '/resident/dashboard' },
    { label: 'Request Pickup', icon: <LocalShipping />,     path: '/request-collection' },
    { label: 'My Collections', icon: <History />,           path: '/my-collections' },
    { label: 'Eco-Programs',   icon: <RecyclingRounded />,  path: '/programs' },
    { label: 'Rewards',        icon: <EmojiEvents />,       path: '/rewards', active: true },
    { label: 'Payments',       icon: <Payment />,           path: '/payments' },
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

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f1f5f9' }}>

      {/* ── Mobile Drawer ── */}
      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: 260, border: 'none' } }}
      >
        <SidebarContent />
      </Drawer>

      {/* ── Desktop Sidebar ── */}
      <Box sx={{ width: 260, flexShrink: 0, display: { xs: 'none', md: 'block' }, position: 'sticky', top: 0, height: '100vh' }}>
        <SidebarContent />
      </Box>

      {/* ── Main ── */}
      <Box sx={{ flexGrow: 1, p: { xs: 2, md: 5 } }}>
        <Container maxWidth="xl" disableGutters>

          {/* Mobile header */}
          <Box sx={{ display: { md: 'none' }, mb: 2 }}>
            <IconButton onClick={() => setMobileOpen(true)}><Menu /></IconButton>
          </Box>

          {/* ── Live flash banner (when coins are awarded in real-time) ── */}
          {flashCoins && (
            <Alert
              severity="success"
              icon={<Celebration />}
              onClose={() => setFlashCoins(null)}
              sx={{ borderRadius: 3, mb: 3, fontWeight: 700, bgcolor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}
            >
              {flashCoins.milestoneReached
                ? `🎉 MILESTONE! You've reached ${THRESHOLD} coins — 1 month of FREE service unlocked!`
                : `+${flashCoins.coinsAwarded} coins deposited! New balance: ${flashCoins.newBalance} coins (${flashCoins.progressPercent}% to free service)`}
            </Alert>
          )}

          {/* Free service active banner */}
          {isFree && !flashCoins && (
            <Alert
              severity="success"
              icon={<WorkspacePremium />}
              sx={{ borderRadius: 3, mb: 3, fontWeight: 700 }}
            >
              🎁 <strong>Free Service Active</strong> — Your waste collection is free until{' '}
              <strong>{format(new Date(freeUntil), 'MMMM dd, yyyy')}</strong>!
            </Alert>
          )}

          {/* Page heading */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
            <Box>
              <Typography variant="h4" fontWeight={900} color="#0f172a">Reward Wallet</Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Track your Eco-Coins and progress toward free waste collection
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<RecyclingRounded />}
              onClick={() => navigate('/programs')}
              sx={{ fontWeight: 700, borderRadius: 2, borderColor: '#16a34a', color: '#16a34a' }}
            >
              Earn More
            </Button>
          </Stack>

          {/* ── TOP ROW: Ring + Stats + Free service countdown ── */}
          <Grid container spacing={3} mb={4}>

            {/* Coin ring */}
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 4, bgcolor: '#0f172a', p: 4,
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  border: '1px solid #1e293b', height: '100%',
                }}
              >
                {loading ? (
                  <Skeleton variant="circular" width={180} height={180} sx={{ bgcolor: '#1e293b' }} />
                ) : (
                  <>
                    <ProgressRing percent={pct} coins={total} threshold={THRESHOLD} />
                    <Typography variant="body2" color="#64748b" mt={2} textAlign="center" fontWeight={600}>
                      {wallet?.coinsUntilFree > 0
                        ? `${wallet.coinsUntilFree} more coins to unlock free service`
                        : '🎉 Free service unlocked!'}
                    </Typography>
                    <Box sx={{ width: '100%', mt: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          height: 6, borderRadius: 4,
                          bgcolor: '#1e293b',
                          '& .MuiLinearProgress-bar': {
                            background: 'linear-gradient(90deg, #16a34a, #22d3ee)',
                            borderRadius: 4,
                          },
                        }}
                      />
                    </Box>
                  </>
                )}
              </Paper>
            </Grid>

            {/* Stat cards */}
            <Grid item xs={12} md={4}>
              <Stack spacing={2} height="100%">
                {[
                  {
                    label: 'Current Balance',
                    value: loading ? '–' : `${balance} coins`,
                    icon: <Stars />,
                    color: '#f59e0b',
                    bg: '#fef9c3',
                  },
                  {
                    label: 'Total Earned (All Time)',
                    value: loading ? '–' : `${total} coins`,
                    icon: <TrendingUp />,
                    color: '#16a34a',
                    bg: '#dcfce7',
                  },
                  {
                    label: 'Free Months Unlocked',
                    value: loading ? '–' : `${wallet?.milestonesReached || 0} month${wallet?.milestonesReached !== 1 ? 's' : ''}`,
                    icon: <CardGiftcard />,
                    color: '#8b5cf6',
                    bg: '#ede9fe',
                  },
                ].map((s) => (
                  <Paper
                    key={s.label}
                    elevation={0}
                    sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', flexGrow: 1 }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: s.bg, color: s.color, width: 44, height: 44 }}>
                        {s.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {s.label}
                        </Typography>
                        <Typography variant="h6" fontWeight={900} color="#0f172a">{s.value}</Typography>
                      </Box>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Grid>

            {/* How it works */}
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', p: 3.5, height: '100%' }}>
                <Typography variant="subtitle1" fontWeight={900} color="#0f172a" mb={2.5}>
                  How Rewards Work
                </Typography>
                <Stack spacing={2}>
                  {[
                    { step: '1', text: 'Browse Eco-Programs on the Programs page', color: '#3b82f6' },
                    { step: '2', text: 'Click "Join Campaign" to apply as a volunteer', color: '#f59e0b' },
                    { step: '3', text: 'Admin reviews and approves your application', color: '#8b5cf6' },
                    { step: '4', text: '+100 coins are automatically deposited to your wallet', color: '#16a34a' },
                    { step: '5', text: 'Reach 1,000 coins → 1 free month of waste collection!', color: '#ef4444' },
                  ].map((s) => (
                    <Stack key={s.step} direction="row" spacing={1.5} alignItems="flex-start">
                      <Avatar
                        sx={{
                          width: 28, height: 28, fontSize: '0.8rem', fontWeight: 900, flexShrink: 0,
                          bgcolor: `${s.color}18`, color: s.color,
                        }}
                      >
                        {s.step}
                      </Avatar>
                      <Typography variant="body2" color="text.secondary" pt={0.3}>{s.text}</Typography>
                    </Stack>
                  ))}
                </Stack>

                <Divider sx={{ my: 2.5 }} />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    Each program rewards
                  </Typography>
                  <Chip
                    icon={<EmojiEvents sx={{ fontSize: '1rem !important', color: '#f59e0b !important' }} />}
                    label="+100 coins"
                    sx={{ fontWeight: 800, bgcolor: '#fef9c3', color: '#854d0e' }}
                  />
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {/* ── MILESTONE TRACK ── */}
          <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', p: 4, mb: 4 }}>
            <Typography variant="subtitle1" fontWeight={900} color="#0f172a" mb={3}>
              🏆 Milestone Track
            </Typography>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ overflowX: 'auto', pb: 1 }}
            >
              {MILESTONES.map((m, i) => {
                const reached = total >= m.coins;
                return (
                  <React.Fragment key={m.coins}>
                    <Tooltip title={`${m.coins} coins: ${m.label}`} arrow>
                      <Stack alignItems="center" spacing={1} sx={{ minWidth: 80 }}>
                        <Avatar
                          sx={{
                            width: 52, height: 52, fontSize: '1.5rem',
                            bgcolor: reached ? m.color : '#f1f5f9',
                            border: reached ? `3px solid ${m.color}` : '3px solid #e2e8f0',
                            transition: 'all 0.3s',
                            boxShadow: reached ? `0 0 16px ${m.color}60` : 'none',
                          }}
                        >
                          {m.icon}
                        </Avatar>
                        <Typography
                          variant="caption"
                          fontWeight={700}
                          color={reached ? '#0f172a' : 'text.secondary'}
                          textAlign="center"
                          sx={{ lineHeight: 1.3 }}
                        >
                          {m.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          {m.coins}
                        </Typography>
                        {reached && (
                          <CheckCircle sx={{ fontSize: '1rem', color: '#16a34a' }} />
                        )}
                      </Stack>
                    </Tooltip>
                    {i < MILESTONES.length - 1 && (
                      <Box
                        sx={{
                          flexGrow: 1, height: 3, mx: 1,
                          bgcolor: total >= MILESTONES[i + 1].coins ? '#16a34a' : '#e2e8f0',
                          borderRadius: 2, transition: 'background 0.4s',
                        }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </Stack>
          </Paper>

          {/* ── BOTTOM ROW: Transaction history + Leaderboard ── */}
          <Grid container spacing={3}>

            {/* Transaction history */}
            <Grid item xs={12} md={8}>
              <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" p={3} borderBottom="1px solid #f1f5f9">
                  <Typography variant="subtitle1" fontWeight={900} color="#0f172a">
                    Coin History
                  </Typography>
                  <Chip label={`${transactions.length} transactions`} size="small" sx={{ fontWeight: 700 }} />
                </Stack>

                {loading ? (
                  <Box p={3}><Skeleton height={60} /><Skeleton height={60} /><Skeleton height={60} /></Box>
                ) : transactions.length === 0 ? (
                  <Box p={5} textAlign="center">
                    <EmojiEvents sx={{ fontSize: 56, color: '#cbd5e1', mb: 1 }} />
                    <Typography color="text.secondary" fontWeight={600}>
                      No coin activity yet. Join a program to start earning!
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/programs')}
                      sx={{ mt: 2, borderRadius: 2, fontWeight: 700, bgcolor: '#16a34a' }}
                    >
                      Browse Programs
                    </Button>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Activity</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#475569' }} align="center">Coins</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#475569' }} align="right">When</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {transactions.map((tx) => (
                          <TxRow key={tx._id} tx={tx} />
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </Grid>

            {/* Leaderboard */}
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', overflow: 'hidden', height: '100%' }}>
                <Stack p={3} borderBottom="1px solid #f1f5f9">
                  <Typography variant="subtitle1" fontWeight={900} color="#0f172a">
                    🏅 Zone Leaderboard
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Top eco-volunteers in your zone
                  </Typography>
                </Stack>

                {loading ? (
                  <Box p={3}><Skeleton height={56} /><Skeleton height={56} /><Skeleton height={56} /></Box>
                ) : leaderboard.length === 0 ? (
                  <Box p={4} textAlign="center">
                    <Typography variant="body2" color="text.secondary">No leaderboard data yet.</Typography>
                  </Box>
                ) : (
                  <List disablePadding>
                    {leaderboard.map((r, idx) => {
                      const isMe = r._id === user?._id;
                      const medals = ['🥇', '🥈', '🥉'];
                      return (
                        <React.Fragment key={r._id}>
                          <ListItem
                            sx={{
                              px: 3, py: 1.5,
                              bgcolor: isMe ? 'rgba(22,163,74,0.05)' : 'transparent',
                              borderLeft: isMe ? '3px solid #16a34a' : '3px solid transparent',
                            }}
                          >
                            <ListItemAvatar sx={{ minWidth: 42 }}>
                              <Typography fontSize="1.3rem">
                                {idx < 3 ? medals[idx] : `${idx + 1}.`}
                              </Typography>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="body2" fontWeight={isMe ? 900 : 700} color={isMe ? '#16a34a' : '#0f172a'}>
                                  {isMe ? 'You' : r.name}
                                </Typography>
                              }
                              secondary={
                                <Typography variant="caption" color="text.secondary">
                                  {r.totalCoinsEarned} coins earned
                                </Typography>
                              }
                            />
                            {r.isServiceFree && (
                              <Chip label="FREE" size="small" sx={{ fontWeight: 800, bgcolor: '#dcfce7', color: '#166534', fontSize: '0.7rem' }} />
                            )}
                          </ListItem>
                          {idx < leaderboard.length - 1 && <Divider component="li" />}
                        </React.Fragment>
                      );
                    })}
                  </List>
                )}
              </Paper>
            </Grid>

          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default RewardWallet;