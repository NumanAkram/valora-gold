const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { optionalAuth, protect, authorize } = require('../middleware/auth');

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
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { keywords: { $regex: search, $options: 'i' } }
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

// @route   POST /api/products
// @desc    Create a new product
// @access  Public (should be protected in production)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      category,
      imageUrl,
      images = [],
      tags = [],
      benefits = [],
      stockCount = 0,
      inStock = true,
      comingSoon = false,
      isFeatured = false,
      isBestSeller = false,
      originalPrice,
    } = req.body;

    if (!name || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, description and category are required'
      });
    }

    let numericPrice = null;
    let numericOriginal = null;

    if (!comingSoon) {
      if (price === undefined || price === null || price === '') {
        return res.status(400).json({
          success: false,
          message: 'Price is required unless the product is marked as coming soon'
        });
      }
      numericPrice = Number(price);
      if (Number.isNaN(numericPrice) || numericPrice < 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be a positive number'
        });
      }
      if (originalPrice !== undefined && originalPrice !== null && originalPrice !== '') {
        numericOriginal = Number(originalPrice);
        if (Number.isNaN(numericOriginal) || numericOriginal < 0) {
          return res.status(400).json({
            success: false,
            message: 'Original price must be a positive number'
          });
        }
      } else {
        numericOriginal = numericPrice;
      }
    }

    const numericStock = Number(stockCount);
    if (Number.isNaN(numericStock) || numericStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock count must be a non-negative number'
      });
    }

    const imageList = Array.isArray(images) && images.length > 0
      ? images.filter(Boolean)
      : (imageUrl ? [imageUrl] : []);

    if (!imageList.length) {
      imageList.push('/4.webp');
    }

    // Set imageUrl to the first image if provided, otherwise use first from images array or default
    const primaryImageUrl = imageUrl && imageUrl.trim() 
      ? imageUrl.trim() 
      : (imageList.length > 0 ? imageList[0] : '/4.webp');

    const product = await Product.create({
      name: name.trim(),
      price: numericPrice,
      originalPrice: numericOriginal,
      description: description.trim(),
      category,
      imageUrl: primaryImageUrl,
      images: imageList,
      tags,
      benefits,
      inStock: numericStock > 0 ? true : Boolean(inStock),
      stockCount: numericStock,
      isFeatured: Boolean(isFeatured),
      isBestSeller: Boolean(isBestSeller),
      comingSoon: Boolean(comingSoon)
    });

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Create Product Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update an existing product
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const {
      name,
      price,
      originalPrice,
      description,
      category,
      imageUrl,
      images,
      tags,
      benefits,
      inStock,
      stockCount,
      isFeatured,
      isBestSeller,
      comingSoon,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (name !== undefined) {
      product.name = name.trim();
    }

    if (description !== undefined) {
      product.description = description.trim();
    }

    if (category !== undefined) {
      product.category = category;
    }

    if (price !== undefined) {
      if (price === null || price === '') {
        product.price = null;
        product.comingSoon = true;
      } else {
        const numericPrice = Number(price);
        if (Number.isNaN(numericPrice) || numericPrice < 0) {
          return res.status(400).json({
            success: false,
            message: 'Price must be a positive number'
          });
        }
        product.price = numericPrice;
        if (originalPrice === undefined) {
          product.originalPrice = numericPrice;
        }
      }
    }

    if (originalPrice !== undefined) {
      if (originalPrice === null || originalPrice === '') {
        product.originalPrice = null;
      } else {
        const numericOriginal = Number(originalPrice);
        if (Number.isNaN(numericOriginal) || numericOriginal < 0) {
          return res.status(400).json({
            success: false,
            message: 'Original price must be a positive number'
          });
        }
        product.originalPrice = numericOriginal;
      }
    }

    if (images !== undefined || imageUrl !== undefined) {
      const imageList = Array.isArray(images) && images.length > 0
        ? images.filter(Boolean)
        : (imageUrl !== undefined ? (imageUrl ? [imageUrl] : []) : product.images);

      if (imageList.length > 0) {
        product.images = imageList;
        // Update imageUrl if imageUrl is provided, otherwise set it to first image in images array
        if (imageUrl !== undefined) {
          product.imageUrl = imageUrl && imageUrl.trim() ? imageUrl.trim() : (imageList.length > 0 ? imageList[0] : '/4.webp');
        } else if (!product.imageUrl && imageList.length > 0) {
          // If imageUrl doesn't exist but images array has items, set imageUrl to first image
          product.imageUrl = imageList[0];
        }
      } else if (imageUrl !== undefined && !imageUrl) {
        product.images = ['/4.webp'];
        product.imageUrl = '/4.webp';
      }
    }

    if (tags !== undefined) {
      product.tags = Array.isArray(tags) ? tags : [];
    }

    if (benefits !== undefined) {
      product.benefits = Array.isArray(benefits) ? benefits : [];
    }

    if (inStock !== undefined) {
      product.inStock = Boolean(inStock);
    }

    if (stockCount !== undefined) {
      const numericStock = Number(stockCount);
      if (Number.isNaN(numericStock) || numericStock < 0) {
        return res.status(400).json({
          success: false,
          message: 'Stock count must be a non-negative number'
        });
      }
      product.stockCount = numericStock;
      if (numericStock > 0) {
        product.inStock = true;
      }
    }

    if (typeof isFeatured === 'boolean') {
      product.isFeatured = isFeatured;
    }

    if (typeof isBestSeller === 'boolean') {
      product.isBestSeller = isBestSeller;
    }

    if (typeof comingSoon === 'boolean') {
      product.comingSoon = comingSoon;
      if (comingSoon) {
        product.price = null;
      }
    }

    if (!product.images || product.images.length === 0) {
      product.images = ['/4.webp'];
    }

    await product.save();

    res.json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Update Product Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
});

// @route   PUT /api/products/:id/price
// @desc    Update price for a coming soon product
// @access  Private/Admin
router.put('/:id/price', protect, authorize('admin'), async (req, res) => {
  try {
    const { price, originalPrice } = req.body;

    if (price === undefined || price === null || price === '') {
      return res.status(400).json({
        success: false,
        message: 'Price is required'
      });
    }

    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a positive number'
      });
    }

    let numericOriginal = numericPrice;
    if (originalPrice !== undefined && originalPrice !== null && originalPrice !== '') {
      numericOriginal = Number(originalPrice);
      if (Number.isNaN(numericOriginal) || numericOriginal < 0) {
        return res.status(400).json({
          success: false,
          message: 'Original price must be a positive number'
        });
      }
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product.price = numericPrice;
    product.originalPrice = numericOriginal;
    product.comingSoon = false;

    await product.save();

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Update Price Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product price',
      error: error.message
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete Product Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
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
