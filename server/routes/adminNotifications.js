const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

// @route   GET /api/admin/notifications
// @desc    Get latest admin notifications
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error('Get Notifications Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load notifications',
    });
  }
});

// @route   POST /api/admin/notifications/:id/read
// @desc    Mark a notification as read
router.post('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error('Mark Notification Read Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification',
    });
  }
});

// @route   POST /api/admin/notifications/clear
// @desc    Clear all notifications
router.post('/clear', async (req, res) => {
  try {
    await Notification.deleteMany({});
    res.json({
      success: true,
      message: 'Notifications cleared',
    });
  } catch (error) {
    console.error('Clear Notifications Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear notifications',
    });
  }
});

module.exports = router;


