// routes/reports.js
// Legacy stub — actual report logic is in routes/adminReports.js
// This file exists to prevent "Cannot find module" crash in server.js

const express = require('express');
const router  = express.Router();

// Redirect legacy /api/reports calls to the admin reports endpoints
router.get('*', (req, res) => {
  res.status(301).json({
    success: false,
    message: 'Please use /api/admin/reports instead of /api/reports'
  });
});

module.exports = router;