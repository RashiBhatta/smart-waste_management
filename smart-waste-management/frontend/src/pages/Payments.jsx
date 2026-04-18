// // import React, { useState, useEffect } from 'react';
// // import {
// //   Box,
// //   Container,
// //   Paper,
// //   Typography,
// //   Grid,
// //   Card,
// //   CardContent,
// //   Button,
// //   Chip,
// //   Table,
// //   TableBody,
// //   TableCell,
// //   TableContainer,
// //   TableHead,
// //   TableRow,
// //   Dialog,
// //   DialogTitle,
// //   DialogContent,
// //   DialogActions,
// //   TextField,
// //   FormControl,
// //   InputLabel,
// //   Select,
// //   MenuItem,
// //   Alert,
// //   Stepper,
// //   Step,
// //   StepLabel,
// //   Divider,
// //   IconButton,
// //   Avatar,
// //   useTheme,
// //   LinearProgress,
// //   InputAdornment,
// //   Tab,
// //   Tabs,
// //   Tooltip,
// //   Snackbar
// // } from '@mui/material';
// // import {
// //   ArrowBack as ArrowBackIcon,
// //   Payment as PaymentIcon,
// //   CreditCard as CreditCardIcon,
// //   AccountBalance as AccountBalanceIcon,
// //   Receipt as ReceiptIcon,
// //   CheckCircle as CheckCircleIcon,
// //   Warning as WarningIcon,
// //   History as HistoryIcon,
// //   GetApp as DownloadIcon,
// //   Star as StarIcon,
// //   Info as InfoIcon,
// //   CalendarToday as CalendarIcon,
// //   Print as PrintIcon,
// //   Email as EmailIcon,
// //   Share as ShareIcon,
// //   Visibility as VisibilityIcon,
// //   QrCode as QrCodeIcon,
// //   AccountBalanceWallet as AccountBalanceWalletIcon
// // } from '@mui/icons-material';
// // import { useNavigate } from 'react-router-dom';
// // import { useAuth } from '../context/AuthContext';
// // import api from '../services/api';
// // import { toast } from 'react-toastify';
// // import { format, formatDistanceToNow } from 'date-fns';

// // // QR Code component (simplified - in production you'd use a proper QR library)
// // const QRCode = ({ value }) => (
// //   <Box
// //     sx={{
// //       width: 200,
// //       height: 200,
// //       bgcolor: '#f5f5f5',
// //       display: 'flex',
// //       alignItems: 'center',
// //       justifyContent: 'center',
// //       border: '2px solid #ccc',
// //       borderRadius: 2,
// //       mx: 'auto',
// //       my: 2
// //     }}
// //   >
// //     <Typography variant="caption" color="textSecondary">
// //       QR Code: {value}
// //     </Typography>
// //   </Box>
// // );

// // const steps = ['Select Amount', 'Payment Method', 'Confirm'];

// // const paymentMethods = [
// //   { 
// //     value: 'card', 
// //     label: 'Credit/Debit Card', 
// //     icon: <CreditCardIcon />, 
// //     description: 'Pay securely with your card',
// //     processingFee: '2%'
// //   },
// //   { 
// //     value: 'bank_transfer', 
// //     label: 'Bank Transfer', 
// //     icon: <AccountBalanceIcon />, 
// //     description: 'Direct bank transfer',
// //     processingFee: '0%',
// //     time: '1-2 business days'
// //   },
// //   { 
// //     value: 'coins', 
// //     label: 'Pay with Coins', 
// //     icon: <StarIcon />, 
// //     description: 'Use your earned coins (100 coins = ₹1)',
// //     processingFee: '0%',
// //     instant: true
// //   },
// //   { 
// //     value: 'wallet', 
// //     label: 'Digital Wallet', 
// //     icon: <AccountBalanceWalletIcon />, 
// //     description: 'Pay using UPI, Paytm, Google Pay',
// //     processingFee: '1.5%',
// //     instant: true
// //   }
// // ];

// // const paymentTypes = [
// //   { value: 'monthly_fee', label: 'Monthly Service Fee', amount: 350, description: 'Regular monthly collection service' },
// //   { value: 'annual', label: 'Annual Subscription', amount: 3800, description: 'Save 10% with annual payment' },
// //   { value: 'custom', label: 'Custom Amount', amount: null, description: 'Pay any amount you wish' }
// // ];

// // const Payments = () => {
// //   const theme = useTheme();
// //   const navigate = useNavigate();
// //   const { user, updateUser } = useAuth();
  
// //   const [payments, setPayments] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [openDialog, setOpenDialog] = useState(false);
// //   const [openReceiptDialog, setOpenReceiptDialog] = useState(false);
// //   const [activeStep, setActiveStep] = useState(0);
// //   const [selectedType, setSelectedType] = useState('monthly_fee');
// //   const [selectedPayment, setSelectedPayment] = useState(null);
// //   const [tabValue, setTabValue] = useState(0);
// //   const [paymentDetails, setPaymentDetails] = useState({
// //     amount: 350,
// //     method: 'card',
// //     type: 'monthly_fee',
// //     description: 'Monthly Service Fee'
// //   });
// //   const [stats, setStats] = useState({
// //     totalPaid: 0,
// //     pendingPayments: 0,
// //     lastPayment: null,
// //     freeMonths: user?.freeServiceMonths || 0,
// //     coinValue: 0,
// //     monthlyFeeStatus: {
// //       paid: false,
// //       dueDate: null
// //     }
// //   });
// //   const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

// //   useEffect(() => {
// //     fetchPayments();
// //     checkMonthlyFeeStatus();
// //   }, []);

// //   useEffect(() => {
// //     calculateStats();
// //   }, [payments, user]);

// //   const fetchPayments = async () => {
// //     try {
// //       setLoading(true);
// //       const response = await api.get('/payments/history');
// //       setPayments(response.data.payments || []);
// //     } catch (error) {
// //       toast.error('Failed to fetch payment history');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const checkMonthlyFeeStatus = async () => {
// //     try {
// //       const response = await api.get('/payments/monthly-fee/status');
// //       setStats(prev => ({
// //         ...prev,
// //         monthlyFeeStatus: response.data.status
// //       }));
// //     } catch (error) {
// //       console.error('Error checking monthly fee status:', error);
// //     }
// //   };

// //   const calculateStats = () => {
// //     const completed = payments.filter(p => p.status === 'completed');
// //     const total = completed.reduce((sum, p) => sum + p.amount, 0);
// //     const pending = payments.filter(p => p.status === 'pending').length;
// //     const last = payments.length > 0 ? payments[0] : null;
// //     const coinValue = (user?.coins || 0) / 100;

// //     setStats(prev => ({
// //       ...prev,
// //       totalPaid: total,
// //       pendingPayments: pending,
// //       lastPayment: last,
// //       freeMonths: user?.freeServiceMonths || 0,
// //       coinValue
// //     }));
// //   };

// //   const handleProcessPayment = async () => {
// //     try {
// //       const response = await api.post('/payments/process', {
// //         amount: paymentDetails.amount,
// //         type: paymentDetails.type,
// //         paymentMethod: paymentDetails.method,
// //         description: paymentDetails.description,
// //         metadata: {
// //           month: new Date().getMonth() + 1,
// //           year: new Date().getFullYear()
// //         }
// //       });
      
// //       if (response.data.freeServiceUsed) {
// //         setSnackbar({
// //           open: true,
// //           message: 'Payment processed using free service!',
// //           severity: 'success'
// //         });
// //         updateUser({ freeServiceMonths: response.data.remainingFreeMonths });
// //       } else {
// //         setSnackbar({
// //           open: true,
// //           message: 'Payment successful!',
// //           severity: 'success'
// //         });
// //         if (paymentDetails.method === 'coins') {
// //           updateUser({ coins: user.coins - (paymentDetails.amount * 100) });
// //         }
// //       }
      
// //       setOpenDialog(false);
// //       fetchPayments();
// //       checkMonthlyFeeStatus();
// //       resetPaymentForm();
// //     } catch (error) {
// //       setSnackbar({
// //         open: true,
// //         message: error.response?.data?.message || 'Payment failed',
// //         severity: 'error'
// //       });
// //     }
// //   };

// //   const resetPaymentForm = () => {
// //     setActiveStep(0);
// //     setPaymentDetails({
// //       amount: 350,
// //       method: 'card',
// //       type: 'monthly_fee',
// //       description: 'Monthly Service Fee'
// //     });
// //     setSelectedType('monthly_fee');
// //   };

// //   const handleNext = () => {
// //     setActiveStep((prev) => prev + 1);
// //   };

// //   const handleBack = () => {
// //     setActiveStep((prev) => prev - 1);
// //   };

// //   const handleTypeChange = (type) => {
// //     setSelectedType(type);
// //     const selected = paymentTypes.find(t => t.value === type);
// //     setPaymentDetails({
// //       ...paymentDetails,
// //       type,
// //       amount: selected?.amount || 0,
// //       description: selected?.label || ''
// //     });
// //   };

// //   const handleDownloadReceipt = async (paymentId) => {
// //     try {
// //       const response = await api.get(`/payments/${paymentId}/invoice`, {
// //         responseType: 'blob'
// //       });
      
// //       const url = window.URL.createObjectURL(new Blob([response.data]));
// //       const link = document.createElement('a');
// //       link.href = url;
// //       link.setAttribute('download', `invoice-${paymentId}.pdf`);
// //       document.body.appendChild(link);
// //       link.click();
      
// //       setSnackbar({
// //         open: true,
// //         message: 'Receipt downloaded successfully',
// //         severity: 'success'
// //       });
// //     } catch (error) {
// //       setSnackbar({
// //         open: true,
// //         message: 'Failed to download receipt',
// //         severity: 'error'
// //       });
// //     }
// //   };

// //   const handleTabChange = (event, newValue) => {
// //     setTabValue(newValue);
// //   };

// //   const canUseCoins = (user?.coins || 0) >= (paymentDetails.amount * 100);
// //   const isMonthlyFeeDue = !stats.monthlyFeeStatus?.paid && user?.freeServiceMonths === 0;

// //   return (
// //     <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
// //       {/* Header */}
// //       <Box
// //         sx={{
// //           background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
// //           color: 'white',
// //           py: 4,
// //           mb: 4
// //         }}
// //       >
// //         <Container maxWidth="lg">
// //           <Box sx={{ display: 'flex', alignItems: 'center' }}>
// //             <IconButton
// //               color="inherit"
// //               onClick={() => navigate(-1)}
// //               sx={{ mr: 2 }}
// //             >
// //               <ArrowBackIcon />
// //             </IconButton>
// //             <Typography variant="h4" fontWeight="700">
// //               Payments & Billing
// //             </Typography>
// //           </Box>
// //         </Container>
// //       </Box>

// //       <Container maxWidth="lg">
// //         {/* Alert for due payment */}
// //         {isMonthlyFeeDue && (
// //           <Alert 
// //             severity="warning" 
// //             sx={{ mb: 3, borderRadius: 2 }}
// //             action={
// //               <Button color="inherit" size="small" onClick={() => setOpenDialog(true)}>
// //                 Pay Now
// //               </Button>
// //             }
// //           >
// //             Your monthly fee of ₹{stats.monthlyFeeStatus?.amount || 350} is due. 
// //             Please pay to continue using the service.
// //           </Alert>
// //         )}

// //         <Grid container spacing={3}>
// //           {/* Left Column - Stats & Info */}
// //           <Grid item xs={12} md={4}>
// //             {/* Balance Card */}
// //             <Card sx={{ mb: 3, borderRadius: 3 }}>
// //               <CardContent>
// //                 <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
// //                   <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2, width: 48, height: 48 }}>
// //                     <AccountBalanceIcon />
// //                   </Avatar>
// //                   <Typography variant="h6" fontWeight="600">
// //                     Total Spent
// //                   </Typography>
// //                 </Box>
// //                 <Typography variant="h3" color="primary" fontWeight="700" gutterBottom>
// //                   ₹{stats.totalPaid.toLocaleString()}
// //                 </Typography>
// //                 <Typography variant="body2" color="textSecondary">
// //                   Lifetime payments
// //                 </Typography>
// //               </CardContent>
// //             </Card>

