import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Card,
  CardContent,
  Divider,
  IconButton,
  InputAdornment,
  useTheme,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  DirectionsCar as VehicleIcon,
  AssignmentInd as AssignmentIndIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Upload as UploadIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  Verified as VerifiedIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

const steps = ['Personal Info', 'Vehicle Details', 'Work Zone', 'Documents', 'Review'];

const vehicleTypes = [
  { value: 'truck', label: 'Truck', capacity: '5-10 tons', icon: '🚛' },
  { value: 'van', label: 'Van', capacity: '1-3 tons', icon: '🚐' },
  { value: 'bike', label: 'Bike/Tricycle', capacity: '100-200 kg', icon: '🛵' },
  { value: 'electric-vehicle', label: 'Electric Vehicle', capacity: '1-2 tons', icon: '⚡' },
  { value: 'other', label: 'Other', capacity: 'Varies', icon: '🚗' }
];

const zones = [
  { value: 'north', label: 'North Zone', areas: ['Downtown', 'Suburb North', 'Industrial Area'] },
  { value: 'south', label: 'South Zone', areas: ['City Center', 'Residential South', 'Park Area'] },
  { value: 'east', label: 'East Zone', areas: ['East End', 'Commercial District', 'Tech Park'] },
  { value: 'west', label: 'West Zone', areas: ['West Side', 'Shopping District', 'Residential West'] },
  { value: 'central', label: 'Central Zone', areas: ['Central Business', 'Old City', 'Market Area'] }
];

