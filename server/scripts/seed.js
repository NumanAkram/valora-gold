const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const connectDB = require('../config/database');

dotenv.config();

// Sample products for Valora Gold
const products = [
  {
    name: "Classic Gold Necklace Set - 22K Premium Collection",
    price: 85000,
    originalPrice: 95000,
    images: ["/4.png", "/4.png", "/4.png"],
    category: "Necklaces",
    description: "Exquisite 22K gold necklace set featuring traditional design with modern elegance. Perfect for weddings and special occasions.",
    ingredients: "22K Pure Gold, Premium Craftsmanship",
    benefits: [
      "Authentic 22K Gold",
      "Certified Purity",
      "Lifetime Warranty",
      "Elegant Design"
    ],
    rating: 4.5,
    numReviews: 76,
    inStock: true,
    stockCount: 15,
    isBestSeller: true,
    isFeatured: true,
    tags: ["necklace", "22k", "wedding", "premium"],
    weight: "45g",
    warranty: "Lifetime"
  },
  {
    name: "Gold Bracelet Collection - Premium 22K",
    price: 45000,
    originalPrice: 50000,
    images: ["/4.png"],
    category: "Bracelets",
    description: "Beautiful 22K gold bracelets with intricate designs. Available in various styles.",
    ingredients: "22K Pure Gold",
    benefits: [
      "Premium Quality",
      "Multiple Styles",
      "Certified Gold"
    ],
    rating: 5,
    numReviews: 40,
    inStock: true,
    stockCount: 20,
    isBestSeller: true,
    tags: ["bracelet", "22k", "premium"],
    weight: "25g"
  },
  {
    name: "Gold Earrings Set - Classic Design",
    price: 35000,
    originalPrice: 38000,
    images: ["/4.png"],
    category: "Earrings",
    description: "Elegant 22K gold earrings set with traditional patterns. Perfect for daily wear or special events.",
    ingredients: "22K Pure Gold",
    benefits: [
      "Comfortable Design",
      "Hypoallergenic",
      "Timeless Style"
    ],
    rating: 5,
    numReviews: 41,
    inStock: true,
    stockCount: 30,
    isBestSeller: true,
    tags: ["earrings", "22k", "classic"],
    weight: "12g"
  },
  {
    name: "Premium Gold Ring - Solitaire Collection",
    price: 55000,
    originalPrice: 60000,
    images: ["/4.png"],
    category: "Rings",
    description: "Stunning 22K gold ring with premium solitaire design. A symbol of elegance and luxury.",
    ingredients: "22K Pure Gold, Premium Stones",
    benefits: [
      "Premium Design",
      "Certified Quality",
      "Luxury Collection"
    ],
    rating: 5,
    numReviews: 19,
    inStock: true,
    stockCount: 12,
    isFeatured: true,
    tags: ["ring", "solitaire", "luxury"],
    weight: "8g"
  },
  {
    name: "Diamond Gold Collection - Exclusive",
    price: 150000,
    originalPrice: 175000,
    images: ["/4.png"],
    category: "Bundles",
    description: "Exclusive diamond-studded gold collection featuring necklace, earrings, and ring set.",
    ingredients: "22K Gold, Premium Diamonds",
    benefits: [
      "Diamond Studded",
      "Complete Set",
      "Premium Collection"
    ],
    rating: 5,
    numReviews: 29,
    inStock: true,
    stockCount: 5,
    isFeatured: true,
    tags: ["diamond", "bundle", "exclusive"],
    weight: "85g"
  },
  {
    name: "Gold Chain Collection - Premium",
    price: 65000,
    originalPrice: 70000,
    images: ["/4.png"],
    category: "Chains",
    description: "Premium 22K gold chains in various lengths and styles. Classic and modern designs available.",
    ingredients: "22K Pure Gold",
    benefits: [
      "Multiple Styles",
      "Various Lengths",
      "Premium Quality"
    ],
    rating: 4.5,
    numReviews: 47,
    inStock: true,
    stockCount: 18,
    isBestSeller: true,
    tags: ["chain", "22k", "premium"],
    weight: "35g"
  }
];

const seedProducts = async () => {
  try {
    await connectDB();
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert new products
    await Product.insertMany(products);
    console.log(`Seeded ${products.length} products`);

    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedProducts();
