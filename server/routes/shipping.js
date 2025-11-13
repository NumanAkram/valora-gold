const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getShippingCharge, updateShippingCharge } = require('../services/shippingService');

router.get('/', async (req, res) => {
  try {
    const amount = await getShippingCharge();

    res.json({
      success: true,
      data: {
        amount,
      },
    });
  } catch (error) {
    console.error('Get Shipping Charge Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load shipping charge',
    });
  }
});

router.put('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { amount } = req.body;
    const result = await updateShippingCharge({ amount, updatedBy: req.user?._id });

    res.json({
      success: true,
      message: 'Shipping charge updated successfully',
      data: {
        amount: result.amount,
        updatedAt: result.updatedAt,
      },
    });
  } catch (error) {
    console.error('Update Shipping Charge Error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update shipping charge',
    });
  }
});

module.exports = router;
