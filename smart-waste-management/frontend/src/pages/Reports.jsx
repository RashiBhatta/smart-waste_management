// ============================================================
// ADMIN FEATURE 3: Reports & PDF Export
// FILE: frontend/src/pages/Reports.jsx
// Route: /admin/reports
// ============================================================
// Tabs:
//   0 — Summary      (KPI cards + monthly/all-time stats)
//   1 — Collections  (filterable log + zone breakdown table)
//   2 — Payments     (ledger + method breakdown)
//   3 — Volunteers   (program-by-program volunteer summary)
// All tabs include a PDF / CSV export button
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Grid, Paper, Typography, Button,
  Stack, Avatar, Chip, Divider, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  LinearProgress, Skeleton, FormControl, InputLabel,
  Select, MenuItem, IconButton, Drawer, Alert
} from '@mui/material';
import {
  PictureAsPdf, Dashboard, People, LocalShipping,
  Payment, VolunteerActivism, RecyclingRounded, Logout,
  Menu, Download, AssignmentTurnedIn, Scale, TrendingUp,
  EmojiEvents, BarChart, FilterList, TableChart
} from '@mui/icons-material';
import {
  BarChart as ReBarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts';
import { useAuth }     from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api             from '../services/api';
import { toast }       from 'react-toastify';
import { format }      from 'date-fns';

// ── Constants ─────────────────────────────────────────────────
const THIS_YEAR  = new Date().getFullYear();
const THIS_MONTH = new Date().getMonth() + 1;

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const YEARS = [THIS_YEAR, THIS_YEAR - 1, THIS_YEAR - 2];

const STATUS_COLOR  = { Collected:'#16a34a', Skipped:'#ef4444', Pending:'#f59e0b',
  Scheduled:'#3b82f6', 'In Progress':'#8b5cf6' };
const ZONE_COLORS   = ['#16a34a','#3b82f6','#f59e0b','#8b5cf6','#ef4444'];
const METHOD_COLORS = { khalti:'#8b5cf6', esewa:'#16a34a', cash:'#f59e0b', coin_redeem:'#f97316' };
const PROG_STATUS   = { active:'#16a34a', upcoming:'#3b82f6', completed:'#64748b', cancelled:'#ef4444' };

// ── Stat card ─────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, color, loading }) => (
  <Paper elevation={0}
    sx={{ p: 3, borderRadius: 4, border: '1px solid #e2e8f0', height: '100%' }}>
    {loading ? <Skeleton height={80} /> : (
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" fontWeight={700} color="text.secondary"
            sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {label}
          </Typography>
          <Avatar sx={{ bgcolor: `${color}15`, color, width: 34, height: 34 }}>{icon}</Avatar>
        </Stack>
        <Typography variant="h4" fontWeight={900} color="#0f172a" lineHeight={1}>{value}</Typography>
        {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
      </Stack>
    )}
  </Paper>
);

// ── Period picker ─────────────────────────────────────────────
const PeriodPicker = ({ year, month, onYear, onMonth }) => (
  <Stack direction="row" spacing={1.5} alignItems="center">
    <FormControl size="small" sx={{ minWidth: 110 }}>
      <InputLabel>Year</InputLabel>
      <Select value={year} label="Year" onChange={e => onYear(Number(e.target.value))}>
        {YEARS.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
      </Select>
    </FormControl>
    <FormControl size="small" sx={{ minWidth: 140 }}>
      <InputLabel>Month</InputLabel>
      <Select value={month} label="Month" onChange={e => onMonth(Number(e.target.value))}>
        {MONTHS.map((m, i) => <MenuItem key={i+1} value={i+1}>{m}</MenuItem>)}
      </Select>
    </FormControl>
  </Stack>
);

// ── Custom tooltip ────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Paper elevation={3} sx={{ p: 1.5, borderRadius: 2, border: '1px solid #e2e8f0' }}>
      <Typography variant="caption" fontWeight={800}>{label}</Typography>
      {payload.map(p => (
        <Stack key={p.dataKey} direction="row" spacing={0.8} alignItems="center" mt={0.3}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.color }} />
          <Typography variant="caption">{p.name}: <strong>{p.value}</strong></Typography>
        </Stack>
      ))}
    </Paper>
  );
};

