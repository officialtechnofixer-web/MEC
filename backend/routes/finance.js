const express = require('express');
const router = express.Router();
const { getInvoices, createInvoice, payInvoice } = require('../controllers/financeController');
const { protect, authorize } = require('../middleware/auth');

router.get('/invoices', protect, getInvoices);
router.post('/invoices', protect, authorize('admin'), createInvoice);
router.put('/invoices/:id/pay', protect, payInvoice);

module.exports = router;
