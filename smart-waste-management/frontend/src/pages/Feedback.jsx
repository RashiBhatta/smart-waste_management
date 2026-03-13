import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Rating,
  TextField,
  Button,
  Avatar,
  Chip,
  Alert,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  useTheme,
  Card,
  CardContent,
  LinearProgress,
  Divider,
  Snackbar,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Recycling as RecyclingIcon,
  CheckCircle as CheckCircleIcon,
  SentimentSatisfied as HappyIcon,
  SentimentNeutral as NeutralIcon,
  SentimentDissatisfied as SadIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  Send as SendIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const steps = ['Overall Rating', 'Specific Aspects', 'Comments'];

const Feedback = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { collectionId } = useParams();
  const { user } = useAuth();
  
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [feedback, setFeedback] = useState({
    rating: 5,
    comment: '',
    wouldRecommend: true,
    categories: {
      punctuality: 5,
      professionalism: 5,
      cleanliness: 5,
      communication: 5,
      care: 5
    }
  });

  useEffect(() => {
    fetchCollectionDetails();
  }, [collectionId]);

  const fetchCollectionDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/collections/${collectionId}`);
      setCollection(response.data.collection);
      
      if (response.data.collection.feedback) {
        setFeedback({
          rating: response.data.collection.feedback.rating,
          comment: response.data.collection.feedback.comment || '',
          wouldRecommend: response.data.collection.feedback.wouldRecommend || true,
          categories: response.data.collection.feedback.categories || {
            punctuality: 5,
            professionalism: 5,
            cleanliness: 5,
            communication: 5,
            care: 5
          }
        });
      }
    } catch (error) {
      toast.error('Failed to fetch collection details');
      navigate('/my-collections');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    try {
      setSubmitting(true);
      await api.post(`/collections/${collectionId}/feedback`, feedback);
      
      setSnackbar({
        open: true,
        message: 'Thank you for your feedback!',
        severity: 'success'
      });
      
      setTimeout(() => {
        navigate('/my-collections');
      }, 2000);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to submit feedback',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h6" gutterBottom>
              How would you rate your overall experience?
            </Typography>
            <Rating
              value={feedback.rating}
              onChange={(e, value) => setFeedback({ ...feedback, rating: value })}
              size="large"
              sx={{ fontSize: 48, mb: 3 }}
            />
            
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <SadIcon color="error" sx={{ fontSize: 40 }} />
                  <Typography variant="caption" display="block">
                    Poor
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <NeutralIcon color="warning" sx={{ fontSize: 40 }} />
                  <Typography variant="caption" display="block">
                    Average
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <HappyIcon color="success" sx={{ fontSize: 40 }} />
                  <Typography variant="caption" display="block">
                    Excellent
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <FormControl component="fieldset" sx={{ mt: 3 }}>
              <FormLabel component="legend">Would you recommend this collector?</FormLabel>
              <RadioGroup
                row
                value={feedback.wouldRecommend}
                onChange={(e) => setFeedback({ ...feedback, wouldRecommend: e.target.value === 'true' })}
              >
                <FormControlLabel value={true} control={<Radio />} label="Yes" />
                <FormControlLabel value={false} control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom>
              Rate Specific Aspects
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography>Punctuality</Typography>
                  <Rating
                    value={feedback.categories.punctuality}
                    onChange={(e, value) => setFeedback({
                      ...feedback,
                      categories: { ...feedback.categories, punctuality: value }
                    })}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography>Professionalism</Typography>
                  <Rating
                    value={feedback.categories.professionalism}
                    onChange={(e, value) => setFeedback({
                      ...feedback,
                      categories: { ...feedback.categories, professionalism: value }
                    })}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography>Cleanliness</Typography>
                  <Rating
                    value={feedback.categories.cleanliness}
                    onChange={(e, value) => setFeedback({
                      ...feedback,
                      categories: { ...feedback.categories, cleanliness: value }
                    })}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography>Communication</Typography>
                  <Rating
                    value={feedback.categories.communication}
                    onChange={(e, value) => setFeedback({
                      ...feedback,
                      categories: { ...feedback.categories, communication: value }
                    })}
                  />
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography>Care for Waste</Typography>
                  <Rating
                    value={feedback.categories.care}
                    onChange={(e, value) => setFeedback({
                      ...feedback,
                      categories: { ...feedback.categories, care: value }
                    })}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom>
              Additional Comments
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Tell us more about your experience... (optional)"
              value={feedback.comment}
              onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
              sx={{ mb: 2 }}
            />
            
            <Alert severity="info">
              <Typography variant="body2">
                Your feedback helps us improve our service and recognize our collectors for their hard work!
              </Typography>
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>Loading collection details...</Typography>
      </Container>
    );
  }

  if (!collection) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">Collection not found</Alert>
      </Container>
    );
  }

  if (collection.feedback) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
          <CheckCircleIcon sx={{ fontSize: 60, color: theme.palette.success.main, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Feedback Already Submitted
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            You have already provided feedback for this collection. Thank you for your input!
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/my-collections')}
            sx={{ mt: 2 }}
          >
            Back to Collections
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', py: 4 }}>
      <Container maxWidth="md">
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" fontWeight="700">
              Rate Your Experience
            </Typography>
          </Box>

          {/* Collection Summary */}
          <Card sx={{ mb: 4, borderRadius: 2, bgcolor: theme.palette.grey[50] }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <RecyclingIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Waste Type
                      </Typography>
                      <Typography variant="body1" fontWeight="600">
                        {collection.wasteType}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <StarIcon sx={{ mr: 1, color: theme.palette.warning.main }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Weight
                      </Typography>
                      <Typography variant="body1" fontWeight="600">
                        {collection.weight} kg
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarIcon sx={{ mr: 1, color: theme.palette.info.main }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Collection Date
                      </Typography>
                      <Typography variant="body1" fontWeight="600">
                        {collection.completedDate ? format(new Date(collection.completedDate), 'PPP') : 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Collector
                      </Typography>
                      <Typography variant="body1" fontWeight="600">
                        {collection.collector?.name || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationIcon sx={{ mr: 1, color: theme.palette.error.main }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Address
                      </Typography>
                      <Typography variant="body1">
                        {collection.address?.street}, {collection.address?.city}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Feedback Steps */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {getStepContent(activeStep)}

          <Divider sx={{ my: 3 }} />

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
              variant="outlined"
            >
              Back
            </Button>
            
            {activeStep === 2 ? (
              <Button
                variant="contained"
                onClick={handleSubmitFeedback}
                disabled={submitting}
                startIcon={submitting ? <LinearProgress size={20} /> : <SendIcon />}
                size="large"
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
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

          {/* Thank You Message */}
          {activeStep === 2 && (
            <Alert severity="success" sx={{ mt: 3 }}>
              <Typography variant="body2">
                Thank you for taking the time to provide feedback! Your input helps us improve our service.
              </Typography>
            </Alert>
          )}
        </Paper>
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Feedback;