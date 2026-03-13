// import React, { useState } from 'react';
// import {
//   Container, Paper, TextField, Button, Typography, Box, Avatar, 
//   Grid, Link, Alert, CircularProgress, InputAdornment, IconButton, 
//   FormControl, InputLabel, Select, MenuItem, Divider, useTheme, alpha, Chip, Stack
// } from '@mui/material';
// import {
//   Person as PersonIcon, Email as EmailIcon, Lock as LockIcon, 
//   Phone as PhoneIcon, Visibility, VisibilityOff, 
//   Recycling as RecyclingIcon, LocationCity as CityIcon,
//   Map as MapIcon, MarkunreadMailbox as ZipIcon,
//   Explore as ZoneIcon, SupervisedUserCircle as RoleIcon
// } from '@mui/icons-material';
// import { useNavigate, Link as RouterLink } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { useForm, Controller } from 'react-hook-form';
// import { yupResolver } from '@hookform/resolvers/yup';
// import * as yup from 'yup';

// const schema = yup.object({
//   name: yup.string().required('Full name is required'),
//   email: yup.string().email('Invalid email address').required('Email is required'),
//   password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
//   phone: yup.string().matches(/^[0-9]{10}$/, 'Phone must be exactly 10 digits').required('Phone number is required'),
//   street: yup.string().required('Street address is required'),
//   city: yup.string().required('City is required'),
//   state: yup.string().required('State is required'),
//   zipCode: yup.string().matches(/^[0-9]{5,6}$/, 'Invalid Zip Code').required('Zip Code is required'),
//   zone: yup.string().required('Please select a zone'),
//   role: yup.string().required('Please select your role')
// });

// const zones = ['North', 'South', 'East', 'West', 'Central'];

