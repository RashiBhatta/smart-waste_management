// ============================================================
// COLLECTOR FEATURE 2: Status Reporting with Photo Evidence
// FILE: frontend/src/pages/CollectionDetails.jsx
// Route: /collector/collections/:id
// ============================================================
// What this page does:
//   - Full collection detail view (for the assigned collector)
//   - Status pipeline stepper (Pending → In Progress → Collected)
//   - "Mark Collected" with actual weight input → POST
//   - "Mark In Progress" one-tap button
//   - "Skip with Reason" → POST /skip
//   - Photo evidence upload (camera / file picker) → POST /photo
//   - Live socket updates pushed to resident's UI
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Container, Grid, Paper, Typography, Button,
  Stack, Avatar, Chip, Divider, Stepper, Step, StepLabel,
  TextField, InputAdornment, Alert, CircularProgress,
  IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, LinearProgress, Skeleton
} from '@mui/material';
import {
  ArrowBack, CheckCircle, PendingActions, LocationOn,
  Person, Phone, CameraAlt, UploadFile, DeleteOutline,
  Scale, Notes, Warning, Schedule, TaskAlt,
  RecyclingRounded, SkipNext
} from '@mui/icons-material';
import { useParams, useNavigate }  from 'react-router-dom';
import { useAuth }                  from '../context/AuthContext';
import api                          from '../services/api';
import { toast }                    from 'react-toastify';
import { format, formatDistanceToNow } from 'date-fns';

// ── Status pipeline definition ─────────────────────────────
const PIPELINE = ['Pending', 'Scheduled', 'In Progress', 'Collected'];

const STATUS_COLOR = {
  Pending:      '#f59e0b',
  Scheduled:    '#3b82f6',
  'In Progress':'#8b5cf6',
  Collected:    '#16a34a',
  Skipped:      '#ef4444',
};

const WASTE_COLOR = {
  Organic:    { bg: '#f0fdf4', color: '#16a34a' },
  Recyclable: { bg: '#eff6ff', color: '#3b82f6' },
  Hazardous:  { bg: '#fef2f2', color: '#ef4444' },
  Mixed:      { bg: '#f8fafc', color: '#64748b' },
  Plastic:    { bg: '#fdf4ff', color: '#a855f7' },
  Paper:      { bg: '#fff7ed', color: '#f97316' },
  Glass:      { bg: '#ecfeff', color: '#06b6d4' },
  Metal:      { bg: '#fafaf9', color: '#78716c' },
};

// ── Small info row ────────────────────────────────────────────
const InfoRow = ({ icon, label, value }) => (
  <Stack direction="row" spacing={1.5} alignItems="flex-start" mb={1.5}>
    <Box sx={{ color: '#94a3b8', mt: 0.3, flexShrink: 0 }}>{icon}</Box>
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={700}
        sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body2" color="#0f172a" fontWeight={600}>{value || '–'}</Typography>
    </Box>
  </Stack>
);

