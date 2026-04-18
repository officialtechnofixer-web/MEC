const express = require('express');
const router = express.Router();
const {
  getCounsellors, addCounsellor, updateCounsellor, autoAssignLeads, deleteCounsellor
} = require('../controllers/counsellorController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getCounsellors);
router.post('/', protect, authorize('admin'), addCounsellor);
router.put('/:id', protect, authorize('admin'), updateCounsellor);
router.delete('/:id', protect, authorize('admin'), deleteCounsellor);
router.post('/auto-assign', protect, authorize('admin'), autoAssignLeads);

module.exports = router;
