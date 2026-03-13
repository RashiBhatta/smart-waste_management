import React from 'react';
import {
  Box,
  Chip,
  Tooltip,
  Badge,
  Avatar,
  alpha,
  useTheme,
  Popper,
  Paper,
  ClickAwayListener,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  Button,
  CircularProgress
} from '@mui/material';
import {
  EmojiEvents,
  Stars,
  TrendingUp,
  CheckCircle
} from '@mui/icons-material';
import { useCoins } from '../context/CoinContext';
import { useNavigate } from 'react-router-dom';

const CoinBalance = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const {
    balance,
    totalEarned,
    getProgressToFreeService,
    isServiceFree,
    freeServiceUntil,
    loading
  } = useCoins();
  
  const [anchorEl, setAnchorEl] = React.useState(null);
  const progress = getProgressToFreeService();

  const handleClick = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'coin-popper' : undefined;

  if (loading) {
    return <CircularProgress size={24} />;
  }

  return (
    <>
      <Tooltip title="Your Eco-Coins Balance">
        <Chip
          avatar={
            <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
              <Stars sx={{ fontSize: 18, color: 'white' }} />
            </Avatar>
          }
          label={balance}
          onClick={handleClick}
          sx={{
            fontWeight: 700,
            bgcolor: alpha(theme.palette.warning.main, 0.1),
            color: theme.palette.warning.dark,
            '&:hover': {
              bgcolor: alpha(theme.palette.warning.main, 0.2)
            },
            cursor: 'pointer'
          }}
        />
      </Tooltip>

      <Popper
        id={id}
        open={open}
        anchorEl={anchorEl}
        placement="bottom-end"
        sx={{ zIndex: 1300 }}
      >
        <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
          <Paper
            sx={{
              mt: 1,
              width: 300,
              borderRadius: 2,
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ p: 2, bgcolor: theme.palette.primary.main, color: 'white' }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Eco-Coins Wallet
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Earn coins by volunteering and get free services!
              </Typography>
            </Box>

            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Current Balance
                </Typography>
                <Typography variant="h5" fontWeight={700} color="warning.main">
                  {balance} coins
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Lifetime Earned
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {totalEarned} coins
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Free Service Progress
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {progress.earned}/1000 coins earned
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  height: 8,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  borderRadius: 4,
                  mb: 1,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box
                  sx={{
                    width: `${progress.percentage}%`,
                    height: '100%',
                    bgcolor: theme.palette.success.main,
                    borderRadius: 4,
                    transition: 'width 0.3s ease'
                  }}
                />
              </Box>

              {isServiceFree ? (
                <Box sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), p: 1.5, borderRadius: 1, mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle color="success" />
                    <Box>
                      <Typography variant="body2" fontWeight={700} color="success.main">
                        Free Service Active!
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Valid until {new Date(freeServiceUntil).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ) : progress.canRedeem ? (
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  sx={{ mt: 2 }}
                  onClick={() => navigate('/payments/redeem')}
                >
                  Redeem 1000 coins for Free Month
                </Button>
              ) : (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                  Need {progress.needed} more coins to unlock free service
                </Typography>
              )}
            </Box>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
};

export default CoinBalance;