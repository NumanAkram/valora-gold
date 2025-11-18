const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const uniqueSuffix = Date.now();
    cb(null, `${baseName || 'image'}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

router.post(
  '/image',
  protect,
  authorize('admin'),
  (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        let errorMessage = err.message;
        if (err.code === 'LIMIT_FILE_SIZE') {
          errorMessage = 'Image file is too large. Please use an image smaller than 10MB.';
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          errorMessage = 'Unexpected file field. Please check your upload form.';
        }
        return res.status(400).json({
          success: false,
          message: errorMessage,
        });
      }
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || 'Upload failed',
        });
      }
      return next();
    });
  },
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const filePath = `/uploads/${req.file.filename}`;
    const absoluteUrl = `${req.protocol}://${req.get('host')}${filePath}`;

    return res.status(201).json({
      success: true,
      url: absoluteUrl,
      path: filePath,
      message: 'Image uploaded successfully',
    });
  }
);

// User profile image upload endpoint (authenticated users only, no admin required)
router.post(
  '/profile-image',
  protect,
  (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        let errorMessage = err.message;
        if (err.code === 'LIMIT_FILE_SIZE') {
          errorMessage = 'Image file is too large. Please use an image smaller than 10MB.';
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          errorMessage = 'Unexpected file field. Please check your upload form.';
        }
        return res.status(400).json({
          success: false,
          message: errorMessage,
        });
      }
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || 'Upload failed',
        });
      }
      return next();
    });
  },
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const filePath = `/uploads/${req.file.filename}`;
    const absoluteUrl = `${req.protocol}://${req.get('host')}${filePath}`;

    return res.status(201).json({
      success: true,
      url: absoluteUrl,
      path: filePath,
      message: 'Profile image uploaded successfully',
    });
  }
);

module.exports = router;

