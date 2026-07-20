export const getOptimizedImageUrl = (imageUrl, options = {}) => {
  if (!imageUrl) return "";

  const {
    width = 500,
    height = 667,
    quality = "auto",
    fetch_format = "auto",
  } = options;

  if (imageUrl.includes("cloudinary.com")) {
    const parts = imageUrl.split("/upload/");
    if (parts.length === 2) {
      const transformation = `w_${width},h_${height},c_fill,q_${quality},f_${fetch_format}`;
      return `${parts[0]}/upload/${transformation}/${parts[1]}`;
    }
  }

  return imageUrl;
};