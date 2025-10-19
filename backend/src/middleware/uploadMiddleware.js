import multer from 'multer';
import { logger } from '../utils/logger.js';

// Use memory storage for easy integration with Cloudinary
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');
    error.statusCode = 400;
    cb(error);
  }
};

// Create multer upload instance
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter,
});

// Error handling middleware for multer
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds 5MB limit',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files',
      });
    }
  }

  if (err) {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || 'File upload error',
    });
  }

  next();
};

// Middleware to validate file exists
export const validateFileExists = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded. Please provide an image file.',
    });
  }
  next();
};

export const uploadSingle = upload.single('photo');
export const uploadMultiple = upload.array('photos', 5); // Max 5 files

export default {
  uploadSingle,
  uploadMultiple,
  handleUploadError,
  validateFileExists,
};