// //             {/* Coins Card */}
// //             <Card sx={{ mb: 3, borderRadius: 3 }}>
// //               <CardContent>
// //                 <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
// //                   <Avatar sx={{ bgcolor: theme.palette.warning.main, mr: 2, width: 48, height: 48 }}>
// //                     <StarIcon />
// //                   </Avatar>
// //                   <Box>
// //                     <Typography variant="h6" fontWeight="600">
// //                       Coin Balance
// //                     </Typography>
// //                   </Box>
// //                 </Box>
// //                 <Typography variant="h3" color="warning.main" fontWeight="700" gutterBottom>
// //                   {user?.coins || 0}
// //                 </Typography>
// //                 <Typography variant="body2" color="textSecondary">
// //                   ≈ ₹{stats.coinValue.toFixed(2)} value (100 coins = ₹1)
// //                 </Typography>
// //                 <LinearProgress
// //                   variant="determinate"
// //                   value={(user?.coins || 0) / 10}
// //                   sx={{ mt: 2, height: 8, borderRadius: 4 }}
// //                 />
// //               </CardContent>
// //             </Card>

// //             {/* Free Service Card */}
// //             {stats.freeMonths > 0 && (
// //               <Card sx={{ mb: 3, borderRadius: 3, bgcolor: theme.palette.success.light }}>
// //                 <CardContent>
// //                   <Box sx={{ display: 'flex', alignItems: 'center' }}>
// //                     <CheckCircleIcon sx={{ fontSize: 40, color: 'white', mr: 2 }} />
// //                     <Box>
// //                       <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
// //                         Free Service Active
// //                       </Typography>
// //                       <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
// //                         {stats.freeMonths} month{stats.freeMonths > 1 ? 's' : ''} remaining
// //                       </Typography>
// //                     </Box>
// //                   </Box>
// //                 </CardContent>
// //               </Card>
// //             )}

// //             {/* Monthly Fee Status */}
// //             <Card sx={{ mb: 3, borderRadius: 3 }}>
// //               <CardContent>
// //                 <Typography variant="h6" fontWeight="600" gutterBottom>
// //                   Monthly Fee Status
// //                 </Typography>
// //                 <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
// //                   <Box>
// //                     <Typography variant="body2" color="textSecondary">
// //                       Current Month
// //                     </Typography>
// //                     <Typography variant="h5" fontWeight="600">
// //                       {stats.monthlyFeeStatus?.paid ? 'Paid' : 'Due'}
// //                     </Typography>
// //                   </Box>
// //                   <Chip
// //                     label={stats.monthlyFeeStatus?.paid ? 'Paid' : 'Due'}
// //                     color={stats.monthlyFeeStatus?.paid ? 'success' : 'warning'}
// //                   />
// //                 </Box>
// //                 {stats.monthlyFeeStatus?.dueDate && (
// //                   <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
// //                     Due by: {format(new Date(stats.monthlyFeeStatus.dueDate), 'PPP')}
// //                   </Typography>
// //                 )}
// //               </CardContent>
// //             </Card>

// //             {/* Quick Actions */}
// //             <Card sx={{ borderRadius: 3 }}>
// //               <CardContent>
// //                 <Typography variant="h6" fontWeight="600" gutterBottom>
// //                   Quick Actions
// //                 </Typography>
// //                 <Button
// //                   fullWidth
// //                   variant="contained"
// //                   startIcon={<PaymentIcon />}
// //                   onClick={() => setOpenDialog(true)}
// //                   sx={{ mb: 1, py: 1.5, borderRadius: 2 }}
// //                 >
// //                   Make a Payment
// //                 </Button>
// //                 <Button
// //                   fullWidth
// //                   variant="outlined"
// //                   startIcon={<HistoryIcon />}
// //                   onClick={() => setTabValue(0)}
// //                   sx={{ py: 1.5, borderRadius: 2 }}
// //                 >
// //                   View History
// //                 </Button>
// //               </CardContent>
// //             </Card>
// //           </Grid>

// //           {/* Right Column - Payment History */}
// //           <Grid item xs={12} md={8}>
// //             <Paper sx={{ p: 3, borderRadius: 3 }}>
// //               <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
// //                 <Tabs value={tabValue} onChange={handleTabChange}>
// //                   <Tab label="Payment History" />
// //                   <Tab label="Invoices" />
// //                   <Tab label="Payment Methods" />
// //                 </Tabs>
// //               </Box>

// //               {/* Payment History Tab */}
// //               {tabValue === 0 && (
// //                 <>
// //                   <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
// //                     <Typography variant="h6" fontWeight="600">
// //                       <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
// //                       Payment History
// //                     </Typography>
// //                     {payments.length > 0 && (
// //                       <Chip
// //                         label={`${payments.length} transactions`}
// //                         size="small"
// //                         color="primary"
// //                       />
// //                     )}
// //                   </Box>

// //                   {loading ? (
// //                     <LinearProgress />
// //                   ) : (
// //                     <TableContainer>
// //                       <Table>
// //                         <TableHead>
// //                           <TableRow>
// //                             <TableCell>Date</TableCell>
// //                             <TableCell>Description</TableCell>
// //                             <TableCell align="right">Amount</TableCell>
// //                             <TableCell>Method</TableCell>
// //                             <TableCell align="center">Status</TableCell>
// //                             <TableCell align="center">Receipt</TableCell>
// //                           </TableRow>
// //                         </TableHead>
// //                         <TableBody>
// //                           {payments.map((payment) => (
// //                             <TableRow key={payment._id} hover>
// //                               <TableCell>
// //                                 <Typography variant="body2">
// //                                   {format(new Date(payment.createdAt), 'MMM dd, yyyy')}
// //                                 </Typography>
// //                                 <Typography variant="caption" color="textSecondary">
// //                                   {format(new Date(payment.createdAt), 'hh:mm a')}
// //                                 </Typography>
// //                               </TableCell>
// //                               <TableCell>
// //                                 <Typography variant="body2" fontWeight="500">
// //                                   {payment.description || payment.type.replace('_', ' ')}
// //                                 </Typography>
// //                                 {payment.transactionId && (
// //                                   <Typography variant="caption" color="textSecondary">
// //                                     ID: {payment.transactionId.slice(-8)}
// //                                   </Typography>
// //                                 )}
// //                               </TableCell>
// //                               <TableCell align="right">
// //                                 <Typography
// //                                   variant="body1"
// //                                   fontWeight="600"
// //                                   color={payment.type === 'reward' ? 'success.main' : 'inherit'}
// //                                 >
// //                                   {payment.type === 'reward' ? '+' : '-'}₹{payment.amount}
// //                                 </Typography>
// //                               </TableCell>
// //                               <TableCell>
// //                                 <Chip
// //                                   icon={paymentMethods.find(m => m.value === payment.paymentMethod)?.icon}
// //                                   label={payment.paymentMethod?.replace('_', ' ')}
// //                                   size="small"
// //                                   variant="outlined"
// //                                   sx={{ fontWeight: 500 }}
// //                                 />
// //                               </TableCell>
// //                               <TableCell align="center">
// //                                 <Chip
// //                                   label={payment.status}
// //                                   size="small"
// //                                   color={
// //                                     payment.status === 'completed' ? 'success' :
// //                                     payment.status === 'pending' ? 'warning' : 'error'
// //                                   }
// //                                   sx={{ fontWeight: 500 }}
// //                                 />
// //                               </TableCell>
// //                               <TableCell align="center">
// //                                 <Tooltip title="View Receipt">
// //                                   <IconButton 
// //                                     size="small" 
// //                                     color="primary"
// //                                     onClick={() => {
// //                                       setSelectedPayment(payment);
// //                                       setOpenReceiptDialog(true);
// //                                     }}
// //                                   >
// //                                     <ReceiptIcon fontSize="small" />
// //                                   </IconButton>
// //                                 </Tooltip>
// //                                 <Tooltip title="Download">
// //                                   <IconButton 
// //                                     size="small" 
// //                                     color="primary"
// //                                     onClick={() => handleDownloadReceipt(payment._id)}
// //                                   >
// //                                     <DownloadIcon fontSize="small" />
// //                                   </IconButton>
// //                                 </Tooltip>
// //                               </TableCell>
// //                             </TableRow>
// //                           ))}

// //                           {payments.length === 0 && (
// //                             <TableRow>
// //                               <TableCell colSpan={6} align="center">
// //                                 <Box sx={{ py: 4 }}>
// //                                   <PaymentIcon sx={{ fontSize: 48, color: theme.palette.grey[400], mb: 2 }} />
// //                                   <Typography variant="body1" color="textSecondary" gutterBottom>
// //                                     No payment history found
// //                                   </Typography>
// //                                   <Typography variant="body2" color="textSecondary">
// //                                     Your payments will appear here once you make your first payment.
// //                                   </Typography>
// //                                 </Box>
// //                               </TableCell>
// //                             </TableRow>
// //                           )}
// //                         </TableBody>
// //                       </Table>
// //                     </TableContainer>
// //                   )}
// //                 </>
// //               )}

// //               {/* Invoices Tab */}
// //               {tabValue === 1 && (
// //                 <Box sx={{ py: 2 }}>
// //                   <Typography variant="body1" color="textSecondary" align="center">
// //                     Your invoices will appear here. You can download them from the payment history.
// //                   </Typography>
// //                 </Box>
// //               )}

// //               {/* Payment Methods Tab */}
// //               {tabValue === 2 && (
// //                 <Grid container spacing={2} sx={{ py: 2 }}>
// //                   {paymentMethods.map((method) => (
// //                     <Grid item xs={12} key={method.value}>
// //                       <Card variant="outlined">
// //                         <CardContent>
// //                           <Box sx={{ display: 'flex', alignItems: 'center' }}>
// //                             <Avatar sx={{ bgcolor: theme.palette.primary.light, mr: 2 }}>
// //                               {method.icon}
// //                             </Avatar>
// //                             <Box sx={{ flex: 1 }}>
// //                               <Typography variant="subtitle1" fontWeight="600">
// //                                 {method.label}
// //                               </Typography>
// //                               <Typography variant="caption" color="textSecondary">
// //                                 {method.description}
// //                               </Typography>
// //                               {method.processingFee && (
// //                                 <Typography variant="caption" color="textSecondary" display="block">
// //                                   Processing fee: {method.processingFee}
// //                                 </Typography>
// //                               )}
// //                             </Box>
// //                             <Chip
// //                               label={method.instant ? 'Instant' : 'Standard'}
// //                               size="small"
// //                               color={method.instant ? 'success' : 'default'}
// //                             />
// //                           </Box>
// //                         </CardContent>
// //                       </Card>
// //                     </Grid>
// //                   ))}
// //                 </Grid>
// //               )}
// //             </Paper>
// //           </Grid>
// //         </Grid>
// //       </Container>

// //       {/* Payment Dialog */}
// //       <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
// //         <DialogTitle>
// //           <Box sx={{ display: 'flex', alignItems: 'center' }}>
// //             <PaymentIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
// //             Make a Payment
// //           </Box>
// //         </DialogTitle>
// //         <DialogContent>
// //           <Stepper activeStep={activeStep} sx={{ my: 3 }}>
// //             {steps.map((label) => (
// //               <Step key={label}>
// //                 <StepLabel>{label}</StepLabel>
// //               </Step>
// //             ))}
// //           </Stepper>

// //           {activeStep === 0 && (
// //             <Grid container spacing={2}>
// //               <Grid item xs={12}>
// //                 <FormControl fullWidth>
// //                   <InputLabel>Payment Type</InputLabel>
// //                   <Select
// //                     value={selectedType}
// //                     onChange={(e) => handleTypeChange(e.target.value)}
// //                     label="Payment Type"
// //                   >
// //                     {paymentTypes.map((type) => (
// //                       <MenuItem key={type.value} value={type.value}>
// //                         <Box>
// //                           <Typography variant="body1">{type.label}</Typography>
// //                           {type.amount && (
// //                             <Typography variant="caption" color="textSecondary">
// //                               ₹{type.amount}
// //                             </Typography>
// //                           )}
// //                         </Box>
// //                       </MenuItem>
// //                     ))}
// //                   </Select>
// //                 </FormControl>
// //               </Grid>
              
