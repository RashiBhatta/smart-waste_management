// import React from 'react';
// import { 
//   Box, Container, Typography, Button, Grid, Card, CardContent, 
//   Stack, Avatar, useTheme, alpha, AppBar, Toolbar, Accordion, 
//   AccordionSummary, AccordionDetails, List, ListItem, ListItemIcon, 
//   ListItemText, Divider, Paper, LinearProgress, Link as MuiLink 
// } from '@mui/material';
// import { 
//   Recycling as RecyclingIcon, 
//   EmojiEvents as TrophyIcon, 
//   LocalShipping as TruckIcon, 
//   ExpandMore as ExpandMoreIcon,
//   CheckCircle as CheckIcon,
//   Public as EarthIcon,
//   People as PeopleIcon,
//   AdminPanelSettings as AdminIcon,
//   Person as ResidentIcon
// } from '@mui/icons-material';
// import { useNavigate } from 'react-router-dom';

// const LandingPage = () => {
//   const theme = useTheme();
//   const navigate = useNavigate();

//   const services = [
//     {
//       title: "Resident Subscription",
//       price: "Rs. 1000/mo",
//       features: [
//         "Weekly Door-to-Door Pickups", 
//         "Verified Volunteer Eligibility", 
//         "Real-time Route Tracking",
//         "Khalti Secure Digital Payments"
//       ],
//       btn: "Join Now",
//       action: () => navigate('/register'),
//       color: theme.palette.primary.main,
//       icon: <ResidentIcon color="primary" />
//     },
//     {
//       title: "Eco-Volunteer",
//       price: "1000 Coins",
//       features: [
//         "Redeem 1 Month Free Service", 
//         "100 Coins Per Verified Event", 
//         "Official Impact Certificate", 
//         "Priority Support Access"
//       ],
//       btn: "Redeem Coins",
//       action: () => navigate('/login'),
//       color: "#FFD700",
//       icon: <TrophyIcon sx={{ color: '#FFD700' }} />
//     }
//   ];

//   const faqs = [
//     {
//       q: "How does the monthly fee work?",
//       a: "The standard waste collection fee is set at 1000 NPR per month. You can easily and securely pay this directly through your dashboard using the Khalti digital wallet integration."
//     },
//     {
//       q: "How do I earn Eco-Coins?",
//       a: "Residents can join community volunteer programs organized by the municipality. Once the Admin verifies your participation, you are automatically awarded 100 Eco-Coins."
//     },
//     {
//       q: "What happens when I reach 1000 Eco-Coins?",
//       a: "Gamification is at the heart of our platform! Once your balance hits 1000 Eco-Coins, the system automatically waives your next monthly fee (1000 NPR value), giving you one month of free service."
//     },
//     {
//       q: "How do collectors know what to pick up?",
//       a: "When you request a pickup via the Resident app, it syncs directly to the Collector's digital route. They use their dashboard to navigate and mark your waste as Collected, Skipped, or Pending."
//     }
//   ];

//   const scrollToSection = (id) => {
//     const element = document.getElementById(id);
//     if (element) {
//       element.scrollIntoView({ behavior: 'smooth' });
//     }
//   };

//   return (
//     <Box sx={{ bgcolor: '#fff', minHeight: '100vh', scrollBehavior: 'smooth' }}>
      
//       {/* 1. Header Navigation */}
//       <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #eee' }}>
//         <Container>
//           <Toolbar sx={{ justifyContent: 'space-between', py: 1, px: { xs: 0 } }}>
//             <Stack direction="row" spacing={1} alignItems="center" sx={{ cursor: 'pointer' }} onClick={() => window.scrollTo(0,0)}>
//               <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}><RecyclingIcon fontSize="small" /></Avatar>
//               <Typography variant="h6" fontWeight="900" color="primary" sx={{ letterSpacing: -0.5 }}>SWMS PORTAL</Typography>
//             </Stack>
            
//             <Stack direction="row" spacing={4} sx={{ display: { xs: 'none', md: 'flex' } }}>
//               <MuiLink component="button" variant="body1" underline="none" color="text.primary" fontWeight="600" onClick={() => scrollToSection('features')}>Features</MuiLink>
//               <MuiLink component="button" variant="body1" underline="none" color="text.primary" fontWeight="600" onClick={() => scrollToSection('pricing')}>Pricing</MuiLink>
//               <MuiLink component="button" variant="body1" underline="none" color="text.primary" fontWeight="600" onClick={() => scrollToSection('faq')}>FAQ</MuiLink>
//             </Stack>

//             <Stack direction="row" spacing={2} alignItems="center">
//               <Button onClick={() => navigate('/login')} sx={{ fontWeight: '700', color: 'text.primary' }}>Login</Button>
//               <Button onClick={() => navigate('/register')} variant="contained" disableElevation sx={{ borderRadius: 8, px: 3, fontWeight: '700' }}>Get Started</Button>
//             </Stack>
//           </Toolbar>
//         </Container>
//       </AppBar>

//       {/* 2. Hero Section */}
//       <Box sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 10, md: 15 }, bgcolor: '#f8fafc', overflow: 'hidden' }}>
//         <Container maxWidth="lg">
//           <Grid container spacing={6} alignItems="center">
//             <Grid item xs={12} md={6}>
//               <Typography variant="overline" color="primary" fontWeight="800" sx={{ letterSpacing: 2 }}>
//                 CLEANER CITY, GREENER REWARDS
//               </Typography>
//               <Typography variant="h1" fontWeight="900" sx={{ fontSize: { xs: '2.8rem', md: '4rem' }, mb: 2, lineHeight: 1.1, color: '#1e293b' }}>
//                 Waste Management <br/><span style={{ color: theme.palette.primary.main }}>Redefined.</span>
//               </Typography>
//               <Typography variant="h6" color="textSecondary" sx={{ mb: 4, fontWeight: '400', maxWidth: '95%', lineHeight: 1.6 }}>
//                 Join our digital waste ecosystem. Schedule pickups, pay securely with Khalti, and earn Eco-Coins for your environmental efforts.
//               </Typography>
//               <Stack direction="row" spacing={2}>
//                 <Button size="large" variant="contained" disableElevation onClick={() => navigate('/register')} sx={{ py: 1.5, px: 4, borderRadius: 8, fontSize: '1.05rem', fontWeight: 800 }}>
//                   Resident Sign Up
//                 </Button>
//                 <Button size="large" variant="outlined" onClick={() => navigate('/login')} sx={{ py: 1.5, px: 4, borderRadius: 8, fontSize: '1.05rem', fontWeight: 800, bgcolor: 'white' }}>
//                   Collector Portal
//                 </Button>
//               </Stack>
//             </Grid>
            
//             <Grid item xs={12} md={6} sx={{ position: 'relative' }}>
//               {/* Main Hero Image */}
//               <Box 
//                 component="img"
//                 src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
//                 alt="Clean environment"
//                 sx={{ width: '100%', borderRadius: 6, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
//               />
//               {/* Floating UI Card Overlay */}
//               <Card sx={{ position: 'absolute', bottom: -30, left: -30, borderRadius: 4, boxShadow: '0 20px 40px rgba(0,0,0,0.15)', width: 300, display: { xs: 'none', sm: 'block' } }}>
//                 <CardContent sx={{ p: 3 }}>
//                    <Stack spacing={1.5}>
//                       <Typography variant="subtitle2" fontWeight="bold" color="primary">Reward Progress</Typography>
//                       <Stack direction="row" justifyContent="space-between">
//                          <Typography variant="caption">Last Event</Typography>
//                          <Typography variant="caption" color="success.main" fontWeight="bold">+100 Coins</Typography>
//                       </Stack>
//                       <Stack direction="row" justifyContent="space-between" color="primary.main">
//                          <Typography variant="body2" fontWeight="bold">Total Balance</Typography>
//                          <Typography variant="body2" fontWeight="bold">900 / 1000</Typography>
//                       </Stack>
//                       <LinearProgress variant="determinate" value={90} sx={{ height: 8, borderRadius: 4 }} />
//                       <Typography variant="caption" color="textSecondary">100 coins until a FREE month!</Typography>
//                    </Stack>
//                 </CardContent>
//               </Card>
//             </Grid>
//           </Grid>
//         </Container>
//       </Box>

//       {/* 3. Trust & Metrics */}
//       <Box sx={{ py: 6, borderBottom: '1px solid #eee' }}>
//         <Container>
//           <Grid container spacing={4} textAlign="center">
//             {[
//               { label: "Wards Covered", val: "12+", icon: <EarthIcon color="primary" /> },
//               { label: "Eco-Coins Issued", val: "50,000+", icon: <TrophyIcon color="primary" /> },
//               { label: "Total Waste Managed", val: "15 Tons", icon: <TruckIcon color="primary" /> },
//               { label: "Active Residents", val: "2,500+", icon: <PeopleIcon color="primary" /> }
//             ].map((s, i) => (
//               <Grid item xs={6} md={3} key={i}>
//                 <Typography variant="h3" fontWeight="900" color="primary">{s.val}</Typography>
//                 <Typography variant="caption" fontWeight="bold" color="textSecondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</Typography>
//               </Grid>
//             ))}
//           </Grid>
//         </Container>
//       </Box>

//       {/* 4. Roles / Features Section */}
//       <Container id="features" sx={{ py: 12 }}>
//         <Typography variant="h3" textAlign="center" fontWeight="900" mb={2}>One Portal. <span style={{ color: theme.palette.primary.main }}>Three Perspectives.</span></Typography>
//         <Typography variant="h6" textAlign="center" color="textSecondary" mb={8} sx={{ maxWidth: 600, mx: 'auto' }}>
//           Our platform connects every stakeholder in the waste management lifecycle to ensure transparency and efficiency.
//         </Typography>
        
