import { v2 as cloudinary } from 'cloudinary';

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Extract public ID from Cloudinary URL
 * URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{public_id}.{ext}
 * or: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{ext}
 * @param {string} imageUrl - The Cloudinary image URL
 * @returns {string} - The public ID
 */
export const extractPublicIdFromUrl = (imageUrl) => {
  if (!imageUrl) return null;

  try {
    // Match pattern: /upload/v{version}/{public_id} or /upload/{public_id}
    const match = imageUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^/.]+)?$/);
    if (match && match[1]) {
      return match[1];
    }
    return null;
  } catch (error) {
    console.error('Error extracting public ID from URL:', imageUrl, error);
    return null;
  }
};

/**
 * Delete a single image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<void>}
 */
export const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) {
    console.warn('No public ID provided for deletion');
    return;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`Deleted image from Cloudinary: ${publicId}`, result);
    return result;
  } catch (error) {
    console.error(`Failed to delete image from Cloudinary: ${publicId}`, error);
    throw new Error(`Failed to delete image from Cloudinary: ${error.message}`);
  }
};

/**
 * Delete multiple images from Cloudinary
 * @param {string[]} imageUrls - Array of Cloudinary image URLs
 * @returns {Promise<void>}
 */
export const deleteCloudinaryImages = async (imageUrls) => {
  if (!imageUrls || imageUrls.length === 0) {
    return;
  }

  const deletePromises = imageUrls.map(async (url) => {
    const publicId = extractPublicIdFromUrl(url);
    if (publicId) {
      try {
        await deleteCloudinaryImage(publicId);
      } catch (error) {
        console.error(`Error deleting image ${publicId}:`, error);
        // Continue deletion of other images even if one fails
      }
    }
  });

  try {
    await Promise.all(deletePromises);
    console.log(`Successfully deleted ${imageUrls.length} images from Cloudinary`);
  } catch (error) {
    console.error('Error during batch image deletion:', error);
    throw new Error(`Failed to delete images from Cloudinary: ${error.message}`);
  }
};

export default {
  extractPublicIdFromUrl,
  deleteCloudinaryImage,
  deleteCloudinaryImages,
};