// //               {selectedType === 'custom' && (
// //                 <Grid item xs={12}>
// //                   <TextField
// //                     fullWidth
// //                     label="Amount"
// //                     type="number"
// //                     value={paymentDetails.amount}
// //                     onChange={(e) => setPaymentDetails({ ...paymentDetails, amount: parseFloat(e.target.value) || 0 })}
// //                     InputProps={{
// //                       startAdornment: <InputAdornment position="start">₹</InputAdornment>
// //                     }}
// //                   />
// //                 </Grid>
// //               )}

// //               <Grid item xs={12}>
// //                 <TextField
// //                   fullWidth
// //                   label="Description (Optional)"
// //                   value={paymentDetails.description}
// //                   onChange={(e) => setPaymentDetails({ ...paymentDetails, description: e.target.value })}
// //                   placeholder="What is this payment for?"
// //                 />
// //               </Grid>

// //               <Grid item xs={12}>
// //                 <Alert severity="info" icon={<InfoIcon />}>
// //                   <Typography variant="body2">
// //                     <strong>Monthly fee:</strong> ₹350<br />
// //                     <strong>Annual subscription:</strong> ₹3800 (save ₹400)
// //                   </Typography>
// //                 </Alert>
// //               </Grid>
// //             </Grid>
// //           )}

// //           {activeStep === 1 && (
// //             <Grid container spacing={2}>
// //               {paymentMethods.map((method) => (
// //                 <Grid item xs={12} key={method.value}>
// //                   <Card
// //                     sx={{
// //                       cursor: 'pointer',
// //                       border: paymentDetails.method === method.value ? `2px solid ${theme.palette.primary.main}` : '1px solid #e0e0e0',
// //                       '&:hover': { boxShadow: theme.shadows[4] },
// //                       transition: 'all 0.2s'
// //                     }}
// //                     onClick={() => setPaymentDetails({ ...paymentDetails, method: method.value })}
// //                   >
// //                     <CardContent>
// //                       <Box sx={{ display: 'flex', alignItems: 'center' }}>
// //                         <Avatar sx={{ bgcolor: theme.palette.primary.light, mr: 2, width: 48, height: 48 }}>
// //                           {method.icon}
// //                         </Avatar>
// //                         <Box sx={{ flex: 1 }}>
// //                           <Typography variant="subtitle1" fontWeight="600">
// //                             {method.label}
// //                           </Typography>
// //                           <Typography variant="caption" color="textSecondary">
// //                             {method.description}
// //                           </Typography>
// //                         </Box>
// //                         {paymentDetails.method === method.value && (
// //                           <CheckCircleIcon color="success" sx={{ ml: 2 }} />
// //                         )}
// //                       </Box>
// //                       {method.value === 'coins' && (
// //                         <Box sx={{ mt: 2 }}>
// //                           <Typography variant="body2">
// //                             Your balance: <strong>{user?.coins} coins</strong> (₹{stats.coinValue.toFixed(2)})
// //                           </Typography>
// //                           {!canUseCoins && (
// //                             <Typography variant="caption" color="error">
// //                               Insufficient coins. Need {(paymentDetails.amount * 100) - (user?.coins || 0)} more coins.
// //                             </Typography>
// //                           )}
// //                         </Box>
// //                       )}
// //                     </CardContent>
// //                   </Card>
// //                 </Grid>
// //               ))}
// //             </Grid>
// //           )}

// //           {activeStep === 2 && (
// //             <Box>
// //               <Typography variant="h6" gutterBottom fontWeight="600">
// //                 Payment Summary
// //               </Typography>
              
// //               <Paper variant="outlined" sx={{ p: 3, mb: 2, bgcolor: theme.palette.grey[50] }}>
// //                 <Grid container spacing={2}>
// //                   <Grid item xs={6}>
// //                     <Typography variant="body2" color="textSecondary">
// //                       Amount
// //                     </Typography>
// //                   </Grid>
// //                   <Grid item xs={6}>
// //                     <Typography variant="body1" align="right" fontWeight="600">
// //                       ₹{paymentDetails.amount}
// //                     </Typography>
// //                   </Grid>
                  
// //                   <Grid item xs={6}>
// //                     <Typography variant="body2" color="textSecondary">
// //                       Payment Method
// //                     </Typography>
// //                   </Grid>
// //                   <Grid item xs={6}>
// //                     <Typography variant="body1" align="right" fontWeight="500">
// //                       {paymentMethods.find(m => m.value === paymentDetails.method)?.label}
// //                     </Typography>
// //                   </Grid>
                  
// //                   <Grid item xs={6}>
// //                     <Typography variant="body2" color="textSecondary">
// //                       Type
// //                     </Typography>
// //                   </Grid>
// //                   <Grid item xs={6}>
// //                     <Typography variant="body1" align="right" fontWeight="500">
// //                       {paymentTypes.find(t => t.value === paymentDetails.type)?.label}
// //                     </Typography>
// //                   </Grid>
                  
// //                   {paymentDetails.method === 'coins' && (
// //                     <>
// //                       <Grid item xs={6}>
// //                         <Typography variant="body2" color="textSecondary">
// //                           Coins to deduct
// //                         </Typography>
// //                       </Grid>
// //                       <Grid item xs={6}>
// //                         <Typography variant="body1" align="right" fontWeight="600" color="warning.main">
// //                           {paymentDetails.amount * 100} coins
// //                         </Typography>
// //                       </Grid>
// //                     </>
// //                   )}
                  
// //                   <Grid item xs={12}>
// //                     <Divider sx={{ my: 1 }} />
// //                   </Grid>
                  
// //                   <Grid item xs={6}>
// //                     <Typography variant="subtitle1" fontWeight="600">
// //                       Total
// //                     </Typography>
// //                   </Grid>
// //                   <Grid item xs={6}>
// //                     <Typography variant="h5" align="right" color="primary" fontWeight="700">
// //                       ₹{paymentDetails.amount}
// //                     </Typography>
// //                   </Grid>
// //                 </Grid>
// //               </Paper>

// //               {stats.freeMonths > 0 && paymentDetails.type === 'monthly_fee' && (
// //                 <Alert severity="success" icon={<StarIcon />} sx={{ mb: 2 }}>
// //                   You have {stats.freeMonths} free month(s) available. This payment can be covered by your free service.
// //                 </Alert>
// //               )}

// //               {paymentDetails.method === 'coins' && !canUseCoins && (
// //                 <Alert severity="error" sx={{ mb: 2 }}>
// //                   Insufficient coins. Please choose another payment method.
// //                 </Alert>
// //               )}

// //               <Alert severity="info">
// //                 By confirming this payment, you agree to our terms and conditions.
// //               </Alert>
// //             </Box>
// //           )}
// //         </DialogContent>
// //         <DialogActions sx={{ p: 3 }}>
// //           <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
// //           {activeStep > 0 && (
// //             <Button onClick={handleBack}>Back</Button>
// //           )}
// //           {activeStep < steps.length - 1 ? (
// //             <Button
// //               onClick={handleNext}
// //               variant="contained"
// //               disabled={
// //                 (activeStep === 0 && !paymentDetails.amount) ||
// //                 (activeStep === 1 && !paymentDetails.method)
// //               }
// //             >
// //               Next
// //             </Button>
// //           ) : (
// //             <Button
// //               onClick={handleProcessPayment}
// //               variant="contained"
// //               color="primary"
// //               disabled={paymentDetails.method === 'coins' && !canUseCoins}
// //               size="large"
// //             >
// //               Pay ₹{paymentDetails.amount}
// //             </Button>
// //           )}
// //         </DialogActions>
// //       </Dialog>

// //       {/* Receipt Dialog */}
// //       <Dialog open={openReceiptDialog} onClose={() => setOpenReceiptDialog(false)} maxWidth="sm" fullWidth>
// //         <DialogTitle>
// //           <Box sx={{ display: 'flex', alignItems: 'center' }}>
// //             <ReceiptIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
// //             Payment Receipt
// //           </Box>
// //         </DialogTitle>
// //         <DialogContent dividers>
// //           {selectedPayment && (
// //             <Box>
// //               <Box sx={{ textAlign: 'center', mb: 3 }}>
// //                 <Typography variant="h5" gutterBottom>
// //                   Smart Waste Management
// //                 </Typography>
// //                 <Typography variant="body2" color="textSecondary">
// //                   Payment Receipt
// //                 </Typography>
// //               </Box>

// //               <QRCode value={`PAYMENT-${selectedPayment.transactionId}`} />

// //               <Grid container spacing={2} sx={{ mt: 2 }}>
// //                 <Grid item xs={6}>
// //                   <Typography variant="body2" color="textSecondary">
// //                     Transaction ID
// //                   </Typography>
// //                 </Grid>
// //                 <Grid item xs={6}>
// //                   <Typography variant="body2" fontWeight="500">
// //                     {selectedPayment.transactionId}
// //                   </Typography>
// //                 </Grid>

// //                 <Grid item xs={6}>
// //                   <Typography variant="body2" color="textSecondary">
// //                     Date
// //                   </Typography>
// //                 </Grid>
// //                 <Grid item xs={6}>
// //                   <Typography variant="body2">
// //                     {format(new Date(selectedPayment.createdAt), 'PPP')}
// //                   </Typography>
// //                 </Grid>

// //                 <Grid item xs={6}>
// //                   <Typography variant="body2" color="textSecondary">
// //                     Amount
// //                   </Typography>
// //                 </Grid>
// //                 <Grid item xs={6}>
// //                   <Typography variant="body1" fontWeight="600" color="primary">
// //                     ₹{selectedPayment.amount}
// //                   </Typography>
// //                 </Grid>

// //                 <Grid item xs={6}>
// //                   <Typography variant="body2" color="textSecondary">
// //                     Payment Method
// //                   </Typography>
// //                 </Grid>
// //                 <Grid item xs={6}>
// //                   <Typography variant="body2">
// //                     {selectedPayment.paymentMethod?.replace('_', ' ')}
// //                   </Typography>
// //                 </Grid>

// //                 <Grid item xs={6}>
// //                   <Typography variant="body2" color="textSecondary">
// //                     Status
// //                   </Typography>
// //                 </Grid>
// //                 <Grid item xs={6}>
// //                   <Chip
// //                     label={selectedPayment.status}
// //                     size="small"
// //                     color={selectedPayment.status === 'completed' ? 'success' : 'warning'}
// //                   />
// //                 </Grid>

// //                 <Grid item xs={12}>
// //                   <Divider sx={{ my: 2 }} />
// //                   <Typography variant="body2" color="textSecondary">
// //                     {selectedPayment.description}
// //                   </Typography>
// //                 </Grid>
// //               </Grid>
// //             </Box>
// //           )}
// //         </DialogContent>
// //         <DialogActions>
// //           <Button onClick={() => setOpenReceiptDialog(false)}>Close</Button>
// //           <Button
// //             variant="contained"
// //             startIcon={<DownloadIcon />}
// //             onClick={() => handleDownloadReceipt(selectedPayment?._id)}
// //           >
// //             Download
// //           </Button>
// //         </DialogActions>
// //       </Dialog>

// //       {/* Snackbar */}
// //       <Snackbar
// //         open={snackbar.open}
// //         autoHideDuration={4000}
// //         onClose={() => setSnackbar({ ...snackbar, open: false })}
// //         anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
// //       >
// //         <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
// //           {snackbar.message}
// //         </Alert>
// //       </Snackbar>
// //     </Box>
// //   );
// // };

// // export default Payments;


// import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   Container,
//   Paper,
//   Typography,
//   Grid,
//   Card,
//   CardContent,
//   Button,
//   Chip,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Alert,
//   Stepper,
//   Step,
//   StepLabel,
//   Divider,
//   IconButton,
//   Avatar,
//   useTheme,
//   LinearProgress,
//   InputAdornment,
//   Tab,
//   Tabs,
//   Tooltip,
//   Snackbar,
//   CircularProgress,
// } from '@mui/material';
// import {
//   ArrowBack as ArrowBackIcon,
//   Payment as PaymentIcon,
//   AccountBalance as AccountBalanceIcon,
//   Receipt as ReceiptIcon,
//   CheckCircle as CheckCircleIcon,
//   History as HistoryIcon,
//   GetApp as DownloadIcon,
//   Star as StarIcon,
//   Info as InfoIcon,
// } from '@mui/icons-material';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import api from '../services/api';
// import { toast } from 'react-toastify';
// import { format } from 'date-fns';

