const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  price: {
    type: Number,
    min: 0,
    default: null
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  imageUrl: {
    type: String,
    default: ''
  },
  images: [{
    type: String,
    required: true
  }],
  category: {
    type: String,
    required: true,
    enum: [
      'Hair',
      'Perfume',
      'Beauty',
      'Other',
      'Bundles',
      'Face',
      'Body',
      'Baby Care',
      'Necklaces',
      'Earrings',
      'Rings',
      'Bracelets',
      'Chains'
    ]
  },
  subCategory: {
    type: String
  },
  description: {
    type: String,
    required: true
  },
  ingredients: String,
  benefits: [String],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  inStock: {
    type: Boolean,
    default: true
  },
  stockCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isBestSeller: {
    type: Boolean,
    default: false
  },
  comingSoon: {
    type: Boolean,
    default: false
  },
  tags: [String],
  keywords: {
    type: [String],
    default: []
  },
  weight: String,
  dimensions: String,
  warranty: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate slug before saving
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  if (this.price === undefined || this.price === null || this.price === '') {
    this.price = null;
    this.comingSoon = true;
  } else {
    this.price = Number(this.price);
    if (Number.isNaN(this.price) || this.price < 0) {
      return next(new Error('Product price must be a positive number'));
    }
    this.comingSoon = false;
  }

  if (this.originalPrice !== undefined && this.originalPrice !== null && this.originalPrice !== '') {
    this.originalPrice = Number(this.originalPrice);
    if (Number.isNaN(this.originalPrice) || this.originalPrice < 0) {
      return next(new Error('Original price must be a positive number'));
    }
  } else if (this.price !== null && (this.originalPrice === null || this.originalPrice === undefined)) {
    this.originalPrice = this.price;
  }

  // Ensure imageUrl is set - use first image from images array if imageUrl is empty
  if (!this.imageUrl || this.imageUrl.trim() === '') {
    if (this.images && Array.isArray(this.images) && this.images.length > 0) {
      // Filter out empty strings and get first valid image
      const validImages = this.images.filter(img => img && img.trim());
      if (validImages.length > 0) {
        this.imageUrl = validImages[0];
      } else {
        this.imageUrl = '/4.webp';
      }
    } else {
      this.imageUrl = '/4.webp';
    }
  }

  // Auto-build keyword list for richer search
  const existingKeywords = Array.isArray(this.keywords)
    ? this.keywords.map((keyword) => keyword.toLowerCase().trim()).filter(Boolean)
    : [];

  const sources = [
    this.name,
    this.category,
    this.subCategory,
    this.ingredients,
    ...(this.tags || []),
    ...(this.benefits || [])
  ];

  const generatedKeywords = sources
    .filter(Boolean)
    .flatMap((value) =>
      value
        .toString()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, ' ')
        .split(/\s+/)
        .filter(Boolean)
    );

  this.keywords = Array.from(new Set([...existingKeywords, ...generatedKeywords]));

  next();
});

// Update rating when reviews change
productSchema.methods.updateRating = async function() {
  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    { $match: { product: this._id } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    this.rating = Math.round(stats[0].avgRating * 10) / 10;
    this.numReviews = stats[0].numReviews;
  } else {
    this.rating = 0;
    this.numReviews = 0;
  }
  await this.save();
};

module.exports = mongoose.model('Product', productSchema);