//         <Grid container spacing={4}>
//           {[
//             { 
//               title: "Resident Dashboard", 
//               icon: <ResidentIcon sx={{ fontSize: 40 }} />, 
//               desc: "Schedule waste pickups, pay the 1000 NPR monthly fee securely via Khalti, and track your Eco-Coin rewards for volunteering.",
//               img: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
//             },
//             { 
//               title: "Collector Fleet", 
//               icon: <TruckIcon sx={{ fontSize: 40 }} />, 
//               desc: "Access daily route assignments based on municipal zones. Update stop statuses to Collected, Pending, or Skipped in real-time.",
//               img: "https://images.unsplash.com/photo-1605600659908-0ef719419d41?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
//             },
//             { 
//               title: "System Administration", 
//               icon: <AdminIcon sx={{ fontSize: 40 }} />, 
//               desc: "Verify volunteers, monitor Khalti revenue, track landfill capacity via charts, and export professional PDF impact reports.",
//               img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
//             }
//           ].map((role, i) => (
//             <Grid item xs={12} md={4} key={i}>
//               <Paper sx={{ borderRadius: 6, overflow: 'hidden', height: '100%', border: '1px solid #eee', transition: '0.3s', '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 12px 24px rgba(0,0,0,0.1)' } }}>
//                 <Box component="img" src={role.img} alt={role.title} sx={{ width: '100%', height: 180, objectFit: 'cover' }} />
//                 <Box sx={{ p: 4 }}>
//                   <Box color="primary.main" mb={2}>{role.icon}</Box>
//                   <Typography variant="h5" fontWeight="800" mb={2}>{role.title}</Typography>
//                   <Typography color="textSecondary" lineHeight={1.6}>{role.desc}</Typography>
//                 </Box>
//               </Paper>
//             </Grid>
//           ))}
//         </Grid>
//       </Container>

//       {/* 5. Pricing & Rewards */}
//       <Box id="pricing" sx={{ py: 12, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
//         <Container>
//           <Typography variant="h3" textAlign="center" fontWeight="900" gutterBottom>Transparent Pricing. <span style={{ color: theme.palette.primary.main }}>Gamified Rewards.</span></Typography>
//           <Typography variant="h6" textAlign="center" color="textSecondary" sx={{ mb: 8, maxWidth: 600, mx: 'auto' }}>
//             Pay a flat rate for top-tier service, and earn back your fee through active community participation.
//           </Typography>
//           <Grid container spacing={4} justifyContent="center">
//             {services.map((s, i) => (
//               <Grid item xs={12} md={5} key={i}>
//                 <Card variant="outlined" sx={{ borderRadius: 6, p: 2, height: '100%', bgcolor: 'white', transition: '0.3s', '&:hover': { borderColor: s.color, boxShadow: `0 15px 40px ${alpha(s.color, 0.15)}` } }}>
//                   <CardContent sx={{ p: 3 }}>
//                     <Stack direction="row" spacing={2} alignItems="center" mb={2}>
//                       <Avatar sx={{ bgcolor: alpha(s.color, 0.1), color: s.color }}>{s.icon}</Avatar>
//                       <Typography variant="h5" fontWeight="800">{s.title}</Typography>
//                     </Stack>
//                     <Typography variant="h2" fontWeight="900" color="primary" sx={{ mb: 4 }}>{s.price}</Typography>
//                     <Divider sx={{ mb: 4 }} />
//                     <List>
//                       {s.features.map((feat, idx) => (
//                         <ListItem key={idx} disableGutters sx={{ py: 1 }}>
//                           <ListItemIcon sx={{ minWidth: 35 }}><CheckIcon color="primary" fontSize="small" /></ListItemIcon>
//                           <ListItemText primary={<Typography fontWeight="500">{feat}</Typography>} />
//                         </ListItem>
//                       ))}
//                     </List>
//                     <Button fullWidth variant={i === 0 ? "outlined" : "contained"} size="large" disableElevation onClick={s.action} sx={{ mt: 4, py: 2, borderRadius: 8, fontWeight: 'bold' }}>
//                       {s.btn}
//                     </Button>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             ))}
//           </Grid>
//         </Container>
//       </Box>

//       {/* 6. FAQ Section */}
//       <Container id="faq" sx={{ py: 12, maxWidth: '800px !important' }}>
//         <Typography variant="h3" textAlign="center" fontWeight="900" mb={6}>Frequently Asked Questions</Typography>
//         <Box sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderRadius: 4, overflow: 'hidden' }}>
//           {faqs.map((faq, i) => (
//             <Accordion key={i} disableGutters elevation={0} sx={{ borderBottom: i === faqs.length - 1 ? 'none' : '1px solid #eee', '&:before': { display: 'none' } }}>
//               <AccordionSummary expandIcon={<ExpandMoreIcon color="primary" />} sx={{ p: 3 }}>
//                 <Typography variant="h6" fontWeight="700">{faq.q}</Typography>
//               </AccordionSummary>
//               <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
//                 <Typography color="textSecondary" lineHeight={1.6}>{faq.a}</Typography>
//               </AccordionDetails>
//             </Accordion>
//           ))}
//         </Box>
//       </Container>

//       {/* 7. Footer */}
//       <Box sx={{ pt: 10, pb: 6, bgcolor: '#1e293b', color: 'white' }}>
//         <Container>
//           <Grid container spacing={6}>
//             <Grid item xs={12} md={5}>
//               <Stack direction="row" spacing={1} alignItems="center" mb={3}>
//                 <Avatar sx={{ bgcolor: 'white', color: 'primary.main', width: 32, height: 32 }}><RecyclingIcon fontSize="small" /></Avatar>
//                 <Typography variant="h6" fontWeight="900" sx={{ letterSpacing: -0.5 }}>SWMS PORTAL</Typography>
//               </Stack>
//               <Typography variant="body2" sx={{ color: '#94a3b8', maxWidth: 400, lineHeight: 1.6, mb: 3 }}>
//                 A Smart Waste Management initiative by Rashi Bhatta (2417499) designed for Herald College Kathmandu. Digitizing municipal waste operations for a cleaner, greener tomorrow.
//               </Typography>
//             </Grid>
            
//             <Grid item xs={6} md={2}>
//               <Typography variant="subtitle1" fontWeight="bold" mb={3}>Platform</Typography>
//               <Stack spacing={2}>
//                 <MuiLink href="#" underline="hover" sx={{ color: '#94a3b8', cursor: 'pointer' }} onClick={() => navigate('/login')}>Resident Portal</MuiLink>
//                 <MuiLink href="#" underline="hover" sx={{ color: '#94a3b8', cursor: 'pointer' }} onClick={() => navigate('/login')}>Collector App</MuiLink>
//                 <MuiLink href="#" underline="hover" sx={{ color: '#94a3b8', cursor: 'pointer' }} onClick={() => navigate('/login')}>Admin Dashboard</MuiLink>
//               </Stack>
//             </Grid>
            
//             <Grid item xs={6} md={2}>
//               <Typography variant="subtitle1" fontWeight="bold" mb={3}>Resources</Typography>
//               <Stack spacing={2}>
//                 <MuiLink href="#" underline="hover" sx={{ color: '#94a3b8', cursor: 'pointer' }} onClick={() => scrollToSection('faq')}>Help Center</MuiLink>
//                 <MuiLink href="#" underline="hover" sx={{ color: '#94a3b8', cursor: 'pointer' }}>Khalti Guide</MuiLink>
//                 <MuiLink href="#" underline="hover" sx={{ color: '#94a3b8', cursor: 'pointer' }}>API Documentation</MuiLink>
//               </Stack>
//             </Grid>

//             <Grid item xs={12} md={3}>
//               <Typography variant="subtitle1" fontWeight="bold" mb={3}>Contact Info</Typography>
//               <Stack spacing={1}>
//                 <Typography variant="body2" sx={{ color: '#94a3b8' }}>R.Bhatta5@wlv.ac.uk</Typography>
//                 <Typography variant="body2" sx={{ color: '#94a3b8' }}>Kageshwori Manohara</Typography>
//                 <Typography variant="body2" sx={{ color: '#94a3b8' }}>Bagmati Province, Nepal</Typography>
//               </Stack>
//             </Grid>
//           </Grid>
          
//           <Divider sx={{ my: 6, borderColor: 'rgba(255,255,255,0.1)' }} />
          
//           <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
//             <Typography variant="caption" sx={{ color: '#64748b' }}>
//               © 2026 Smart Waste Management System. All Rights Reserved.
//             </Typography>
//             <Stack direction="row" spacing={3}>
//               <MuiLink href="#" underline="none" variant="caption" sx={{ color: '#64748b', '&:hover': { color: 'white' } }}>Privacy Policy</MuiLink>
//               <MuiLink href="#" underline="none" variant="caption" sx={{ color: '#64748b', '&:hover': { color: 'white' } }}>Terms of Service</MuiLink>
//             </Stack>
//           </Stack>
//         </Container>
//       </Box>

//     </Box>
//   );
// };

// export default LandingPage;

// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   Box, Container, Typography, Button, Stack, Avatar,
//   Grid, Chip, Accordion, AccordionSummary, AccordionDetails,
//   IconButton, Drawer, List, ListItem, ListItemText, Divider
// } from '@mui/material';
// import {
//   RecyclingRounded, EmojiEvents, LocalShipping, People,
//   AdminPanelSettings, ExpandMore, CheckCircle, Star,
//   ArrowForward, Menu, Close, PhoneAndroid, Analytics,
//   Payment, VolunteerActivism, Shield, Speed, Notifications
// } from '@mui/icons-material';

// // ── Design tokens ─────────────────────────────────────────────
// const T = {
//   ink:     '#0d1b0f',
//   forest:  '#16a34a',
//   leaf:    '#22c55e',
//   moss:    '#166534',
//   cream:   '#fafaf5',
//   sand:    '#f5f0e8',
//   mist:    '#e8f5e9',
//   grey:    '#6b7280',
//   border:  '#d1fae5',
// };

// // ── Shared styles ─────────────────────────────────────────────
// const HERO_FONT = '"Playfair Display", Georgia, serif';
// const BODY_FONT = '"DM Sans", "Helvetica Neue", sans-serif';

// // ── Animated counter ──────────────────────────────────────────
// const Counter = ({ target, suffix = '' }) => {
//   const [count, setCount] = useState(0);
//   const ref = useRef();
//   useEffect(() => {
//     const obs = new IntersectionObserver(([e]) => {
//       if (e.isIntersecting) {
//         let start = 0;
//         const step = Math.ceil(target / 60);
//         const t = setInterval(() => {
//           start += step;
//           if (start >= target) { setCount(target); clearInterval(t); }
//           else setCount(start);
//         }, 20);
//         obs.disconnect();
//       }
//     }, { threshold: 0.5 });
//     if (ref.current) obs.observe(ref.current);
//     return () => obs.disconnect();
//   }, [target]);
//   return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
// };