// // ── QR Code placeholder ───────────────────────────────────────
// const QRCode = ({ value }) => (
//   <Box
//     sx={{
//       width: 200,
//       height: 200,
//       bgcolor: '#f5f5f5',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       border: '2px solid #ccc',
//       borderRadius: 2,
//       mx: 'auto',
//       my: 2,
//     }}
//   >
//     <Typography variant="caption" color="textSecondary">
//       QR Code: {value}
//     </Typography>
//   </Box>
// );

// // ── Khalti SVG logo ───────────────────────────────────────────
// const KhaltiIcon = () => (
//   <Box
//     component="img"
//     src="https://khalti.com/static/khalti-logo.svg"
//     alt="Khalti"
//     sx={{ width: 28, height: 28, objectFit: 'contain' }}
//     onError={(e) => { e.target.style.display = 'none'; }}
//   />
// );

// // ── eSewa SVG logo ────────────────────────────────────────────
// const EsewaIcon = () => (
//   <Box
//     component="img"
//     src="https://esewa.com.np/common/images/esewa_logo.png"
//     alt="eSewa"
//     sx={{ width: 28, height: 28, objectFit: 'contain' }}
//     onError={(e) => { e.target.style.display = 'none'; }}
//   />
// );

// const MONTHLY_FEE = 1000; // NPR — must match backend

// const steps = ['Select Amount', 'Payment Method', 'Confirm'];

// // ── Payment methods — Khalti & eSewa only ────────────────────
// const paymentMethods = [
//   {
//     value: 'khalti',
//     label: 'Khalti',
//     icon: <KhaltiIcon />,
//     description: 'Pay securely via Khalti digital wallet',
//     processingFee: '0%',
//     instant: true,
//     color: '#5C2D91',
//   },
//   {
//     value: 'esewa',
//     label: 'eSewa',
//     icon: <EsewaIcon />,
//     description: 'Pay via eSewa — Nepal\'s leading payment gateway',
//     processingFee: '0%',
//     instant: true,
//     color: '#60BB46',
//   },
//   {
//     value: 'coin_redeem',
//     label: 'Pay with Coins',
//     icon: <StarIcon sx={{ color: '#F59E0B' }} />,
//     description: `Redeem ${MONTHLY_FEE} coins for 1 free month`,
//     processingFee: '0%',
//     instant: true,
//     color: '#F59E0B',
//   },
// ];

// const paymentTypes = [
//   {
//     value: 'monthly_fee',
//     label: 'Monthly Service Fee',
//     amount: MONTHLY_FEE,
//     description: 'Regular monthly waste collection service',
//   },
// ];

// // ── eSewa form auto-submitter ────────────────────────────────
// const submitEsewaForm = (formFields, esewaUrl) => {
//   const form = document.createElement('form');
//   form.method = 'POST';
//   form.action = esewaUrl;
//   Object.entries(formFields).forEach(([key, value]) => {
//     const input = document.createElement('input');
//     input.type = 'hidden';
//     input.name = key;
//     input.value = value;
//     form.appendChild(input);
//   });
//   document.body.appendChild(form);
//   form.submit();
// };

// const Payments = () => {
//   const theme = useTheme();
//   const navigate = useNavigate();
//   const { user, updateUser } = useAuth();

//   const [payments, setPayments]               = useState([]);
//   const [loading, setLoading]                 = useState(true);
//   const [payLoading, setPayLoading]           = useState(false);
//   const [openDialog, setOpenDialog]           = useState(false);
//   const [openReceiptDialog, setOpenReceiptDialog] = useState(false);
//   const [activeStep, setActiveStep]           = useState(0);
//   const [selectedType, setSelectedType]       = useState('monthly_fee');
//   const [selectedPayment, setSelectedPayment] = useState(null);
//   const [tabValue, setTabValue]               = useState(0);
//   const [paymentDetails, setPaymentDetails]   = useState({
//     amount: MONTHLY_FEE,
//     method: 'khalti',
//     type: 'monthly_fee',
//     description: 'Monthly Service Fee',
//   });
//   const [billingStatus, setBillingStatus] = useState({
//     paid: false,
//     isFreeActive: false,
//     freeServiceUntil: null,
//     paymentStatus: 'unpaid',
//     nextPaymentDue: null,
//     lastPaymentDate: null,
//     coinBalance: 0,
//     canRedeem: false,
//     monthlyFee: MONTHLY_FEE,
//     payment: null,
//   });
//   const [stats, setStats] = useState({
//     totalPaid: 0,
//     pendingPayments: 0,
//     lastPayment: null,
//     freeMonths: user?.freeServiceMonths || 0,
//     coinValue: 0,
//   });
//   const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

//   // ── On mount: check for Khalti/eSewa redirect back ──────────
//   useEffect(() => {
//     fetchPayments();
//     fetchMonthlyFeeStatus();
//     handlePaymentReturn();
//   }, []);

//   useEffect(() => {
//     calculateStats();
//   }, [payments, user]);

//   // ── Handle redirect back from Khalti / eSewa ────────────────
//   const handlePaymentReturn = async () => {
//     const params = new URLSearchParams(window.location.search);
//     const method = params.get('method');
//     const pidx   = params.get('pidx');
//     const status = params.get('status');
//     // eSewa returns base64 data param
//     const encodedData = params.get('data');

//     if (method === 'khalti' && pidx && status === 'Completed') {
//       await verifyKhalti(pidx);
//     } else if (method === 'esewa' && encodedData) {
//       await verifyEsewa(encodedData);
//     }

//     // Clean URL after handling
//     if (method) {
//       window.history.replaceState({}, '', window.location.pathname);
//     }
//   };

//   // ── Fetch payment history ────────────────────────────────────
//   const fetchPayments = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get('/payments/history');
//       setPayments(response.data.payments || []);
//     } catch (error) {
//       toast.error('Failed to fetch payment history');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── Fetch monthly fee status ─────────────────────────────────
//   const fetchMonthlyFeeStatus = async () => {
//     try {
//       const response = await api.get('/payments/monthly-fee/status');
//       const data = response.data;
//       setBillingStatus({
//         paid:             data.paid,
//         isFreeActive:     data.isFreeActive,
//         freeServiceUntil: data.freeServiceUntil,
//         paymentStatus:    data.paymentStatus,
//         nextPaymentDue:   data.nextPaymentDue,
//         lastPaymentDate:  data.lastPaymentDate,
//         coinBalance:      data.coinBalance || 0,
//         canRedeem:        data.canRedeem,
//         monthlyFee:       data.monthlyFee || MONTHLY_FEE,
//         payment:          data.payment || null,
//       });
//     } catch (error) {
//       console.error('Error checking monthly fee status:', error);
//     }
//   };

//   // ── Calculate stats from history ────────────────────────────
//   const calculateStats = () => {
//     const completed  = payments.filter((p) => p.status === 'completed');
//     const total      = completed.reduce((sum, p) => sum + p.amount, 0);
//     const pending    = payments.filter((p) => p.status === 'pending').length;
//     const last       = payments.length > 0 ? payments[0] : null;
//     const coinValue  = (user?.coins || 0) / 100;

//     setStats((prev) => ({
//       ...prev,
//       totalPaid:       total,
//       pendingPayments: pending,
//       lastPayment:     last,
//       freeMonths:      user?.freeServiceMonths || 0,
//       coinValue,
//     }));
//   };

//   // ── Initiate Khalti ──────────────────────────────────────────
//   const initiateKhalti = async () => {
//     setPayLoading(true);
//     try {
//       const month = new Date().getMonth() + 1;
//       const year  = new Date().getFullYear();
//       const res   = await api.post('/payments/khalti/initiate', {
//         amount:      MONTHLY_FEE,
//         paymentType: 'monthly_fee',
//         month,
//         year,
//       });
//       if (res.data.payment_url) {
//         window.location.href = res.data.payment_url;
//       }
//     } catch (error) {
//       showSnackbar(error.response?.data?.message || 'Khalti payment initiation failed', 'error');
//     } finally {
//       setPayLoading(false);
//     }
//   };

//   // ── Initiate eSewa ───────────────────────────────────────────
//   const initiateEsewa = async () => {
//     setPayLoading(true);
//     try {
//       const res = await api.post('/payments/esewa/initiate', {
//         amount:      MONTHLY_FEE,
//         paymentType: 'monthly_fee',
//       });
//       if (res.data.formFields && res.data.esewaUrl) {
//         submitEsewaForm(res.data.formFields, res.data.esewaUrl);
//       }
//     } catch (error) {
//       showSnackbar(error.response?.data?.message || 'eSewa payment initiation failed', 'error');
//       setPayLoading(false);
//     }
//   };

//   // ── Redeem coins ─────────────────────────────────────────────
//   const redeemCoins = async () => {
//     setPayLoading(true);
//     try {
//       const res = await api.post('/payments/redeem');
//       showSnackbar(res.data.message || '1,000 coins redeemed! Free service activated.', 'success');
//       updateUser({ coins: res.data.coinsRemaining });
//       setOpenDialog(false);
//       fetchPayments();
//       fetchMonthlyFeeStatus();
//       resetPaymentForm();
//     } catch (error) {
//       showSnackbar(error.response?.data?.message || 'Redemption failed', 'error');
//     } finally {
//       setPayLoading(false);
//     }
//   };

//   // ── Verify Khalti after redirect ─────────────────────────────
//   const verifyKhalti = async (pidx) => {
//     try {
//       const res = await api.post('/payments/khalti/verify', { pidx });
//       if (res.data.success) {
//         showSnackbar('✅ Khalti payment verified successfully!', 'success');
//         fetchPayments();
//         fetchMonthlyFeeStatus();
//       }
//     } catch (error) {
//       showSnackbar(error.response?.data?.message || 'Khalti verification failed', 'error');
//     }
//   };

//   // ── Verify eSewa after redirect ──────────────────────────────
//   const verifyEsewa = async (encodedData) => {
//     try {
//       const res = await api.post('/payments/esewa/verify', { encodedData });
//       if (res.data.success) {
//         showSnackbar('✅ eSewa payment verified successfully!', 'success');
//         fetchPayments();
//         fetchMonthlyFeeStatus();
//       }
//     } catch (error) {
//       showSnackbar(error.response?.data?.message || 'eSewa verification failed', 'error');
//     }
//   };

//   // ── Main payment handler ─────────────────────────────────────
//   const handleProcessPayment = async () => {
//     if (paymentDetails.method === 'khalti')     return initiateKhalti();
//     if (paymentDetails.method === 'esewa')      return initiateEsewa();
//     if (paymentDetails.method === 'coin_redeem') return redeemCoins();
//   };

//   const resetPaymentForm = () => {
//     setActiveStep(0);
//     setPaymentDetails({
//       amount:      MONTHLY_FEE,
//       method:      'khalti',
//       type:        'monthly_fee',
//       description: 'Monthly Service Fee',
//     });
//     setSelectedType('monthly_fee');
//   };

//   const handleNext = () => setActiveStep((prev) => prev + 1);
//   const handleBack = () => setActiveStep((prev) => prev - 1);

//   const handleTypeChange = (type) => {
//     setSelectedType(type);
//     const selected = paymentTypes.find((t) => t.value === type);
//     setPaymentDetails({
//       ...paymentDetails,
//       type,
//       amount:      selected?.amount || MONTHLY_FEE,
//       description: selected?.label || '',
//     });
//   };

//   const handleDownloadReceipt = async (paymentId) => {
//     try {
//       const response = await api.get(`/payments/${paymentId}/invoice`, { responseType: 'blob' });
//       const url  = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement('a');
//       link.href  = url;
//       link.setAttribute('download', `invoice-${paymentId}.pdf`);
//       document.body.appendChild(link);
//       link.click();
//       showSnackbar('Receipt downloaded successfully', 'success');
//     } catch (error) {
//       showSnackbar('Failed to download receipt', 'error');
//     }
//   };

//   const showSnackbar = (message, severity = 'success') => {
//     setSnackbar({ open: true, message, severity });
//   };

