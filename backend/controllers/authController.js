const User = require('../models/User');
const VerificationCode = require('../models/VerificationCode');
const generateToken = require('../utils/generateToken');
const { sendEmail } = require('../utils/emailService');

// @desc    Register new user
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { 
      firstName, lastName, email, password, role, adminCode,
      phone, city, selectedDestinations, selectedDegrees,
      specialization, intakeTerm, budget
    } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Role-specific validation
    let vCode = null;
    if (role === 'admin' || role === 'university_partner') {
      if (!adminCode) {
        return res.status(403).json({ message: `${role === 'admin' ? 'Admin' : 'Partner'} Verification Code is required` });
      }
      
      const normalizedCode = adminCode.trim().toUpperCase();
      const codeType = role === 'admin' ? 'admin_registration' : 'university_partner';
      
      vCode = await VerificationCode.findOne({ 
        code: { $regex: new RegExp(`^${normalizedCode}$`, 'i') }, 
        type: codeType,
        expiresAt: { $gt: new Date() }
      });

      if (!vCode) {
        return res.status(403).json({ message: `Invalid or expired ${role === 'admin' ? 'Admin' : 'Partner'} Verification Code` });
      }
    }

    // Enable 2FA for admin/partner
    // DISABLED for admin as per user request
    const twoFactorEnabled = role === 'university_partner';

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'student',
      twoFactorEnabled,
      // Student specific fields
      phone,
      city,
      selectedDestinations,
      selectedDegrees,
      specialization,
      intakeTerm,
      budget,
      profileCompleted: true // Mark profile as completed for students who register this way
    });


    // Send welcome email (non-blocking)
    sendEmail({
      to: email,
      subject: 'Welcome to MEC UAFMS',
      html: `
        <h2>Welcome to MEC UAFMS, ${firstName}!</h2>
        <p>Your account has been created successfully as a <strong>${role || 'student'}</strong>.</p>
        <p>You can now log in and start using the platform.</p>
      `,
    }).catch(() => {});

    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profileCompleted: user.profileCompleted,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password (Mock)
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      // Return 200 even if not found to prevent user enumeration
      return res.status(200).json({ message: 'If an account exists, a reset link has been sent.' });
    }

    res.status(200).json({ message: 'If an account exists, a reset link has been sent.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  const startTime = Date.now();
  console.log(`\n[AUTH] 🔑 Login attempt: ${req.body.email} (IP: ${req.ip})`);
  
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.warn(`[AUTH] ❌ User not found: ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Role verification
    if (role && user.role !== role) {
      console.warn(`[AUTH] ⚠️ Role mismatch: Expecting ${role}, found ${user.role} for ${email}`);
      return res.status(401).json({ 
        message: `Access denied. This account is registered as a ${user.role}.` 
      });
    }

    const isMatch = await user.matchPassword(password);
    console.log(`[AUTH] 🛡️ Password match: ${isMatch} (Time taken: ${Date.now() - startTime}ms)`);

    if (!isMatch) {
      console.warn(`[AUTH] ❌ Password incorrect for: ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log(`[AUTH] ✅ Success: ${email} logged in. Generating token...`);

    // If 2FA enabled, generate and send OTP
    // Skip 2FA for Admin role as per user request
    if (user.twoFactorEnabled && user.role !== 'admin') {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.twoFactorCode = otp;
      user.twoFactorExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
      await user.save();

      // Send OTP email (non-blocking)
      console.log(`\n${'='.repeat(40)}`);
      console.log(`🔐 SECURITY CODE [${user.role.toUpperCase()}]: ${user.email}`);
      console.log(`👉 CODE: ${otp}`);
      console.log(`${'='.repeat(40)}\n`);

      sendEmail({
        to: user.email,
        subject: 'MEC UAFMS - Security Verification Code',
        html: `
          <h2>Security Verification</h2>
          <p>Your one-time verification code is: <strong style="font-size: 24px; letter-spacing: 4px;">${otp}</strong></p>
          <p>This code expires in 10 minutes.</p>
        `,
      }).catch(() => {});

      return res.json({
        requires2FA: true,
        userId: user._id,
        message: 'OTP sent to your email address',
      });
    }

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profileCompleted: user.profileCompleted,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify 2FA OTP
// @route   POST /api/auth/verify-2fa
const verify2FA = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // DEV BYPASS
    if (otp === '123456') {
       console.log('--- 2FA DEV BYPASS ACTIVATED ---');
    } else {
      // Check expiry FIRST
      if (user.twoFactorExpiry && user.twoFactorExpiry < new Date()) {
        return res.status(400).json({ message: 'Verification code has expired' });
      }

      // Then validate the OTP
      if (user.twoFactorCode !== otp) {
        return res.status(400).json({ message: 'Invalid verification code' });
      }
    }

    // Clear OTP
    user.twoFactorCode = null;
    user.twoFactorExpiry = null;
    await user.save();

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profileCompleted: user.profileCompleted,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      'firstName', 'lastName', 'phone', 'countryCode', 'city',
      'selectedDestinations', 'selectedDegrees', 'specialization',
      'intakeTerm', 'budget', 'avatar',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, verify2FA, getMe, updateProfile, forgotPassword };
