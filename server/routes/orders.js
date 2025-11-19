const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const Notification = require('../models/Notification');
const { sendMail } = require('../utils/mailer');
const { getShippingCharge } = require('../services/shippingService');

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
const categoryMap = {
  hair: 'Hair',
  perfume: 'Perfume',
  beauty: 'Beauty',
  body: 'Body',
  face: 'Face',
  baby: 'Baby Care',
  bundle: 'Bundles',
  necklaces: 'Necklaces',
  earrings: 'Earrings',
  rings: 'Rings',
  bracelets: 'Bracelets',
  chains: 'Chains',
  other: 'Other',
};

const findProductForItem = async (item = {}) => {
  const { productId, id, slug, name } = item;

  const identifiers = [
    productId,
    id,
    slug,
    typeof slug === 'string' ? slug.toLowerCase() : null,
  ]
    .filter(Boolean)
    .map((value) => String(value).trim());

  for (const identifier of identifiers) {
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      const product = await Product.findById(identifier);
      if (product) {
        return product;
      }
    }

    const slugMatch = await Product.findOne({ slug: identifier });
    if (slugMatch) {
      return slugMatch;
    }
  }

  if (name) {
    const nameMatch = await Product.findOne({ name });
    if (nameMatch) {
      return nameMatch;
    }

    const fuzzyMatch = await Product.findOne({
      name: { $regex: new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
    });
    if (fuzzyMatch) {
      return fuzzyMatch;
    }
  }

  const normalizedIdentifier = String(productId || id || slug || '').trim().toLowerCase();

  if (normalizedIdentifier.startsWith('mock-')) {
    const mockKey = normalizedIdentifier.replace('mock-', '').toLowerCase();
    const category = categoryMap[mockKey];
    if (category) {
      const categoryProduct = await Product.findOne({ category }).sort({ createdAt: -1 });
      if (categoryProduct) {
        return categoryProduct;
      }
    }
  }

  return null;
};

router.post('/', [
  protect,
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('shippingAddress').isObject().withMessage('Shipping address is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { items, shippingAddress, paymentMethod = 'COD', notes } = req.body;

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const identifier = item.productId || item.id || item.slug || item.name || 'unknown';
      const product = await findProductForItem(item);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${identifier} not found`
        });
      }

      const quantity = Math.max(parseInt(item.quantity, 10) || 1, 1);
      const currentStock = Number.isFinite(product.stockCount) ? product.stockCount : 0;

      if (!product.inStock || currentStock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} currently has ${currentStock} in stock. Please lower the quantity or restock before placing the order.`
        });
      }

      const priceSource = product.price ?? product.originalPrice ?? 0;
      const itemPrice = Number.isFinite(priceSource) ? priceSource : Number(priceSource) || 0;
      const itemTotal = itemPrice * quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.images[0]
      });

      // Update stock
      product.stockCount = currentStock - quantity;
      product.inStock = product.stockCount > 0;
      await product.save();
    }

    if (orderItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No valid products found for this order. Please refresh your cart and try again.'
      });
    }

    const shippingCost = await getShippingCharge();
    const discount = 0;
    const total = subtotal + shippingCost - discount;

    // Create order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingCost,
      discount,
      total,
      notes
    });

    try {
      await Notification.create({
        title: 'New Order Placed',
        message: `${req.user?.name || 'A customer'} placed order ${order.orderNumber || order._id}.`,
        type: 'order',
        metadata: {
          orderId: order._id,
          userId: req.user?._id,
          total,
        },
      });
    } catch (notifyError) {
      console.error('Notification creation failed:', notifyError);
    }

    const adminEmailsRaw =
      process.env.ADMIN_NOTIFICATION_EMAILS ||
      process.env.ADMIN_NOTIFICATION_EMAIL ||
      'info@valoragold.store,valoragold.pk@gmail.com';
    const adminEmails = adminEmailsRaw
      .split(',')
      .map((email) => email.trim())
      .filter(Boolean);

    const productSummary = order.items
      .map(
        (item) => `• ${item.name} × ${item.quantity} @ Rs.${Number(item.price || 0).toLocaleString()}`
      )
      .join('\n');

    const emailResults = await Promise.all(
      adminEmails.map((recipient) =>
        sendMail({
          to: recipient,
          subject: `New Order: ${order.orderNumber || order._id}`,
          text: `A new order has been placed.\n\nOrder Number: ${order.orderNumber || order._id}\nCustomer: ${
            req.user?.name || 'Unknown'
          }\nTotal: Rs.${total.toLocaleString()}\n\nItems:\n${productSummary}\n\nView details in the admin dashboard.`,
          html: `
            <h2 style="margin-bottom:16px;">A new order has been placed</h2>
            <p><strong>Order Number:</strong> ${order.orderNumber || order._id}</p>
            <p><strong>Customer:</strong> ${req.user?.name || 'Unknown'}</p>
            <p><strong>Total:</strong> Rs.${total.toLocaleString()}</p>
            <p style="margin-top:16px;"><strong>Items:</strong></p>
            <ul>
              ${order.items
                .map(
                  (item) =>
                    `<li>${item.name} × ${item.quantity} @ Rs.${Number(item.price || 0).toLocaleString()}</li>`
                )
                .join('')}
            </ul>
            <p style="margin-top:16px;">Sign in to the admin panel to view full order details.</p>
          `,
        })
      )
    );

    if (emailResults.every((result) => !result)) {
      console.warn('All admin order emails failed to send for order', order._id);
    }

    // Clear user cart
    const user = await User.findById(req.user._id);
    if (user) {
      user.cart = [];
      await user.save();
    }

    res.status(201).json({
      success: true,
      data: order,
      message: 'Order placed successfully'
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Server error' : error.message || 'Server error'
    });
  }
});

// @route   GET /api/orders
// @desc    Get user orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Get Orders Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name images price')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/orders/track/:orderNumber
// @desc    Track order by order number
// @access  Public
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
      .populate('items.product', 'name images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: {
        _id: order._id,
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.orderStatus,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus || 'pending',
        trackingNumber: order.trackingNumber,
        createdAt: order.createdAt,
        orderDate: order.createdAt,
        total: order.total,
        totalAmount: order.total,
        items: order.items,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod
      }
    });
  } catch (error) {
    console.error('Track Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