//   const canRedeem    = billingStatus.canRedeem;
//   const isFeeDue     = !billingStatus.paid && !billingStatus.isFreeActive;
//   const selectedMethodObj = paymentMethods.find((m) => m.value === paymentDetails.method);

//   return (
//     <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
//       {/* Header */}
//       <Box
//         sx={{
//           background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
//           color: 'white',
//           py: 4,
//           mb: 4,
//         }}
//       >
//         <Container maxWidth="lg">
//           <Box sx={{ display: 'flex', alignItems: 'center' }}>
//             <IconButton color="inherit" onClick={() => navigate(-1)} sx={{ mr: 2 }}>
//               <ArrowBackIcon />
//             </IconButton>
//             <Typography variant="h4" fontWeight="700">
//               Payments & Billing
//             </Typography>
//           </Box>
//         </Container>
//       </Box>

//       <Container maxWidth="lg">
//         {/* Due payment alert */}
//         {isFeeDue && (
//           <Alert
//             severity="warning"
//             sx={{ mb: 3, borderRadius: 2 }}
//             action={
//               <Button color="inherit" size="small" onClick={() => setOpenDialog(true)}>
//                 Pay Now
//               </Button>
//             }
//           >
//             Your monthly fee of Rs. {billingStatus.monthlyFee} is due. Pay to continue using the service.
//           </Alert>
//         )}

//         {/* Free service active alert */}
//         {billingStatus.isFreeActive && (
//           <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} icon={<CheckCircleIcon />}>
//             Free service is active until{' '}
//             {billingStatus.freeServiceUntil
//               ? format(new Date(billingStatus.freeServiceUntil), 'PPP')
//               : '—'}
//             . No payment needed this month.
//           </Alert>
//         )}

//         <Grid container spacing={3}>
//           {/* ── Left Column ─────────────────────────────────── */}
//           <Grid item xs={12} md={4}>
//             {/* Total Spent */}
//             <Card sx={{ mb: 3, borderRadius: 3 }}>
//               <CardContent>
//                 <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                   <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2, width: 48, height: 48 }}>
//                     <AccountBalanceIcon />
//                   </Avatar>
//                   <Typography variant="h6" fontWeight="600">Total Spent</Typography>
//                 </Box>
//                 <Typography variant="h3" color="primary" fontWeight="700" gutterBottom>
//                   Rs. {stats.totalPaid.toLocaleString()}
//                 </Typography>
//                 <Typography variant="body2" color="textSecondary">Lifetime payments</Typography>
//               </CardContent>
//             </Card>

//             {/* Coins */}
//             <Card sx={{ mb: 3, borderRadius: 3 }}>
//               <CardContent>
//                 <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                   <Avatar sx={{ bgcolor: theme.palette.warning.main, mr: 2, width: 48, height: 48 }}>
//                     <StarIcon />
//                   </Avatar>
//                   <Typography variant="h6" fontWeight="600">Coin Balance</Typography>
//                 </Box>
//                 <Typography variant="h3" color="warning.main" fontWeight="700" gutterBottom>
//                   {billingStatus.coinBalance}
//                 </Typography>
//                 <Typography variant="body2" color="textSecondary">
//                   {canRedeem
//                     ? `✅ Enough to redeem 1 free month (${MONTHLY_FEE} coins needed)`
//                     : `Need ${MONTHLY_FEE - billingStatus.coinBalance} more coins to redeem`}
//                 </Typography>
//                 <LinearProgress
//                   variant="determinate"
//                   value={Math.min((billingStatus.coinBalance / MONTHLY_FEE) * 100, 100)}
//                   sx={{ mt: 2, height: 8, borderRadius: 4 }}
//                 />
//               </CardContent>
//             </Card>

//             {/* Free service active */}
//             {billingStatus.isFreeActive && (
//               <Card sx={{ mb: 3, borderRadius: 3, bgcolor: theme.palette.success.light }}>
//                 <CardContent>
//                   <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                     <CheckCircleIcon sx={{ fontSize: 40, color: 'white', mr: 2 }} />
//                     <Box>
//                       <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
//                         Free Service Active
//                       </Typography>
//                       <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
//                         Until{' '}
//                         {billingStatus.freeServiceUntil
//                           ? format(new Date(billingStatus.freeServiceUntil), 'PPP')
//                           : '—'}
//                       </Typography>
//                     </Box>
//                   </Box>
//                 </CardContent>
//               </Card>
//             )}

//             {/* Monthly Fee Status */}
//             <Card sx={{ mb: 3, borderRadius: 3 }}>
//               <CardContent>
//                 <Typography variant="h6" fontWeight="600" gutterBottom>
//                   Monthly Fee Status
//                 </Typography>
//                 <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                   <Box>
//                     <Typography variant="body2" color="textSecondary">Current Month</Typography>
//                     <Typography variant="h5" fontWeight="600">
//                       {billingStatus.isFreeActive ? 'Free' : billingStatus.paid ? 'Paid' : 'Due'}
//                     </Typography>
//                   </Box>
//                   <Chip
//                     label={billingStatus.isFreeActive ? 'Free' : billingStatus.paid ? 'Paid' : 'Due'}
//                     color={billingStatus.isFreeActive || billingStatus.paid ? 'success' : 'warning'}
//                   />
//                 </Box>
//                 {billingStatus.nextPaymentDue && (
//                   <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
//                     Next due: {format(new Date(billingStatus.nextPaymentDue), 'PPP')}
//                   </Typography>
//                 )}
//                 {billingStatus.lastPaymentDate && (
//                   <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
//                     Last paid: {format(new Date(billingStatus.lastPaymentDate), 'PPP')}
//                   </Typography>
//                 )}
//               </CardContent>
//             </Card>

//             {/* Quick Actions */}
//             <Card sx={{ borderRadius: 3 }}>
//               <CardContent>
//                 <Typography variant="h6" fontWeight="600" gutterBottom>
//                   Quick Actions
//                 </Typography>
//                 <Button
//                   fullWidth
//                   variant="contained"
//                   startIcon={<PaymentIcon />}
//                   onClick={() => setOpenDialog(true)}
//                   disabled={billingStatus.isFreeActive || billingStatus.paid}
//                   sx={{ mb: 1, py: 1.5, borderRadius: 2 }}
//                 >
//                   {billingStatus.isFreeActive || billingStatus.paid ? 'Already Paid' : 'Make a Payment'}
//                 </Button>
//                 <Button
//                   fullWidth
//                   variant="outlined"
//                   startIcon={<HistoryIcon />}
//                   onClick={() => setTabValue(0)}
//                   sx={{ py: 1.5, borderRadius: 2 }}
//                 >
//                   View History
//                 </Button>
//               </CardContent>
//             </Card>
//           </Grid>

//           {/* ── Right Column ─────────────────────────────────── */}
//           <Grid item xs={12} md={8}>
//             <Paper sx={{ p: 3, borderRadius: 3 }}>
//               <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
//                 <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
//                   <Tab label="Payment History" />
//                   <Tab label="Invoices" />
//                   <Tab label="Payment Methods" />
//                 </Tabs>
//               </Box>

//               {/* Payment History Tab */}
//               {tabValue === 0 && (
//                 <>
//                   <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
//                     <Typography variant="h6" fontWeight="600">
//                       <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
//                       Payment History
//                     </Typography>
//                     {payments.length > 0 && (
//                       <Chip label={`${payments.length} transactions`} size="small" color="primary" />
//                     )}
//                   </Box>

//                   {loading ? (
//                     <LinearProgress />
//                   ) : (
//                     <TableContainer>
//                       <Table>
//                         <TableHead>
//                           <TableRow>
//                             <TableCell>Date</TableCell>
//                             <TableCell>Description</TableCell>
//                             <TableCell align="right">Amount</TableCell>
//                             <TableCell>Method</TableCell>
//                             <TableCell align="center">Status</TableCell>
//                             <TableCell align="center">Receipt</TableCell>
//                           </TableRow>
//                         </TableHead>
//                         <TableBody>
//                           {payments.map((payment) => (
//                             <TableRow key={payment._id} hover>
//                               <TableCell>
//                                 <Typography variant="body2">
//                                   {format(new Date(payment.createdAt), 'MMM dd, yyyy')}
//                                 </Typography>
//                                 <Typography variant="caption" color="textSecondary">
//                                   {format(new Date(payment.createdAt), 'hh:mm a')}
//                                 </Typography>
//                               </TableCell>
//                               <TableCell>
//                                 <Typography variant="body2" fontWeight="500">
//                                   {payment.description ||
//                                     (payment.type || payment.paymentMethod || '').replace(/_/g, ' ')}
//                                 </Typography>
//                                 {payment.transactionId && (
//                                   <Typography variant="caption" color="textSecondary">
//                                     ID: {payment.transactionId.slice(-8)}
//                                   </Typography>
//                                 )}
//                               </TableCell>
//                               <TableCell align="right">
//                                 <Typography variant="body1" fontWeight="600">
//                                   Rs. {payment.amount}
//                                 </Typography>
//                               </TableCell>
//                               <TableCell>
//                                 <Chip
//                                   label={(payment.paymentMethod || '').replace(/_/g, ' ')}
//                                   size="small"
//                                   variant="outlined"
//                                   sx={{
//                                     fontWeight: 500,
//                                     borderColor:
//                                       payment.paymentMethod === 'khalti' ? '#5C2D91' :
//                                       payment.paymentMethod === 'esewa'  ? '#60BB46' :
//                                       undefined,
//                                     color:
//                                       payment.paymentMethod === 'khalti' ? '#5C2D91' :
//                                       payment.paymentMethod === 'esewa'  ? '#60BB46' :
//                                       undefined,
//                                   }}
//                                 />
//                               </TableCell>
//                               <TableCell align="center">
//                                 <Chip
//                                   label={payment.status}
//                                   size="small"
//                                   color={
//                                     payment.status === 'completed' ? 'success' :
//                                     payment.status === 'pending'   ? 'warning' : 'error'
//                                   }
//                                   sx={{ fontWeight: 500 }}
//                                 />
//                               </TableCell>
//                               <TableCell align="center">
//                                 <Tooltip title="View Receipt">
//                                   <IconButton
//                                     size="small"
//                                     color="primary"
//                                     onClick={() => {
//                                       setSelectedPayment(payment);
//                                       setOpenReceiptDialog(true);
//                                     }}
//                                   >
//                                     <ReceiptIcon fontSize="small" />
//                                   </IconButton>
//                                 </Tooltip>
//                                 <Tooltip title="Download">
//                                   <IconButton
//                                     size="small"
//                                     color="primary"
//                                     onClick={() => handleDownloadReceipt(payment._id)}
//                                   >
//                                     <DownloadIcon fontSize="small" />
//                                   </IconButton>
//                                 </Tooltip>
//                               </TableCell>
//                             </TableRow>
//                           ))}

//                           {payments.length === 0 && (
//                             <TableRow>
//                               <TableCell colSpan={6} align="center">
//                                 <Box sx={{ py: 4 }}>
//                                   <PaymentIcon sx={{ fontSize: 48, color: theme.palette.grey[400], mb: 2 }} />
//                                   <Typography variant="body1" color="textSecondary" gutterBottom>
//                                     No payment history found
//                                   </Typography>
//                                   <Typography variant="body2" color="textSecondary">
//                                     Your payments will appear here once you make your first payment.
//                                   </Typography>
//                                 </Box>
//                               </TableCell>
//                             </TableRow>
//                           )}
//                         </TableBody>
//                       </Table>
//                     </TableContainer>
//                   )}
//                 </>
//               )}

//               {/* Invoices Tab */}
//               {tabValue === 1 && (
//                 <Box sx={{ py: 2 }}>
//                   <Typography variant="body1" color="textSecondary" align="center">
//                     Download invoices from the payment history tab.
//                   </Typography>
//                 </Box>
//               )}

