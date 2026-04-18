const express = require('express');
const router = express.Router();
const { register, login, verify2FA, getMe, updateProfile, forgotPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-2fa', verify2FA);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
