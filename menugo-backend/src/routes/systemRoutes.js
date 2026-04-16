// src/routes/systemRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getSystemSettings,
  updateSystemSettings,
  getAuditLogs,
  getSystemHealth,
  getBackups,
  createBackup,
  deleteBackup,
  downloadBackup,
  testEmailSettings,
} = require('../controllers/systemController');

// All system routes require authentication and platform admin role
router.use(protect);
router.use(authorize('platform_admin'));

// Settings routes
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);

// Email settings
router.put('/settings/email', updateSystemSettings);
router.post('/settings/email/test', testEmailSettings);

// Audit logs
router.get('/audit-logs', getAuditLogs);

// System health
router.get('/health', getSystemHealth);

// Backup management
router.get('/backups', getBackups);
router.post('/backups', createBackup);
router.delete('/backups/:backupId', deleteBackup);
router.get('/backups/:backupId/download', downloadBackup);

module.exports = router;