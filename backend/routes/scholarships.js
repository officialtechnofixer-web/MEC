const express = require('express');
const router = express.Router();
const scholarshipController = require('../controllers/scholarshipController');
const { protect } = require('../middleware/auth');

router.get('/', protect, scholarshipController.getScholarships);

module.exports = router;