// ── Main component ────────────────────────────────────────────
const CollectionDetails = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { user }  = useAuth();

  const [collection,   setCollection]   = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [submitting,   setSubmitting]   = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile,    setPhotoFile]    = useState(null);
  const [uploading,    setUploading]    = useState(false);

  // Skip dialog
  const [skipDialog, setSkipDialog] = useState(false);
  const [skipReason, setSkipReason] = useState('');

  // Collect dialog
  const [collectDialog, setCollectDialog] = useState(false);
  const [weight,        setWeight]        = useState('');
  const [collectNotes,  setCollectNotes]  = useState('');

  const fileInputRef = useRef(null);

  // ── Fetch collection ──────────────────────────────────────
  const fetchCollection = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/collections/${id}`);
      setCollection(res.data.collection);
      if (res.data.collection.photoEvidence) {
        setPhotoPreview(res.data.collection.photoEvidence);
      }
    } catch (err) {
      toast.error('Could not load collection details');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchCollection(); }, [fetchCollection]);

  // ── Mark In Progress ──────────────────────────────────────
  const handleStartJob = async () => {
    try {
      setSubmitting(true);
      await api.put(`/collections/${id}/status`, { status: 'In Progress', notes: 'En route' });
      toast.success('Marked as In Progress');
      fetchCollection();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Mark Collected ─────────────────────────────────────────
  const handleCollect = async () => {
    if (!weight || Number(weight) <= 0) {
      toast.warning('Enter the actual weight to continue');
      return;
    }
    try {
      setSubmitting(true);
      await api.put(`/collections/${id}/status`, {
        status:       'Collected',
        actualWeight: Number(weight),
        notes:        collectNotes || undefined,
      });
      toast.success('Collection marked as complete ✅');
      setCollectDialog(false);
      fetchCollection();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Skip ───────────────────────────────────────────────────
  const handleSkip = async () => {
    if (!skipReason.trim()) {
      toast.warning('Please provide a reason for skipping');
      return;
    }
    try {
      setSubmitting(true);
      await api.post(`/collections/${id}/skip`, { reason: skipReason });
      toast.success('Collection marked as skipped');
      setSkipDialog(false);
      fetchCollection();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Skip failed');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Photo: select file ─────────────────────────────────────
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB');
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  // ── Photo: upload to server ────────────────────────────────
  const handlePhotoUpload = async () => {
    if (!photoFile) return;
    try {
      setUploading(true);
      const form = new FormData();
      form.append('photo', photoFile);
      await api.post(`/collections/${id}/photo`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Photo evidence uploaded ✅');
      setPhotoFile(null);
      fetchCollection();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // ── Stepper index ──────────────────────────────────────────
  const stepIndex = (status) => {
    const idx = PIPELINE.indexOf(status);
    return idx === -1 ? 0 : idx;
  };

  // ── Loading skeleton ───────────────────────────────────────
  if (loading) return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f1f5f9', p: { xs: 2, md: 5 } }}>
      <Container maxWidth="lg">
        <Skeleton height={60} sx={{ mb: 3, borderRadius: 2 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={360} sx={{ borderRadius: 4 }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={360} sx={{ borderRadius: 4 }} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );

  if (!collection) return null;

  const isAssigned  = collection.collector?._id?.toString() === user?._id;
  const isDone      = ['Collected', 'Skipped'].includes(collection.status);
  const wColor      = WASTE_COLOR[collection.wasteType] || WASTE_COLOR.Mixed;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f1f5f9', pb: 6 }}>

      {/* ── Top bar ── */}
      <Box sx={{ bgcolor: '#0f172a', px: { xs: 2, md: 5 }, py: 2.5 }}>
        <Container maxWidth="lg" disableGutters>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <IconButton onClick={() => navigate(-1)} sx={{ color: '#94a3b8' }}>
                <ArrowBack />
              </IconButton>
              <Box>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 700 }}>
                  COLLECTION #{id.slice(-6).toUpperCase()}
                </Typography>
                <Typography variant="h6" fontWeight={900} color="white">
                  {collection.resident?.name || 'Resident'}
                </Typography>
              </Box>
            </Stack>
            {collection.status === 'Skipped' ? (
              <Chip label="Skipped" sx={{ fontWeight: 800, bgcolor: '#ef444420', color: '#ef4444' }} />
            ) : (
              <Chip
                label={collection.status}
                sx={{ fontWeight: 800, bgcolor: `${STATUS_COLOR[collection.status]}20`, color: STATUS_COLOR[collection.status] }}
              />
            )}
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pt: 4 }}>
        <Grid container spacing={3}>

          {/* ── LEFT: Status flow + Actions ── */}
          <Grid item xs={12} md={8}>

            {/* Progress stepper */}
            {!isDone ? (
              <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', p: 4, mb: 3 }}>
                <Typography variant="h6" fontWeight={900} color="#0f172a" mb={3}>
                  Collection Progress
                </Typography>
                <Stepper activeStep={stepIndex(collection.status)} alternativeLabel>
                  {PIPELINE.map((label) => (
                    <Step key={label}>
                      <StepLabel
                        sx={{
                          '& .MuiStepLabel-label': { fontWeight: 700, fontSize: '0.8rem' },
                          '& .Mui-active': { color: '#16a34a !important' },
                          '& .Mui-completed': { color: '#16a34a !important' },
                        }}
                      >
                        {label}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Paper>
            ) : (
              <Alert
                severity={collection.status === 'Collected' ? 'success' : 'error'}
                icon={collection.status === 'Collected' ? <CheckCircle /> : <Warning />}
                sx={{ borderRadius: 4, mb: 3, fontWeight: 600, '& .MuiAlert-message': { fontSize: '1rem' } }}
              >
                {collection.status === 'Collected'
                  ? `✅ Collected on ${format(new Date(collection.completedDate || collection.updatedAt), 'MMMM dd, yyyy')} — ${collection.actualWeight} kg`
                  : `⚠️ Skipped — ${collection.notes}`}
              </Alert>
            )}

            {/* Waste details */}
            <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', p: 4, mb: 3 }}>
              <Typography variant="h6" fontWeight={900} color="#0f172a" mb={3}>
                Waste Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, bgcolor: wColor.bg, textAlign: 'center' }}>
                    <RecyclingRounded sx={{ color: wColor.color, fontSize: 32 }} />
                    <Typography fontWeight={900} color={wColor.color} mt={0.5}>
                      {collection.wasteType}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Waste Type</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, bgcolor: '#f8fafc', textAlign: 'center' }}>
                    <Scale sx={{ color: '#64748b', fontSize: 32 }} />
                    <Typography fontWeight={900} color="#0f172a" mt={0.5}>
                      {collection.status === 'Collected'
                        ? `${collection.actualWeight} kg`
                        : `~${collection.estimatedWeight || '?'} kg`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {collection.status === 'Collected' ? 'Actual Weight' : 'Estimated Weight'}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {collection.notes && (
                <Paper elevation={0} sx={{ mt: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 3 }}>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <Notes sx={{ color: '#94a3b8', mt: 0.3, flexShrink: 0 }} />
                    <Typography variant="body2" color="text.secondary">{collection.notes}</Typography>
                  </Stack>
                </Paper>
              )}
            </Paper>

            {/* ── Action buttons (only for assigned collector on active jobs) ── */}
            {isAssigned && !isDone && (
              <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', p: 4, mb: 3 }}>
                <Typography variant="h6" fontWeight={900} color="#0f172a" mb={3}>
                  Update Status
                </Typography>
                <Stack spacing={2}>

                  {/* In Progress */}
                  {['Pending', 'Scheduled'].includes(collection.status) && (
                    <Button
                      fullWidth variant="contained"
                      startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <Schedule />}
                      disabled={submitting}
                      onClick={handleStartJob}
                      sx={{ borderRadius: 2, py: 1.5, fontWeight: 800, bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' } }}
                    >
                      Mark as In Progress
                    </Button>
                  )}

                  {/* Collected */}
                  <Button
                    fullWidth variant="contained"
                    startIcon={<TaskAlt />}
                    onClick={() => setCollectDialog(true)}
                    disabled={submitting}
                    sx={{ borderRadius: 2, py: 1.5, fontWeight: 800, bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}
                  >
                    Mark as Collected
                  </Button>

                  {/* Skip */}
                  <Button
                    fullWidth variant="outlined"
                    startIcon={<SkipNext />}
                    color="error"
                    onClick={() => setSkipDialog(true)}
                    disabled={submitting}
                    sx={{ borderRadius: 2, py: 1.5, fontWeight: 800 }}
                  >
                    Skip with Reason
                  </Button>
                </Stack>
              </Paper>
            )}

            {/* ── Photo evidence ── */}
            {isAssigned && (
              <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', p: 4 }}>
                <Typography variant="h6" fontWeight={900} color="#0f172a" mb={0.5}>
                  Photo Evidence
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Attach a photo to confirm the pickup condition.
                </Typography>

                {/* Preview */}
                {photoPreview ? (
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    <Box
                      component="img"
                      src={photoPreview}
                      alt="Evidence"
                      sx={{ width: '100%', maxHeight: 260, objectFit: 'cover', borderRadius: 3 }}
                    />
                    {photoFile && (
                      <IconButton
                        size="small"
                        onClick={() => { setPhotoFile(null); setPhotoPreview(collection.photoEvidence || null); }}
                        sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.5)', color: 'white',
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
                      >
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    )}
                    {collection.photoEvidence && !photoFile && (
                      <Chip
                        label="✓ Uploaded"
                        color="success"
                        size="small"
                        sx={{ position: 'absolute', bottom: 10, left: 10, fontWeight: 800 }}
                      />
                    )}
                  </Box>
                ) : (
                  <Box
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      border: '2px dashed #cbd5e1', borderRadius: 3,
                      p: 5, textAlign: 'center', cursor: 'pointer', mb: 2,
                      transition: 'all 0.2s',
                      '&:hover': { borderColor: '#16a34a', bgcolor: '#f0fdf4' },
                    }}
                  >
                    <CameraAlt sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                    <Typography fontWeight={700} color="text.secondary">
                      Tap to take a photo or upload
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      JPG, PNG or WebP · Max 5 MB
                    </Typography>
                  </Box>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: 'none' }}
                  onChange={handlePhotoSelect}
                />

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<UploadFile />}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{ borderRadius: 2, fontWeight: 700 }}
                  >
                    {photoPreview ? 'Change Photo' : 'Select Photo'}
                  </Button>

                  {photoFile && (
                    <Button
                      variant="contained"
                      startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <CameraAlt />}
                      disabled={uploading}
                      onClick={handlePhotoUpload}
                      sx={{ borderRadius: 2, fontWeight: 800, bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}
                    >
                      {uploading ? 'Uploading…' : 'Upload Evidence'}
                    </Button>
                  )}
                </Stack>
                {uploading && <LinearProgress sx={{ mt: 2, borderRadius: 2 }} />}
              </Paper>
            )}
          </Grid>

          {/* ── RIGHT: Resident info + timeline ── */}
          <Grid item xs={12} md={4}>

            {/* Resident card */}
            <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight={900} color="#0f172a" mb={2.5}>
                Resident
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center" mb={2.5}>
                <Avatar sx={{ bgcolor: '#eff6ff', color: '#3b82f6', width: 52, height: 52, fontSize: '1.3rem' }}>
                  {collection.resident?.name?.charAt(0) || '?'}
                </Avatar>
                <Box>
                  <Typography fontWeight={900} color="#0f172a">{collection.resident?.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{collection.resident?.email}</Typography>
                </Box>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              <InfoRow icon={<Phone fontSize="small" />} label="Phone" value={collection.resident?.phone} />
              <InfoRow icon={<LocationOn fontSize="small" />} label="Address"
                value={`${collection.resident?.address?.street || collection.address?.street}, Zone ${(collection.address?.zone || '').toUpperCase()}`} />
              <InfoRow icon={<Schedule fontSize="small" />} label="Scheduled"
                value={format(new Date(collection.scheduledDate || collection.createdAt), 'MMM dd, yyyy')} />

              {collection.resident?.phone && (
                <Button
                  fullWidth variant="outlined"
                  startIcon={<Phone />}
                  href={`tel:${collection.resident.phone}`}
                  sx={{ mt: 2, borderRadius: 2, fontWeight: 700 }}
                >
                  Call Resident
                </Button>
              )}
            </Paper>

            {/* Activity timeline */}
            <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', p: 3 }}>
              <Typography variant="h6" fontWeight={900} color="#0f172a" mb={2.5}>
                Activity Log
              </Typography>
              <Stack spacing={0}>
                {[
                  {
                    icon: <RecyclingRounded fontSize="small" />,
                    color: '#3b82f6',
                    label: 'Request Created',
                    time: collection.createdAt,
                  },
                  collection.collector && {
                    icon: <Person fontSize="small" />,
                    color: '#8b5cf6',
                    label: 'Collector Assigned',
                    time: collection.updatedAt,
                  },
                  (collection.status === 'In Progress') && {
                    icon: <Schedule fontSize="small" />,
                    color: '#f59e0b',
                    label: 'En Route',
                    time: collection.updatedAt,
                  },
                  collection.status === 'Collected' && {
                    icon: <CheckCircle fontSize="small" />,
                    color: '#16a34a',
                    label: `Collected — ${collection.actualWeight} kg`,
                    time: collection.completedDate || collection.updatedAt,
                  },
                  collection.status === 'Skipped' && {
                    icon: <Warning fontSize="small" />,
                    color: '#ef4444',
                    label: `Skipped: ${collection.notes}`,
                    time: collection.updatedAt,
                  },
                  collection.photoEvidence && {
                    icon: <CameraAlt fontSize="small" />,
                    color: '#06b6d4',
                    label: 'Photo evidence attached',
                    time: collection.updatedAt,
                  },
                ]
                  .filter(Boolean)
                  .map((item, idx, arr) => (
                    <Stack key={idx} direction="row" spacing={1.5} alignItems="flex-start"
                      sx={{ position: 'relative', pb: idx < arr.length - 1 ? 2.5 : 0 }}>
                      {/* Vertical line */}
                      {idx < arr.length - 1 && (
                        <Box sx={{
                          position: 'absolute', left: 15, top: 34, bottom: 0,
                          width: 2, bgcolor: '#e2e8f0',
                        }} />
                      )}
                      <Avatar sx={{ bgcolor: `${item.color}18`, color: item.color, width: 32, height: 32, flexShrink: 0 }}>
                        {item.icon}
                      </Avatar>
                      <Box pt={0.3}>
                        <Typography variant="body2" fontWeight={700} color="#0f172a">{item.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(new Date(item.time), { addSuffix: true })}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* ── Mark Collected dialog ── */}
      <Dialog
        open={collectDialog}
        onClose={() => !submitting && setCollectDialog(false)}
        PaperProps={{ sx: { borderRadius: 4, p: 1, maxWidth: 440, width: '100%' } }}
      >
        <DialogTitle sx={{ fontWeight: 900 }}>Confirm Collection ✅</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} mt={1}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Enter the actual waste weight. This is recorded permanently and visible to the resident.
            </Alert>
            <TextField
              fullWidth label="Actual Weight *" type="number"
              variant="filled"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              InputProps={{ endAdornment: <InputAdornment position="end">kg</InputAdornment> }}
              helperText="Required — must be greater than 0"
            />
            <TextField
              fullWidth label="Notes (optional)" multiline rows={3}
              variant="filled"
              value={collectNotes}
              onChange={(e) => setCollectNotes(e.target.value)}
              placeholder="Any remarks about this pickup…"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={() => setCollectDialog(false)} disabled={submitting} sx={{ fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCollect}
            disabled={submitting || !weight}
            sx={{ fontWeight: 800, borderRadius: 2, px: 3, bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}
          >
            {submitting ? 'Saving…' : 'Confirm Collected'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Skip dialog ── */}
      <Dialog
        open={skipDialog}
        onClose={() => !submitting && setSkipDialog(false)}
        PaperProps={{ sx: { borderRadius: 4, p: 1, maxWidth: 440, width: '100%' } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#ef4444' }}>Skip Collection ⚠️</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} mt={1}>
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              The resident will be notified of this skip and the reason you provide.
            </Alert>
            <TextField
              fullWidth label="Reason for Skipping *" multiline rows={4}
              variant="filled"
              value={skipReason}
              onChange={(e) => setSkipReason(e.target.value)}
              placeholder="e.g., No one was home, road blocked, waste not put out…"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={() => setSkipDialog(false)} disabled={submitting} sx={{ fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleSkip}
            disabled={submitting || !skipReason.trim()}
            sx={{ fontWeight: 800, borderRadius: 2, px: 3 }}
          >
            {submitting ? 'Saving…' : 'Confirm Skip'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CollectionDetails;