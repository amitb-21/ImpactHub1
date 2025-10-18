import cloudinary from 'cloudinary';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

// File size limit: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Allowed file types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const validateFile = (file) => {
  const errors = [];

  if (!file) {
    errors.push('No file provided');
    return errors;
  }

  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File size exceeds 5MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
  }

  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    errors.push('Invalid file type. Only JPEG, PNG, WebP, and GIF allowed');
  }

  return errors;
};

export const uploadToCloudinary = async (file, folder = 'impacthub/events') => {
  try {
    if (!config.CLOUDINARY_CLOUD_NAME) {
      throw new Error('Cloudinary not configured. Using base64 fallback.');
    }

    // Validate file
    const validationErrors = validateFile(file);
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join(', '));
    }

    // Upload to Cloudinary
    return new Promise((resolve, reject) => {
      const upload = cloudinary.v2.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          quality: 'auto',
          fetch_format: 'auto',
          max_bytes: MAX_FILE_SIZE,
        },
        (error, result) => {
          if (error) {
            logger.error('Cloudinary upload error', error);
            reject(error);
          } else {
            logger.success(`File uploaded to Cloudinary: ${result.public_id}`);
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              fileName: result.original_filename,
              fileSize: result.bytes,
              height: result.height,
              width: result.width,
            });
          }
        }
      );

      upload.end(file.buffer);
    });
  } catch (error) {
    logger.error('Upload service error', error);
    throw error;
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!config.CLOUDINARY_CLOUD_NAME) {
      logger.warn('Cloudinary not configured, skipping delete');
      return;
    }

    const result = await cloudinary.v2.uploader.destroy(publicId);
    logger.success(`File deleted from Cloudinary: ${publicId}`);
    return result;
  } catch (error) {
    logger.error('Error deleting file from Cloudinary', error);
    throw error;
  }
};

export const getUploadSignature = () => {
  try {
    if (!config.CLOUDINARY_CLOUD_NAME) {
      throw new Error('Cloudinary not configured');
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.v2.utils.api_sign_request(
      {
        timestamp,
        folder: 'impacthub/events',
      },
      config.CLOUDINARY_API_SECRET
    );

    return {
      timestamp,
      signature,
      apiKey: config.CLOUDINARY_API_KEY,
      cloudName: config.CLOUDINARY_CLOUD_NAME,
    };
  } catch (error) {
    logger.error('Error generating upload signature', error);
    throw error;
  }
};

// Convert base64 to Cloudinary (for backward compatibility)
export const uploadBase64ToCloudinary = async (base64String, folder = 'impacthub/events') => {
  try {
    if (!config.CLOUDINARY_CLOUD_NAME) {
      // Return base64 as-is if Cloudinary not configured
      return {
        url: base64String,
        isBase64: true,
      };
    }

    const result = await cloudinary.v2.uploader.upload(base64String, {
      folder,
      resource_type: 'auto',
      quality: 'auto',
    });

    logger.success(`Base64 uploaded to Cloudinary: ${result.public_id}`);
    return {
      url: result.secure_url,
      publicId: result.public_id,
      isBase64: false,
    };
  } catch (error) {
    logger.error('Error uploading base64 to Cloudinary', error);
    throw error;
  }
};

export default {
  validateFile,
  uploadToCloudinary,
  deleteFromCloudinary,
  getUploadSignature,
  uploadBase64ToCloudinary,
};