// // ── Scroll-reveal wrapper ─────────────────────────────────────
// const Reveal = ({ children, delay = 0, direction = 'up' }) => {
//   const ref = useRef();
//   const [visible, setVisible] = useState(false);
//   useEffect(() => {
//     const obs = new IntersectionObserver(([e]) => {
//       if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
//     }, { threshold: 0.15 });
//     if (ref.current) obs.observe(ref.current);
//     return () => obs.disconnect();
//   }, []);
//   const translate = direction === 'up' ? 'translateY(32px)' : direction === 'left' ? 'translateX(-32px)' : 'translateX(32px)';
//   return (
//     <Box ref={ref} sx={{
//       opacity: visible ? 1 : 0,
//       transform: visible ? 'none' : translate,
//       transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
//     }}>
//       {children}
//     </Box>
//   );
// };

// // ── Main component ────────────────────────────────────────────
// const LandingPage = () => {
//   const navigate = useNavigate();
//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);

//   useEffect(() => {
//     const onScroll = () => setScrolled(window.scrollY > 48);
//     window.addEventListener('scroll', onScroll);
//     return () => window.removeEventListener('scroll', onScroll);
//   }, []);

//   const scrollTo = (id) => {
//     document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
//     setDrawerOpen(false);
//   };

//   const navLinks = [
//     { label: 'Features', id: 'features' },
//     { label: 'How It Works', id: 'how-it-works' },
//     { label: 'Pricing', id: 'pricing' },
//     { label: 'FAQ', id: 'faq' },
//   ];

//   return (
//     <Box sx={{ bgcolor: T.cream, fontFamily: BODY_FONT, overflowX: 'hidden' }}>

//       {/* ── Import fonts ──────────────────────────────── */}
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;700&display=swap');
//         * { font-family: ${BODY_FONT}; box-sizing: border-box; }
//         ::selection { background: ${T.forest}; color: white; }
//         html { scroll-behavior: smooth; }
//         @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
//         @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
//         @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.5);opacity:0} }
//         .float { animation: float 5s ease-in-out infinite; }
//         .spin-slow { animation: spin-slow 20s linear infinite; }
//       `}</style>

//       {/* ── NAVBAR ───────────────────────────────────── */}
//       <Box component="nav" sx={{
//         position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
//         bgcolor: scrolled ? 'rgba(250,250,245,0.95)' : 'transparent',
//         backdropFilter: scrolled ? 'blur(12px)' : 'none',
//         borderBottom: scrolled ? `1px solid ${T.border}` : 'none',
//         transition: 'all 0.3s ease',
//         px: { xs: 3, md: 6 }, py: 2,
//       }}>
//         <Stack direction="row" justifyContent="space-between" alignItems="center">
//           {/* Logo */}
//           <Stack direction="row" spacing={1.5} alignItems="center" sx={{ cursor:'pointer' }} onClick={() => scrollTo('hero')}>
//             <Box sx={{
//               width: 38, height: 38, borderRadius: 2, bgcolor: T.forest,
//               display: 'flex', alignItems: 'center', justifyContent: 'center',
//               boxShadow: `0 4px 12px ${T.forest}60`,
//             }}>
//               <RecyclingRounded sx={{ color: 'white', fontSize: 22 }} />
//             </Box>
//             <Box>
//               <Typography sx={{ fontFamily: HERO_FONT, fontWeight: 900, fontSize: '1.1rem', color: T.ink, lineHeight: 1 }}>
//                 SWMS
//               </Typography>
//               <Typography sx={{ fontSize: '0.65rem', color: T.grey, fontWeight: 500, letterSpacing: 1.5, textTransform: 'uppercase' }}>
//                 Waste Portal
//               </Typography>
//             </Box>
//           </Stack>

//           {/* Desktop nav */}
//           <Stack direction="row" spacing={1} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
//             {navLinks.map(link => (
//               <Button key={link.id} onClick={() => scrollTo(link.id)}
//                 sx={{ fontWeight: 600, color: T.ink, fontSize: '0.9rem', px: 2,
//                   '&:hover': { color: T.forest, bgcolor: 'transparent' } }}>
//                 {link.label}
//               </Button>
//             ))}
//             <Box sx={{ width: 1, height: 20, bgcolor: T.border, mx: 1 }} />
//             <Button onClick={() => navigate('/login')}
//               sx={{ fontWeight: 700, color: T.forest, px: 2.5 }}>
//               Sign In
//             </Button>
//             <Button variant="contained" onClick={() => navigate('/register')}
//               sx={{
//                 fontWeight: 800, bgcolor: T.ink, color: 'white', px: 3, py: 1,
//                 borderRadius: 2, boxShadow: 'none',
//                 '&:hover': { bgcolor: T.moss, boxShadow: `0 6px 20px ${T.forest}40` },
//               }}>
//               Get Started
//             </Button>
//           </Stack>

//           {/* Mobile hamburger */}
//           <IconButton sx={{ display: { md: 'none' } }} onClick={() => setDrawerOpen(true)}>
//             <Menu sx={{ color: T.ink }} />
//           </IconButton>
//         </Stack>
//       </Box>

//       {/* Mobile Drawer */}
//       <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}
//         PaperProps={{ sx: { width: 280, bgcolor: T.cream, p: 3 } }}>
//         <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
//           <Typography fontWeight={900} color={T.ink}>Menu</Typography>
//           <IconButton onClick={() => setDrawerOpen(false)}><Close /></IconButton>
//         </Stack>
//         <Divider sx={{ mb: 2 }} />
//         {navLinks.map(link => (
//           <Button key={link.id} fullWidth onClick={() => scrollTo(link.id)}
//             sx={{ justifyContent:'flex-start', fontWeight:700, color:T.ink, py:1.5, fontSize:'1rem' }}>
//             {link.label}
//           </Button>
//         ))}
//         <Divider sx={{ my: 2 }} />
//         <Button fullWidth variant="outlined" onClick={() => navigate('/login')}
//           sx={{ fontWeight:800, borderColor:T.forest, color:T.forest, mb:1.5, borderRadius:2 }}>
//           Sign In
//         </Button>
//         <Button fullWidth variant="contained" onClick={() => navigate('/register')}
//           sx={{ fontWeight:800, bgcolor:T.ink, color:'white', borderRadius:2 }}>
//           Register Free
//         </Button>
//       </Drawer>

//       {/* ── HERO ─────────────────────────────────────── */}
//       <Box id="hero" sx={{
//         minHeight: '100vh', display: 'flex', flexDirection: 'column',
//         justifyContent: 'center', position: 'relative', overflow: 'hidden',
//         pt: { xs: 12, md: 0 }, pb: 8,
//         background: `radial-gradient(ellipse 80% 60% at 60% 40%, ${T.mist} 0%, ${T.cream} 60%)`,
//       }}>
//         {/* Decorative background ring */}
//         <Box sx={{
//           position: 'absolute', top: '10%', right: '-8%',
//           width: { xs: 300, md: 550 }, height: { xs: 300, md: 550 },
//           borderRadius: '50%',
//           border: `1.5px solid ${T.border}`,
//           opacity: 0.7,
//         }} className="spin-slow" />
//         <Box sx={{
//           position: 'absolute', top: '15%', right: '-3%',
//           width: { xs: 200, md: 380 }, height: { xs: 200, md: 380 },
//           borderRadius: '50%',
//           border: `1px solid ${T.forest}30`,
//         }} />

//         {/* Floating eco badge */}
//         <Box sx={{
//           position: 'absolute', top: '22%', right: { xs: '5%', md: '10%' },
//           bgcolor: 'white', borderRadius: 3, p: 2,
//           boxShadow: '0 8px 32px rgba(22,163,74,0.12)',
//           border: `1px solid ${T.border}`,
//           display: { xs: 'none', md: 'flex' },
//           alignItems: 'center', gap: 1.5,
//         }} className="float">
//           <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: T.mist,
//             display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//             <EmojiEvents sx={{ color: T.forest, fontSize: 22 }} />
//           </Box>
//           <Box>
//             <Typography sx={{ fontWeight: 900, fontSize: '0.9rem', color: T.ink }}>+100 Eco-Coins</Typography>
//             <Typography sx={{ fontSize: '0.75rem', color: T.grey }}>Volunteer reward</Typography>
//           </Box>
//         </Box>

//         {/* Floating collection card */}
//         <Box sx={{
//           position: 'absolute', bottom: '18%', right: { xs: '5%', md: '7%' },
//           bgcolor: T.ink, borderRadius: 3, p: 2,
//           boxShadow: '0 12px 40px rgba(13,27,15,0.2)',
//           display: { xs: 'none', md: 'flex' },
//           alignItems: 'center', gap: 1.5,
//           animationDelay: '1.5s',
//         }} className="float">
//           <Box sx={{ position: 'relative' }}>
//             <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: T.forest,
//               display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//               <LocalShipping sx={{ color: 'white', fontSize: 18 }} />
//             </Box>
//             <Box sx={{
//               position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
//               borderRadius: '50%', border: `2px solid ${T.leaf}`,
//               animation: 'pulse-ring 2s ease-out infinite',
//             }} />
//           </Box>
//           <Box>
//             <Typography sx={{ fontWeight: 900, fontSize: '0.85rem', color: 'white' }}>Pickup En Route</Typography>
//             <Typography sx={{ fontSize: '0.72rem', color: T.leaf }}>Collector 3 min away</Typography>
//           </Box>
//         </Box>

//         <Container maxWidth="lg">
//           <Grid container spacing={4} alignItems="center">
//             <Grid item xs={12} md={7}>
//               {/* Eyebrow */}
//               <Reveal>
//                 <Stack direction="row" spacing={1} alignItems="center" mb={3}>
//                   <Box sx={{ width: 32, height: 2, bgcolor: T.forest }} />
//                   <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: T.forest,
//                     textTransform: 'uppercase', letterSpacing: 2 }}>
//                     Kathmandu's Smart Waste Portal
//                   </Typography>
//                 </Stack>
//               </Reveal>