const days = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const CollectorRegister = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: 'COL' + Date.now().toString().slice(-6),
    vehicleType: '',
    vehicleNumber: '',
    zone: '',
    assignedWards: [],
    schedule: days.map(day => ({
      day,
      startTime: day !== 'Sunday' ? '09:00' : '',
      endTime: day !== 'Sunday' ? '17:00' : '',
      working: day !== 'Sunday'
    })),
    documents: {
      license: null,
      insurance: null,
      idProof: null
    }
  });

  const [errors, setErrors] = useState({});

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const validateStep = () => {
    const newErrors = {};

    if (activeStep === 0) {
      // Personal info is from user profile, no validation needed
    }

    if (activeStep === 1) {
      if (!formData.vehicleType) newErrors.vehicleType = 'Vehicle type is required';
      if (!formData.vehicleNumber) newErrors.vehicleNumber = 'Vehicle number is required';
    }

    if (activeStep === 2) {
      if (!formData.zone) newErrors.zone = 'Zone is required';
      if (formData.assignedWards.length === 0) newErrors.assignedWards = 'Select at least one ward';
    }

    if (activeStep === 3) {
      if (!formData.documents.license) newErrors.license = 'Driver\'s license is required';
      if (!formData.documents.insurance) newErrors.insurance = 'Insurance is required';
      if (!formData.documents.idProof) newErrors.idProof = 'ID proof is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = (field, file) => {
    setFormData({
      ...formData,
      documents: {
        ...formData.documents,
        [field]: file
      }
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      
      // Append text data
      Object.keys(formData).forEach(key => {
        if (key !== 'documents') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        }
      });

      // Append documents
      Object.keys(formData.documents).forEach(key => {
        if (formData.documents[key]) {
          formDataToSend.append(key, formData.documents[key]);
        }
      });

      await api.post('/collectors/register', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Registered as collector successfully! Your documents will be verified within 1-2 business days.');
      navigate('/collector/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" icon={<InfoIcon />}>
                Your personal information will be used from your profile. You can update it in settings.
              </Alert>
            </Grid>
            
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Profile Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        value={user?.name || ''}
                        disabled
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={user?.email || ''}
                        disabled
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone"
                        value={user?.phone || ''}
                        disabled
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PhoneIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Employee ID"
                        value={formData.employeeId}
                        disabled
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AssignmentIndIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Vehicle Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.vehicleType}>
                <InputLabel>Vehicle Type</InputLabel>
                <Select
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                  label="Vehicle Type"
                >
                  {vehicleTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1" sx={{ mr: 1 }}>{type.icon}</Typography>
                        <Box>
                          <Typography variant="body1">{type.label}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            Capacity: {type.capacity}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {errors.vehicleType && (
                  <Typography variant="caption" color="error">
                    {errors.vehicleType}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vehicle Number"
                value={formData.vehicleNumber}
                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                error={!!errors.vehicleNumber}
                helperText={errors.vehicleNumber}
                placeholder="e.g., ABC-1234"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VehicleIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Work Zone & Schedule
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.zone}>
                <InputLabel>Primary Zone</InputLabel>
                <Select
                  value={formData.zone}
                  onChange={(e) => {
                    const zone = zones.find(z => z.value === e.target.value);
                    setFormData({ 
                      ...formData, 
                      zone: e.target.value,
                      assignedWards: zone?.areas || []
                    });
                  }}
                  label="Primary Zone"
                >
                  {zones.map((zone) => (
                    <MenuItem key={zone.value} value={zone.value}>
                      {zone.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.zone && (
                  <Typography variant="caption" color="error">
                    {errors.zone}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Assigned Wards/Areas
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {formData.assignedWards.map((ward) => (
                  <Chip
                    key={ward}
                    label={ward}
                    onDelete={() => {
                      const newWards = formData.assignedWards.filter(w => w !== ward);
                      setFormData({ ...formData, assignedWards: newWards });
                    }}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
              {errors.assignedWards && (
                <Typography variant="caption" color="error">
                  {errors.assignedWards}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Work Schedule
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                {formData.schedule.map((item, index) => (
                  <Box key={item.day} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Chip
                      label={item.day.slice(0, 3)}
                      size="small"
                      color={item.working ? 'primary' : 'default'}
                      onClick={() => {
                        const newSchedule = [...formData.schedule];
                        newSchedule[index].working = !newSchedule[index].working;
                        setFormData({ ...formData, schedule: newSchedule });
                      }}
                    />
                    {item.working && (
                      <>
                        <TextField
                          type="time"
                          size="small"
                          value={item.startTime}
                          onChange={(e) => {
                            const newSchedule = [...formData.schedule];
                            newSchedule[index].startTime = e.target.value;
                            setFormData({ ...formData, schedule: newSchedule });
                          }}
                          sx={{ width: 100 }}
                        />
                        <Typography>-</Typography>
                        <TextField
                          type="time"
                          size="small"
                          value={item.endTime}
                          onChange={(e) => {
                            const newSchedule = [...formData.schedule];
                            newSchedule[index].endTime = e.target.value;
                            setFormData({ ...formData, schedule: newSchedule });
                          }}
                          sx={{ width: 100 }}
                        />
                      </>
                    )}
                  </Box>
                ))}
              </Paper>
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Required Documents
              </Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                Please upload clear photos or scans of the following documents. They will be verified within 1-2 business days.
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <VerifiedIcon color={formData.documents.license ? 'success' : 'action'} sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="body1">Driver's License</Typography>
                        <Typography variant="caption" color="textSecondary">
                          Upload a clear photo of your valid driver's license
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<UploadIcon />}
                      color={formData.documents.license ? 'success' : 'primary'}
                    >
                      {formData.documents.license ? 'Reupload' : 'Upload'}
                      <input
                        type="file"
                        hidden
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload('license', e.target.files[0])}
                      />
                    </Button>
                  </Box>
                  {formData.documents.license && (
                    <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                      ✓ {formData.documents.license.name} uploaded
                    </Typography>
                  )}
                  {errors.license && (
                    <Typography variant="caption" color="error">
                      {errors.license}
                    </Typography>
                  )}
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <VerifiedIcon color={formData.documents.insurance ? 'success' : 'action'} sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="body1">Vehicle Insurance</Typography>
                        <Typography variant="caption" color="textSecondary">
                          Current insurance certificate for your vehicle
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<UploadIcon />}
                      color={formData.documents.insurance ? 'success' : 'primary'}
                    >
                      {formData.documents.insurance ? 'Reupload' : 'Upload'}
                      <input
                        type="file"
                        hidden
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload('insurance', e.target.files[0])}
                      />
                    </Button>
                  </Box>
                  {formData.documents.insurance && (
                    <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                      ✓ {formData.documents.insurance.name} uploaded
                    </Typography>
                  )}
                  {errors.insurance && (
                    <Typography variant="caption" color="error">
                      {errors.insurance}
                    </Typography>
                  )}
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <VerifiedIcon color={formData.documents.idProof ? 'success' : 'action'} sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="body1">Identity Proof</Typography>
                        <Typography variant="caption" color="textSecondary">
                          Government ID (Aadhar, Passport, Voter ID)
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<UploadIcon />}
                      color={formData.documents.idProof ? 'success' : 'primary'}
                    >
                      {formData.documents.idProof ? 'Reupload' : 'Upload'}
                      <input
                        type="file"
                        hidden
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload('idProof', e.target.files[0])}
                      />
                    </Button>
                  </Box>
                  {formData.documents.idProof && (
                    <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                      ✓ {formData.documents.idProof.name} uploaded
                    </Typography>
                  )}
                  {errors.idProof && (
                    <Typography variant="caption" color="error">
                      {errors.idProof}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      case 4:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Please review your information before submitting
              </Alert>

              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Personal Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><PersonIcon /></ListItemIcon>
                      <ListItemText primary="Name" secondary={user?.name} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><EmailIcon /></ListItemIcon>
                      <ListItemText primary="Email" secondary={user?.email} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><PhoneIcon /></ListItemIcon>
                      <ListItemText primary="Phone" secondary={user?.phone} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><AssignmentIndIcon /></ListItemIcon>
                      <ListItemText primary="Employee ID" secondary={formData.employeeId} />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>

              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Vehicle Details
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><VehicleIcon /></ListItemIcon>
                      <ListItemText 
                        primary="Vehicle Type" 
                        secondary={vehicleTypes.find(v => v.value === formData.vehicleType)?.label || 'Not specified'} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><AssignmentIndIcon /></ListItemIcon>
                      <ListItemText primary="Vehicle Number" secondary={formData.vehicleNumber || 'Not specified'} />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>

              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Work Zone
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><LocationIcon /></ListItemIcon>
                      <ListItemText 
                        primary="Zone" 
                        secondary={zones.find(z => z.value === formData.zone)?.label || 'Not specified'} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><ScheduleIcon /></ListItemIcon>
                      <ListItemText 
                        primary="Assigned Areas" 
                        secondary={formData.assignedWards.join(', ') || 'None'} 
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Documents
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <VerifiedIcon color={formData.documents.license ? 'success' : 'error'} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Driver's License" 
                        secondary={formData.documents.license ? 'Uploaded' : 'Not uploaded'} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <VerifiedIcon color={formData.documents.insurance ? 'success' : 'error'} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Vehicle Insurance" 
                        secondary={formData.documents.insurance ? 'Uploaded' : 'Not uploaded'} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <VerifiedIcon color={formData.documents.idProof ? 'success' : 'error'} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Identity Proof" 
                        secondary={formData.documents.idProof ? 'Uploaded' : 'Not uploaded'} 
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', py: 4 }}>
      <Container maxWidth="md">
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" fontWeight="700">
              Register as Collector
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {getStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
              variant="outlined"
            >
              Back
            </Button>
            
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                size="large"
              >
                {loading ? <LinearProgress size={24} /> : 'Submit Registration'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Box>

          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              By registering as a collector, you agree to our terms and conditions. You'll be able to start accepting collection requests once your documents are verified.
            </Typography>
          </Alert>
        </Paper>
      </Container>
    </Box>
  );
};

export default CollectorRegister;