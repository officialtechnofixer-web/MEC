const express = require('express');
const router = express.Router();
const {
  getConsentLogs, recordConsent, requestDataExport, deleteAccount,
  getPlatformSettings, updatePlatformSettings,
} = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/platform', protect, authorize('admin'), getPlatformSettings);
router.put('/platform', protect, authorize('admin'), updatePlatformSettings);
router.get('/consent-logs', protect, getConsentLogs);
router.post('/consent', protect, recordConsent);
router.post('/data-export', protect, requestDataExport);
router.delete('/account', protect, deleteAccount);

module.exports = router;