//               {/* Headline */}
//               <Reveal delay={100}>
//                 <Typography sx={{
//                   fontFamily: HERO_FONT,
//                   fontSize: { xs: '2.8rem', sm: '3.8rem', md: '4.8rem' },
//                   fontWeight: 900,
//                   color: T.ink,
//                   lineHeight: 1.05,
//                   letterSpacing: -1.5,
//                   mb: 3,
//                 }}>
//                   Cleaner City,<br />
//                   <Box component="span" sx={{ color: T.forest, fontStyle: 'italic' }}>
//                     Smarter
//                   </Box>{' '}
//                   Waste.
//                 </Typography>
//               </Reveal>

//               {/* Subheading */}
//               <Reveal delay={200}>
//                 <Typography sx={{
//                   fontSize: { xs: '1rem', md: '1.15rem' },
//                   color: T.grey, lineHeight: 1.8, maxWidth: 500, mb: 5,
//                 }}>
//                   A complete waste management ecosystem — residents track pickups,
//                   collectors manage routes, and admins oversee operations. Earn
//                   Eco-Coins and unlock free service through volunteering.
//                 </Typography>
//               </Reveal>

//               {/* CTA row */}
//               <Reveal delay={300}>
//                 <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
//                   <Button variant="contained" size="large" endIcon={<ArrowForward />}
//                     onClick={() => navigate('/register')}
//                     sx={{
//                       fontWeight: 800, bgcolor: T.forest, color: 'white',
//                       px: 4, py: 1.8, borderRadius: 3, fontSize: '1rem',
//                       boxShadow: `0 8px 24px ${T.forest}50`,
//                       '&:hover': { bgcolor: T.moss, transform: 'translateY(-2px)',
//                         boxShadow: `0 12px 32px ${T.forest}60` },
//                       transition: 'all 0.2s ease',
//                     }}>
//                     Register Free
//                   </Button>
//                   <Button variant="outlined" size="large"
//                     onClick={() => scrollTo('how-it-works')}
//                     sx={{
//                       fontWeight: 700, borderColor: T.ink, color: T.ink,
//                       px: 4, py: 1.8, borderRadius: 3, fontSize: '1rem',
//                       '&:hover': { bgcolor: `${T.ink}08`, borderColor: T.ink },
//                     }}>
//                     See How It Works
//                   </Button>
//                 </Stack>
//               </Reveal>

//               {/* Trust bar */}
//               <Reveal delay={400}>
//                 <Stack direction="row" spacing={3} alignItems="center" mt={5}
//                   sx={{ flexWrap: 'wrap', gap: 2 }}>
//                   {[
//                     { icon: <Shield sx={{ fontSize: 16 }} />, text: 'Secure Khalti Payments' },
//                     { icon: <Speed sx={{ fontSize: 16 }} />, text: 'Real-time Tracking' },
//                     { icon: <EmojiEvents sx={{ fontSize: 16 }} />, text: 'Earn Eco-Coins' },
//                   ].map(item => (
//                     <Stack key={item.text} direction="row" spacing={0.8} alignItems="center">
//                       <Box sx={{ color: T.forest }}>{item.icon}</Box>
//                       <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: T.grey }}>
//                         {item.text}
//                       </Typography>
//                     </Stack>
//                   ))}
//                 </Stack>
//               </Reveal>
//             </Grid>
//           </Grid>
//         </Container>
//       </Box>

//       {/* ── STATS BAR ────────────────────────────────── */}
//       <Box sx={{ bgcolor: T.ink, py: 5 }}>
//         <Container maxWidth="lg">
//           <Grid container spacing={2} justifyContent="center">
//             {[
//               { value: 4800, suffix: '+', label: 'Residents Served' },
//               { value: 120,  suffix: '+', label: 'Active Collectors' },
//               { value: 98,   suffix: '%',  label: 'Pickup Success Rate' },
//               { value: 52,   suffix: 'T',  label: 'Waste Recycled (tonnes)' },
//             ].map((stat, i) => (
//               <Grid item xs={6} md={3} key={i}>
//                 <Reveal delay={i * 80}>
//                   <Box sx={{ textAlign: 'center', py: 1 }}>
//                     <Typography sx={{
//                       fontFamily: HERO_FONT, fontWeight: 900,
//                       fontSize: { xs: '2.2rem', md: '3rem' },
//                       color: T.leaf, lineHeight: 1,
//                     }}>
//                       <Counter target={stat.value} suffix={stat.suffix} />
//                     </Typography>
//                     <Typography sx={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 500, mt: 0.5 }}>
//                       {stat.label}
//                     </Typography>
//                   </Box>
//                 </Reveal>
//               </Grid>
//             ))}
//           </Grid>
//         </Container>
//       </Box>

//       {/* ── FEATURES ─────────────────────────────────── */}
//       <Box id="features" sx={{ py: { xs: 8, md: 14 }, bgcolor: T.cream }}>
//         <Container maxWidth="lg">
//           <Reveal>
//             <Box textAlign="center" mb={8}>
//               <Chip label="Features" sx={{ fontWeight: 700, bgcolor: T.mist, color: T.forest, mb: 2 }} />
//               <Typography sx={{
//                 fontFamily: HERO_FONT, fontWeight: 900,
//                 fontSize: { xs: '2.2rem', md: '3rem' },
//                 color: T.ink, lineHeight: 1.2,
//               }}>
//                 Everything you need,<br />in one platform
//               </Typography>
//             </Box>
//           </Reveal>

//           {/* 3 role cards */}
//           <Grid container spacing={3} mb={6}>
//             {[
//               {
//                 icon: <People sx={{ fontSize: 28 }} />,
//                 role: 'Resident',
//                 color: T.forest,
//                 bg: T.mist,
//                 headline: 'Smart waste at your doorstep',
//                 points: [
//                   'Request & schedule pickups',
//                   'Track collector in real-time',
//                   'Pay via Khalti or eSewa',
//                   'Redeem coins for free service',
//                   'Join eco-volunteer programs',
//                 ],
//               },
//               {
//                 icon: <LocalShipping sx={{ fontSize: 28 }} />,
//                 role: 'Collector',
//                 color: '#3b82f6',
//                 bg: '#eff6ff',
//                 headline: 'Efficient routes, zero confusion',
//                 points: [
//                   'Claim pickups from zone board',
//                   'Mark status with photo evidence',
//                   'View daily analytics & ratings',
//                   'Receive real-time assignments',
//                   'Track performance metrics',
//                 ],
//               },
//               {
//                 icon: <AdminPanelSettings sx={{ fontSize: 28 }} />,
//                 role: 'Admin',
//                 color: '#8b5cf6',
//                 bg: '#f5f3ff',
//                 headline: 'Full operational visibility',
//                 points: [
//                   'System-wide KPI dashboard',
//                   'Manage volunteer programs',
//                   'Generate PDF reports',
//                   'Assign collectors manually',
//                   'Monitor revenue & payments',
//                 ],
//               },
//             ].map((card, i) => (
//               <Grid item xs={12} md={4} key={i}>
//                 <Reveal delay={i * 100}>
//                   <Box sx={{
//                     p: 4, borderRadius: 5,
//                     border: `1.5px solid ${card.color}25`,
//                     bgcolor: card.bg,
//                     height: '100%',
//                     transition: 'all 0.25s ease',
//                     '&:hover': {
//                       transform: 'translateY(-6px)',
//                       boxShadow: `0 20px 48px ${card.color}20`,
//                       borderColor: `${card.color}60`,
//                     },
//                   }}>
//                     <Box sx={{
//                       width: 56, height: 56, borderRadius: 3,
//                       bgcolor: `${card.color}15`, color: card.color,
//                       display: 'flex', alignItems: 'center', justifyContent: 'center',
//                       mb: 2.5,
//                     }}>
//                       {card.icon}
//                     </Box>
//                     <Chip label={card.role} size="small"
//                       sx={{ fontWeight: 800, bgcolor: `${card.color}15`, color: card.color, mb: 2 }} />
//                     <Typography sx={{
//                       fontFamily: HERO_FONT, fontWeight: 700,
//                       fontSize: '1.25rem', color: T.ink, mb: 2.5, lineHeight: 1.3,
//                     }}>
//                       {card.headline}
//                     </Typography>
//                     <Stack spacing={1.2}>
//                       {card.points.map(p => (
//                         <Stack key={p} direction="row" spacing={1} alignItems="flex-start">
//                           <CheckCircle sx={{ fontSize: 17, color: card.color, mt: 0.2, flexShrink: 0 }} />
//                           <Typography sx={{ fontSize: '0.9rem', color: T.grey }}>{p}</Typography>
//                         </Stack>
//                       ))}
//                     </Stack>
//                   </Box>
//                 </Reveal>
//               </Grid>
//             ))}
//           </Grid>

//           {/* Secondary feature pills */}
//           <Reveal>
//             <Box sx={{
//               p: { xs: 3, md: 5 }, borderRadius: 5,
//               background: `linear-gradient(135deg, ${T.ink} 0%, ${T.moss} 100%)`,
//             }}>
//               <Typography sx={{
//                 fontFamily: HERO_FONT, fontWeight: 900,
//                 fontSize: { xs: '1.5rem', md: '2rem' }, color: 'white', mb: 3, textAlign: 'center',
//               }}>
//                 Platform Highlights
//               </Typography>
//               <Grid container spacing={2}>
//                 {[
//                   { icon: <PhoneAndroid />,   label: 'Mobile-First Design' },
//                   { icon: <Notifications />,  label: 'Real-time Alerts' },
//                   { icon: <Analytics />,      label: 'Recharts Analytics' },
//                   { icon: <Payment />,        label: 'Khalti + eSewa' },
//                   { icon: <VolunteerActivism />, label: 'Eco-Coin Rewards' },
//                   { icon: <Shield />,         label: 'JWT Auth + RBAC' },
//                 ].map((item, i) => (
//                   <Grid item xs={6} sm={4} md={2} key={i}>
//                     <Stack alignItems="center" spacing={1}
//                       sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.07)',
//                         border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
//                       <Box sx={{ color: T.leaf }}>{item.icon}</Box>
//                       <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
//                         {item.label}
//                       </Typography>
//                     </Stack>
//                   </Grid>
//                 ))}
//               </Grid>
//             </Box>
//           </Reveal>
//         </Container>
//       </Box>