//               {/* Payment Methods Tab */}
//               {tabValue === 2 && (
//                 <Grid container spacing={2} sx={{ py: 2 }}>
//                   {paymentMethods.map((method) => (
//                     <Grid item xs={12} key={method.value}>
//                       <Card variant="outlined">
//                         <CardContent>
//                           <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                             <Avatar sx={{ bgcolor: method.color + '22', mr: 2 }}>
//                               {method.icon}
//                             </Avatar>
//                             <Box sx={{ flex: 1 }}>
//                               <Typography variant="subtitle1" fontWeight="600">
//                                 {method.label}
//                               </Typography>
//                               <Typography variant="caption" color="textSecondary">
//                                 {method.description}
//                               </Typography>
//                               <Typography variant="caption" color="textSecondary" display="block">
//                                 Processing fee: {method.processingFee}
//                               </Typography>
//                             </Box>
//                             <Chip label="Instant" size="small" color="success" />
//                           </Box>
//                         </CardContent>
//                       </Card>
//                     </Grid>
//                   ))}
//                 </Grid>
//               )}
//             </Paper>
//           </Grid>
//         </Grid>
//       </Container>

//       {/* ── Payment Dialog ────────────────────────────────────── */}
//       <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
//         <DialogTitle>
//           <Box sx={{ display: 'flex', alignItems: 'center' }}>
//             <PaymentIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
//             Make a Payment
//           </Box>
//         </DialogTitle>
//         <DialogContent>
//           <Stepper activeStep={activeStep} sx={{ my: 3 }}>
//             {steps.map((label) => (
//               <Step key={label}>
//                 <StepLabel>{label}</StepLabel>
//               </Step>
//             ))}
//           </Stepper>

//           {/* Step 0 — Select Amount */}
//           {activeStep === 0 && (
//             <Grid container spacing={2}>
//               <Grid item xs={12}>
//                 <FormControl fullWidth>
//                   <InputLabel>Payment Type</InputLabel>
//                   <Select
//                     value={selectedType}
//                     onChange={(e) => handleTypeChange(e.target.value)}
//                     label="Payment Type"
//                   >
//                     {paymentTypes.map((type) => (
//                       <MenuItem key={type.value} value={type.value}>
//                         <Box>
//                           <Typography variant="body1">{type.label}</Typography>
//                           <Typography variant="caption" color="textSecondary">
//                             Rs. {type.amount}
//                           </Typography>
//                         </Box>
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>
//               </Grid>
//               <Grid item xs={12}>
//                 <Alert severity="info" icon={<InfoIcon />}>
//                   <Typography variant="body2">
//                     <strong>Monthly fee:</strong> Rs. {MONTHLY_FEE}
//                     <br />
//                     <strong>Coin redemption:</strong> {MONTHLY_FEE} coins = 1 free month
//                   </Typography>
//                 </Alert>
//               </Grid>
//             </Grid>
//           )}

//           {/* Step 1 — Payment Method */}
//           {activeStep === 1 && (
//             <Grid container spacing={2}>
//               {paymentMethods.map((method) => {
//                 const isDisabled =
//                   method.value === 'coin_redeem' && !canRedeem;

//                 return (
//                   <Grid item xs={12} key={method.value}>
//                     <Card
//                       sx={{
//                         cursor: isDisabled ? 'not-allowed' : 'pointer',
//                         opacity: isDisabled ? 0.5 : 1,
//                         border:
//                           paymentDetails.method === method.value
//                             ? `2px solid ${method.color}`
//                             : '1px solid #e0e0e0',
//                         '&:hover': !isDisabled ? { boxShadow: theme.shadows[4] } : {},
//                         transition: 'all 0.2s',
//                       }}
//                       onClick={() =>
//                         !isDisabled &&
//                         setPaymentDetails({ ...paymentDetails, method: method.value })
//                       }
//                     >
//                       <CardContent>
//                         <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                           <Avatar sx={{ bgcolor: method.color + '22', mr: 2, width: 48, height: 48 }}>
//                             {method.icon}
//                           </Avatar>
//                           <Box sx={{ flex: 1 }}>
//                             <Typography variant="subtitle1" fontWeight="600">
//                               {method.label}
//                             </Typography>
//                             <Typography variant="caption" color="textSecondary">
//                               {method.description}
//                             </Typography>
//                             {method.value === 'coin_redeem' && (
//                               <Typography
//                                 variant="caption"
//                                 color={canRedeem ? 'success.main' : 'error'}
//                                 display="block"
//                               >
//                                 {canRedeem
//                                   ? `You have ${billingStatus.coinBalance} coins ✅`
//                                   : `Need ${MONTHLY_FEE - billingStatus.coinBalance} more coins`}
//                               </Typography>
//                             )}
//                           </Box>
//                           {paymentDetails.method === method.value && (
//                             <CheckCircleIcon sx={{ color: method.color, ml: 2 }} />
//                           )}
//                         </Box>
//                       </CardContent>
//                     </Card>
//                   </Grid>
//                 );
//               })}
//             </Grid>
//           )}

//           {/* Step 2 — Confirm */}
//           {activeStep === 2 && (
//             <Box>
//               <Typography variant="h6" gutterBottom fontWeight="600">
//                 Payment Summary
//               </Typography>
//               <Paper variant="outlined" sx={{ p: 3, mb: 2, bgcolor: theme.palette.grey[50] }}>
//                 <Grid container spacing={2}>
//                   <Grid item xs={6}>
//                     <Typography variant="body2" color="textSecondary">Amount</Typography>
//                   </Grid>
//                   <Grid item xs={6}>
//                     <Typography variant="body1" align="right" fontWeight="600">
//                       Rs. {paymentDetails.amount}
//                     </Typography>
//                   </Grid>

//                   <Grid item xs={6}>
//                     <Typography variant="body2" color="textSecondary">Payment Method</Typography>
//                   </Grid>
//                   <Grid item xs={6}>
//                     <Typography variant="body1" align="right" fontWeight="500">
//                       {selectedMethodObj?.label}
//                     </Typography>
//                   </Grid>

//                   <Grid item xs={6}>
//                     <Typography variant="body2" color="textSecondary">Type</Typography>
//                   </Grid>
//                   <Grid item xs={6}>
//                     <Typography variant="body1" align="right" fontWeight="500">
//                       {paymentTypes.find((t) => t.value === paymentDetails.type)?.label}
//                     </Typography>
//                   </Grid>

//                   {paymentDetails.method === 'coin_redeem' && (
//                     <>
//                       <Grid item xs={6}>
//                         <Typography variant="body2" color="textSecondary">Coins to deduct</Typography>
//                       </Grid>
//                       <Grid item xs={6}>
//                         <Typography variant="body1" align="right" fontWeight="600" color="warning.main">
//                           {MONTHLY_FEE} coins
//                         </Typography>
//                       </Grid>
//                     </>
//                   )}

//                   <Grid item xs={12}>
//                     <Divider sx={{ my: 1 }} />
//                   </Grid>

//                   <Grid item xs={6}>
//                     <Typography variant="subtitle1" fontWeight="600">Total</Typography>
//                   </Grid>
//                   <Grid item xs={6}>
//                     <Typography variant="h5" align="right" color="primary" fontWeight="700">
//                       {paymentDetails.method === 'coin_redeem' ? `${MONTHLY_FEE} coins` : `Rs. ${paymentDetails.amount}`}
//                     </Typography>
//                   </Grid>
//                 </Grid>
//               </Paper>

//               {paymentDetails.method === 'khalti' && (
//                 <Alert severity="info" sx={{ mb: 2 }}>
//                   You will be redirected to <strong>Khalti</strong> to complete the payment.
//                 </Alert>
//               )}
//               {paymentDetails.method === 'esewa' && (
//                 <Alert severity="info" sx={{ mb: 2 }}>
//                   You will be redirected to <strong>eSewa</strong> to complete the payment.
//                 </Alert>
//               )}
//               {paymentDetails.method === 'coin_redeem' && (
//                 <Alert severity="success" icon={<StarIcon />} sx={{ mb: 2 }}>
//                   {MONTHLY_FEE} coins will be deducted and free service will be activated for 30 days.
//                 </Alert>
//               )}

//               <Alert severity="info">
//                 By confirming, you agree to our terms and conditions.
//               </Alert>
//             </Box>
//           )}
//         </DialogContent>

//         <DialogActions sx={{ p: 3 }}>
//           <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
//           {activeStep > 0 && <Button onClick={handleBack}>Back</Button>}
//           {activeStep < steps.length - 1 ? (
//             <Button
//               onClick={handleNext}
//               variant="contained"
//               disabled={!paymentDetails.amount || !paymentDetails.method}
//             >
//               Next
//             </Button>
//           ) : (
//             <Button
//               onClick={handleProcessPayment}
//               variant="contained"
//               color="primary"
//               disabled={
//                 payLoading ||
//                 (paymentDetails.method === 'coin_redeem' && !canRedeem)
//               }
//               size="large"
//               startIcon={payLoading ? <CircularProgress size={18} color="inherit" /> : null}
//             >
//               {payLoading
//                 ? 'Processing...'
//                 : paymentDetails.method === 'coin_redeem'
//                 ? `Redeem ${MONTHLY_FEE} Coins`
//                 : `Pay Rs. ${paymentDetails.amount} via ${selectedMethodObj?.label}`}
//             </Button>
//           )}
//         </DialogActions>
//       </Dialog>

//       {/* ── Receipt Dialog ────────────────────────────────────── */}
//       <Dialog open={openReceiptDialog} onClose={() => setOpenReceiptDialog(false)} maxWidth="sm" fullWidth>
//         <DialogTitle>
//           <Box sx={{ display: 'flex', alignItems: 'center' }}>
//             <ReceiptIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
//             Payment Receipt
//           </Box>
//         </DialogTitle>
//         <DialogContent dividers>
//           {selectedPayment && (
//             <Box>
//               <Box sx={{ textAlign: 'center', mb: 3 }}>
//                 <Typography variant="h5" gutterBottom>Smart Waste Management</Typography>
//                 <Typography variant="body2" color="textSecondary">Payment Receipt</Typography>
//               </Box>

//               <QRCode value={`PAYMENT-${selectedPayment.transactionId}`} />

//               <Grid container spacing={2} sx={{ mt: 2 }}>
//                 <Grid item xs={6}>
//                   <Typography variant="body2" color="textSecondary">Transaction ID</Typography>
//                 </Grid>
//                 <Grid item xs={6}>
//                   <Typography variant="body2" fontWeight="500">
//                     {selectedPayment.transactionId}
//                   </Typography>
//                 </Grid>

//                 <Grid item xs={6}>
//                   <Typography variant="body2" color="textSecondary">Date</Typography>
//                 </Grid>
//                 <Grid item xs={6}>
//                   <Typography variant="body2">
//                     {format(new Date(selectedPayment.createdAt), 'PPP')}
//                   </Typography>
//                 </Grid>

//                 <Grid item xs={6}>
//                   <Typography variant="body2" color="textSecondary">Amount</Typography>
//                 </Grid>
//                 <Grid item xs={6}>
//                   <Typography variant="body1" fontWeight="600" color="primary">
//                     Rs. {selectedPayment.amount}
//                   </Typography>
//                 </Grid>

//                 <Grid item xs={6}>
//                   <Typography variant="body2" color="textSecondary">Payment Method</Typography>
//                 </Grid>
//                 <Grid item xs={6}>
//                   <Typography variant="body2">
//                     {(selectedPayment.paymentMethod || '').replace(/_/g, ' ')}
//                   </Typography>
//                 </Grid>

//                 <Grid item xs={6}>
//                   <Typography variant="body2" color="textSecondary">Status</Typography>
//                 </Grid>
//                 <Grid item xs={6}>
//                   <Chip
//                     label={selectedPayment.status}
//                     size="small"
//                     color={selectedPayment.status === 'completed' ? 'success' : 'warning'}
//                   />
//                 </Grid>

//                 {selectedPayment.validUntil && (
//                   <>
//                     <Grid item xs={6}>
//                       <Typography variant="body2" color="textSecondary">Valid Until</Typography>
//                     </Grid>
//                     <Grid item xs={6}>
//                       <Typography variant="body2">
//                         {format(new Date(selectedPayment.validUntil), 'PPP')}
//                       </Typography>
//                     </Grid>
//                   </>
//                 )}

//                 <Grid item xs={12}>
//                   <Divider sx={{ my: 2 }} />
//                   <Typography variant="body2" color="textSecondary">
//                     {selectedPayment.description}
//                   </Typography>
//                 </Grid>
//               </Grid>
//             </Box>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenReceiptDialog(false)}>Close</Button>
//           <Button
//             variant="contained"
//             startIcon={<DownloadIcon />}
//             onClick={() => handleDownloadReceipt(selectedPayment?._id)}
//           >
//             Download
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* ── Snackbar ──────────────────────────────────────────── */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={4000}
//         onClose={() => setSnackbar({ ...snackbar, open: false })}
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
//       >
//         <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default Payments;


