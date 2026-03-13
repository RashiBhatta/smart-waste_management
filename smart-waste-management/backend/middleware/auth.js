const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify token
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized, no token' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-here-change-in-production');
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized, user not found' 
      });
    }

    if (!req.user.isActive) {
      return res.status(401).json({ 
        success: false,
        message: 'Account deactivated. Please contact admin.' 
      });
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      success: false,
      message: 'Not authorized, token failed' 
    });
  }
};

// Generic authorize function (for any role)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route. Required roles: ${roles.join(', ')}`
      });
    }
    next();
  };
};

// Admin middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      success: false,
      message: 'Not authorized as admin' 
    });
  }
};

// Collector middleware
const collector = (req, res, next) => {
  if (req.user && req.user.role === 'collector') {
    next();
  } else {
    res.status(403).json({ 
      success: false,
      message: 'Not authorized as collector' 
    });
  }
};

// Resident middleware
const resident = (req, res, next) => {
  if (req.user && req.user.role === 'resident') {
    next();
  } else {
    res.status(403).json({ 
      success: false,
      message: 'Not authorized as resident' 
    });
  }
};

// Check monthly fee for residents
const checkMonthlyFee = async (req, res, next) => {
  try {
    if (req.user && req.user.role === 'resident') {
      const now = new Date();
      
      // Check if payment is due
      if (req.user.paymentDueDate && req.user.paymentDueDate < now) {
        req.user.monthlyFeePaid = false;
        await req.user.save();
      }
      
      // Block access if fee not paid and no free months
      if (!req.user.monthlyFeePaid && req.user.freeServiceMonths === 0) {
        return res.status(403).json({
          success: false,
          message: 'Monthly fee payment required. Please pay to continue using the service.',
          redirectTo: '/resident/payments'
        });
      }

      // Flag if free months are available
      if (req.user.freeServiceMonths > 0) {
        req.user.hasFreeMonths = true;
      }
    }
    next();
  } catch (error) {
    console.error('Error checking monthly fee:', error);
    next();
  }
};

// Check if user has completed profile (for collectors)
const checkCollectorProfile = async (req, res, next) => {
  try {
    if (req.user && req.user.role === 'collector') {
      const Collector = require('../models/Collector');
      const collector = await Collector.findOne({ user: req.user._id });
      
      if (!collector) {
        return res.status(403).json({
          success: false,
          message: 'Collector profile not found. Please complete your registration.',
          redirectTo: '/collector/register'
        });
      }
      
      if (collector.vehicleType === 'Not specified' || collector.vehicleNumber === 'Not specified') {
        return res.status(403).json({
          success: false,
          message: 'Please complete your collector profile with vehicle details.',
          redirectTo: '/collector/register'
        });
      }
      
      req.collector = collector;
    }
    next();
  } catch (error) {
    console.error('Error checking collector profile:', error);
    next();
  }
};

// Check if user has free months available
const checkFreeMonths = (req, res, next) => {
  if (req.user && req.user.freeServiceMonths > 0) {
    req.user.hasFreeMonths = true;
  }
  next();
};

// Optional: Check specific permissions
const hasPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Admins have all permissions
    if (req.user.role === 'admin') {
      return next();
    }

    // Add specific permission logic here based on your needs
    const permissions = {
      'manage_users': ['admin'],
      'manage_collections': ['admin', 'collector'],
      'view_reports': ['admin', 'collector'],
      'join_programs': ['resident'],
      'make_payments': ['resident'],
      'update_location': ['collector']
    };

    const allowedRoles = permissions[permission];
    if (!allowedRoles) {
      return res.status(400).json({
        success: false,
        message: 'Invalid permission'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} does not have ${permission} permission`
      });
    }

    next();
  };
};

module.exports = { 
  protect, 
  authorize,
  admin, 
  collector, 
  resident, 
  checkMonthlyFee,
  checkCollectorProfile,
  checkFreeMonths,
  hasPermission
};