//       {/* ── HOW IT WORKS ─────────────────────────────── */}
//       <Box id="how-it-works" sx={{ py: { xs: 8, md: 14 }, bgcolor: T.sand }}>
//         <Container maxWidth="lg">
//           <Reveal>
//             <Box textAlign="center" mb={8}>
//               <Chip label="Process" sx={{ fontWeight: 700, bgcolor: T.mist, color: T.forest, mb: 2 }} />
//               <Typography sx={{
//                 fontFamily: HERO_FONT, fontWeight: 900,
//                 fontSize: { xs: '2.2rem', md: '3rem' }, color: T.ink,
//               }}>
//                 How SWMS Works
//               </Typography>
//             </Box>
//           </Reveal>

//           <Grid container spacing={4}>
//             {[
//               { step: '01', title: 'Register & Set Up', desc: 'Create your account as a resident or collector. Set your zone and address for precise routing.' },
//               { step: '02', title: 'Request Pickup', desc: 'Residents submit collection requests. The system notifies collectors in your zone automatically.' },
//               { step: '03', title: 'Collector Claims Job', desc: 'A collector claims your request from the zone board, sets status, and navigates to your address.' },
//               { step: '04', title: 'Collection & Feedback', desc: 'Collector marks job complete with weight and photo. Resident rates the experience.' },
//               { step: '05', title: 'Earn & Redeem', desc: 'Volunteer in eco-programs to earn 100 coins each. Accumulate 1,000 coins for a free month of service.' },
//               { step: '06', title: 'Admin Oversight', desc: 'Admins monitor all operations, generate PDF reports, and manage programs from a single dashboard.' },
//             ].map((item, i) => (
//               <Grid item xs={12} sm={6} md={4} key={i}>
//                 <Reveal delay={i * 80}>
//                   <Box sx={{
//                     p: 3.5, borderRadius: 4,
//                     bgcolor: 'white',
//                     border: `1px solid ${T.border}`,
//                     height: '100%',
//                     position: 'relative',
//                     '&:hover': { boxShadow: '0 12px 36px rgba(22,163,74,0.1)' },
//                     transition: 'box-shadow 0.25s',
//                   }}>
//                     <Typography sx={{
//                       fontFamily: HERO_FONT, fontWeight: 900,
//                       fontSize: '3.5rem', color: `${T.forest}18`,
//                       position: 'absolute', top: 12, right: 20, lineHeight: 1,
//                     }}>
//                       {item.step}
//                     </Typography>
//                     <Typography sx={{ fontWeight: 700, color: T.forest, fontSize: '0.8rem',
//                       letterSpacing: 1.5, textTransform: 'uppercase', mb: 1.5 }}>
//                       Step {item.step}
//                     </Typography>
//                     <Typography sx={{ fontFamily: HERO_FONT, fontWeight: 700, fontSize: '1.2rem',
//                       color: T.ink, mb: 1.5, lineHeight: 1.3 }}>
//                       {item.title}
//                     </Typography>
//                     <Typography sx={{ fontSize: '0.9rem', color: T.grey, lineHeight: 1.7 }}>
//                       {item.desc}
//                     </Typography>
//                   </Box>
//                 </Reveal>
//               </Grid>
//             ))}
//           </Grid>
//         </Container>
//       </Box>

//       {/* ── PRICING ──────────────────────────────────── */}
//       <Box id="pricing" sx={{ py: { xs: 8, md: 14 }, bgcolor: T.cream }}>
//         <Container maxWidth="lg">
//           <Reveal>
//             <Box textAlign="center" mb={8}>
//               <Chip label="Pricing" sx={{ fontWeight: 700, bgcolor: T.mist, color: T.forest, mb: 2 }} />
//               <Typography sx={{
//                 fontFamily: HERO_FONT, fontWeight: 900,
//                 fontSize: { xs: '2.2rem', md: '3rem' }, color: T.ink,
//               }}>
//                 Simple, transparent pricing
//               </Typography>
//             </Box>
//           </Reveal>

//           <Grid container spacing={3} justifyContent="center">
//             {[
//               {
//                 name: 'Monthly Plan',
//                 price: 'Rs. 1,000',
//                 period: 'per month',
//                 highlight: false,
//                 desc: 'Full access to all resident features with monthly billing.',
//                 features: [
//                   'Unlimited pickup requests',
//                   'Real-time collector tracking',
//                   'Khalti & eSewa payment',
//                   'Eco-Coin earning',
//                   'Volunteer program access',
//                   'Priority notifications',
//                 ],
//                 cta: 'Get Started',
//                 action: () => navigate('/register'),
//               },
//               {
//                 name: 'Eco-Volunteer',
//                 price: 'FREE',
//                 period: 'with 1,000 coins',
//                 highlight: true,
//                 desc: 'Earn through community service and unlock free months.',
//                 features: [
//                   'All Monthly Plan features',
//                   'Earn 100 coins per event',
//                   '1 month free at 1,000 coins',
//                   'Impact certificate',
//                   'Volunteer leaderboard',
//                   'Zone top contributor badge',
//                 ],
//                 cta: 'Start Earning',
//                 action: () => navigate('/register'),
//               },
//             ].map((plan, i) => (
//               <Grid item xs={12} sm={8} md={5} key={i}>
//                 <Reveal delay={i * 120}>
//                   <Box sx={{
//                     p: 4.5, borderRadius: 5, height: '100%',
//                     bgcolor: plan.highlight ? T.ink : 'white',
//                     border: plan.highlight ? 'none' : `1.5px solid ${T.border}`,
//                     boxShadow: plan.highlight ? `0 24px 60px ${T.ink}30` : 'none',
//                     position: 'relative', overflow: 'hidden',
//                   }}>
//                     {plan.highlight && (
//                       <Chip label="Most Popular" size="small"
//                         sx={{ position:'absolute', top:20, right:20,
//                           bgcolor: T.forest, color: 'white', fontWeight: 800 }} />
//                     )}
//                     <Typography sx={{
//                       fontWeight: 700, fontSize: '0.8rem', letterSpacing: 1.5,
//                       textTransform: 'uppercase', mb: 1,
//                       color: plan.highlight ? T.leaf : T.forest,
//                     }}>
//                       {plan.name}
//                     </Typography>
//                     <Stack direction="row" alignItems="baseline" spacing={1} mb={1}>
//                       <Typography sx={{
//                         fontFamily: HERO_FONT, fontWeight: 900,
//                         fontSize: '2.8rem', color: plan.highlight ? 'white' : T.ink, lineHeight: 1,
//                       }}>
//                         {plan.price}
//                       </Typography>
//                       <Typography sx={{ color: plan.highlight ? '#94a3b8' : T.grey, fontSize: '0.9rem' }}>
//                         {plan.period}
//                       </Typography>
//                     </Stack>
//                     <Typography sx={{
//                       fontSize: '0.9rem', mb: 3,
//                       color: plan.highlight ? '#94a3b8' : T.grey,
//                     }}>
//                       {plan.desc}
//                     </Typography>
//                     <Divider sx={{ borderColor: plan.highlight ? 'rgba(255,255,255,0.1)' : T.border, mb: 3 }} />
//                     <Stack spacing={1.5} mb={4}>
//                       {plan.features.map(f => (
//                         <Stack key={f} direction="row" spacing={1.2} alignItems="center">
//                           <CheckCircle sx={{ fontSize: 17, color: plan.highlight ? T.leaf : T.forest, flexShrink: 0 }} />
//                           <Typography sx={{ fontSize: '0.9rem', color: plan.highlight ? 'rgba(255,255,255,0.85)' : T.grey }}>
//                             {f}
//                           </Typography>
//                         </Stack>
//                       ))}
//                     </Stack>
//                     <Button fullWidth variant={plan.highlight ? 'contained' : 'outlined'}
//                       size="large" endIcon={<ArrowForward />} onClick={plan.action}
//                       sx={{
//                         fontWeight: 800, borderRadius: 3, py: 1.6,
//                         bgcolor: plan.highlight ? T.forest : 'transparent',
//                         borderColor: plan.highlight ? 'transparent' : T.ink,
//                         color: plan.highlight ? 'white' : T.ink,
//                         '&:hover': {
//                           bgcolor: plan.highlight ? T.leaf : `${T.ink}08`,
//                           boxShadow: plan.highlight ? `0 8px 24px ${T.forest}50` : 'none',
//                         },
//                       }}>
//                       {plan.cta}
//                     </Button>
//                   </Box>
//                 </Reveal>
//               </Grid>
//             ))}
//           </Grid>
//         </Container>
//       </Box>

//       {/* ── TESTIMONIALS ─────────────────────────────── */}
//       <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: T.mist }}>
//         <Container maxWidth="lg">
//           <Reveal>
//             <Box textAlign="center" mb={6}>
//               <Typography sx={{ fontFamily: HERO_FONT, fontWeight: 900,
//                 fontSize: { xs: '2rem', md: '2.6rem' }, color: T.ink }}>
//                 What users say
//               </Typography>
//             </Box>
//           </Reveal>
//           <Grid container spacing={3}>
//             {[
//               { name: 'Ramesh Shrestha', role: 'Resident, Lalitpur', text: 'The coin system actually makes me want to volunteer. I earned enough coins in 3 months to get a free month!', rating: 5 },
//               { name: 'Maya Gurung',    role: 'Resident, Bhaktapur', text: 'Scheduling pickups used to be a headache. Now I just tap once and I can track the collector on the way.', rating: 5 },
//               { name: 'Bikash Thapa',  role: 'Collector, KTM North', text: 'The route board shows me everything in my zone. No more confusion about which house to visit next.', rating: 5 },
//             ].map((t, i) => (
//               <Grid item xs={12} md={4} key={i}>
//                 <Reveal delay={i * 100}>
//                   <Box sx={{ p: 4, borderRadius: 4, bgcolor: 'white',
//                     border: `1px solid ${T.border}`, height: '100%',
//                     '&:hover': { boxShadow: '0 12px 36px rgba(22,163,74,0.1)', transform: 'translateY(-4px)' },
//                     transition: 'all 0.25s ease' }}>
//                     <Stack direction="row" mb={2}>
//                       {[...Array(t.rating)].map((_, j) => (
//                         <Star key={j} sx={{ fontSize: 18, color: '#f59e0b' }} />
//                       ))}
//                     </Stack>
//                     <Typography sx={{ fontSize: '0.95rem', color: T.grey, lineHeight: 1.8, mb: 3, fontStyle: 'italic' }}>
//                       "{t.text}"
//                     </Typography>
//                     <Stack direction="row" spacing={1.5} alignItems="center">
//                       <Avatar sx={{ bgcolor: T.forest, width: 38, height: 38, fontSize: '0.9rem' }}>
//                         {t.name.charAt(0)}
//                       </Avatar>
//                       <Box>
//                         <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: T.ink }}>{t.name}</Typography>
//                         <Typography sx={{ fontSize: '0.78rem', color: T.grey }}>{t.role}</Typography>
//                       </Box>
//                     </Stack>
//                   </Box>
//                 </Reveal>
//               </Grid>
//             ))}
//           </Grid>
//         </Container>
//       </Box>

