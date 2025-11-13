const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const connectDB = require('../config/database');

dotenv.config();

// Updated catalogue that mirrors the storefront categories
const products = [
  {
    name: "Herbal Hair Growth Oil 100ml",
    price: 1295,
    originalPrice: 1595,
    images: ["/hair-oil-1.jpg", "/hair-oil-2.jpg", "/hair-oil-3.jpg", "/hair-oil-4.jpg"],
    category: "Hair",
    description: "Lightweight nourishing oil infused with rosemary, onion seed, and vitamin E to reduce hair fall while boosting shine.",
    benefits: [
      "Reduces breakage and hair fall",
      "Stimulates healthy regrowth",
      "Keeps scalp hydrated and flake free"
    ],
    rating: 4.8,
    numReviews: 112,
    inStock: true,
    stockCount: 120,
    isBestSeller: true,
    isFeatured: true,
    tags: ["hair", "oil", "growth", "anti hair fall"],
    keywords: ["hair oil", "growth oil", "anti hair fall", "rosemary oil", "onion oil", "vitamin e", "valora gold hair"]
  },
  {
    name: "Intense Repair Hair Oil 200ml",
    price: 1895,
    originalPrice: 2195,
    images: ["/2perfume1.webp"],
    category: "Hair",
    description: "Strengthening oil with amla, almond, and coconut extracts to repair chemically treated hair.",
    benefits: [
      "Deep conditioning blend",
      "Repairs split ends",
      "Adds mirror-like shine"
    ],
    rating: 4.6,
    numReviews: 76,
    inStock: true,
    stockCount: 85,
    tags: ["hair", "oil", "repair"],
    keywords: ["hair repair", "damage control", "amla oil", "almond oil", "coconut oil", "intense repair"]
  },
  {
    name: "Vitamin C Brightening Face Serum 30ml",
    price: 1450,
    originalPrice: 1690,
    images: ["/cream4.jpg", "/cream3.jpg"],
    category: "Beauty",
    description: "Daily vitamin C shot with niacinamide to fade dark spots and deliver a brighter complexion.",
    benefits: [
      "Targets pigmentation",
      "Boosts collagen production",
      "Non-greasy, fast absorbing"
    ],
    rating: 4.9,
    numReviews: 98,
    inStock: true,
    stockCount: 150,
    isBestSeller: true,
    tags: ["face", "serum", "vitamin c", "brightening"],
    keywords: ["vitamin c serum", "brightening serum", "dark spot remover", "niacinamide", "glow serum"]
  },
  {
    name: "Tea Tree Anti-Acne Face Wash 100ml",
    price: 855,
    originalPrice: 999,
    images: ["/face-wash1.webp", "/face-wash2.webp", "/face-wash3.jpg", "/face-wash4.jpg"],
    category: "Beauty",
    description: "Gentle foaming cleanser powered by tea tree and salicylic acid to keep breakouts under control.",
    benefits: [
      "Clears clogged pores",
      "Reduces active acne",
      "Soothes inflammation"
    ],
    rating: 4.7,
    numReviews: 134,
    inStock: true,
    stockCount: 200,
    tags: ["face wash", "acne", "oil control"],
    keywords: ["tea tree face wash", "anti acne", "salicylic acid", "oil control cleanser", "pimple face wash"]
  },
  {
    name: "Glow Boost Body Lotion 250ml",
    price: 1195,
    originalPrice: 1495,
    images: ["/loshion1.webp", "/loshion2.webp", "/loshion3.jpg", "/loshion4.jpg"],
    category: "Beauty",
    description: "Silky body lotion enriched with shea butter and hyaluronic acid to lock in moisture for 48 hours.",
    benefits: [
      "Long-lasting hydration",
      "Restores skin glow",
      "Non-sticky finish"
    ],
    rating: 4.5,
    numReviews: 64,
    inStock: true,
    stockCount: 140,
    tags: ["body lotion", "hydration", "glow"],
    keywords: ["body lotion", "glow lotion", "hydrating lotion", "shea butter", "hyaluronic body"]
  },
  {
    name: "Signature Oud Perfume 50ml",
    price: 3250,
    originalPrice: 3650,
    images: ["/perfume1.webp", "/perfume2.webp", "/perfume3.webp", "/perfume4.jpg"],
    category: "Perfume",
    description: "Long-lasting oriental fragrance with notes of oud, amber, and saffron crafted for special evenings.",
    benefits: [
      "12-hour projection",
      "Premium oriental blend",
      "Elegant glass bottle"
    ],
    rating: 4.8,
    numReviews: 57,
    inStock: true,
    stockCount: 60,
    isFeatured: true,
    tags: ["perfume", "oud", "fragrance"],
    keywords: ["oud perfume", "valora gold perfume", "long lasting fragrance", "oriental scent", "saffron perfume"]
  },
  {
    name: "Gentle Baby Massage Oil 120ml",
    price: 699,
    originalPrice: 799,
    images: ["/cream1.webp"],
    category: "Other",
    description: "Dermatologist-tested baby oil with almond, olive, and chamomile for soft and healthy skin.",
    benefits: [
      "Hypoallergenic",
      "Supports bone strength",
      "Relaxes and calms baby"
    ],
    rating: 4.9,
    numReviews: 44,
    inStock: true,
    stockCount: 90,
    tags: ["baby", "oil", "massage"],
    keywords: ["baby massage oil", "almond baby oil", "olive baby oil", "chamomile baby", "newborn massage"]
  },
  {
    name: "Soothing Baby Body Wash 200ml",
    price: 845,
    originalPrice: 995,
    images: ["/soap1.webp", "/soap2.webp", "/soap3.jpg", "/soap4.jpg"],
    category: "Other",
    description: "Tear-free formula with oat milk and aloe vera to cleanse delicate baby skin.",
    benefits: [
      "No parabens or sulfates",
      "Maintains natural moisture",
      "Gentle calming fragrance"
    ],
    rating: 4.6,
    numReviews: 38,
    inStock: true,
    stockCount: 110,
    tags: ["baby wash", "gentle", "tear free"],
    keywords: ["baby body wash", "tear free wash", "oat milk wash", "aloe vera baby", "gentle cleanser"]
  },
  {
    name: "Ultimate Glow Bundle",
    price: 4499,
    originalPrice: 5295,
    images: ["/2perfume2.webp"],
    category: "Other",
    description: "Complete skin renewal set including vitamin C serum, tea tree face wash, and hydrating lotion.",
    benefits: [
      "Complete daily routine",
      "Saves more than 10%",
      "Suitable for all skin types"
    ],
    rating: 4.7,
    numReviews: 51,
    inStock: true,
    stockCount: 75,
    isBestSeller: true,
    tags: ["bundle", "glow", "skin care set"],
    keywords: ["glow bundle", "skincare set", "vitamin c kit", "face wash bundle", "hydration combo"]
  },
  {
    name: "Luxury Hair Care Bundle",
    price: 3799,
    originalPrice: 4495,
    images: ["/hair-oil-1.jpg", "/face-wash1.webp"],
    category: "Other",
    description: "Bundle of herbal hair oil, damage repair mask, and strengthening serum for complete care.",
    benefits: [
      "Comprehensive repair system",
      "Visible results in 3 weeks",
      "Free scalp massage brush"
    ],
    rating: 4.6,
    numReviews: 62,
    inStock: true,
    stockCount: 65,
    tags: ["bundle", "hair care", "oil"],
    keywords: ["hair care bundle", "oil bundle", "scalp treatment kit", "hair serum set", "hair mask combo"]
  },
  {
    name: "Radiant Glow Face Cream 50g",
    price: 1499,
    originalPrice: 1799,
    images: ["/cream2.webp", "/cream3.jpg"],
    category: "Beauty",
    description: "Daily brightening cream with SPF 30 to protect, brighten, and hydrate in one step.",
    benefits: [
      "Evens skin tone",
      "Protects from UV damage",
      "Improves texture"
    ],
    rating: 4.5,
    numReviews: 87,
    inStock: true,
    stockCount: 130,
    tags: ["face cream", "spf", "brightening"],
    keywords: ["face cream", "brightening cream", "spf 30", "moisturizer", "daily glow cream"]
  },
  {
    name: "Hydrating Hand & Foot Cream 80g",
    price: 695,
    originalPrice: 845,
    images: ["/cream4.jpg"],
    category: "Beauty",
    description: "Intensive repair cream infused with cocoa butter to heal cracked hands and heels.",
    benefits: [
      "Repairs rough skin",
      "Forms protective barrier",
      "Fast-absorbing rich texture"
    ],
    rating: 4.4,
    numReviews: 29,
    inStock: true,
    stockCount: 95,
    tags: ["hand cream", "foot cream", "repair"],
    keywords: ["hand cream", "foot cream", "cracked heel", "cocoa butter cream", "repair balm"]
  }
];

const createSlug = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

const seedProducts = async () => {
  try {
    await connectDB();
    
    const operations = products.map((product) => {
      const slug = createSlug(product.name);
      return {
        updateOne: {
          filter: { slug },
          update: {
            $set: {
              ...product,
              slug,
            }
          },
          upsert: true
        }
      };
    });

    if (operations.length > 0) {
      const result = await Product.bulkWrite(operations);
      const upserts = result.upsertedCount ?? result.nUpserted ?? 0;
      const updates = result.modifiedCount ?? result.nModified ?? 0;
      console.log(`Products upserted: ${upserts}`);
      console.log(`Products updated: ${updates}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedProducts();
