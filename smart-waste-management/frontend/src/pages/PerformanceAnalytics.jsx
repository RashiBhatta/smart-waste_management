// ============================================================
// COLLECTOR FEATURE 3: Performance Analytics
// FILE: frontend/src/pages/PerformanceAnalytics.jsx
// Route: /collector/analytics
// ============================================================
// Sections:
//   1. KPI cards row (today / week / month / all-time)
//   2. 30-day bar chart (collections + weight)
//   3. Waste-type breakdown (horizontal bar)
//   4. Rating section (star distribution + review cards)
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Grid, Paper, Typography, Button,
  Stack, Avatar, Chip, Divider, LinearProgress,
  Skeleton, Rating, IconButton, Drawer, Card, CardContent
} from '@mui/material';
import {
  TrendingUp, CheckCircle, Scale, Speed,
  Star, EmojiEvents, RecyclingRounded,
  LocalShipping, Menu, Logout, Assignment,
  BarChart, Timeline, WorkspacePremium, ArrowBack,
  FormatQuote
} from '@mui/icons-material';
import {
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts';
import { useAuth }     from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api             from '../services/api';
import { toast }       from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';

// ── Waste type color palette ──────────────────────────────────
const WASTE_COLORS = {
  Organic:    '#16a34a',
  Recyclable: '#3b82f6',
  Hazardous:  '#ef4444',
  Mixed:      '#64748b',
  Plastic:    '#a855f7',
  Paper:      '#f97316',
  Glass:      '#06b6d4',
  Metal:      '#78716c',
};

// ── KPI card ──────────────────────────────────────────────────
const KpiCard = ({ icon, label, value, sub, color, loading }) => (
  <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #e2e8f0', height: '100%' }}>
    {loading ? <Skeleton height={80} /> : (
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="text.secondary" fontWeight={700}
            sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {label}
          </Typography>
          <Avatar sx={{ bgcolor: `${color}15`, color, width: 36, height: 36 }}>{icon}</Avatar>
        </Stack>
        <Typography variant="h4" fontWeight={900} color="#0f172a" lineHeight={1}>{value}</Typography>
        {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
      </Stack>
    )}
  </Paper>
);

// ── Star rating display ───────────────────────────────────────
const StarDisplay = ({ rating, size = 'medium' }) => (
  <Rating value={rating} precision={0.1} readOnly size={size}
    sx={{ '& .MuiRating-iconFilled': { color: '#f59e0b' } }} />
);

// ── Custom bar chart tooltip ──────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Paper elevation={3} sx={{ p: 2, borderRadius: 2, border: '1px solid #e2e8f0' }}>
      <Typography variant="caption" fontWeight={800} color="#0f172a">{label}</Typography>
      {payload.map((p) => (
        <Stack key={p.dataKey} direction="row" spacing={1} alignItems="center" mt={0.5}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: p.color }} />
          <Typography variant="caption" color="text.secondary">
            {p.name}: <strong>{p.value}{p.dataKey === 'weight' ? ' kg' : ''}</strong>
          </Typography>
        </Stack>
      ))}
    </Paper>
  );
};