//       {/* ── FAQ ──────────────────────────────────────── */}
//       <Box id="faq" sx={{ py: { xs: 8, md: 14 }, bgcolor: T.cream }}>
//         <Container maxWidth="md">
//           <Reveal>
//             <Box textAlign="center" mb={7}>
//               <Chip label="FAQ" sx={{ fontWeight: 700, bgcolor: T.mist, color: T.forest, mb: 2 }} />
//               <Typography sx={{
//                 fontFamily: HERO_FONT, fontWeight: 900,
//                 fontSize: { xs: '2.2rem', md: '3rem' }, color: T.ink,
//               }}>
//                 Frequently asked questions
//               </Typography>
//             </Box>
//           </Reveal>
//           {[
//             { q: 'How does the monthly fee work?', a: 'The standard waste collection fee is Rs. 1,000 per month. Pay directly via Khalti or eSewa from your resident dashboard. Free service months can be redeemed using Eco-Coins.' },
//             { q: 'How do I earn Eco-Coins?', a: 'Join community volunteer programs listed in the Programs section. Once an admin verifies your participation, 100 Eco-Coins are automatically credited to your wallet.' },
//             { q: 'What happens when I reach 1,000 Eco-Coins?', a: 'The system automatically unlocks one month of free service for your account — worth Rs. 1,000. The coins are deducted and your service continues uninterrupted.' },
//             { q: 'How do collectors navigate to my address?', a: 'Collectors see a zone board with all pending pickups. Once claimed, they follow the address to your location and mark the job as collected, skipped, or in progress.' },
//             { q: 'Is my payment information secure?', a: 'Yes. All payments are processed through Khalti and eSewa\'s official APIs with HMAC-SHA256 signature verification. We never store your card or payment credentials.' },
//             { q: 'Can I use the platform on my phone?', a: 'Absolutely. SWMS is fully responsive and works on any device. A Progressive Web App version is on the roadmap for native-like mobile experience.' },
//           ].map((faq, i) => (
//             <Reveal key={i} delay={i * 50}>
//               <Accordion elevation={0} disableGutters
//                 sx={{
//                   mb: 1.5, borderRadius: '12px !important', overflow: 'hidden',
//                   border: `1px solid ${T.border}`, bgcolor: 'white',
//                   '&:before': { display: 'none' },
//                   '&.Mui-expanded': { border: `1.5px solid ${T.forest}50` },
//                 }}>
//                 <AccordionSummary expandIcon={<ExpandMore sx={{ color: T.forest }} />} sx={{ px: 3, py: 0.5 }}>
//                   <Typography sx={{ fontWeight: 700, color: T.ink, fontSize: '0.95rem' }}>{faq.q}</Typography>
//                 </AccordionSummary>
//                 <AccordionDetails sx={{ px: 3, pt: 0, pb: 2.5 }}>
//                   <Typography sx={{ color: T.grey, lineHeight: 1.8, fontSize: '0.9rem' }}>{faq.a}</Typography>
//                 </AccordionDetails>
//               </Accordion>
//             </Reveal>
//           ))}
//         </Container>
//       </Box>

//       {/* ── CTA BANNER ───────────────────────────────── */}
//       <Box sx={{
//         py: { xs: 8, md: 12 },
//         background: `linear-gradient(135deg, ${T.ink} 0%, ${T.moss} 100%)`,
//         position: 'relative', overflow: 'hidden',
//       }}>
//         {/* Decorative circle */}
//         <Box sx={{
//           position: 'absolute', top: '-30%', right: '-10%',
//           width: 500, height: 500, borderRadius: '50%',
//           border: '1px solid rgba(255,255,255,0.06)',
//         }} />
//         <Container maxWidth="md">
//           <Reveal>
//             <Box textAlign="center">
//               <RecyclingRounded sx={{ fontSize: 56, color: T.leaf, mb: 2 }} />
//               <Typography sx={{
//                 fontFamily: HERO_FONT, fontWeight: 900,
//                 fontSize: { xs: '2.2rem', md: '3.2rem' },
//                 color: 'white', lineHeight: 1.15, mb: 2,
//               }}>
//                 Join thousands building<br />a cleaner Kathmandu
//               </Typography>
//               <Typography sx={{ color: '#94a3b8', fontSize: '1rem', mb: 5 }}>
//                 Start your free account in under 2 minutes. No credit card required.
//               </Typography>
//               <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
//                 <Button variant="contained" size="large" endIcon={<ArrowForward />}
//                   onClick={() => navigate('/register')}
//                   sx={{
//                     fontWeight: 800, bgcolor: T.forest, color: 'white',
//                     px: 5, py: 1.8, borderRadius: 3, fontSize: '1rem',
//                     boxShadow: `0 8px 28px ${T.forest}50`,
//                     '&:hover': { bgcolor: T.leaf },
//                   }}>
//                   Create Free Account
//                 </Button>
//                 <Button variant="outlined" size="large" onClick={() => navigate('/login')}
//                   sx={{
//                     fontWeight: 700, borderColor: 'rgba(255,255,255,0.3)', color: 'white',
//                     px: 5, py: 1.8, borderRadius: 3, fontSize: '1rem',
//                     '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.5)' },
//                   }}>
//                   Sign In
//                 </Button>
//               </Stack>
//             </Box>
//           </Reveal>
//         </Container>
//       </Box>

//       {/* ── FOOTER ───────────────────────────────────── */}
//       <Box sx={{ bgcolor: T.ink, py: 5, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
//         <Container maxWidth="lg">
//           <Stack direction={{ xs:'column', md:'row' }} justifyContent="space-between" alignItems={{ md:'center' }} spacing={3}>
//             <Stack direction="row" spacing={1.5} alignItems="center">
//               <Box sx={{ width:34, height:34, borderRadius:2, bgcolor:T.forest,
//                 display:'flex', alignItems:'center', justifyContent:'center' }}>
//                 <RecyclingRounded sx={{ color:'white', fontSize:18 }} />
//               </Box>
//               <Box>
//                 <Typography sx={{ fontFamily:HERO_FONT, fontWeight:900, fontSize:'0.95rem', color:'white' }}>SWMS</Typography>
//                 <Typography sx={{ fontSize:'0.7rem', color:'#64748b', letterSpacing:1.5, textTransform:'uppercase' }}>
//                   Smart Waste Management
//                 </Typography>
//               </Box>
//             </Stack>
//             <Typography sx={{ fontSize:'0.8rem', color:'#475569', textAlign:{ xs:'center', md:'right' } }}>
//               © {new Date().getFullYear()} SWMS · Kathmandu, Nepal · Built with MERN Stack
//             </Typography>
//           </Stack>
//         </Container>
//       </Box>
//     </Box>
//   );
// };

// export default LandingPage;



import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Button, Stack, Avatar,
  Grid, Chip, Accordion, AccordionSummary, AccordionDetails,
  IconButton, Drawer, Divider, Paper
} from '@mui/material';
import {
  RecyclingRounded, LocalShipping, People,
  AdminPanelSettings, ExpandMore, CheckCircle, Star,
  ArrowForward, Menu, Close, PhoneAndroid, Analytics,
  Payment, VolunteerActivism, Shield, Notifications, AccountCircle
} from '@mui/icons-material';

// ── Refined "Eco-Premium" Design Tokens ───────────────────────
const T = {
  primary:   '#059669', // Emerald 600
  primaryDk: '#047857', // Emerald 700
  accent:    '#dcfce7', // Emerald 50
  ink:       '#0f172a', // Slate 900
  slate:     '#334155', // Slate 700
  grey:      '#64748b', // Slate 500
  surface:   '#f8fafc', // Slate 50
  surfaceAlt:'#f1f5f9', // Slate 100
  border:    '#e2e8f0', // Slate 200
  white:     '#ffffff',
};

// ── Typography ────────────────────────────────────────────────
const HEAD_FONT = '"Outfit", "Inter", sans-serif';
const BODY_FONT = '"Plus Jakarta Sans", "Helvetica Neue", sans-serif';

// ── Animated Counter ──────────────────────────────────────────
const Counter = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef();
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = Math.ceil(target / 45);
        const t = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(t); }
          else setCount(start);
        }, 30);
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

// ── Smooth Scroll-Reveal Wrapper ──────────────────────────────
const Reveal = ({ children, delay = 0, direction = 'up' }) => {
  const ref = useRef();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const translate = direction === 'up' ? 'translateY(40px)' : direction === 'left' ? 'translateX(-40px)' : 'translateX(40px)';
  return (
    <Box ref={ref} sx={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : translate,
      transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
    }}>
      {children}
    </Box>
  );
};

