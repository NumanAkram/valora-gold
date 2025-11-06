const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { optionalAuth } = require('../middleware/auth');

// @route   GET /api/products
// @desc    Get all products with filters
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      inStock,
      isBestSeller,
      isFeatured,
      sort,
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (inStock === 'true') {
      query.inStock = true;
    }

    if (isBestSeller === 'true') {
      query.isBestSeller = true;
    }

    if (isFeatured === 'true') {
      query.isFeatured = true;
    }

    // Sort
    let sortBy = {};
    switch (sort) {
      case 'price-low':
        sortBy = { price: 1 };
        break;
      case 'price-high':
        sortBy = { price: -1 };
        break;
      case 'rating':
        sortBy = { rating: -1 };
        break;
      case 'newest':
        sortBy = { createdAt: -1 };
        break;
      default:
        sortBy = { createdAt: -1 };
    }

    // Pagination
    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(Number(limit))
      .select('-reviews');

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get Products Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/products/bestsellers
// @desc    Get best sellers
// @access  Public
router.get('/bestsellers', async (req, res) => {
  try {
    const products = await Product.find({ isBestSeller: true })
      .sort({ rating: -1, numReviews: -1 })
      .limit(9)
      .select('-reviews');

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get Best Sellers Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(8)
      .select('-reviews');

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get Featured Products Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/products/search
// @desc    Search products by keywords (name, category, tags, etc.)
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.json({
        success: true,
        data: []
      });
    }

    // Clean and prepare search query
    const searchQuery = q.trim().toLowerCase();
    console.log('Search query received:', searchQuery);
    
    // Escape special regex characters
    const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Build comprehensive search query that searches in all relevant fields
    const searchConditions = [];

    // Search in all relevant fields
    // For arrays, we'll use a different approach
    searchConditions.push(
      // Search in product name (most important)
      { name: { $regex: escapedQuery, $options: 'i' } },
      // Search in title field (if exists)
      { title: { $regex: escapedQuery, $options: 'i' } },
      // Search in description
      { description: { $regex: escapedQuery, $options: 'i' } },
      // Search in category
      { category: { $regex: escapedQuery, $options: 'i' } },
      // Search in subCategory (if exists)
      { subCategory: { $regex: escapedQuery, $options: 'i' } },
      // Search in ingredients (if exists)
      { ingredients: { $regex: escapedQuery, $options: 'i' } },
      // Search in slug (if exists)
      { slug: { $regex: escapedQuery, $options: 'i' } }
    );
    
    // For arrays (tags, benefits), MongoDB will check each element
    // Using $regex on array fields will match any element in the array
    searchConditions.push(
      { tags: { $regex: escapedQuery, $options: 'i' } },
      { benefits: { $regex: escapedQuery, $options: 'i' } }
    );

    // Use $or to match any of the conditions (flexible search)
    const query = {
      $or: searchConditions
    };
    
    console.log('Search query object:', JSON.stringify(query, null, 2));
    
    // First, check total products in database
    const totalProducts = await Product.countDocuments({});
    console.log(`Total products in database: ${totalProducts}`);
    
    const products = await Product.find(query)
      .limit(50)
      .select('-reviews')
      .sort({
        // Prioritize products with matching names
        isFeatured: -1,
        isBestSeller: -1,
        rating: -1,
        createdAt: -1
      });

    console.log(`Found ${products.length} products for search: "${searchQuery}"`);

    // If no results found, try a simpler search as fallback
    if (products.length === 0 && totalProducts > 0) {
      console.log('No results with complex search, trying simpler search...');
      const simpleQuery = {
        $or: [
          { name: { $regex: escapedQuery, $options: 'i' } },
          { description: { $regex: escapedQuery, $options: 'i' } },
          { category: { $regex: escapedQuery, $options: 'i' } }
        ]
      };
      
      const simpleResults = await Product.find(simpleQuery)
        .limit(50)
        .select('-reviews')
        .sort({ createdAt: -1 });
      
      console.log(`Simple search found ${simpleResults.length} products`);
      
      return res.json({
        success: true,
        data: simpleResults
      });
    }

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Search Products Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('reviews');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get Product Error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/products/category/:category
// @desc    Get products by category
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category })
      .sort({ createdAt: -1 })
      .select('-reviews');

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get Category Products Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/products/:id/related
// @desc    Get related products
// @access  Public
router.get('/:id/related', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id }
    })
      .limit(4)
      .select('-reviews');

    res.json({
      success: true,
      data: relatedProducts
    });
  } catch (error) {
    console.error('Get Related Products Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
