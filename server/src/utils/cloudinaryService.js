import { v2 as cloudinary } from 'cloudinary';

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const hasCloudinaryConfig = () => {
  return Boolean(
    (process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME) &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
};

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
    if (!imageUrl.includes('/upload/')) return null;

    const [rawPath] = imageUrl.split(/[?#]/);
    const uploadIndex = rawPath.indexOf('/upload/');
    if (uploadIndex === -1) return null;

    let tail = decodeURIComponent(rawPath.slice(uploadIndex + '/upload/'.length));
    const segments = tail.split('/').filter(Boolean);

    // If transformed URL is provided, drop transformation segments until version or public ID.
    while (segments.length > 0 && !/^v\d+$/.test(segments[0])) {
      const segment = segments[0];
      const looksLikeTransformation = segment.includes(',') || /^[a-z]{1,3}_.+/.test(segment);
      if (!looksLikeTransformation) break;
      segments.shift();
    }

    if (segments.length > 0 && /^v\d+$/.test(segments[0])) {
      segments.shift();
    }

    if (segments.length === 0) return null;

    let publicId = segments.join('/');
    publicId = publicId.replace(/\.[^.\/]+$/, '');

    if (publicId) {
      return publicId;
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

  if (!hasCloudinaryConfig()) {
    console.warn('Cloudinary config missing on server. Skipping Cloudinary delete.');
    return;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
      type: 'upload',
      invalidate: true,
    });
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
