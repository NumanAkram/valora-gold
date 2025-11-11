const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Product = require('../models/Product');
const { protect, optionalAuth, authorize } = require('../middleware/auth');

// @route   GET /api/reviews/product/:productId
// @desc    Get reviews for a product
// @access  Public
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Get Reviews Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/reviews
// @desc    Get all reviews (for customer reviews section)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find({ isVerified: true })
      .populate('product', 'name images')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Get All Reviews Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/reviews
// @desc    Create a review
// @access  Private
router.post('/', [
  protect,
  body('product').notEmpty().withMessage('Product ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('reviewText').trim().notEmpty().withMessage('Review text is required'),
  body('customerName').trim().notEmpty().withMessage('Customer name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { product, rating, reviewText, customerName, productTitle, productImage } = req.body;

    // Check if product exists
    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product,
      user: req.user._id
    });

    if (existingReview) {
      existingReview.customerName = customerName;
      existingReview.rating = rating;
      existingReview.reviewText = reviewText;
      existingReview.productTitle = productTitle || productExists.name;
      existingReview.productImage = productImage || productExists.images[0];
      existingReview.isVerified = true;
      await existingReview.save();

      await productExists.updateRating();

      return res.json({
        success: true,
        data: existingReview,
        message: 'Review updated successfully'
      });
    }

    // Create review
    const review = await Review.create({
      product,
      user: req.user._id,
      customerName,
      rating,
      reviewText,
      productTitle: productTitle || productExists.name,
      productImage: productImage || productExists.images[0],
      isVerified: true
    });

    // Update product rating
    await productExists.updateRating();

    res.status(201).json({
      success: true,
      data: review,
      message: 'Review submitted successfully'
    });
  } catch (error) {
    console.error('Create Review Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/reviews/:id
// @desc    Update a review (admin only)
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { customerName, rating, reviewText, isVerified } = req.body;

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    if (typeof customerName !== 'undefined') {
      review.customerName = customerName;
    }
    if (typeof rating !== 'undefined') {
      review.rating = Number(rating);
    }
    if (typeof reviewText !== 'undefined') {
      review.reviewText = reviewText;
    }
    if (typeof isVerified !== 'undefined') {
      review.isVerified = Boolean(isVerified);
    }

    await review.save();

    const product = await Product.findById(review.product);
    if (product) {
      await product.updateRating();
    }

    res.json({
      success: true,
      data: review,
      message: 'Review updated successfully',
    });
  } catch (error) {
    console.error('Update Review Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review (admin only)
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    const product = await Product.findById(review.product);
    if (product) {
      await product.updateRating();
    }

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Delete Review Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

module.exports = router;
