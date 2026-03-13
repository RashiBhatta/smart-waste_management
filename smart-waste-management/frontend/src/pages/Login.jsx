// import React, { useState } from 'react';
// import { 
//   Box, Container, Typography, TextField, Button, Paper, 
//   Tabs, Tab, Stack, Avatar, InputAdornment, IconButton, Link as MuiLink 
// } from '@mui/material';
// import { 
//   LockOutlined, Visibility, VisibilityOff, Recycling 
// } from '@mui/icons-material';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { toast } from 'react-toastify';

// const Login = () => {
//   const navigate = useNavigate();
//   const { login } = useAuth();
  
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [role, setRole] = useState('resident'); 
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!email || !password) {
//       toast.warning("Please fill in all fields.");
//       return;
//     }

//     setLoading(true);
//     try {
//       // 1. Authenticate and get the exact user profile back
//       const loggedInUser = await login(email, password, role); 
//       toast.success(`Welcome back, ${loggedInUser.name}!`);
      
//       // 2. Immediate Role-Based Redirection
//       if (loggedInUser.role === 'admin') {
//         navigate('/admin/dashboard');
//       } else if (loggedInUser.role === 'collector') {
//         navigate('/collector/dashboard');
//       } else {
//         navigate('/resident/dashboard');
//       }
      
//     } catch (error) {
//       const errorMessage = error.response?.data?.message || "Invalid credentials or server error";
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', bgcolor: '#f8fafc', py: 6 }}>
//       <Container maxWidth="sm">
//         <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, borderRadius: 6, border: '1px solid #eee', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
          
//           <Stack alignItems="center" mb={4}>
//             <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mb: 2 }}>
//               <LockOutlined fontSize="large" />
//             </Avatar>
//             <Typography variant="h4" fontWeight="900" color="text.primary">Welcome Back</Typography>
//             <Typography variant="body1" color="textSecondary">Sign in to your SWMS account</Typography>
//           </Stack>

//           <Tabs 
//             value={role} 
//             onChange={(e, newValue) => setRole(newValue)} 
//             variant="fullWidth" 
//             sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}
//             textColor="primary"
//             indicatorColor="primary"
//           >
//             <Tab label="Resident" value="resident" sx={{ fontWeight: 'bold' }} />
//             <Tab label="Collector" value="collector" sx={{ fontWeight: 'bold' }} />
//             <Tab label="Admin" value="admin" sx={{ fontWeight: 'bold' }} />
//           </Tabs>

//           <form onSubmit={handleSubmit}>
//             <Stack spacing={3}>
//               <TextField 
//                 label="Email Address" 
//                 variant="outlined" 
//                 fullWidth 
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 disabled={loading}
//               />
              
//               <TextField 
//                 label="Password" 
//                 variant="outlined" 
//                 fullWidth 
//                 type={showPassword ? 'text' : 'password'}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 disabled={loading}
//                 InputProps={{
//                   endAdornment: (
//                     <InputAdornment position="end">
//                       <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
//                         {showPassword ? <VisibilityOff /> : <Visibility />}
//                       </IconButton>
//                     </InputAdornment>
//                   )
//                 }}
//               />

//               <Button 
//                 type="submit" 
//                 variant="contained" 
//                 size="large" 
//                 fullWidth 
//                 disabled={loading}
//                 sx={{ py: 1.5, borderRadius: 3, fontWeight: 800, fontSize: '1.05rem' }}
//               >
//                 {loading ? 'Authenticating...' : `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
//               </Button>
//             </Stack>
//           </form>

//           <Stack direction="row" justifyContent="center" mt={4} spacing={1}>
//             <Typography variant="body2" color="textSecondary">Don't have an account?</Typography>
//             <MuiLink 
//               component="button" 
//               variant="body2" 
//               fontWeight="bold" 
//               underline="hover"
//               onClick={() => navigate('/register')}
//             >
//               Sign up here
//             </MuiLink>
//           </Stack>
          
//           <Box textAlign="center" mt={4}>
//             <MuiLink 
//               component="button" 
//               variant="caption" 
//               color="textSecondary"
//               underline="hover"
//               onClick={() => navigate('/')}
//               sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}
//             >
//               <Recycling fontSize="small" /> Back to Home
//             </MuiLink>
//           </Box>

//         </Paper>
//       </Container>
//     </Box>
//   );
// };

// export default Login;


import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, Stack, Avatar,
  InputAdornment, IconButton, Chip, Divider, Paper
} from '@mui/material';
import {
  Visibility, VisibilityOff, RecyclingRounded,
  EmailOutlined, LockOutlined, ArrowForward
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
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

const ROLES = [
  { value: 'resident',  label: 'Resident',  color: T.forest, bg: T.mist },
  { value: 'collector', label: 'Collector', color: '#3b82f6', bg: '#eff6ff' },
  { value: 'admin',     label: 'Admin',     color: '#8b5cf6', bg: '#f5f3ff' },
];

const Login = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  const [role,         setRole]         = useState('resident');
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPass,     setShowPass]     = useState(false);
  const [loading,      setLoading]      = useState(false);

  // Show "registered" message coming from Register page
  const successMsg = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) { toast.warning('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const user = await login(email.trim(), password, role);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'admin')          navigate('/admin/dashboard');
      else if (user.role === 'collector') navigate('/collector/dashboard');
      else                                navigate('/resident/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = ROLES.find(r => r.value === role);

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', fontFamily: BODY_FONT,
      background: `radial-gradient(ellipse 80% 80% at 20% 50%, ${T.mist} 0%, ${T.cream} 60%)`,
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;700&display=swap');`}</style>

      {/* Left panel — branding */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        width: '42%', flexDirection: 'column', justifyContent: 'center',
        px: 8, py: 6,
        background: `linear-gradient(160deg, ${T.ink} 0%, ${T.moss} 100%)`,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative ring */}
        <Box sx={{
          position: 'absolute', bottom: '-15%', right: '-20%',
          width: 500, height: 500, borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.07)',
        }} />
        <Box sx={{
          position: 'absolute', top: '-10%', left: '-15%',
          width: 300, height: 300, borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.05)',
        }} />

        {/* Logo */}
        <Stack direction="row" spacing={1.5} alignItems="center" mb={8}>
          <Box sx={{ width:38, height:38, borderRadius:2, bgcolor:T.forest,
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:`0 4px 12px ${T.forest}60` }}>
            <RecyclingRounded sx={{ color:'white', fontSize:22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontFamily:HERO_FONT, fontWeight:900, fontSize:'1.1rem', color:'white', lineHeight:1 }}>SWMS</Typography>
            <Typography sx={{ fontSize:'0.65rem', color:T.leaf, fontWeight:500, letterSpacing:1.5, textTransform:'uppercase' }}>Waste Portal</Typography>
          </Box>
        </Stack>

        <Typography sx={{
          fontFamily: HERO_FONT, fontWeight: 900,
          fontSize: '2.6rem', color: 'white', lineHeight: 1.1, mb: 2,
        }}>
          Good to see<br />you again.
        </Typography>
        <Typography sx={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.7, mb: 6, maxWidth: 320 }}>
          Track pickups, earn Eco-Coins, and manage waste collection — all in one place.
        </Typography>

        {/* Feature pills */}
        {[
          '🌿  Earn 100 coins per volunteer event',
          '🚚  Real-time collector tracking',
          '💳  Khalti & eSewa payments',
        ].map(item => (
          <Stack key={item} direction="row" spacing={1.5} alignItems="center" mb={1.5}>
            <Box sx={{ width:6, height:6, borderRadius:'50%', bgcolor:T.leaf, flexShrink:0 }} />
            <Typography sx={{ fontSize:'0.88rem', color:'rgba(255,255,255,0.8)' }}>{item}</Typography>
          </Stack>
        ))}
      </Box>

      {/* Right panel — form */}
      <Box sx={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        px: { xs: 3, sm: 6, md: 8 }, py: 6,
      }}>
        <Box sx={{ width: '100%', maxWidth: 440 }}>

          {/* Mobile logo */}
          <Stack direction="row" spacing={1.5} alignItems="center" mb={5}
            sx={{ display: { md: 'none' } }}>
            <Box sx={{ width:36, height:36, borderRadius:2, bgcolor:T.forest,
              display:'flex', alignItems:'center', justifyContent:'center' }}>
              <RecyclingRounded sx={{ color:'white', fontSize:20 }} />
            </Box>
            <Typography sx={{ fontFamily:HERO_FONT, fontWeight:900, color:T.ink }}>SWMS</Typography>
          </Stack>

          {successMsg && (
            <Box sx={{ p:2, mb:3, borderRadius:3, bgcolor:T.mist, border:`1px solid ${T.border}` }}>
              <Typography sx={{ fontSize:'0.88rem', fontWeight:600, color:T.forest }}>{successMsg}</Typography>
            </Box>
          )}

          <Typography sx={{ fontFamily:HERO_FONT, fontWeight:900, fontSize:'2rem', color:T.ink, mb:0.5 }}>
            Sign In
          </Typography>
          <Typography sx={{ color:T.grey, fontSize:'0.9rem', mb:4 }}>
            Welcome back. Select your role to continue.
          </Typography>

          {/* Role selector */}
          <Stack direction="row" spacing={1} mb={4}>
            {ROLES.map(r => (
              <Button key={r.value}
                onClick={() => setRole(r.value)}
                sx={{
                  flex:1, py:1.2, borderRadius:2.5, fontWeight:700, fontSize:'0.82rem',
                  bgcolor: role === r.value ? r.color : 'transparent',
                  color: role === r.value ? 'white' : T.grey,
                  border: `1.5px solid ${role === r.value ? r.color : '#e2e8f0'}`,
                  '&:hover': { bgcolor: role === r.value ? r.color : `${r.color}10` },
                  transition: 'all 0.2s',
                }}>
                {r.label}
              </Button>
            ))}
          </Stack>

          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5} mb={3}>
              <TextField
                fullWidth label="Email address" type="email"
                value={email} onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><EmailOutlined sx={{ color:T.grey, fontSize:20 }} /></InputAdornment>,
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius:2.5 } }}
              />
              <TextField
                fullWidth label="Password"
                type={showPass ? 'text' : 'password'}
                value={password} onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LockOutlined sx={{ color:T.grey, fontSize:20 }} /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPass(p => !p)}>
                        {showPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius:2.5 } }}
              />
            </Stack>

            <Button fullWidth variant="contained" type="submit"
              disabled={loading} endIcon={loading ? null : <ArrowForward />}
              sx={{
                py: 1.7, borderRadius: 3, fontWeight: 800, fontSize: '1rem',
                bgcolor: selectedRole.color, color: 'white',
                boxShadow: `0 6px 20px ${selectedRole.color}50`,
                '&:hover': { opacity: 0.9, boxShadow: `0 10px 28px ${selectedRole.color}60` },
                '&.Mui-disabled': { bgcolor: '#e2e8f0', color: '#94a3b8', boxShadow: 'none' },
                transition: 'all 0.2s',
              }}>
              {loading ? 'Signing in…' : `Sign In as ${selectedRole.label}`}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography sx={{ fontSize: '0.8rem', color: T.grey, px: 1 }}>or</Typography>
          </Divider>

          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.9rem', color: T.grey }}>
              Don't have an account?{' '}
              <RouterLink to="/register" style={{ color: T.forest, fontWeight: 700, textDecoration: 'none' }}>
                Register free →
              </RouterLink>
            </Typography>
          </Box>

          {/* Demo credentials hint */}
          <Box sx={{ mt: 4, p: 3, borderRadius: 3, bgcolor: T.sand, border:`1px solid ${T.border}` }}>
            <Typography sx={{ fontSize:'0.78rem', fontWeight:700, color:T.ink, mb:1, textTransform:'uppercase', letterSpacing:0.5 }}>
              Demo Credentials
            </Typography>
            <Stack spacing={0.8}>
              {[
                { role:'Admin',     email:'admin@swm.com',     pass:'Admin@123' },
              ].map(c => (
                <Stack key={c.role} direction="row" justifyContent="space-between" alignItems="center">
                  <Chip label={c.role} size="small" sx={{ fontWeight:700, fontSize:'0.7rem' }} />
                  <Typography sx={{ fontSize:'0.78rem', color:T.grey, fontFamily:'monospace' }}>
                    {c.email} / {c.pass}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;