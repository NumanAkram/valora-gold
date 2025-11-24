const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

const ORDER_STATUS_VALUES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUS_VALUES = ['pending', 'paid', 'failed'];

// Helper to build sales chart data
const buildSalesChart = async () => {
  const monthsToShow = 6;
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - (monthsToShow - 1), 1);

  const salesAggregation = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        total: { $sum: '$total' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const labels = [];
  const data = [];

  for (let i = 0; i < monthsToShow; i += 1) {
    const date = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const label = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    const bucket = salesAggregation.find(
      (entry) => entry._id.year === year && entry._id.month === month
    );

    labels.push(label);
    data.push(bucket ? bucket.total : 0);
  }

  return { labels, data };
};

// Helper to build inventory chart data
const buildInventoryChart = async () => {
  const inventoryAggregation = await Product.aggregate([
    {
      $group: {
        _id: '$category',
        stock: { $sum: '$stockCount' },
      },
    },
    { $sort: { stock: -1 } },
    { $limit: 6 },
  ]);

  return {
    labels: inventoryAggregation.map((entry) => entry._id || 'Uncategorized'),
    data: inventoryAggregation.map((entry) => entry.stock),
  };
};

// @route   GET /api/admin/metrics
// @desc    Get dashboard metrics overview
// @access  Private/Admin
router.get('/metrics', async (req, res) => {
  try {
    const [orderTotals, productCount, customerCount, salesChart, inventoryChart, latestOrders] =
      await Promise.all([
        Order.aggregate([
          {
            $group: {
              _id: null,
              totalSales: { $sum: '$total' },
              totalOrders: { $sum: 1 },
            },
          },
        ]),
        Product.countDocuments(),
        User.countDocuments({ role: 'user' }),
        buildSalesChart(),
        buildInventoryChart(),
        Order.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('user', 'name email')
          .select('orderNumber orderStatus total createdAt user'),
      ]);

    const totalsAggregation = orderTotals[0] || { totalSales: 0, totalOrders: 0 };

    res.json({
      success: true,
      data: {
        totals: {
          sales: totalsAggregation.totalSales || 0,
          orders: totalsAggregation.totalOrders || 0,
          products: productCount,
          customers: customerCount,
        },
        salesChart,
        inventoryChart,
        latestOrders: latestOrders.map((order) => ({
          _id: order._id,
          orderNumber: order.orderNumber,
          customerName: order.user?.name || 'Guest',
          status: order.orderStatus,
          total: order.total,
          createdAt: order.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('Admin Metrics Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard metrics',
    });
  }
});

// @route   GET /api/admin/orders
// @desc    Get all orders with filters
// @access  Private/Admin
router.get('/orders', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate,
      search,
    } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

    const match = {};

    if (status && status !== 'all') {
      match.orderStatus = status;
    }

    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) {
        match.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        match.createdAt.$lte = end;
      }
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      match.$or = [
        { orderNumber: regex },
        { trackingNumber: regex },
        { 'user.name': regex },
        { 'user.email': regex },
        { 'shippingAddress.phone': regex },
      ];
    }

    const pipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
    ];

    if (Object.keys(match).length > 0) {
      pipeline.push({ $match: match });
    }

    pipeline.push({ $sort: { createdAt: -1 } });

    pipeline.push({
      $facet: {
        data: [
          { $skip: (pageNumber - 1) * limitNumber },
          { $limit: limitNumber },
          {
            $project: {
              _id: 1,
              orderNumber: 1,
              total: 1,
              orderStatus: 1,
              paymentStatus: 1,
              trackingNumber: 1,
              createdAt: 1,
              itemsCount: { $size: '$items' },
              shippingAddress: 1,
              user: {
                _id: '$user._id',
                name: '$user.name',
                email: '$user.email',
                phone: '$user.phone',
              },
            },
          },
        ],
        totalCount: [{ $count: 'count' }],
      },
    });

    const aggregation = await Order.aggregate(pipeline);
    const orders = aggregation[0]?.data || [];
    const total = aggregation[0]?.totalCount?.[0]?.count || 0;

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        pages: Math.ceil(total / limitNumber) || 1,
      },
    });
  } catch (error) {
    console.error('Admin Get Orders Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
    });
  }
});

// @route   GET /api/admin/orders/:id
// @desc    Get order details
// @access  Private/Admin
router.get('/orders/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order id',
      });
    }

    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images price');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Admin Get Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
    });
  }
});

// @route   PUT /api/admin/orders/:id/status
// @desc    Update order status or payment status
// @access  Private/Admin
router.put('/orders/:id/status', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order id',
      });
    }

    const { status, paymentStatus, trackingNumber } = req.body;

    if (!status && !paymentStatus && trackingNumber === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one field to update',
      });
    }

    if (status && !ORDER_STATUS_VALUES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status value',
      });
    }

    if (paymentStatus && !PAYMENT_STATUS_VALUES.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status value',
      });
    }

    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images price');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (status) {
      order.orderStatus = status;
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    if (trackingNumber !== undefined) {
      order.trackingNumber = trackingNumber ? trackingNumber.trim() : '';
    }

    await order.save();

    res.json({
      success: true,
      data: order,
      message: 'Order updated successfully',
    });
  } catch (error) {
    console.error('Admin Update Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order',
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with filters
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      role,
    } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .select('-password'),
      User.countDocuments(query),
    ]);

    // Get orders count and latest address for each user
    const usersWithOrders = await Promise.all(
      users.map(async (user) => {
        const userOrders = await Order.find({ user: user._id })
          .sort({ createdAt: -1 })
          .limit(1)
          .select('shippingAddress');
        
        const ordersCount = await Order.countDocuments({ user: user._id });
        const latestAddress = userOrders.length > 0 ? userOrders[0].shippingAddress : null;

        return {
          ...user.toObject(),
          ordersCount,
          latestAddress,
        };
      })
    );

    res.json({
      success: true,
      data: usersWithOrders,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        pages: Math.ceil(total / limitNumber) || 1,
      },
    });
  } catch (error) {
    console.error('Admin Get Users Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }
});

// @route   GET /api/admin/users/:id/orders
// @desc    Get all orders for a specific user
// @access  Private/Admin
router.get('/users/:id/orders', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user id',
      });
    }

    const orders = await Order.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name images price')
      .select('orderNumber orderStatus paymentStatus total createdAt shippingAddress items');

    res.json({
      success: true,
      data: orders,
      count: orders.length,
    });
  } catch (error) {
    console.error('Admin Get User Orders Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user orders',
    });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update a user's details
// @access  Private/Admin
router.put('/users/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user id',
      });
    }

    const { name, email, role, phone, country, countryCode, phoneDialCode, profileImage } = req.body;

    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'A user with this email already exists',
        });
      }
    }

    if (role && !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role value',
      });
    }

    if (name !== undefined) {
      user.name = name.trim();
    }
    if (email !== undefined) {
      user.email = email.trim().toLowerCase();
    }
    if (phone !== undefined) {
      user.phone = phone.trim();
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
    if (role !== undefined) {
      user.role = role;
    }
    if (profileImage !== undefined && profileImage !== null) {
      // Allow empty string to clear profile image, or set new URL
      user.profileImage = typeof profileImage === 'string' ? profileImage.trim() : profileImage;
    }

    await user.save();

    res.json({
      success: true,
      data: user,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Admin Update User Error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to update user';
    if (error.name === 'ValidationError') {
      errorMessage = 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', ');
    } else if (error.code === 11000) {
      errorMessage = 'A user with this email already exists';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