import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Divider,
  IconButton,
  Avatar,
  useTheme,
  LinearProgress,
  InputAdornment,
  Tab,
  Tabs,
  Tooltip,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Payment as PaymentIcon,
  AccountBalance as AccountBalanceIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
  History as HistoryIcon,
  GetApp as DownloadIcon,
  Star as StarIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

// ── QR Code placeholder ───────────────────────────────────────
const QRCode = ({ value }) => (
  <Box
    sx={{
      width: 200,
      height: 200,
      bgcolor: '#f5f5f5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '2px solid #ccc',
      borderRadius: 2,
      mx: 'auto',
      my: 2,
    }}
  >
    <Typography variant="caption" color="textSecondary">
      QR Code: {value}
    </Typography>
  </Box>
);

// ── Khalti SVG logo ───────────────────────────────────────────
const KhaltiIcon = () => (
  <Box
    component="img"
    src="https://khalti.com/static/khalti-logo.svg"
    alt="Khalti"
    sx={{ width: 28, height: 28, objectFit: 'contain' }}
    onError={(e) => { e.target.style.display = 'none'; }}
  />
);

// ── eSewa SVG logo ────────────────────────────────────────────
const EsewaIcon = () => (
  <Box
    component="img"
    src="https://esewa.com.np/common/images/esewa_logo.png"
    alt="eSewa"
    sx={{ width: 28, height: 28, objectFit: 'contain' }}
    onError={(e) => { e.target.style.display = 'none'; }}
  />
);

const MONTHLY_FEE = 1000; // NPR — must match backend

const steps = ['Select Amount', 'Payment Method', 'Confirm'];

// ── Payment methods — Khalti & eSewa only ────────────────────
const paymentMethods = [
  {
    value: 'khalti',
    label: 'Khalti',
    icon: <KhaltiIcon />,
    description: 'Pay securely via Khalti digital wallet',
    processingFee: '0%',
    instant: true,
    color: '#5C2D91',
  },
  {
    value: 'esewa',
    label: 'eSewa',
    icon: <EsewaIcon />,
    description: 'Pay via eSewa — Nepal\'s leading payment gateway',
    processingFee: '0%',
    instant: true,
    color: '#60BB46',
  },
  {
    value: 'coin_redeem',
    label: 'Pay with Coins',
    icon: <StarIcon sx={{ color: '#F59E0B' }} />,
    description: `Redeem ${MONTHLY_FEE} coins for 1 free month`,
    processingFee: '0%',
    instant: true,
    color: '#F59E0B',
  },
];

const paymentTypes = [
  {
    value: 'monthly_fee',
    label: 'Monthly Service Fee',
    amount: MONTHLY_FEE,
    description: 'Regular monthly waste collection service',
  },
];

// ── eSewa form auto-submitter ────────────────────────────────
const submitEsewaForm = (formFields, esewaUrl) => {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = esewaUrl;
  Object.entries(formFields).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
};

