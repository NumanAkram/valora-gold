const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { protect } = require('../middleware/auth');
const { sendMail } = require('../utils/mailer');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().trim(),
  body('gender').optional().isIn(['male', 'female']).withMessage('Invalid gender selection'),
  body('profileImage').optional().isString().withMessage('Invalid profile image'),
  body('role').optional().isIn(['user', 'admin']).withMessage('Invalid role value')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      name,
      email,
      password,
      phone,
      role,
      profileImage,
      country,
      countryCode,
      phoneDialCode,
      gender,
    } = req.body;
    const normalizedRole = role === 'admin' ? 'admin' : 'user';

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      profileImage,
      country,
      countryCode,
      phoneDialCode,
      gender,
      role: normalizedRole
    });

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profileImage: user.profileImage,
        country: user.country,
        countryCode: user.countryCode,
        phoneDialCode: user.phoneDialCode,
        gender: user.gender,
        token: generateToken(user._id)
      },
      message: 'Account created successfully'
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profileImage: user.profileImage,
        country: user.country,
        countryCode: user.countryCode,
        phoneDialCode: user.phoneDialCode,
        gender: user.gender,
        token: generateToken(user._id)
      },
      message: 'Successfully signed in'
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   POST /api/auth/admin/login
// @desc    Login admin user
// @access  Public (validates admin role)
router.post('/admin/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profileImage: user.profileImage,
        country: user.country,
        countryCode: user.countryCode,
        phoneDialCode: user.phoneDialCode,
        gender: user.gender,
        token: generateToken(user._id)
      },
      message: 'Successfully signed in'
    });
  } catch (error) {
    console.error('Admin Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update current user's profile
// @access  Private
router.put(
  '/profile',
  protect,
  [
    body('email').optional().isEmail().withMessage('Please provide a valid email'),
    body('gender').optional().isIn(['male', 'female']).withMessage('Invalid gender selection'),
    body('newPassword')
      .optional()
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const {
        name,
        email,
        phone,
        profileImage,
        country,
        countryCode,
        phoneDialCode,
        gender,
        newPassword,
        currentPassword,
      } = req.body;

      const user = await User.findById(req.user._id).select('+password');

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (email && email !== user.email) {
        const existing = await User.findOne({ email });
        if (existing && existing._id.toString() !== user._id.toString()) {
          return res.status(400).json({
            success: false,
            message: 'A user with this email already exists',
          });
        }
        user.email = email.trim().toLowerCase();
      }

      if (name !== undefined) {
        user.name = name.trim();
      }
      if (phone !== undefined) {
        user.phone = phone.trim();
      }
      if (profileImage !== undefined && profileImage !== null) {
        // Allow empty string to clear profile image, or set new URL
        user.profileImage = typeof profileImage === 'string' ? profileImage.trim() : profileImage;
      }
      if (country !== undefined) {
        user.country = country.trim();
      }
      if (countryCode !== undefined) {
        user.countryCode = countryCode.trim();
      }
      if (phoneDialCode !== undefined) {
        user.phoneDialCode = phoneDialCode.trim();
      }
      if (gender !== undefined) {
        user.gender = gender;
      }

      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({
            success: false,
            message: 'Current password is required to set a new password',
          });
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
          return res.status(400).json({
            success: false,
            message: 'Current password is incorrect',
          });
        }

        user.password = newPassword;
      }

      await user.save();

      res.json({
        success: true,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          profileImage: user.profileImage,
          country: user.country,
          countryCode: user.countryCode,
          phoneDialCode: user.phoneDialCode,
          gender: user.gender,
          addresses: user.addresses,
          token: generateToken(user._id),
        },
        message: 'Account updated successfully',
      });
    } catch (error) {
      console.error('Update Profile Error:', error);
      res.status(500).json({ success: false, message: 'Server error while updating profile' });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('wishlist', 'name price images')
      .populate('cart.product', 'name price images');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get User Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send reset code to email
// @access  Public
router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Please provide a valid email')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const email = req.body.email?.trim().toLowerCase();

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'A valid email is required',
        });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(200).json({
          success: true,
          message: 'If that email is registered, a code has been sent.',
        });
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      user.resetCode = code;
      user.resetCodeExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
      await user.save();

      await sendMail({
        to: email,
        subject: 'Valora Gold Password Reset Code',
        text: `Your password reset code is ${code}. This code will expire in 5 minutes.`,
        html: `<p>Your password reset code is <strong>${code}</strong>. This code will expire in 5 minutes.</p>`,
      });

      res.json({ success: true, message: 'Reset code sent to your email.' });
    } catch (error) {
      console.error('Forgot Password Error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during password reset',
      });
    }
  }
);

// @route   POST /api/auth/verify-reset-code
// @desc    Verify reset code
// @access  Public
router.post(
  '/verify-reset-code',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('code').isLength({ min: 6, max: 6 }).withMessage('Please provide a valid code'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const email = req.body.email?.trim().toLowerCase();
      const code = req.body.code?.trim();

      if (!email || !code) {
        return res.status(400).json({ success: false, message: 'Email and verification code are required' });
      }

      const user = await User.findOne({ email });

      if (!user || !user.resetCode || !user.resetCodeExpiresAt) {
        return res.status(400).json({ success: false, message: 'Invalid or expired code' });
      }

      if (user.resetCode !== code || Date.now() > new Date(user.resetCodeExpiresAt).getTime()) {
        return res.status(400).json({ success: false, message: 'Invalid or expired code' });
      }

      res.json({ success: true, message: 'Code verified successfully' });
    } catch (error) {
      console.error('Verify Code Error:', error);
      res.status(500).json({ success: false, message: 'Server error verifying code' });
    }
  }
);

// @route   POST /api/auth/reset-password
// @desc    Reset password using code
// @access  Public
router.post(
  '/reset-password',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('code').isLength({ min: 6, max: 6 }).withMessage('Please provide a valid code'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const email = req.body.email?.trim().toLowerCase();
      const code = req.body.code?.trim();
      const newPassword = req.body.newPassword;

      if (!email || !code || !newPassword) {
        return res.status(400).json({ success: false, message: 'Email, code, and new password are required' });
      }

      const user = await User.findOne({ email }).select('+password');

      if (!user || !user.resetCode || !user.resetCodeExpiresAt) {
        return res.status(400).json({ success: false, message: 'Invalid or expired code' });
      }

      if (user.resetCode !== code || Date.now() > new Date(user.resetCodeExpiresAt).getTime()) {
        return res.status(400).json({ success: false, message: 'Invalid or expired code' });
      }

      user.password = newPassword;
      user.resetCode = undefined;
      user.resetCodeExpiresAt = undefined;
      await user.save();

      res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
      console.error('Reset Password Error:', error);
      res.status(500).json({ success: false, message: 'Server error resetting password' });
    }
  }
);

module.exports = router;