// ── Main component ────────────────────────────────────────────
const Reports = () => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const [activeTab, setActiveTab] = useState(0);
  const [year,  setYear]  = useState(THIS_YEAR);
  const [month, setMonth] = useState(THIS_MONTH);

  // Data
  const [summary,     setSummary]     = useState(null);
  const [collections, setCollections] = useState([]);
  const [zoneBrk,     setZoneBrk]     = useState([]);
  const [payments,    setPayments]     = useState([]);
  const [payBreakdown, setPayBreakdown] = useState([]);
  const [volunteers,   setVolunteers]  = useState([]);

  // Collection filters
  const [filterZone,  setFilterZone]  = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [loading,     setLoading]     = useState(true);
  const [exporting,   setExporting]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  // ── Fetch summary ─────────────────────────────────────────
  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/reports/summary?year=${year}&month=${month}`);
      setSummary(res.data);
    } catch { toast.error('Failed to load summary'); }
    finally  { setLoading(false); }
  }, [year, month]);

  const fetchCollections = useCallback(async () => {
    try {
      const params = new URLSearchParams({ year, month });
      if (filterZone)   params.append('zone', filterZone);
      if (filterStatus) params.append('status', filterStatus);
      const res = await api.get(`/admin/reports/collections?${params}&limit=100`);
      setCollections(res.data.collections || []);
      setZoneBrk(res.data.zoneBreakdown || []);
    } catch { toast.error('Failed to load collections'); }
  }, [year, month, filterZone, filterStatus]);

  const fetchPayments = useCallback(async () => {
    try {
      const res = await api.get(`/admin/reports/payments?year=${year}&month=${month}&limit=100`);
      setPayments(res.data.payments || []);
      setPayBreakdown(res.data.breakdown || []);
    } catch { toast.error('Failed to load payments'); }
  }, [year, month]);

  const fetchVolunteers = useCallback(async () => {
    try {
      const res = await api.get('/admin/reports/volunteers');
      setVolunteers(res.data.programs || []);
    } catch { toast.error('Failed to load volunteer data'); }
  }, []);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);
  useEffect(() => { if (activeTab === 1) fetchCollections(); }, [activeTab, fetchCollections]);
  useEffect(() => { if (activeTab === 2) fetchPayments(); }, [activeTab, fetchPayments]);
  useEffect(() => { if (activeTab === 3) fetchVolunteers(); }, [activeTab, fetchVolunteers]);

  // ── PDF exports ───────────────────────────────────────────
  const downloadMonthlyPDF = async () => {
    try {
      setExporting(true);
      const res = await api.get(`/admin/reports/pdf/monthly?year=${year}&month=${month}`, {
        responseType: 'blob',
      });
      const url  = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', `SWMS_Report_${year}_${String(month).padStart(2,'0')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch { toast.error('PDF export failed'); }
    finally  { setExporting(false); }
  };

  const downloadCollectionsPDF = async () => {
    try {
      setExporting(true);
      const params = new URLSearchParams({ year, month });
      if (filterZone)   params.append('zone', filterZone);
      if (filterStatus) params.append('status', filterStatus);
      const res = await api.get(`/admin/reports/pdf/collections?${params}`, { responseType: 'blob' });
      const url  = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', `SWMS_Collections_${year}_${String(month).padStart(2,'0')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Collections PDF downloaded!');
    } catch { toast.error('Export failed'); }
    finally  { setExporting(false); }
  };

  // ── Sidebar ───────────────────────────────────────────────
  const navItems = [
    { label: 'Dashboard',   icon: <Dashboard />,        path: '/admin/dashboard' },
    { label: 'Programs',    icon: <VolunteerActivism />, path: '/admin/programs'  },
    { label: 'Collections', icon: <LocalShipping />,    path: '/admin/dashboard' },
    { label: 'Payments',    icon: <Payment />,           path: '/admin/dashboard' },
    { label: 'Reports',     icon: <BarChart />,          path: '/admin/reports', active: true },
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
            <Typography variant="caption" sx={{ color: '#64748b' }}>Reports</Typography>
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
            <Typography fontSize="0.9rem" fontWeight={item.active ? 800 : 500} color="white">{item.label}</Typography>
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

  const monthLabel = `${MONTHS[month - 1]} ${year}`;

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
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between"
            alignItems={{ sm: 'center' }} mb={4} spacing={2}>
            <Box>
              <Typography variant="h4" fontWeight={900} color="#0f172a">Reports & Analytics</Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Operational data and PDF exports for {monthLabel}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <PeriodPicker year={year} month={month} onYear={setYear} onMonth={m => { setMonth(m); }} />
              <Button variant="contained" startIcon={<PictureAsPdf />}
                onClick={downloadMonthlyPDF} disabled={exporting}
                sx={{ fontWeight: 800, borderRadius: 2, bgcolor: '#ef4444',
                  '&:hover': { bgcolor: '#dc2626' }, whiteSpace: 'nowrap' }}>
                {exporting ? 'Exporting…' : 'Full PDF'}
              </Button>
            </Stack>
          </Stack>

          {/* Tabs */}
          <Stack direction="row" spacing={1} mb={4} flexWrap="wrap" gap={1}>
            {[
              { label: 'Summary',      icon: <TrendingUp fontSize="small" /> },
              { label: 'Collections',  icon: <LocalShipping fontSize="small" /> },
              { label: 'Payments',     icon: <Payment fontSize="small" /> },
              { label: 'Volunteers',   icon: <VolunteerActivism fontSize="small" /> },
            ].map((t, i) => (
              <Button key={t.label}
                variant={activeTab === i ? 'contained' : 'outlined'}
                startIcon={t.icon}
                onClick={() => setActiveTab(i)}
                sx={{ borderRadius: 2, fontWeight: 800,
                  bgcolor: activeTab === i ? '#0f172a' : 'white',
                  color: activeTab === i ? 'white' : '#0f172a',
                  borderColor: '#e2e8f0' }}>
                {t.label}
              </Button>
            ))}
          </Stack>

          {/* ── TAB 0: SUMMARY ── */}
          {activeTab === 0 && (
            <Box>
              {/* Monthly KPIs */}
              <Typography variant="h6" fontWeight={900} color="#0f172a" mb={2}>
                {monthLabel} — Highlights
              </Typography>
              <Grid container spacing={2} mb={4}>
                <Grid item xs={6} sm={3}><StatCard loading={loading} icon={<LocalShipping fontSize="small" />} label="Collections" value={summary?.monthly?.collections ?? '–'} sub={`${summary?.monthly?.collected ?? 0} collected · ${summary?.monthly?.skipped ?? 0} skipped`} color="#3b82f6" /></Grid>
                <Grid item xs={6} sm={3}><StatCard loading={loading} icon={<Scale fontSize="small" />} label="Weight (kg)" value={summary?.monthly?.weight ?? '–'} sub="from collected jobs" color="#16a34a" /></Grid>
                <Grid item xs={6} sm={3}><StatCard loading={loading} icon={<AssignmentTurnedIn fontSize="small" />} label="Completion" value={`${summary?.monthly?.completionRate ?? 0}%`} sub="pickup completion rate" color="#8b5cf6" /></Grid>
                <Grid item xs={6} sm={3}><StatCard loading={loading} icon={<Payment fontSize="small" />} label="Revenue" value={`Rs. ${(summary?.monthly?.revenue ?? 0).toLocaleString()}`} sub={`${summary?.monthly?.freeRedemptions ?? 0} coin redemptions`} color="#f59e0b" /></Grid>
              </Grid>

              {/* All-time KPIs */}
              <Typography variant="h6" fontWeight={900} color="#0f172a" mb={2}>
                All-Time Totals
              </Typography>
              <Grid container spacing={2} mb={4}>
                <Grid item xs={6} sm={3}><StatCard loading={loading} icon={<LocalShipping fontSize="small" />} label="Total Collections" value={summary?.allTime?.collections ?? '–'} sub={`${summary?.allTime?.collected ?? 0} collected`} color="#3b82f6" /></Grid>
                <Grid item xs={6} sm={3}><StatCard loading={loading} icon={<Scale fontSize="small" />} label="Total Weight" value={`${summary?.allTime?.weight ?? 0}kg`} sub="all time" color="#16a34a" /></Grid>
                <Grid item xs={6} sm={3}><StatCard loading={loading} icon={<AssignmentTurnedIn fontSize="small" />} label="Lifetime Rate" value={`${summary?.allTime?.completionRate ?? 0}%`} sub="collection completion" color="#8b5cf6" /></Grid>
                <Grid item xs={6} sm={3}><StatCard loading={loading} icon={<Payment fontSize="small" />} label="Total Revenue" value={`Rs. ${(summary?.allTime?.revenue ?? 0).toLocaleString()}`} sub="all payments" color="#f59e0b" /></Grid>
              </Grid>

              {/* Programs + Users side by side */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #e2e8f0' }}>
                    <Typography fontWeight={900} color="#0f172a" mb={2}>Programs Overview</Typography>
                    {loading ? <Skeleton height={120} /> : (
                      <Stack spacing={1.5}>
                        {[
                          { label: 'Active', value: summary?.programs?.active ?? 0, color: '#16a34a' },
                          { label: 'Upcoming', value: summary?.programs?.upcoming ?? 0, color: '#3b82f6' },
                          { label: 'Completed', value: summary?.programs?.completed ?? 0, color: '#64748b' },
                          { label: 'Total Volunteers', value: summary?.programs?.totalVolunteers ?? 0, color: '#f59e0b' },
                        ].map(item => (
                          <Stack key={item.label} direction="row" justifyContent="space-between" alignItems="center">
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
                              <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                            </Stack>
                            <Typography variant="body2" fontWeight={800} color="#0f172a">{item.value}</Typography>
                          </Stack>
                        ))}
                      </Stack>
                    )}
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #e2e8f0' }}>
                    <Typography fontWeight={900} color="#0f172a" mb={2}>User Base</Typography>
                    {loading ? <Skeleton height={120} /> : (
                      <Stack spacing={1.5}>
                        {[
                          { label: 'Residents', value: summary?.users?.residents ?? 0, color: '#3b82f6' },
                          { label: 'Collectors', value: summary?.users?.collectors ?? 0, color: '#8b5cf6' },
                          { label: 'Paid this month', value: summary?.users?.paidResidents ?? 0, color: '#16a34a' },
                          { label: 'Free service active', value: summary?.users?.freeService ?? 0, color: '#f59e0b' },
                        ].map(item => (
                          <Stack key={item.label} direction="row" justifyContent="space-between" alignItems="center">
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
                              <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                            </Stack>
                            <Typography variant="body2" fontWeight={800} color="#0f172a">{item.value}</Typography>
                          </Stack>
                        ))}
                      </Stack>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* ── TAB 1: COLLECTIONS ── */}
          {activeTab === 1 && (
            <Box>
              {/* Filters + export row */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} mb={3} flexWrap="wrap">
                <FormControl size="small" sx={{ minWidth: 130 }}>
                  <InputLabel>Zone</InputLabel>
                  <Select value={filterZone} label="Zone" onChange={e => setFilterZone(e.target.value)}>
                    <MenuItem value="">All Zones</MenuItem>
                    {['north','south','east','west','central'].map(z => (
                      <MenuItem key={z} value={z}>{z.charAt(0).toUpperCase()+z.slice(1)}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Status</InputLabel>
                  <Select value={filterStatus} label="Status" onChange={e => setFilterStatus(e.target.value)}>
                    <MenuItem value="">All Status</MenuItem>
                    {['Pending','Scheduled','In Progress','Collected','Skipped'].map(s => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button variant="outlined" startIcon={<FilterList />}
                  onClick={fetchCollections}
                  sx={{ borderRadius: 2, fontWeight: 700 }}>
                  Apply
                </Button>
                <Box sx={{ flexGrow: 1 }} />
                <Button variant="contained" startIcon={<PictureAsPdf />}
                  onClick={downloadCollectionsPDF} disabled={exporting}
                  sx={{ fontWeight: 800, borderRadius: 2, bgcolor: '#ef4444' }}>
                  Export PDF
                </Button>
              </Stack>

              {/* Zone breakdown bars */}
              {zoneBrk.length > 0 && (
                <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #e2e8f0', mb: 3 }}>
                  <Typography fontWeight={900} color="#0f172a" mb={2.5}>Zone Breakdown — Collected</Typography>
                  <Stack spacing={2}>
                    {zoneBrk.map((z, i) => {
                      const max = zoneBrk[0]?.weight || 1;
                      return (
                        <Box key={z._id}>
                          <Stack direction="row" justifyContent="space-between" mb={0.8}>
                            <Typography variant="body2" fontWeight={700}>{(z._id || 'Unknown').toUpperCase()}</Typography>
                            <Stack direction="row" spacing={1.5}>
                              <Typography variant="caption" color="text.secondary">{z.count} jobs · {Math.round(z.weight*10)/10}kg</Typography>
                            </Stack>
                          </Stack>
                          <LinearProgress variant="determinate" value={Math.round((z.weight / max) * 100)}
                            sx={{ height: 8, borderRadius: 4, bgcolor: `${ZONE_COLORS[i % ZONE_COLORS.length]}18`,
                              '& .MuiLinearProgress-bar': { bgcolor: ZONE_COLORS[i % ZONE_COLORS.length], borderRadius: 4 } }} />
                        </Box>
                      );
                    })}
                  </Stack>
                </Paper>
              )}

              {/* Table */}
              <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" p={3} borderBottom="1px solid #f1f5f9">
                  <Typography fontWeight={900} color="#0f172a">{collections.length} Records — {monthLabel}</Typography>
                </Stack>
                <TableContainer>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                      <TableRow>
                        {['Date','Resident','Zone','Type','Weight','Collector','Status'].map(h => (
                          <TableCell key={h} sx={{ fontWeight: 800, color: '#475569' }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {collections.length === 0 ? (
                        <TableRow><TableCell colSpan={7} sx={{ textAlign:'center', py: 5, color:'#94a3b8', fontWeight:600 }}>
                          No records for this period
                        </TableCell></TableRow>
                      ) : collections.map(c => (
                        <TableRow key={c._id} hover sx={{ '&:last-child td': { border:0 } }}>
                          <TableCell><Typography variant="caption">{format(new Date(c.updatedAt),'MMM dd')}</Typography></TableCell>
                          <TableCell><Typography variant="body2" fontWeight={700}>{c.resident?.name || '–'}</Typography></TableCell>
                          <TableCell><Chip label={(c.address?.zone || '–').toUpperCase()} size="small" sx={{ fontWeight:700 }} /></TableCell>
                          <TableCell>{c.wasteType || '–'}</TableCell>
                          <TableCell>{c.actualWeight ? `${c.actualWeight}kg` : '–'}</TableCell>
                          <TableCell><Typography variant="caption">{c.collector?.name || '–'}</Typography></TableCell>
                          <TableCell>
                            <Chip label={c.status} size="small"
                              sx={{ fontWeight:700, bgcolor:`${STATUS_COLOR[c.status]}18`, color:STATUS_COLOR[c.status] }} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          )}

          {/* ── TAB 2: PAYMENTS ── */}
          {activeTab === 2 && (
            <Box>
              {/* Method breakdown chart */}
              {payBreakdown.length > 0 && (
                <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e2e8f0', mb: 4 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} mb={3}>
                    <Typography fontWeight={900} color="#0f172a">Revenue by Method — {monthLabel}</Typography>
                    <Typography variant="h5" fontWeight={900} color="#16a34a">
                      Rs. {payBreakdown.reduce((s,b) => s + b.total, 0).toLocaleString()}
                    </Typography>
                  </Stack>
                  <Grid container spacing={3}>
                    {/* Pie chart */}
                    <Grid item xs={12} md={5}>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={payBreakdown} dataKey="total" nameKey="_id"
                            cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={3}>
                            {payBreakdown.map((b, i) => (
                              <Cell key={b._id} fill={METHOD_COLORS[b._id] || ZONE_COLORS[i]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={v => [`Rs. ${v.toLocaleString()}`, '']} />
                          <Legend formatter={v => <span style={{ fontSize: 12, fontWeight: 600 }}>{v}</span>} />
                        </PieChart>
                      </ResponsiveContainer>
                    </Grid>
                    {/* Method cards */}
                    <Grid item xs={12} md={7}>
                      <Stack spacing={1.5} justifyContent="center" height="100%">
                        {payBreakdown.map((b, i) => (
                          <Stack key={b._id} direction="row" justifyContent="space-between" alignItems="center"
                            sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 3 }}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: METHOD_COLORS[b._id] || ZONE_COLORS[i] }} />
                              <Box>
                                <Typography variant="body2" fontWeight={800} textTransform="capitalize">{b._id}</Typography>
                                <Typography variant="caption" color="text.secondary">{b.count} payments{b.freeCount > 0 ? ` · ${b.freeCount} free` : ''}</Typography>
                              </Box>
                            </Stack>
                            <Typography variant="body2" fontWeight={900} color="#0f172a">Rs. {b.total.toLocaleString()}</Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Grid>
                  </Grid>
                </Paper>
              )}

              {/* Ledger table */}
              <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" p={3} borderBottom="1px solid #f1f5f9">
                  <Typography fontWeight={900} color="#0f172a">{payments.length} Payments — {monthLabel}</Typography>
                </Stack>
                <TableContainer>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                      <TableRow>
                        {['Date','Resident','Email','Method','Amount'].map(h => (
                          <TableCell key={h} sx={{ fontWeight:800, color:'#475569' }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {payments.length === 0 ? (
                        <TableRow><TableCell colSpan={5} sx={{ textAlign:'center', py:5, color:'#94a3b8', fontWeight:600 }}>
                          No payments this period
                        </TableCell></TableRow>
                      ) : payments.map(p => (
                        <TableRow key={p._id} hover sx={{ '&:last-child td': { border:0 } }}>
                          <TableCell><Typography variant="caption">{format(new Date(p.createdAt),'MMM dd, yyyy')}</Typography></TableCell>
                          <TableCell><Typography variant="body2" fontWeight={700}>{p.user?.name || '–'}</Typography></TableCell>
                          <TableCell><Typography variant="caption" color="text.secondary">{p.user?.email || '–'}</Typography></TableCell>
                          <TableCell>
                            <Chip label={p.isFreeService ? 'Coin Redeem' : (p.paymentMethod || '–')} size="small"
                              sx={{ fontWeight:700, textTransform:'capitalize' }} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={900}
                              color={p.isFreeService ? '#f59e0b' : '#16a34a'}>
                              {p.isFreeService ? '🎉 FREE' : `Rs. ${(p.amount||0).toLocaleString()}`}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          )}

          {/* ── TAB 3: VOLUNTEERS ── */}
          {activeTab === 3 && (
            <Box>
              {/* Summary bar */}
              {volunteers.length > 0 && (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3} flexWrap="wrap">
                  {[
                    { label: 'Total Programs', value: volunteers.length },
                    { label: 'Active', value: volunteers.filter(p => p.status === 'active').length },
                    { label: 'Total Approved Volunteers', value: volunteers.reduce((s, p) => s + p.approved, 0) },
                    { label: 'Coins Awarded', value: volunteers.reduce((s, p) => s + p.totalCoinsAwarded, 0).toLocaleString() },
                    { label: 'Pending Reviews', value: volunteers.reduce((s, p) => s + p.pending, 0) },
                  ].map(item => (
                    <Paper key={item.label} elevation={0}
                      sx={{ p: 2, borderRadius: 3, border: '1px solid #e2e8f0', flex: '1 1 auto', minWidth: 140 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}
                        sx={{ textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                        {item.label}
                      </Typography>
                      <Typography variant="h5" fontWeight={900} color="#0f172a">{item.value}</Typography>
                    </Paper>
                  ))}
                </Stack>
              )}

              <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                      <TableRow>
                        {['Program','Org','Zone','Status','Approved','Pending','Coins Awarded','Capacity'].map(h => (
                          <TableCell key={h} sx={{ fontWeight:800, color:'#475569' }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {volunteers.length === 0 ? (
                        <TableRow><TableCell colSpan={8} sx={{ textAlign:'center', py:5, color:'#94a3b8', fontWeight:600 }}>
                          No programs found
                        </TableCell></TableRow>
                      ) : volunteers.map(p => (
                        <TableRow key={p.id} hover sx={{ '&:last-child td': { border:0 } }}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={700} color="#0f172a">{p.title}</Typography>
                          </TableCell>
                          <TableCell><Typography variant="caption">{p.organization}</Typography></TableCell>
                          <TableCell>{p.zone ? <Chip label={(p.zone).toUpperCase()} size="small" sx={{ fontWeight:700 }} /> : '–'}</TableCell>
                          <TableCell>
                            <Chip label={p.status} size="small"
                              sx={{ fontWeight:700, bgcolor:`${PROG_STATUS[p.status]}15`, color:PROG_STATUS[p.status] }} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={800} color="#16a34a">{p.approved}</Typography>
                          </TableCell>
                          <TableCell>
                            {p.pending > 0
                              ? <Chip label={p.pending} size="small" color="warning" sx={{ fontWeight:800 }} />
                              : <Typography variant="body2" color="text.disabled">0</Typography>}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={700} color="#f59e0b">
                              {p.totalCoinsAwarded.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Stack spacing={0.5}>
                              <Typography variant="caption">{p.approved}/{p.maxVolunteers}</Typography>
                              <LinearProgress variant="determinate"
                                value={p.maxVolunteers > 0 ? Math.min(Math.round((p.approved / p.maxVolunteers)*100), 100) : 0}
                                sx={{ height:5, borderRadius:3, bgcolor:'#e2e8f0',
                                  '& .MuiLinearProgress-bar': { bgcolor:'#16a34a', borderRadius:3 } }} />
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          )}

        </Container>
      </Box>
    </Box>
  );
};

export default Reports;