const Payments = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [payments, setPayments]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [payLoading, setPayLoading]           = useState(false);
  const [openDialog, setOpenDialog]           = useState(false);
  const [openReceiptDialog, setOpenReceiptDialog] = useState(false);
  const [activeStep, setActiveStep]           = useState(0);
  const [selectedType, setSelectedType]       = useState('monthly_fee');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [tabValue, setTabValue]               = useState(0);
  const [paymentDetails, setPaymentDetails]   = useState({
    amount: MONTHLY_FEE,
    method: 'khalti',
    type: 'monthly_fee',
    description: 'Monthly Service Fee',
  });
  const [billingStatus, setBillingStatus] = useState({
    paid: false,
    isFreeActive: false,
    freeServiceUntil: null,
    paymentStatus: 'unpaid',
    nextPaymentDue: null,
    lastPaymentDate: null,
    coinBalance: 0,
    canRedeem: false,
    monthlyFee: MONTHLY_FEE,
    payment: null,
  });
  const [stats, setStats] = useState({
    totalPaid: 0,
    pendingPayments: 0,
    lastPayment: null,
    freeMonths: user?.freeServiceMonths || 0,
    coinValue: 0,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // ── On mount: check for Khalti/eSewa redirect back ──────────
  useEffect(() => {
    fetchPayments();
    fetchMonthlyFeeStatus();
    handlePaymentReturn();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [payments, user]);

  // ── Handle redirect back from Khalti / eSewa ────────────────
  const handlePaymentReturn = async () => {
    const params = new URLSearchParams(window.location.search);
    const method = params.get('method');
    const pidx   = params.get('pidx');
    const status = params.get('status');
    // eSewa returns base64 data param
    const encodedData = params.get('data');

    if (method === 'khalti' && pidx && status === 'Completed') {
      await verifyKhalti(pidx);
    } else if (method === 'esewa' && encodedData) {
      await verifyEsewa(encodedData);
    }

    // Clean URL after handling
    if (method) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  // ── Fetch payment history ────────────────────────────────────
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payments/history');
      setPayments(response.data.payments || []);
    } catch (error) {
      toast.error('Failed to fetch payment history');
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch monthly fee status ─────────────────────────────────
  const fetchMonthlyFeeStatus = async () => {
    try {
      const response = await api.get('/payments/monthly-fee/status');
      const data = response.data;
      setBillingStatus({
        paid:             data.paid,
        isFreeActive:     data.isFreeActive,
        freeServiceUntil: data.freeServiceUntil,
        paymentStatus:    data.paymentStatus,
        nextPaymentDue:   data.nextPaymentDue,
        lastPaymentDate:  data.lastPaymentDate,
        coinBalance:      data.coinBalance || 0,
        canRedeem:        data.canRedeem,
        monthlyFee:       data.monthlyFee || MONTHLY_FEE,
        payment:          data.payment || null,
      });
    } catch (error) {
      console.error('Error checking monthly fee status:', error);
    }
  };

  // ── Calculate stats from history ────────────────────────────
  const calculateStats = () => {
    const completed  = payments.filter((p) => p.status === 'completed');
    const total      = completed.reduce((sum, p) => sum + p.amount, 0);
    const pending    = payments.filter((p) => p.status === 'pending').length;
    const last       = payments.length > 0 ? payments[0] : null;
    const coinValue  = (user?.coins || 0) / 100;

    setStats((prev) => ({
      ...prev,
      totalPaid:       total,
      pendingPayments: pending,
      lastPayment:     last,
      freeMonths:      user?.freeServiceMonths || 0,
      coinValue,
    }));
  };

  // ── Initiate Khalti ──────────────────────────────────────────
  const initiateKhalti = async () => {
    setPayLoading(true);
    try {
      const month = new Date().getMonth() + 1;
      const year  = new Date().getFullYear();
      const res   = await api.post('/payments/khalti/initiate', {
        amount:      MONTHLY_FEE,
        paymentType: 'monthly_fee',
        month,
        year,
      });
      if (res.data.payment_url) {
        window.location.href = res.data.payment_url;
      }
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Khalti payment initiation failed', 'error');
    } finally {
      setPayLoading(false);
    }
  };

  // ── Initiate eSewa ───────────────────────────────────────────
  const initiateEsewa = async () => {
    setPayLoading(true);
    try {
      const res = await api.post('/payments/esewa/initiate', {
        amount:      MONTHLY_FEE,
        paymentType: 'monthly_fee',
      });
      if (res.data.formFields && res.data.esewaUrl) {
        submitEsewaForm(res.data.formFields, res.data.esewaUrl);
      }
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'eSewa payment initiation failed', 'error');
      setPayLoading(false);
    }
  };

  // ── Redeem coins ─────────────────────────────────────────────
  const redeemCoins = async () => {
    setPayLoading(true);
    try {
      const res = await api.post('/payments/redeem');
      showSnackbar(res.data.message || '1,000 coins redeemed! Free service activated.', 'success');
      updateUser({ coins: res.data.coinsRemaining });
      setOpenDialog(false);
      fetchPayments();
      fetchMonthlyFeeStatus();
      resetPaymentForm();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Redemption failed', 'error');
    } finally {
      setPayLoading(false);
    }
  };

  // ── Verify Khalti after redirect ─────────────────────────────
  const verifyKhalti = async (pidx) => {
    try {
      const res = await api.post('/payments/khalti/verify', { pidx });
      if (res.data.success) {
        showSnackbar('✅ Khalti payment verified successfully!', 'success');
        fetchPayments();
        fetchMonthlyFeeStatus();
      }
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Khalti verification failed', 'error');
    }
  };

  // ── Verify eSewa after redirect ──────────────────────────────
  const verifyEsewa = async (encodedData) => {
    try {
      const res = await api.post('/payments/esewa/verify', { encodedData });
      if (res.data.success) {
        showSnackbar('✅ eSewa payment verified successfully!', 'success');
        fetchPayments();
        fetchMonthlyFeeStatus();
      }
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'eSewa verification failed', 'error');
    }
  };

  // ── Main payment handler ─────────────────────────────────────
  const handleProcessPayment = async () => {
    if (paymentDetails.method === 'khalti')     return initiateKhalti();
    if (paymentDetails.method === 'esewa')      return initiateEsewa();
    if (paymentDetails.method === 'coin_redeem') return redeemCoins();
  };

  const resetPaymentForm = () => {
    setActiveStep(0);
    setPaymentDetails({
      amount:      MONTHLY_FEE,
      method:      'khalti',
      type:        'monthly_fee',
      description: 'Monthly Service Fee',
    });
    setSelectedType('monthly_fee');
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleTypeChange = (type) => {
    setSelectedType(type);
    const selected = paymentTypes.find((t) => t.value === type);
    setPaymentDetails({
      ...paymentDetails,
      type,
      amount:      selected?.amount || MONTHLY_FEE,
      description: selected?.label || '',
    });
  };

  const handleDownloadReceipt = async (paymentId) => {
    try {
      const response    = await api.get(`/payments/${paymentId}/invoice`, { responseType: 'blob' });
      const contentType = response.headers['content-type'] || '';
      const isPdf       = contentType.includes('pdf');
      const ext         = isPdf ? 'pdf' : 'html';
      const mime        = isPdf ? 'application/pdf' : 'text/html';

      const url  = window.URL.createObjectURL(new Blob([response.data], { type: mime }));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', `receipt-${paymentId}.${ext}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showSnackbar(`Receipt downloaded as ${ext.toUpperCase()}`, 'success');
    } catch (error) {
      showSnackbar('Failed to download receipt', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const canRedeem    = billingStatus.canRedeem;
  const isFeeDue     = !billingStatus.paid && !billingStatus.isFreeActive;
  const selectedMethodObj = paymentMethods.find((m) => m.value === paymentDetails.method);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
          color: 'white',
          py: 4,
          mb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton color="inherit" onClick={() => navigate(-1)} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" fontWeight="700">
              Payments & Billing
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Due payment alert */}
        {isFeeDue && (
          <Alert
            severity="warning"
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              <Button color="inherit" size="small" onClick={() => setOpenDialog(true)}>
                Pay Now
              </Button>
            }
          >
            Your monthly fee of Rs. {billingStatus.monthlyFee} is due. Pay to continue using the service.
          </Alert>
        )}

        {/* Free service active alert */}
        {billingStatus.isFreeActive && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} icon={<CheckCircleIcon />}>
            Free service is active until{' '}
            {billingStatus.freeServiceUntil
              ? format(new Date(billingStatus.freeServiceUntil), 'PPP')
              : '—'}
            . No payment needed this month.
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* ── Left Column ─────────────────────────────────── */}
          <Grid item xs={12} md={4}>
            {/* Total Spent */}
            <Card sx={{ mb: 3, borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2, width: 48, height: 48 }}>
                    <AccountBalanceIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight="600">Total Spent</Typography>
                </Box>
                <Typography variant="h3" color="primary" fontWeight="700" gutterBottom>
                  Rs. {stats.totalPaid.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="textSecondary">Lifetime payments</Typography>
              </CardContent>
            </Card>

            {/* Coins */}
            <Card sx={{ mb: 3, borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: theme.palette.warning.main, mr: 2, width: 48, height: 48 }}>
                    <StarIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight="600">Coin Balance</Typography>
                </Box>
                <Typography variant="h3" color="warning.main" fontWeight="700" gutterBottom>
                  {billingStatus.coinBalance}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {canRedeem
                    ? `✅ Enough to redeem 1 free month (${MONTHLY_FEE} coins needed)`
                    : `Need ${MONTHLY_FEE - billingStatus.coinBalance} more coins to redeem`}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.min((billingStatus.coinBalance / MONTHLY_FEE) * 100, 100)}
                  sx={{ mt: 2, height: 8, borderRadius: 4 }}
                />
              </CardContent>
            </Card>

            {/* Free service active */}
            {billingStatus.isFreeActive && (
              <Card sx={{ mb: 3, borderRadius: 3, bgcolor: theme.palette.success.light }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon sx={{ fontSize: 40, color: 'white', mr: 2 }} />
                    <Box>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                        Free Service Active
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                        Until{' '}
                        {billingStatus.freeServiceUntil
                          ? format(new Date(billingStatus.freeServiceUntil), 'PPP')
                          : '—'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Monthly Fee Status */}
            <Card sx={{ mb: 3, borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Monthly Fee Status
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">Current Month</Typography>
                    <Typography variant="h5" fontWeight="600">
                      {billingStatus.isFreeActive ? 'Free' : billingStatus.paid ? 'Paid' : 'Due'}
                    </Typography>
                  </Box>
                  <Chip
                    label={billingStatus.isFreeActive ? 'Free' : billingStatus.paid ? 'Paid' : 'Due'}
                    color={billingStatus.isFreeActive || billingStatus.paid ? 'success' : 'warning'}
                  />
                </Box>
                {billingStatus.nextPaymentDue && (
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                    Next due: {format(new Date(billingStatus.nextPaymentDue), 'PPP')}
                  </Typography>
                )}
                {billingStatus.lastPaymentDate && (
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                    Last paid: {format(new Date(billingStatus.lastPaymentDate), 'PPP')}
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Quick Actions
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<PaymentIcon />}
                  onClick={() => setOpenDialog(true)}
                  disabled={billingStatus.isFreeActive || billingStatus.paid}
                  sx={{ mb: 1, py: 1.5, borderRadius: 2 }}
                >
                  {billingStatus.isFreeActive || billingStatus.paid ? 'Already Paid' : 'Make a Payment'}
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<HistoryIcon />}
                  onClick={() => setTabValue(0)}
                  sx={{ py: 1.5, borderRadius: 2 }}
                >
                  View History
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* ── Right Column ─────────────────────────────────── */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
                  <Tab label="Payment History" />
                  <Tab label="Invoices" />
                  <Tab label="Payment Methods" />
                </Tabs>
              </Box>

              {/* Payment History Tab */}
              {tabValue === 0 && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight="600">
                      <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Payment History
                    </Typography>
                    {payments.length > 0 && (
                      <Chip label={`${payments.length} transactions`} size="small" color="primary" />
                    )}
                  </Box>

                  {loading ? (
                    <LinearProgress />
                  ) : (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell align="right">Amount</TableCell>
                            <TableCell>Method</TableCell>
                            <TableCell align="center">Status</TableCell>
                            <TableCell align="center">Receipt</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {payments.map((payment) => (
                            <TableRow key={payment._id} hover>
                              <TableCell>
                                <Typography variant="body2">
                                  {format(new Date(payment.createdAt), 'MMM dd, yyyy')}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {format(new Date(payment.createdAt), 'hh:mm a')}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight="500">
                                  {payment.description ||
                                    (payment.type || payment.paymentMethod || '').replace(/_/g, ' ')}
                                </Typography>
                                {payment.transactionId && (
                                  <Typography variant="caption" color="textSecondary">
                                    ID: {payment.transactionId.slice(-8)}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body1" fontWeight="600">
                                  Rs. {payment.amount}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={(payment.paymentMethod || '').replace(/_/g, ' ')}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    fontWeight: 500,
                                    borderColor:
                                      payment.paymentMethod === 'khalti' ? '#5C2D91' :
                                      payment.paymentMethod === 'esewa'  ? '#60BB46' :
                                      undefined,
                                    color:
                                      payment.paymentMethod === 'khalti' ? '#5C2D91' :
                                      payment.paymentMethod === 'esewa'  ? '#60BB46' :
                                      undefined,
                                  }}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={payment.status}
                                  size="small"
                                  color={
                                    payment.status === 'completed' ? 'success' :
                                    payment.status === 'pending'   ? 'warning' : 'error'
                                  }
                                  sx={{ fontWeight: 500 }}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Tooltip title="View Receipt">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => {
                                      setSelectedPayment(payment);
                                      setOpenReceiptDialog(true);
                                    }}
                                  >
                                    <ReceiptIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Download">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleDownloadReceipt(payment._id)}
                                  >
                                    <DownloadIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}

                          {payments.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={6} align="center">
                                <Box sx={{ py: 4 }}>
                                  <PaymentIcon sx={{ fontSize: 48, color: theme.palette.grey[400], mb: 2 }} />
                                  <Typography variant="body1" color="textSecondary" gutterBottom>
                                    No payment history found
                                  </Typography>
                                  <Typography variant="body2" color="textSecondary">
                                    Your payments will appear here once you make your first payment.
                                  </Typography>
                                </Box>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </>
              )}

              {/* Invoices Tab */}
              {tabValue === 1 && (
                <Box sx={{ py: 2 }}>
                  <Typography variant="body1" color="textSecondary" align="center">
                    Download invoices from the payment history tab.
                  </Typography>
                </Box>
              )}

              {/* Payment Methods Tab */}
              {tabValue === 2 && (
                <Grid container spacing={2} sx={{ py: 2 }}>
                  {paymentMethods.map((method) => (
                    <Grid item xs={12} key={method.value}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ bgcolor: method.color + '22', mr: 2 }}>
                              {method.icon}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" fontWeight="600">
                                {method.label}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {method.description}
                              </Typography>
                              <Typography variant="caption" color="textSecondary" display="block">
                                Processing fee: {method.processingFee}
                              </Typography>
                            </Box>
                            <Chip label="Instant" size="small" color="success" />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* ── Payment Dialog ────────────────────────────────────── */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PaymentIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            Make a Payment
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ my: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step 0 — Select Amount */}
          {activeStep === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Payment Type</InputLabel>
                  <Select
                    value={selectedType}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    label="Payment Type"
                  >
                    {paymentTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        <Box>
                          <Typography variant="body1">{type.label}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            Rs. {type.amount}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Alert severity="info" icon={<InfoIcon />}>
                  <Typography variant="body2">
                    <strong>Monthly fee:</strong> Rs. {MONTHLY_FEE}
                    <br />
                    <strong>Coin redemption:</strong> {MONTHLY_FEE} coins = 1 free month
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          )}

          {/* Step 1 — Payment Method */}
          {activeStep === 1 && (
            <Grid container spacing={2}>
              {paymentMethods.map((method) => {
                const isDisabled =
                  method.value === 'coin_redeem' && !canRedeem;

                return (
                  <Grid item xs={12} key={method.value}>
                    <Card
                      sx={{
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        opacity: isDisabled ? 0.5 : 1,
                        border:
                          paymentDetails.method === method.value
                            ? `2px solid ${method.color}`
                            : '1px solid #e0e0e0',
                        '&:hover': !isDisabled ? { boxShadow: theme.shadows[4] } : {},
                        transition: 'all 0.2s',
                      }}
                      onClick={() =>
                        !isDisabled &&
                        setPaymentDetails({ ...paymentDetails, method: method.value })
                      }
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ bgcolor: method.color + '22', mr: 2, width: 48, height: 48 }}>
                            {method.icon}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight="600">
                              {method.label}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {method.description}
                            </Typography>
                            {method.value === 'coin_redeem' && (
                              <Typography
                                variant="caption"
                                color={canRedeem ? 'success.main' : 'error'}
                                display="block"
                              >
                                {canRedeem
                                  ? `You have ${billingStatus.coinBalance} coins ✅`
                                  : `Need ${MONTHLY_FEE - billingStatus.coinBalance} more coins`}
                              </Typography>
                            )}
                          </Box>
                          {paymentDetails.method === method.value && (
                            <CheckCircleIcon sx={{ color: method.color, ml: 2 }} />
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}

          {/* Step 2 — Confirm */}
          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Payment Summary
              </Typography>
              <Paper variant="outlined" sx={{ p: 3, mb: 2, bgcolor: theme.palette.grey[50] }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Amount</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1" align="right" fontWeight="600">
                      Rs. {paymentDetails.amount}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Payment Method</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1" align="right" fontWeight="500">
                      {selectedMethodObj?.label}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Type</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1" align="right" fontWeight="500">
                      {paymentTypes.find((t) => t.value === paymentDetails.type)?.label}
                    </Typography>
                  </Grid>

                  {paymentDetails.method === 'coin_redeem' && (
                    <>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">Coins to deduct</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body1" align="right" fontWeight="600" color="warning.main">
                          {MONTHLY_FEE} coins
                        </Typography>
                      </Grid>
                    </>
                  )}

                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="subtitle1" fontWeight="600">Total</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h5" align="right" color="primary" fontWeight="700">
                      {paymentDetails.method === 'coin_redeem' ? `${MONTHLY_FEE} coins` : `Rs. ${paymentDetails.amount}`}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {paymentDetails.method === 'khalti' && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  You will be redirected to <strong>Khalti</strong> to complete the payment.
                </Alert>
              )}
              {paymentDetails.method === 'esewa' && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  You will be redirected to <strong>eSewa</strong> to complete the payment.
                </Alert>
              )}
              {paymentDetails.method === 'coin_redeem' && (
                <Alert severity="success" icon={<StarIcon />} sx={{ mb: 2 }}>
                  {MONTHLY_FEE} coins will be deducted and free service will be activated for 30 days.
                </Alert>
              )}

              <Alert severity="info">
                By confirming, you agree to our terms and conditions.
              </Alert>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          {activeStep > 0 && <Button onClick={handleBack}>Back</Button>}
          {activeStep < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              variant="contained"
              disabled={!paymentDetails.amount || !paymentDetails.method}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleProcessPayment}
              variant="contained"
              color="primary"
              disabled={
                payLoading ||
                (paymentDetails.method === 'coin_redeem' && !canRedeem)
              }
              size="large"
              startIcon={payLoading ? <CircularProgress size={18} color="inherit" /> : null}
            >
              {payLoading
                ? 'Processing...'
                : paymentDetails.method === 'coin_redeem'
                ? `Redeem ${MONTHLY_FEE} Coins`
                : `Pay Rs. ${paymentDetails.amount} via ${selectedMethodObj?.label}`}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* ── Receipt Dialog ────────────────────────────────────── */}
      <Dialog open={openReceiptDialog} onClose={() => setOpenReceiptDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ReceiptIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            Payment Receipt
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedPayment && (
            <Box>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h5" gutterBottom>Smart Waste Management</Typography>
                <Typography variant="body2" color="textSecondary">Payment Receipt</Typography>
              </Box>

              <QRCode value={`PAYMENT-${selectedPayment.transactionId}`} />

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Transaction ID</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" fontWeight="500">
                    {selectedPayment.transactionId}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Date</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    {format(new Date(selectedPayment.createdAt), 'PPP')}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Amount</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" fontWeight="600" color="primary">
                    Rs. {selectedPayment.amount}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Payment Method</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    {(selectedPayment.paymentMethod || '').replace(/_/g, ' ')}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Status</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Chip
                    label={selectedPayment.status}
                    size="small"
                    color={selectedPayment.status === 'completed' ? 'success' : 'warning'}
                  />
                </Grid>

                {selectedPayment.validUntil && (
                  <>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Valid Until</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        {format(new Date(selectedPayment.validUntil), 'PPP')}
                      </Typography>
                    </Grid>
                  </>
                )}

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="textSecondary">
                    {selectedPayment.description}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReceiptDialog(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => handleDownloadReceipt(selectedPayment?._id)}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ──────────────────────────────────────────── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Payments;