const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Newsletter = require('../models/Newsletter');

// @route   POST /api/newsletter
// @desc    Subscribe to newsletter
// @access  Public
router.post('/', [
  body('email').isEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email } = req.body;

    // Check if already subscribed
    const existing = await Newsletter.findOne({ email });
    if (existing) {
      if (existing.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Email already subscribed'
        });
      } else {
        existing.isActive = true;
        existing.subscribedAt = new Date();
        await existing.save();
        return res.json({
          success: true,
          message: 'Successfully resubscribed to newsletter'
        });
      }
    }

    // Subscribe
    await Newsletter.create({ email });

    res.json({
      success: true,
      message: 'Successfully subscribed to newsletter!'
    });
  } catch (error) {
    console.error('Newsletter Subscribe Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