// const Register = () => {
//   const theme = useTheme();
//   const navigate = useNavigate();
//   const { register: registerUser } = useAuth();
  
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const { control, handleSubmit, formState: { errors } } = useForm({
//     resolver: yupResolver(schema),
//     defaultValues: {
//       name: '', email: '', password: '', phone: '',
//       street: '', city: '', state: '', zipCode: '', 
//       zone: 'central', role: 'resident'
//     }
//   });

//   const onSubmit = async (data) => {
//     setError('');
//     setLoading(true);
    
//     const userData = {
//       name: data.name,
//       email: data.email,
//       password: data.password,
//       phone: data.phone,
//       role: data.role,
//       address: { 
//         street: data.street, 
//         city: data.city, 
//         state: data.state,
//         zipCode: data.zipCode,
//         zone: data.zone 
//       }
//     };

//     try {
//       const result = await registerUser(userData);
//       if (result.success) {
//         navigate('/login', { state: { message: 'Account created! Please sign in.', role: data.role } });
//       } else {
//         setError(result.error || 'Registration failed. This email may already be in use.');
//       }
//     } catch (err) {
//       setError('Connection refused. Is the server running on port 5000?');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Box sx={{ 
//       minHeight: '100vh', display: 'flex', alignItems: 'center', 
//       background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
//       py: 6 
//     }}>
//       <Container maxWidth="md">
//         <Paper elevation={24} sx={{ 
//           p: { xs: 4, md: 6 }, 
//           borderRadius: 6, 
//           bgcolor: alpha('#ffffff', 0.98),
//           backdropFilter: 'blur(10px)',
//           boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
//         }}>
//           <Stack alignItems="center" mb={4}>
//             <Avatar sx={{ bgcolor: 'primary.main', width: 70, height: 70, mb: 2, boxShadow: '0 8px 20px rgba(46, 125, 50, 0.3)' }}>
//               <RecyclingIcon sx={{ fontSize: 40 }} />
//             </Avatar>
//             <Typography variant="h4" fontWeight="900" color="primary.dark" sx={{ letterSpacing: -1 }}>Create Account</Typography>
//             <Typography variant="body1" color="textSecondary" fontWeight="500">Join the Smart Waste Management movement</Typography>
//           </Stack>

//           {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 3, fontWeight: 600 }}>{error}</Alert>}

//           <form onSubmit={handleSubmit(onSubmit)}>
//             <Grid container spacing={3}>
//               {/* Section 1: Account Info */}
//               <Grid item xs={12}><Typography variant="button" color="primary" fontWeight="900">1. Account Security</Typography></Grid>
              
//               <Grid item xs={12} sm={6}>
//                 <Controller name="email" control={control} render={({ field }) => (
//                   <TextField {...field} fullWidth label="Email Address" error={!!errors.email} helperText={errors.email?.message} 
//                     InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon color="action"/></InputAdornment> }}/>
//                 )}/>
//               </Grid>

//               <Grid item xs={12} sm={6}>
//                 <Controller name="password" control={control} render={({ field }) => (
//                   <TextField {...field} fullWidth label="Password" type={showPassword ? 'text' : 'password'} error={!!errors.password} helperText={errors.password?.message}
//                     InputProps={{ 
//                       startAdornment: <InputAdornment position="start"><LockIcon color="action"/></InputAdornment>,
//                       endAdornment: (
//                         <InputAdornment position="end">
//                           <IconButton onClick={() => setShowPassword(!showPassword)} edge="end"><Visibility /></IconButton>
//                         </InputAdornment>
//                       )
//                     }}/>
//                 )}/>
//               </Grid>

//               {/* Section 2: Personal Details */}
//               <Grid item xs={12} mt={1}><Typography variant="button" color="primary" fontWeight="900">2. Personal Information</Typography></Grid>

//               <Grid item xs={12} sm={6}>
//                 <Controller name="name" control={control} render={({ field }) => (
//                   <TextField {...field} fullWidth label="Full Name" error={!!errors.name} helperText={errors.name?.message} 
//                     InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="action"/></InputAdornment> }}/>
//                 )}/>
//               </Grid>

//               <Grid item xs={12} sm={6}>
//                 <Controller name="phone" control={control} render={({ field }) => (
//                   <TextField {...field} fullWidth label="Mobile Number" error={!!errors.phone} helperText={errors.phone?.message} 
//                     InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon color="action"/></InputAdornment> }}/>
//                 )}/>
//               </Grid>

//               {/* Section 3: Service Location */}
//               <Grid item xs={12} mt={1}><Typography variant="button" color="primary" fontWeight="900">3. Service Location</Typography></Grid>
              
//               <Grid item xs={12}>
//                 <Controller name="street" control={control} render={({ field }) => (
//                   <TextField {...field} fullWidth label="Street & House Details" error={!!errors.street} helperText={errors.street?.message}
//                     InputProps={{ startAdornment: <InputAdornment position="start"><MapIcon color="action"/></InputAdornment> }}/>
//                 )}/>
//               </Grid>

//               <Grid item xs={12} sm={4}>
//                 <Controller name="city" control={control} render={({ field }) => (
//                   <TextField {...field} fullWidth label="City" error={!!errors.city} helperText={errors.city?.message}
//                     InputProps={{ startAdornment: <InputAdornment position="start"><CityIcon color="action"/></InputAdornment> }}/>
//                 )}/>
//               </Grid>

//               <Grid item xs={12} sm={4}>
//                 <Controller name="state" control={control} render={({ field }) => (
//                   <TextField {...field} fullWidth label="State" error={!!errors.state} helperText={errors.state?.message} />
//                 )}/>
//               </Grid>

//               <Grid item xs={12} sm={4}>
//                 <Controller name="zipCode" control={control} render={({ field }) => (
//                   <TextField {...field} fullWidth label="Zip Code" error={!!errors.zipCode} helperText={errors.zipCode?.message}
//                     InputProps={{ startAdornment: <InputAdornment position="start"><ZipIcon color="action"/></InputAdornment> }}/>
//                 )}/>
//               </Grid>

//               <Grid item xs={12} sm={6}>
//                 <Controller name="zone" control={control} render={({ field }) => (
//                   <FormControl fullWidth error={!!errors.zone}>
//                     <InputLabel sx={{ fontWeight: 700 }}><ZoneIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} /> Pick Service Zone</InputLabel>
//                     <Select {...field} label="Pick Service Zone" sx={{ fontWeight: 700 }}>
//                       {zones.map(z => <MenuItem key={z} value={z.toLowerCase()}>{z} Zone</MenuItem>)}
//                     </Select>
//                   </FormControl>
//                 )}/>
//               </Grid>

//               <Grid item xs={12} sm={6}>
//                 <Controller name="role" control={control} render={({ field }) => (
//                   <FormControl fullWidth error={!!errors.role}>
//                     <InputLabel sx={{ fontWeight: 700 }}><RoleIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} /> Account Type</InputLabel>
//                     <Select {...field} label="Account Type" sx={{ fontWeight: 700 }}>
//                       <MenuItem value="resident">Resident User</MenuItem>
//                       <MenuItem value="collector">Waste Collector</MenuItem>
//                     </Select>
//                   </FormControl>
//                 )}/>
//               </Grid>
//             </Grid>

//             <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} 
//               sx={{ mt: 5, mb: 3, py: 2, borderRadius: 4, fontWeight: '900', fontSize: '1.1rem', boxShadow: '0 10px 30px rgba(46, 125, 50, 0.3)' }}>
//               {loading ? <CircularProgress size={26} color="inherit" /> : 'GET STARTED'}
//             </Button>

//             <Box textAlign="center">
//               <Typography variant="body2" color="textSecondary" fontWeight="500">
//                 Already have an account? {' '}
//                 <Link component={RouterLink} to="/login" sx={{ textDecoration: 'none', fontWeight: '900', color: 'primary.main' }}>
//                   Login here
//                 </Link>
//               </Typography>
//             </Box>
//           </form>
//         </Paper>
//       </Container>
//     </Box>
//   );
// };

// export default Register;


import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, Stack, Grid,
  InputAdornment, IconButton, FormControl, InputLabel,
  Select, MenuItem, Divider, LinearProgress, Chip, Alert
} from '@mui/material';
import {
  Visibility, VisibilityOff, RecyclingRounded,
  PersonOutlined, EmailOutlined, LockOutlined,
  PhoneOutlined, LocationOnOutlined, ArrowForward,
  ArrowBack, CheckCircle
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const T = {
  ink:    '#0d1b0f',
  forest: '#16a34a',
  leaf:   '#22c55e',
  moss:   '#166534',
  cream:  '#fafaf5',
  sand:   '#f5f0e8',
  mist:   '#e8f5e9',
  grey:   '#6b7280',
  border: '#d1fae5',
};

const HERO_FONT = '"Playfair Display", Georgia, serif';
const BODY_FONT = '"DM Sans", "Helvetica Neue", sans-serif';

const ZONES = ['north', 'south', 'east', 'west', 'central'];

const ROLES = [
  {
    value: 'resident',
    label: 'Resident',
    desc: 'Request pickups, pay fees, earn Eco-Coins',
    color: T.forest, bg: T.mist,
  },
  {
    value: 'collector',
    label: 'Collector',
    desc: 'Manage routes and complete pickups',
    color: '#3b82f6', bg: '#eff6ff',
  },
];

const STEPS = ['Your Role', 'Account Info', 'Address', 'Done'];

// ── Inline validation ─────────────────────────────────────────
const validate = {
  name:     v => v.trim().length >= 2  ? '' : 'Full name must be at least 2 characters',
  email:    v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email address',
  password: v => v.length >= 6         ? '' : 'Password must be at least 6 characters',
  phone:    v => /^[0-9]{10}$/.test(v) ? '' : 'Phone must be exactly 10 digits',
  street:   v => v.trim().length >= 3  ? '' : 'Street address is required',
  city:     v => v.trim().length >= 2  ? '' : 'City is required',
};

const Register = () => {
  const navigate               = useNavigate();
  const { register: registerUser } = useAuth();

  const [step,        setStep]        = useState(0);
  const [loading,     setLoading]     = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPass,    setShowPass]    = useState(false);

  const [form, setForm] = useState({
    role: 'resident',
    name: '', email: '', password: '', phone: '',
    street: '', city: 'Kathmandu', state: 'Bagmati',
    zipCode: '', zone: 'central',
  });
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => {
    const val = e.target.value;
    setForm(p => ({ ...p, [field]: val }));
    if (validate[field]) setErrors(p => ({ ...p, [field]: validate[field](val) }));
  };

  const validateStep = () => {
    const newErr = {};
    if (step === 1) {
      ['name', 'email', 'password', 'phone'].forEach(f => {
        const msg = validate[f]?.(form[f]);
        if (msg) newErr[f] = msg;
      });
    }
    if (step === 2) {
      ['street', 'city'].forEach(f => {
        const msg = validate[f]?.(form[f]);
        if (msg) newErr[f] = msg;
      });
      if (!form.zone) newErr.zone = 'Please select a zone';
    }
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const next = () => { if (validateStep()) setStep(s => s + 1); };
  const prev = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setServerError('');
    try {
      await registerUser({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone,
        role: form.role,
        address: {
          street: form.street.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          zipCode: form.zipCode,
          zone: form.zone,
        },
      });
      setStep(3); // success
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. The email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  const progress = (step / 3) * 100;

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', fontFamily: BODY_FONT,
      background: `radial-gradient(ellipse 80% 80% at 80% 50%, ${T.mist} 0%, ${T.cream} 60%)`,
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;700&display=swap');`}</style>

      {/* Left info panel */}
      <Box sx={{
        display: { xs:'none', lg:'flex' },
        width: '38%', flexDirection:'column', justifyContent:'center',
        px: 8, py: 6,
        background: `linear-gradient(160deg, ${T.ink} 0%, ${T.moss} 100%)`,
        position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{
          position:'absolute', bottom:'-15%', right:'-25%',
          width:500, height:500, borderRadius:'50%',
          border:'1px solid rgba(255,255,255,0.06)',
        }} />

        {/* Logo */}
        <Stack direction="row" spacing={1.5} alignItems="center" mb={8}>
          <Box sx={{ width:38, height:38, borderRadius:2, bgcolor:T.forest,
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            <RecyclingRounded sx={{ color:'white', fontSize:22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontFamily:HERO_FONT, fontWeight:900, fontSize:'1.1rem', color:'white', lineHeight:1 }}>SWMS</Typography>
            <Typography sx={{ fontSize:'0.65rem', color:T.leaf, fontWeight:500, letterSpacing:1.5, textTransform:'uppercase' }}>Waste Portal</Typography>
          </Box>
        </Stack>

        <Typography sx={{ fontFamily:HERO_FONT, fontWeight:900, fontSize:'2.4rem', color:'white', lineHeight:1.1, mb:2 }}>
          Start your<br />eco-journey.
        </Typography>
        <Typography sx={{ color:'#94a3b8', fontSize:'0.95rem', lineHeight:1.7, mb:6 }}>
          Join thousands of Kathmandu residents building a cleaner city — and earning rewards for it.
        </Typography>

        {/* Step progress on left */}
        <Stack spacing={2}>
          {STEPS.slice(0, 3).map((s, i) => (
            <Stack key={s} direction="row" spacing={2} alignItems="center">
              <Box sx={{
                width:28, height:28, borderRadius:'50%',
                bgcolor: i < step ? T.forest : i === step ? T.leaf : 'rgba(255,255,255,0.1)',
                display:'flex', alignItems:'center', justifyContent:'center',
                flexShrink: 0,
                transition: 'all 0.3s',
              }}>
                {i < step
                  ? <CheckCircle sx={{ fontSize:16, color:'white' }} />
                  : <Typography sx={{ fontSize:'0.72rem', fontWeight:800, color: i === step ? 'white' : '#475569' }}>{i+1}</Typography>
                }
              </Box>
              <Typography sx={{ fontSize:'0.88rem', fontWeight: i === step ? 700 : 400,
                color: i <= step ? 'white' : '#475569' }}>
                {s}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* Right panel — form */}
      <Box sx={{
        flex:1, display:'flex', flexDirection:'column',
        justifyContent:'center', alignItems:'center',
        px: { xs:3, sm:6, md:8 }, py:6,
      }}>
        <Box sx={{ width:'100%', maxWidth:480 }}>

          {/* Mobile logo */}
          <Stack direction="row" spacing={1.5} alignItems="center" mb={4}
            sx={{ display:{ lg:'none' } }}>
            <Box sx={{ width:34, height:34, borderRadius:2, bgcolor:T.forest,
              display:'flex', alignItems:'center', justifyContent:'center' }}>
              <RecyclingRounded sx={{ color:'white', fontSize:18 }} />
            </Box>
            <Typography sx={{ fontFamily:HERO_FONT, fontWeight:900, color:T.ink }}>SWMS</Typography>
          </Stack>

          {step < 3 && (
            <>
              {/* Progress bar */}
              <LinearProgress variant="determinate" value={progress}
                sx={{ height:4, borderRadius:4, bgcolor:'#e2e8f0', mb:1,
                  '& .MuiLinearProgress-bar': { bgcolor:T.forest, borderRadius:4 } }} />
              <Stack direction="row" justifyContent="space-between" mb={4}>
                {STEPS.slice(0,3).map((s, i) => (
                  <Typography key={s} sx={{
                    fontSize:'0.72rem', fontWeight: i === step ? 800 : 400,
                    color: i === step ? T.forest : i < step ? T.ink : T.grey,
                  }}>{s}</Typography>
                ))}
              </Stack>
            </>
          )}

          {/* ── STEP 0: ROLE ── */}
          {step === 0 && (
            <>
              <Typography sx={{ fontFamily:HERO_FONT, fontWeight:900, fontSize:'1.9rem', color:T.ink, mb:0.5 }}>
                Choose your role
              </Typography>
              <Typography sx={{ color:T.grey, fontSize:'0.9rem', mb:4 }}>
                You can always update this later in settings.
              </Typography>

              <Stack spacing={2} mb={6}>
                {ROLES.map(r => (
                  <Box key={r.value}
                    onClick={() => setForm(p => ({ ...p, role: r.value }))}
                    sx={{
                      p:3, borderRadius:3, cursor:'pointer',
                      border: `2px solid ${form.role === r.value ? r.color : '#e2e8f0'}`,
                      bgcolor: form.role === r.value ? r.bg : 'white',
                      display:'flex', alignItems:'center', gap:2,
                      transition:'all 0.2s',
                      '&:hover': { borderColor: r.color, bgcolor: r.bg },
                    }}>
                    <Box sx={{ width:42, height:42, borderRadius:2.5,
                      bgcolor: form.role === r.value ? r.color : '#f1f5f9',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      transition:'all 0.2s' }}>
                      <RecyclingRounded sx={{ color: form.role === r.value ? 'white' : T.grey, fontSize:22 }} />
                    </Box>
                    <Box sx={{ flex:1 }}>
                      <Typography sx={{ fontWeight:800, color:T.ink, fontSize:'0.95rem' }}>{r.label}</Typography>
                      <Typography sx={{ fontSize:'0.8rem', color:T.grey }}>{r.desc}</Typography>
                    </Box>
                    {form.role === r.value && (
                      <CheckCircle sx={{ color:r.color }} />
                    )}
                  </Box>
                ))}
              </Stack>

              <Button fullWidth variant="contained" onClick={next}
                endIcon={<ArrowForward />}
                sx={{ py:1.7, borderRadius:3, fontWeight:800, fontSize:'1rem',
                  bgcolor:T.forest, boxShadow:`0 6px 20px ${T.forest}40`,
                  '&:hover': { bgcolor:T.moss } }}>
                Continue
              </Button>
            </>
          )}

          {/* ── STEP 1: ACCOUNT ── */}
          {step === 1 && (
            <>
              <Typography sx={{ fontFamily:HERO_FONT, fontWeight:900, fontSize:'1.9rem', color:T.ink, mb:0.5 }}>
                Account details
              </Typography>
              <Typography sx={{ color:T.grey, fontSize:'0.9rem', mb:4 }}>
                Create your {form.role} account.
              </Typography>

              <Stack spacing={2.5} mb={4}>
                <TextField fullWidth label="Full Name" value={form.name} onChange={set('name')}
                  error={!!errors.name} helperText={errors.name}
                  InputProps={{ startAdornment:<InputAdornment position="start"><PersonOutlined sx={{ color:T.grey, fontSize:20 }} /></InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2.5 } }} />
                <TextField fullWidth label="Email Address" type="email" value={form.email} onChange={set('email')}
                  error={!!errors.email} helperText={errors.email}
                  InputProps={{ startAdornment:<InputAdornment position="start"><EmailOutlined sx={{ color:T.grey, fontSize:20 }} /></InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2.5 } }} />
                <TextField fullWidth label="Password" type={showPass ? 'text' : 'password'}
                  value={form.password} onChange={set('password')}
                  error={!!errors.password} helperText={errors.password || 'Minimum 6 characters'}
                  InputProps={{
                    startAdornment:<InputAdornment position="start"><LockOutlined sx={{ color:T.grey, fontSize:20 }} /></InputAdornment>,
                    endAdornment:(
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowPass(p=>!p)}>
                          {showPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2.5 } }} />
                <TextField fullWidth label="Phone Number" value={form.phone} onChange={set('phone')}
                  error={!!errors.phone} helperText={errors.phone}
                  inputProps={{ maxLength:10 }}
                  InputProps={{ startAdornment:<InputAdornment position="start"><PhoneOutlined sx={{ color:T.grey, fontSize:20 }} /></InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2.5 } }} />
              </Stack>

              <Stack direction="row" spacing={1.5}>
                <Button variant="outlined" onClick={prev} startIcon={<ArrowBack />}
                  sx={{ flex:1, py:1.5, borderRadius:3, fontWeight:700, borderColor:'#e2e8f0', color:T.ink }}>
                  Back
                </Button>
                <Button variant="contained" onClick={next} endIcon={<ArrowForward />}
                  sx={{ flex:2, py:1.5, borderRadius:3, fontWeight:800,
                    bgcolor:T.forest, '&:hover':{ bgcolor:T.moss } }}>
                  Continue
                </Button>
              </Stack>
            </>
          )}

          {/* ── STEP 2: ADDRESS ── */}
          {step === 2 && (
            <>
              <Typography sx={{ fontFamily:HERO_FONT, fontWeight:900, fontSize:'1.9rem', color:T.ink, mb:0.5 }}>
                Your address
              </Typography>
              <Typography sx={{ color:T.grey, fontSize:'0.9rem', mb:4 }}>
                Used to assign you to the right collection zone.
              </Typography>

              {serverError && (
                <Alert severity="error" sx={{ mb:3, borderRadius:2 }}>{serverError}</Alert>
              )}

              <Stack spacing={2.5} mb={4}>
                <TextField fullWidth label="Street Address" value={form.street} onChange={set('street')}
                  error={!!errors.street} helperText={errors.street}
                  InputProps={{ startAdornment:<InputAdornment position="start"><LocationOnOutlined sx={{ color:T.grey, fontSize:20 }} /></InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2.5 } }} />
                <Grid container spacing={2}>
                  <Grid item xs={7}>
                    <TextField fullWidth label="City" value={form.city} onChange={set('city')}
                      error={!!errors.city} helperText={errors.city}
                      sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2.5 } }} />
                  </Grid>
                  <Grid item xs={5}>
                    <TextField fullWidth label="Zip Code" value={form.zipCode}
                      onChange={e => setForm(p => ({ ...p, zipCode: e.target.value }))}
                      inputProps={{ maxLength:6 }}
                      sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2.5 } }} />
                  </Grid>
                </Grid>
                <TextField fullWidth label="State / Province" value={form.state}
                  onChange={e => setForm(p => ({ ...p, state: e.target.value }))}
                  sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2.5 } }} />
                <FormControl fullWidth error={!!errors.zone}>
                  <InputLabel>Collection Zone</InputLabel>
                  <Select value={form.zone} label="Collection Zone"
                    onChange={e => { setForm(p => ({ ...p, zone: e.target.value })); setErrors(p => ({ ...p, zone: '' })); }}
                    sx={{ borderRadius:2.5 }}>
                    {ZONES.map(z => (
                      <MenuItem key={z} value={z} sx={{ textTransform:'capitalize' }}>{z.charAt(0).toUpperCase()+z.slice(1)}</MenuItem>
                    ))}
                  </Select>
                  {errors.zone && <Typography sx={{ fontSize:'0.75rem', color:'error.main', mt:0.5, ml:1.5 }}>{errors.zone}</Typography>}
                </FormControl>
              </Stack>

              <Stack direction="row" spacing={1.5}>
                <Button variant="outlined" onClick={prev} startIcon={<ArrowBack />}
                  sx={{ flex:1, py:1.5, borderRadius:3, fontWeight:700, borderColor:'#e2e8f0', color:T.ink }}>
                  Back
                </Button>
                <Button variant="contained" onClick={handleSubmit} disabled={loading}
                  endIcon={loading ? null : <CheckCircle />}
                  sx={{ flex:2, py:1.5, borderRadius:3, fontWeight:800,
                    bgcolor:T.forest, '&:hover':{ bgcolor:T.moss },
                    '&.Mui-disabled':{ bgcolor:'#e2e8f0', color:'#94a3b8' } }}>
                  {loading ? 'Creating Account…' : 'Create Account'}
                </Button>
              </Stack>
            </>
          )}

          {/* ── STEP 3: SUCCESS ── */}
          {step === 3 && (
            <Box textAlign="center">
              <Box sx={{
                width:80, height:80, borderRadius:'50%',
                bgcolor:T.mist, display:'flex', alignItems:'center',
                justifyContent:'center', mx:'auto', mb:3,
                border:`2px solid ${T.forest}`,
              }}>
                <CheckCircle sx={{ fontSize:44, color:T.forest }} />
              </Box>
              <Typography sx={{ fontFamily:HERO_FONT, fontWeight:900, fontSize:'2rem', color:T.ink, mb:1 }}>
                You're in!
              </Typography>
              <Typography sx={{ color:T.grey, fontSize:'0.95rem', mb:5, lineHeight:1.7 }}>
                Your account has been created successfully.<br />
                Sign in to start using SWMS.
              </Typography>
              <Button fullWidth variant="contained" endIcon={<ArrowForward />}
                onClick={() => navigate('/login', { state:{ message:'Account created! Please sign in.' } })}
                sx={{ py:1.7, borderRadius:3, fontWeight:800, fontSize:'1rem',
                  bgcolor:T.forest, boxShadow:`0 6px 20px ${T.forest}40`,
                  '&:hover':{ bgcolor:T.moss } }}>
                Go to Sign In
              </Button>
            </Box>
          )}

          {step < 3 && (
            <Box sx={{ textAlign:'center', mt:4 }}>
              <Typography sx={{ fontSize:'0.88rem', color:T.grey }}>
                Already have an account?{' '}
                <RouterLink to="/login" style={{ color:T.forest, fontWeight:700, textDecoration:'none' }}>
                  Sign in →
                </RouterLink>
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Register;