// ── Main Landing Page ─────────────────────────────────────────
const LandingPage = () => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setDrawerOpen(false);
  };

  const navLinks = [
    { label: 'Platform', id: 'features' },
    { label: 'Process', id: 'how-it-works' },
    { label: 'Pricing', id: 'pricing' },
    { label: 'FAQ', id: 'faq' },
  ];

  return (
    <Box sx={{ bgcolor: T.surface, fontFamily: BODY_FONT, overflowX: 'hidden' }}>

      {/* ── Font Import & Globals ────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        * { font-family: ${BODY_FONT}; box-sizing: border-box; }
        ::selection { background: ${T.primary}; color: white; }
        html { scroll-behavior: smooth; }
        
        .hero-grid {
          background-size: 40px 40px;
          background-image: 
            linear-gradient(to right, ${T.border} 1px, transparent 1px),
            linear-gradient(to bottom, ${T.border} 1px, transparent 1px);
          mask-image: radial-gradient(ellipse 60% 80% at 50% 30%, black 10%, transparent 100%);
        }
        
        .glass-nav {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(226, 232, 240, 0.8);
        }
      `}</style>

      {/* ── NAVBAR ───────────────────────────────────────────── */}
      <Box component="nav" className={scrolled ? 'glass-nav' : ''} sx={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        transition: 'all 0.3s ease',
        px: { xs: 3, md: 8 }, py: scrolled ? 1.5 : 3,
        bgcolor: scrolled ? 'transparent' : 'transparent',
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          
          {/* Logo */}
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ cursor:'pointer' }} onClick={() => scrollTo('hero')}>
            <Box sx={{
              width: 42, height: 42, borderRadius: 2.5, bgcolor: T.ink,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <RecyclingRounded sx={{ color: T.white, fontSize: 24 }} />
            </Box>
            <Box>
              <Typography sx={{ fontFamily: HEAD_FONT, fontWeight: 900, fontSize: '1.25rem', color: T.ink, lineHeight: 1 }}>
                SWMS
              </Typography>
              <Typography sx={{ fontSize: '0.65rem', color: T.grey, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', mt: 0.3 }}>
                Enterprise
              </Typography>
            </Box>
          </Stack>

          {/* Desktop Nav Links */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
            {navLinks.map(link => (
              <Button key={link.id} onClick={() => scrollTo(link.id)} disableRipple
                sx={{ 
                  fontWeight: 600, color: T.slate, fontSize: '0.95rem', px: 2.5, textTransform: 'none',
                  '&:hover': { color: T.ink, bgcolor: 'transparent' } 
                }}>
                {link.label}
              </Button>
            ))}
            <Box sx={{ width: 1, height: 24, bgcolor: T.border, mx: 2 }} />
            <Button onClick={() => navigate('/login')} disableRipple
              sx={{ fontWeight: 700, color: T.ink, px: 3, textTransform: 'none', fontSize: '0.95rem' }}>
              Sign In
            </Button>
            <Button variant="contained" onClick={() => navigate('/register')}
              sx={{
                fontWeight: 700, bgcolor: T.primary, color: T.white, px: 3.5, py: 1.2,
                borderRadius: 2, textTransform: 'none', fontSize: '0.95rem', boxShadow: 'none',
                '&:hover': { bgcolor: T.primaryDk, boxShadow: `0 8px 24px ${T.primary}40` },
              }}>
              Create Account
            </Button>
          </Stack>

          {/* Mobile Hamburger */}
          <IconButton sx={{ display: { md: 'none' } }} onClick={() => setDrawerOpen(true)}>
            <Menu sx={{ color: T.ink }} />
          </IconButton>
        </Stack>
      </Box>

      {/* ── MOBILE DRAWER ────────────────────────────────────── */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 300, bgcolor: T.white, p: 3 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography fontFamily={HEAD_FONT} fontWeight={800} color={T.ink}>Navigation</Typography>
          <IconButton onClick={() => setDrawerOpen(false)}><Close /></IconButton>
        </Stack>
        <Divider sx={{ mb: 2 }} />
        {navLinks.map(link => (
          <Button key={link.id} fullWidth onClick={() => scrollTo(link.id)}
            sx={{ justifyContent:'flex-start', fontWeight:600, color:T.slate, py:1.5, fontSize:'1rem', textTransform:'none' }}>
            {link.label}
          </Button>
        ))}
        <Divider sx={{ my: 2 }} />
        <Button fullWidth variant="outlined" onClick={() => navigate('/login')}
          sx={{ fontWeight:700, borderColor:T.border, color:T.ink, mb:1.5, borderRadius:2, py:1.5, textTransform:'none' }}>
          Sign In
        </Button>
        <Button fullWidth variant="contained" onClick={() => navigate('/register')}
          sx={{ fontWeight:700, bgcolor:T.primary, color:'white', borderRadius:2, py:1.5, textTransform:'none', boxShadow:'none' }}>
          Create Account
        </Button>
      </Drawer>

      {/* ── HERO SECTION ─────────────────────────────────────── */}
      <Box id="hero" sx={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', position: 'relative', overflow: 'hidden',
        pt: { xs: 16, md: 12 }, pb: 8,
      }}>
        <Box className="hero-grid" sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }} />
        
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          
          <Reveal>
            <Chip 
              icon={<Star sx={{ fontSize: '14px !important', color: '#fbbf24' }} />}
              label="Kathmandu's #1 Waste Management Platform" 
              sx={{ fontWeight: 700, bgcolor: T.white, color: T.ink, mb: 4, px: 1, py: 2.5, 
                border: `1px solid ${T.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }} 
            />
          </Reveal>

          <Reveal delay={100}>
            <Typography sx={{
              fontFamily: HEAD_FONT,
              fontSize: { xs: '3rem', sm: '4rem', md: '5rem' },
              fontWeight: 900, color: T.ink, lineHeight: 1.1,
              letterSpacing: -1.5, mb: 3,
            }}>
              Modern Waste Control <br />
              <Box component="span" sx={{ color: T.primary }}>Simplified.</Box>
            </Typography>
          </Reveal>

          <Reveal delay={200}>
            <Typography sx={{
              fontSize: { xs: '1.05rem', md: '1.2rem' },
              color: T.grey, lineHeight: 1.6, maxWidth: 650, mx: 'auto', mb: 6,
              fontWeight: 400
            }}>
              A unified, intelligent ecosystem connecting residents, collectors, and city administrators. Track pickups in real-time, pay seamlessly, and earn rewards for a cleaner tomorrow.
            </Typography>
          </Reveal>

          <Reveal delay={300}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" mb={8}>
              <Button variant="contained" size="large" onClick={() => navigate('/register')}
                sx={{
                  fontWeight: 700, bgcolor: T.ink, color: T.white,
                  px: 4, py: 2, borderRadius: 2.5, fontSize: '1.05rem', textTransform: 'none',
                  boxShadow: `0 12px 32px ${T.ink}30`,
                  '&:hover': { bgcolor: T.slate, transform: 'translateY(-2px)' },
                  transition: 'all 0.2s ease',
                }}>
                Start for Free
              </Button>
              <Button variant="outlined" size="large" onClick={() => scrollTo('how-it-works')}
                sx={{
                  fontWeight: 700, borderColor: T.border, color: T.ink, bgcolor: T.white,
                  px: 4, py: 2, borderRadius: 2.5, fontSize: '1.05rem', textTransform: 'none',
                  '&:hover': { bgcolor: T.surfaceAlt, borderColor: '#cbd5e1' },
                }}>
                Explore Platform
              </Button>
            </Stack>
          </Reveal>

        </Container>
      </Box>

      {/* ── METRICS ──────────────────────────────────────────── */}
      <Box sx={{ bgcolor: T.white, py: 6, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center">
            {[
              { value: 4800, suffix: '+', label: 'Active Households' },
              { value: 120,  suffix: '+', label: 'Verified Collectors' },
              { value: 98,   suffix: '%', label: 'On-Time Pickups' },
              { value: 52,   suffix: 'T', label: 'Tonnes Recycled' },
            ].map((stat, i) => (
              <Grid item xs={6} md={3} key={i}>
                <Reveal delay={i * 100}>
                  <Box sx={{ textAlign: 'center', position: 'relative' }}>
                    <Typography sx={{
                      fontFamily: HEAD_FONT, fontWeight: 800,
                      fontSize: { xs: '2.5rem', md: '3.2rem' },
                      color: T.ink, lineHeight: 1, mb: 1
                    }}>
                      <Counter target={stat.value} suffix={stat.suffix} />
                    </Typography>
                    <Typography sx={{ color: T.grey, fontSize: '0.9rem', fontWeight: 600 }}>
                      {stat.label}
                    </Typography>
                  </Box>
                </Reveal>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── FEATURES (ROLE BASED) ───────────────────────────── */}
      <Box id="features" sx={{ py: { xs: 10, md: 16 }, bgcolor: T.surface }}>
        <Container maxWidth="lg">
          <Reveal>
            <Box textAlign="center" mb={10}>
              <Typography sx={{ color: T.primary, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', mb: 2, fontSize: '0.85rem' }}>
                Unified Platform
              </Typography>
              <Typography sx={{ fontFamily: HEAD_FONT, fontWeight: 800, fontSize: { xs: '2.2rem', md: '3rem' }, color: T.ink, lineHeight: 1.2 }}>
                Built for every stakeholder
              </Typography>
            </Box>
          </Reveal>

          <Grid container spacing={4}>
            {[
              {
                icon: <AccountCircle sx={{ fontSize: 32 }} />,
                role: 'For Residents',
                color: T.primary,
                headline: 'Effortless Waste Disposal',
                points: ['Schedule instant or recurring pickups', 'Track collector arrival in real-time', 'Digital payments via Khalti / eSewa', 'Earn Eco-Coins for free service'],
              },
              {
                icon: <LocalShipping sx={{ fontSize: 32 }} />,
                role: 'For Collectors',
                color: '#2563eb', // Blue 600
                headline: 'Optimized Routing & Jobs',
                points: ['Live zone board for available pickups', 'One-tap job claiming & navigation', 'Digital status updates & proof', 'Performance & earning analytics'],
              },
              {
                icon: <AdminPanelSettings sx={{ fontSize: 32 }} />,
                role: 'For Administrators',
                color: '#7c3aed', // Violet 600
                headline: 'Complete Operational Control',
                points: ['High-level KPI & revenue dashboard', 'Generate automated PDF reports', 'Manage eco-volunteer programs', 'Manual assignment overrides'],
              },
            ].map((card, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Reveal delay={i * 150}>
                  <Paper elevation={0} sx={{
                    p: 5, borderRadius: 4, height: '100%', bgcolor: T.white,
                    border: `1px solid ${T.border}`,
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'translateY(-8px)', boxShadow: `0 24px 48px rgba(15,23,42,0.06)`, borderColor: `${card.color}40` },
                  }}>
                    <Box sx={{
                      width: 64, height: 64, borderRadius: 3, mb: 4,
                      bgcolor: `${card.color}15`, color: card.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {card.icon}
                    </Box>
                    <Typography sx={{ fontWeight: 700, color: card.color, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>
                      {card.role}
                    </Typography>
                    <Typography sx={{ fontFamily: HEAD_FONT, fontWeight: 800, fontSize: '1.4rem', color: T.ink, mb: 3, lineHeight: 1.3 }}>
                      {card.headline}
                    </Typography>
                    <Stack spacing={2}>
                      {card.points.map(p => (
                        <Stack key={p} direction="row" spacing={1.5} alignItems="flex-start">
                          <CheckCircle sx={{ fontSize: 18, color: T.border, mt: 0.1, flexShrink: 0 }} />
                          <Typography sx={{ fontSize: '0.95rem', color: T.slate, fontWeight: 500 }}>{p}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Paper>
                </Reveal>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <Box id="how-it-works" sx={{ py: { xs: 10, md: 16 }, bgcolor: T.white, borderTop: `1px solid ${T.border}` }}>
        <Container maxWidth="lg">
          <Reveal>
            <Box textAlign="center" mb={10}>
              <Typography sx={{ color: T.grey, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', mb: 2, fontSize: '0.85rem' }}>
                The Process
              </Typography>
              <Typography sx={{ fontFamily: HEAD_FONT, fontWeight: 800, fontSize: { xs: '2.2rem', md: '3rem' }, color: T.ink }}>
                How SWMS Works
              </Typography>
            </Box>
          </Reveal>

          <Grid container spacing={6}>
            {[
              { step: '01', title: 'Register & Setup', desc: 'Create your resident or collector profile. Set your zone for accurate routing.' },
              { step: '02', title: 'Request Pickup', desc: 'Residents submit requests. The system alerts collectors in the exact zone.' },
              { step: '03', title: 'Claim & Collect', desc: 'Collectors claim jobs, navigate to the address, and mark completion with weight.' },
              { step: '04', title: 'Earn Rewards', desc: 'Residents earn Eco-Coins through programs to unlock free service months.' },
            ].map((item, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Reveal delay={i * 100}>
                  <Box sx={{ position: 'relative' }}>
                    <Typography sx={{
                      fontFamily: HEAD_FONT, fontWeight: 900,
                      fontSize: '4rem', color: T.surfaceAlt,
                      lineHeight: 1, mb: 2,
                    }}>
                      {item.step}
                    </Typography>
                    <Typography sx={{ fontFamily: HEAD_FONT, fontWeight: 700, fontSize: '1.25rem', color: T.ink, mb: 1.5 }}>
                      {item.title}
                    </Typography>
                    <Typography sx={{ fontSize: '0.95rem', color: T.grey, lineHeight: 1.6, fontWeight: 500 }}>
                      {item.desc}
                    </Typography>
                  </Box>
                </Reveal>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── PRICING ──────────────────────────────────────────── */}
      <Box id="pricing" sx={{ py: { xs: 10, md: 16 }, bgcolor: T.surface, borderTop: `1px solid ${T.border}` }}>
        <Container maxWidth="lg">
          <Reveal>
            <Box textAlign="center" mb={10}>
              <Typography sx={{ color: T.primary, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', mb: 2, fontSize: '0.85rem' }}>
                Pricing
              </Typography>
              <Typography sx={{ fontFamily: HEAD_FONT, fontWeight: 800, fontSize: { xs: '2.2rem', md: '3rem' }, color: T.ink }}>
                Simple, transparent plans
              </Typography>
            </Box>
          </Reveal>

          <Grid container spacing={4} justifyContent="center">
            {[
              {
                name: 'Standard Resident',
                price: 'Rs. 1,000',
                period: '/ month',
                highlight: false,
                desc: 'Standard monthly fee for comprehensive waste management.',
                features: ['Unlimited scheduled pickups', 'Real-time tracking', 'Digital wallet payments', 'Access to Eco-Coin programs'],
              },
              {
                name: 'Eco-Volunteer',
                price: 'FREE',
                period: '/ with 1k coins',
                highlight: true,
                desc: 'Earn 100 coins per volunteer event. Reach 1,000 for a free month.',
                features: ['All Standard features', 'Community impact certificate', 'Priority scheduling status', 'Waived monthly fee'],
              },
            ].map((plan, i) => (
              <Grid item xs={12} md={5} key={i}>
                <Reveal delay={i * 150}>
                  <Paper elevation={0} sx={{
                    p: 6, borderRadius: 4, height: '100%',
                    bgcolor: plan.highlight ? T.ink : T.white,
                    border: plan.highlight ? 'none' : `1px solid ${T.border}`,
                    boxShadow: plan.highlight ? `0 24px 64px rgba(15,23,42,0.2)` : 'none',
                    position: 'relative', overflow: 'hidden'
                  }}>
                    {plan.highlight && (
                      <Box sx={{ position: 'absolute', top: 24, right: 24 }}>
                        <Chip label="Recommended" size="small" sx={{ bgcolor: T.primary, color: T.white, fontWeight: 700, borderRadius: 2 }} />
                      </Box>
                    )}
                    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 1, mb: 2, color: plan.highlight ? T.accent : T.grey }}>
                      {plan.name}
                    </Typography>
                    <Stack direction="row" alignItems="baseline" spacing={1} mb={2}>
                      <Typography sx={{ fontFamily: HEAD_FONT, fontWeight: 800, fontSize: '3rem', color: plan.highlight ? T.white : T.ink, lineHeight: 1 }}>
                        {plan.price}
                      </Typography>
                      <Typography sx={{ color: plan.highlight ? T.grey : T.grey, fontWeight: 500 }}>
                        {plan.period}
                      </Typography>
                    </Stack>
                    <Typography sx={{ fontSize: '0.95rem', color: plan.highlight ? '#94a3b8' : T.slate, mb: 4, fontWeight: 500 }}>
                      {plan.desc}
                    </Typography>
                    
                    <Stack spacing={2} mb={6}>
                      {plan.features.map(f => (
                        <Stack key={f} direction="row" spacing={1.5} alignItems="center">
                          <CheckCircle sx={{ fontSize: 18, color: plan.highlight ? T.primary : T.primary }} />
                          <Typography sx={{ fontSize: '0.95rem', color: plan.highlight ? T.white : T.ink, fontWeight: 500 }}>{f}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                    
                    <Button fullWidth variant={plan.highlight ? 'contained' : 'outlined'} size="large" onClick={() => navigate('/register')}
                      sx={{
                        fontWeight: 700, borderRadius: 2, py: 1.5, textTransform: 'none', fontSize: '1rem',
                        bgcolor: plan.highlight ? T.primary : 'transparent',
                        borderColor: plan.highlight ? 'transparent' : T.border,
                        color: plan.highlight ? T.white : T.ink,
                        '&:hover': { bgcolor: plan.highlight ? T.primaryDk : T.surfaceAlt },
                        boxShadow: 'none'
                      }}>
                      {plan.highlight ? 'Start Earning Coins' : 'Choose Standard'}
                    </Button>
                  </Paper>
                </Reveal>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <Box id="faq" sx={{ py: { xs: 10, md: 16 }, bgcolor: T.white }}>
        <Container maxWidth="md">
          <Reveal>
            <Box textAlign="center" mb={8}>
              <Typography sx={{ fontFamily: HEAD_FONT, fontWeight: 800, fontSize: { xs: '2.2rem', md: '3rem' }, color: T.ink }}>
                Frequently Asked Questions
              </Typography>
            </Box>
          </Reveal>
          
          <Box sx={{ borderTop: `1px solid ${T.border}` }}>
            {[
              { q: 'How does the payment system work?', a: 'You can easily pay your Rs. 1,000 monthly fee through our integrated Khalti or eSewa payment gateways directly from your Resident Dashboard.' },
              { q: 'What is the Eco-Coin system?', a: 'Eco-Coins reward community participation. By volunteering in registered cleanup programs, you earn 100 coins per event. Collecting 1,000 coins automatically waives your next monthly fee.' },
              { q: 'How do collectors know where to go?', a: 'Collectors access a real-time Zone Board. They can claim pending requests in their assigned zone, giving them direct access to your address and request details.' },
              { q: 'Is the platform secure?', a: 'Yes. We use industry-standard JWT authentication and Role-Based Access Control. Payment data is never stored on our servers; everything is handled securely via Khalti/eSewa.' },
            ].map((faq, i) => (
              <Reveal key={i} delay={i * 50}>
                <Accordion elevation={0} disableGutters sx={{ 
                  borderBottom: `1px solid ${T.border}`, bgcolor: 'transparent',
                  '&:before': { display: 'none' } 
                }}>
                  <AccordionSummary expandIcon={<ExpandMore sx={{ color: T.ink }} />} sx={{ px: 0, py: 2 }}>
                    <Typography sx={{ fontFamily: HEAD_FONT, fontWeight: 600, color: T.ink, fontSize: '1.1rem' }}>{faq.q}</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 0, pt: 0, pb: 3 }}>
                    <Typography sx={{ color: T.slate, lineHeight: 1.7, fontSize: '1rem', fontWeight: 400 }}>{faq.a}</Typography>
                  </AccordionDetails>
                </Accordion>
              </Reveal>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ── CTA FOOTER ───────────────────────────────────────── */}
      <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: T.ink, color: T.white, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Reveal>
            <Typography sx={{ fontFamily: HEAD_FONT, fontWeight: 800, fontSize: { xs: '2rem', md: '2.5rem' }, mb: 2 }}>
              Ready to modernize your waste management?
            </Typography>
            <Typography sx={{ color: T.grey, fontSize: '1.1rem', mb: 5, fontWeight: 400 }}>
              Join thousands of residents and collectors on the SWMS platform today.
            </Typography>
            <Button variant="contained" size="large" onClick={() => navigate('/register')}
              sx={{ fontWeight: 700, bgcolor: T.primary, color: T.white, px: 5, py: 1.8, borderRadius: 2, fontSize: '1.05rem', textTransform: 'none', '&:hover': { bgcolor: T.primaryDk } }}>
              Create Your Free Account
            </Button>
          </Reveal>
        </Container>
      </Box>
      
      {/* ── COPYRIGHT ────────────────────────────────────────── */}
      <Box sx={{ py: 3, bgcolor: '#0b1120', textAlign: 'center' }}>
        <Typography sx={{ fontSize: '0.85rem', color: T.grey, fontWeight: 500 }}>
          © {new Date().getFullYear()} SWMS · Kathmandu, Nepal · Built with MERN Stack
        </Typography>
      </Box>

    </Box>
  );
};

export default LandingPage;