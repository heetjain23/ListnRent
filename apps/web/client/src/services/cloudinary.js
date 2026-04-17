const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

/**
 * Generate an optimized Cloudinary URL with transformations
 * @param {string} imageUrl - Original image URL
 * @param {Object} options - Transformation options
 * @returns {string} Optimized Cloudinary URL
 */
export const getOptimizedImageUrl = (imageUrl, options = {}) => {
  if (!imageUrl) return ''

  const {
    width = 500,
    height = 667,
    quality = 'auto',
    format = 'auto',
    fetch_format = 'auto',
  } = options

  // If it's already a Cloudinary URL, insert transformations
  if (imageUrl.includes('cloudinary.com')) {
    const parts = imageUrl.split('/upload/')
    if (parts.length === 2) {
      const transformation = `w_${width},h_${height},c_fill,q_${quality},f_${fetch_format}`
      return `${parts[0]}/upload/${transformation}/${parts[1]}`
    }
  }

  return imageUrl
}

/**
 * Get responsive image srcset for different device sizes
 * @param {string} imageUrl - Original image URL
 * @returns {string} srcset string for responsive images
 */
export const getResponsiveImageSrcSet = (imageUrl) => {
  if (!imageUrl) return ''

  const sizes = [
    { width: 300, dpr: 1 },
    { width: 400, dpr: 1 },
    { width: 500, dpr: 2 },
    { width: 600, dpr: 1 },
    { width: 800, dpr: 2 },
  ]

  return sizes
    .map((size) => `${getOptimizedImageUrl(imageUrl, { width: size.width, height: Math.round(size.width * 1.33) })} ${size.width}w`)
    .join(', ')
}

/**
 * Upload a single image to Cloudinary
 * @param {File} file - Image file to upload
 * @returns {Promise<string>} Cloudinary URL
 */
export const uploadImage = async (file) => {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error('Cloudinary configuration missing. Check .env.local')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      throw new Error('Failed to upload image')
    }

    const data = await response.json()
    return data.secure_url // Return the HTTPS URL
  } catch (error) {
    throw error
  }
}

/**
 * Upload multiple images to Cloudinary in parallel
 * @param {File[]} files - Array of image files
 * @returns {Promise<string[]>} Array of Cloudinary URLs
 */
export const uploadMultipleImages = async (files) => {
  if (files.length === 0) {
    throw new Error('No files provided')
  }

  try {
    const uploadPromises = files.map((file) => uploadImage(file))
    const urls = await Promise.all(uploadPromises)
    return urls
  } catch (error) {
    throw error
  }
}

/**
 * Delete image from Cloudinary (requires signature verification)
 * Note: For production, use backend to handle deletions securely
 * @param {string} publicId - Cloudinary public ID
 */
export const deleteImage = async (publicId) => {
  throw new Error('Use backend API for secure image deletion')
}

export default {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  getOptimizedImageUrl,
  getResponsiveImageSrcSet,
}