// ── Main component ────────────────────────────────────────────
const PerformanceAnalytics = () => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const [summary,    setSummary]    = useState(null);
  const [daily,      setDaily]      = useState([]);
  const [breakdown,  setBreakdown]  = useState([]);
  const [ratings,    setRatings]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [chartMode,  setChartMode]  = useState('collections'); // 'collections' | 'weight'
  const [mobileOpen, setMobileOpen] = useState(false);

  // ── Fetch all analytics ───────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [sumRes, dayRes, typeRes, ratRes] = await Promise.all([
        api.get('/collector/analytics/summary'),
        api.get('/collector/analytics/daily'),
        api.get('/collector/analytics/waste-types'),
        api.get('/collector/analytics/ratings'),
      ]);
      setSummary(sumRes.data.summary);
      setDaily(dayRes.data.days || []);
      setBreakdown(typeRes.data.breakdown || []);
      setRatings(ratRes.data);
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Sidebar ───────────────────────────────────────────────
  const SidebarContent = () => (
    <Box sx={{ height: '100%', bgcolor: '#0f172a', display: 'flex', flexDirection: 'column' }}>
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
      <Box sx={{ px: 3, py: 2.5, bgcolor: '#1e293b', mx: 2, borderRadius: 2, mt: 2 }}>
        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
          Zone
        </Typography>
        <Typography variant="body1" fontWeight={900} color="white" mt={0.3}>
          {user?.address?.zone?.toUpperCase() || '–'}
        </Typography>
      </Box>
      <Box sx={{ flexGrow: 1, px: 2, pt: 2 }}>
        {[
          { label: 'Dashboard',    icon: <Assignment />,    path: '/collector/dashboard' },
          { label: 'Analytics',    icon: <BarChart />,      path: '/collector/analytics', active: true },
        ].map((item) => (
          <Box key={item.path}
            onClick={() => { navigate(item.path); setMobileOpen(false); }}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1.5,
              px: 2, py: 1.5, borderRadius: 2, mb: 0.5, cursor: 'pointer',
              bgcolor: item.active ? '#16a34a' : 'transparent',
              '&:hover': { bgcolor: item.active ? '#15803d' : 'rgba(255,255,255,0.05)' },
            }}>
            <Box sx={{ color: 'white' }}>{item.icon}</Box>
            <Typography fontSize="0.9rem" fontWeight={item.active ? 800 : 500} color="white">
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
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconButton onClick={() => setMobileOpen(true)}><Menu /></IconButton>
              <IconButton onClick={() => navigate(-1)}><ArrowBack /></IconButton>
            </Stack>
          </Box>

          {/* Page heading */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
            <Box>
              <Typography variant="h4" fontWeight={900} color="#0f172a">Performance Analytics</Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Zone {summary?.profile?.zone?.toUpperCase() || user?.address?.zone?.toUpperCase() || 'N/A'}
                {summary?.profile?.vehicleType && ` · ${summary.profile.vehicleType}`}
              </Typography>
            </Box>
            {summary && (
              <Paper elevation={0} sx={{ px: 2.5, py: 1.5, borderRadius: 3, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Star sx={{ color: '#f59e0b', fontSize: 20 }} />
                  <Typography fontWeight={900} color="#0f172a" fontSize="1.2rem">
                    {summary.rating.average || '–'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({summary.rating.totalRatings} reviews)
                  </Typography>
                </Stack>
              </Paper>
            )}
          </Stack>

          {/* ── Section 1: KPI cards ── */}
          <Grid container spacing={2} mb={4}>
            <Grid item xs={6} sm={3}>
              <KpiCard icon={<CheckCircle fontSize="small" />} label="Today" loading={loading}
                value={summary?.today.collected ?? '–'}
                sub={`${summary?.today.weight ?? 0} kg collected`}
                color="#16a34a" />
            </Grid>
            <Grid item xs={6} sm={3}>
              <KpiCard icon={<TrendingUp fontSize="small" />} label="This Week" loading={loading}
                value={summary?.week.collected ?? '–'}
                sub={`${summary?.week.weight ?? 0} kg total`}
                color="#3b82f6" />
            </Grid>
            <Grid item xs={6} sm={3}>
              <KpiCard icon={<Timeline fontSize="small" />} label="This Month" loading={loading}
                value={summary?.month.collected ?? '–'}
                sub={`${summary?.month.weight ?? 0} kg total`}
                color="#8b5cf6" />
            </Grid>
            <Grid item xs={6} sm={3}>
              <KpiCard icon={<Speed fontSize="small" />} label="Completion Rate" loading={loading}
                value={`${summary?.allTime.completionRate ?? 0}%`}
                sub={`${summary?.allTime.collected ?? 0} of ${summary?.allTime.total ?? 0} jobs`}
                color="#f59e0b" />
            </Grid>
          </Grid>

          {/* ── Section 2: 30-day chart ── */}
          <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', p: 4, mb: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
              <Box>
                <Typography variant="h6" fontWeight={900} color="#0f172a">Last 30 Days</Typography>
                <Typography variant="body2" color="text.secondary">Daily collection activity</Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Chip
                  label="Collections"
                  onClick={() => setChartMode('collections')}
                  variant={chartMode === 'collections' ? 'filled' : 'outlined'}
                  color={chartMode === 'collections' ? 'success' : 'default'}
                  sx={{ fontWeight: 700, cursor: 'pointer' }}
                />
                <Chip
                  label="Weight (kg)"
                  onClick={() => setChartMode('weight')}
                  variant={chartMode === 'weight' ? 'filled' : 'outlined'}
                  color={chartMode === 'weight' ? 'primary' : 'default'}
                  sx={{ fontWeight: 700, cursor: 'pointer' }}
                />
              </Stack>
            </Stack>

            {loading ? (
              <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 3 }} />
            ) : daily.length === 0 ? (
              <Box py={6} textAlign="center">
                <BarChart sx={{ fontSize: 56, color: '#cbd5e1', mb: 1 }} />
                <Typography color="text.secondary" fontWeight={600}>No activity in the last 30 days</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <ReBarChart data={daily} margin={{ top: 0, right: 10, left: -20, bottom: 0 }} barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                    tickLine={false}
                    axisLine={false}
                    interval={4}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  {chartMode === 'collections' ? (
                    <>
                      <Bar dataKey="collected" name="Collected" fill="#16a34a" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="skipped"   name="Skipped"   fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </>
                  ) : (
                    <Bar dataKey="weight" name="Weight" radius={[4, 4, 0, 0]}>
                      {daily.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={entry.weight > 0
                            ? `hsl(${220 - (entry.weight / 10) * 20}, 80%, 55%)`
                            : '#e2e8f0'}
                        />
                      ))}
                    </Bar>
                  )}
                </ReBarChart>
              </ResponsiveContainer>
            )}
          </Paper>

          {/* ── Section 3 + 4 side by side ── */}
          <Grid container spacing={3} mb={4}>

            {/* Waste type breakdown */}
            <Grid item xs={12} md={5}>
              <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', p: 4, height: '100%' }}>
                <Typography variant="h6" fontWeight={900} color="#0f172a" mb={3}>
                  Waste Type Breakdown
                </Typography>
                {loading ? (
                  <Stack spacing={1.5}>{[1,2,3,4].map(i => <Skeleton key={i} height={40} sx={{ borderRadius: 2 }} />)}</Stack>
                ) : breakdown.length === 0 ? (
                  <Box py={4} textAlign="center">
                    <RecyclingRounded sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                    <Typography color="text.secondary" fontWeight={600}>No data yet</Typography>
                  </Box>
                ) : (
                  <Stack spacing={2.5}>
                    {breakdown.map((b) => {
                      const color = WASTE_COLORS[b.type] || '#64748b';
                      return (
                        <Box key={b.type}>
                          <Stack direction="row" justifyContent="space-between" mb={0.8}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                              <Typography variant="body2" fontWeight={700} color="#0f172a">{b.type}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Typography variant="caption" color="text.secondary">{b.weight} kg</Typography>
                              <Chip label={`${b.percent}%`} size="small"
                                sx={{ fontWeight: 800, bgcolor: `${color}15`, color, height: 20, fontSize: '0.72rem' }} />
                            </Stack>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={b.percent}
                            sx={{
                              height: 8, borderRadius: 4,
                              bgcolor: `${color}18`,
                              '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 },
                            }}
                          />
                          <Typography variant="caption" color="text.secondary" mt={0.3} display="block">
                            {b.count} collection{b.count !== 1 ? 's' : ''}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Paper>
            </Grid>

            {/* Ratings section */}
            <Grid item xs={12} md={7}>
              <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', p: 4, height: '100%' }}>
                <Typography variant="h6" fontWeight={900} color="#0f172a" mb={3}>
                  Resident Ratings
                </Typography>

                {loading ? (
                  <Skeleton height={200} sx={{ borderRadius: 3 }} />
                ) : !ratings || ratings.totalRatings === 0 ? (
                  <Box py={4} textAlign="center">
                    <Star sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                    <Typography color="text.secondary" fontWeight={600}>No ratings yet</Typography>
                    <Typography variant="caption" color="text.disabled" mt={0.5} display="block">
                      Ratings appear here after residents review completed pickups
                    </Typography>
                  </Box>
                ) : (
                  <>
                    {/* Rating summary */}
                    <Stack direction="row" spacing={4} alignItems="center" mb={3}
                      sx={{ bgcolor: '#f8fafc', borderRadius: 3, p: 3 }}>
                      <Box textAlign="center">
                        <Typography variant="h2" fontWeight={900} color="#0f172a" lineHeight={1}>
                          {ratings.average}
                        </Typography>
                        <StarDisplay rating={ratings.average} size="small" />
                        <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
                          {ratings.totalRatings} review{ratings.totalRatings !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                      <Box flexGrow={1}>
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count   = ratings.distribution.find(d => d.star === star)?.count || 0;
                          const percent = ratings.totalRatings > 0
                            ? Math.round((count / ratings.totalRatings) * 100)
                            : 0;
                          return (
                            <Stack key={star} direction="row" spacing={1} alignItems="center" mb={0.6}>
                              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ minWidth: 14 }}>
                                {star}
                              </Typography>
                              <Star sx={{ fontSize: 14, color: '#f59e0b' }} />
                              <LinearProgress variant="determinate" value={percent}
                                sx={{ flexGrow: 1, height: 8, borderRadius: 4,
                                  bgcolor: '#e2e8f0',
                                  '& .MuiLinearProgress-bar': { bgcolor: '#f59e0b', borderRadius: 4 },
                                }}
                              />
                              <Typography variant="caption" color="text.secondary" sx={{ minWidth: 28 }}>
                                {percent}%
                              </Typography>
                            </Stack>
                          );
                        })}
                      </Box>
                    </Stack>

                    {/* Recent reviews */}
                    {ratings.reviews.length > 0 && (
                      <Box>
                        <Typography variant="body2" fontWeight={800} color="#0f172a" mb={2}>
                          Recent Reviews
                        </Typography>
                        <Stack spacing={2} sx={{ maxHeight: 320, overflowY: 'auto', pr: 0.5 }}>
                          {ratings.reviews.slice(0, 8).map((r) => (
                            <Card key={r.id} elevation={0}
                              sx={{ borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <Avatar sx={{ bgcolor: '#eff6ff', color: '#3b82f6', width: 30, height: 30, fontSize: '0.85rem' }}>
                                      {r.resident?.charAt(0)}
                                    </Avatar>
                                    <Box>
                                      <Typography variant="body2" fontWeight={800} color="#0f172a">
                                        {r.resident}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {r.type} ·{' '}
                                        {r.date
                                          ? formatDistanceToNow(new Date(r.date), { addSuffix: true })
                                          : '–'}
                                      </Typography>
                                    </Box>
                                  </Stack>
                                  <StarDisplay rating={r.rating} size="small" />
                                </Stack>
                                {r.comment && (
                                  <Stack direction="row" spacing={1} alignItems="flex-start">
                                    <FormatQuote sx={{ color: '#cbd5e1', fontSize: 18, mt: 0.2, flexShrink: 0 }} />
                                    <Typography variant="caption" color="text.secondary" fontStyle="italic">
                                      {r.comment}
                                    </Typography>
                                  </Stack>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* ── All-time summary bar ── */}
          <Paper elevation={0} sx={{ borderRadius: 4, bgcolor: '#0f172a', p: 4, border: '1px solid #1e293b' }}>
            <Typography variant="h6" fontWeight={900} color="white" mb={3}>All-Time Summary</Typography>
            <Grid container spacing={3}>
              {[
                { label: 'Total Assigned',  value: summary?.allTime.total      ?? '–', icon: <Assignment />,      color: '#3b82f6' },
                { label: 'Total Collected', value: summary?.allTime.collected  ?? '–', icon: <CheckCircle />,     color: '#16a34a' },
                { label: 'Total Skipped',   value: summary?.allTime.skipped    ?? '–', icon: <EmojiEvents />,    color: '#ef4444' },
                { label: 'Total Weight',    value: `${summary?.allTime.weight ?? 0}kg`,icon: <Scale />,           color: '#8b5cf6' },
                { label: 'Avg Weight/Stop', value: `${summary?.allTime.avgWeight ?? 0}kg`, icon: <TrendingUp />, color: '#f59e0b' },
                { label: 'Rating',          value: summary?.rating.average ?? '–',     icon: <Star />,            color: '#f59e0b' },
              ].map((s) => (
                <Grid item xs={6} sm={4} md={2} key={s.label}>
                  {loading ? <Skeleton height={60} sx={{ bgcolor: '#1e293b', borderRadius: 2 }} /> : (
                    <Box>
                      <Avatar sx={{ bgcolor: `${s.color}18`, color: s.color, width: 36, height: 36, mb: 1 }}>
                        {s.icon}
                      </Avatar>
                      <Typography variant="h5" fontWeight={900} color="white">{s.value}</Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {s.label}
                      </Typography>
                    </Box>
                  )}
                </Grid>
              ))}
            </Grid>
          </Paper>

        </Container>
      </Box>
    </Box>
  );
};

export default PerformanceAnalytics;