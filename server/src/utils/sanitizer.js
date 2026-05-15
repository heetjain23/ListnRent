import sanitizeHtml from 'sanitize-html';

/**
 * Sanitize string input - removes HTML/script tags and trims whitespace
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  // First, remove HTML tags
  const sanitized = sanitizeHtml(str, { 
    allowedTags: [],
    allowedAttributes: {}
  });
  // Trim and remove extra whitespace
  return sanitized.trim().replace(/\s+/g, ' ');
};

/**
 * Sanitize email - basic validation and lowercase
 */
export const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return email;
  return email.toLowerCase().trim();
};

/**
 * Sanitize phone number - extract only digits
 */
export const sanitizePhone = (phone) => {
  if (typeof phone !== 'string') return phone;
  return phone.replace(/\D/g, '');
};

/**
 * Sanitize URL - basic validation
 */
export const sanitizeUrl = (url) => {
  if (typeof url !== 'string') return url;
  try {
    new URL(url); // Validate URL format
    return url.trim();
  } catch {
    return '';
  }
};

/**
 * Sanitize object fields recursively
 */
export const sanitizeObject = (obj, fieldsToSanitize = {}) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (fieldsToSanitize[key] === 'email') {
      sanitized[key] = sanitizeEmail(value);
    } else if (fieldsToSanitize[key] === 'phone') {
      sanitized[key] = sanitizePhone(value);
    } else if (fieldsToSanitize[key] === 'url') {
      sanitized[key] = sanitizeUrl(value);
    } else if (fieldsToSanitize[key] === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(v => 
        typeof v === 'string' ? sanitizeString(v) : v
      );
    } else if (typeof value === 'string') {
      // Default: sanitize strings
      sanitized[key] = sanitizeString(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

/**
 * Sanitize array of items
 */
export const sanitizeArray = (arr) => {
  if (!Array.isArray(arr)) return arr;
  return arr.map(item => {
    if (typeof item === 'string') {
      return sanitizeString(item);
    } else if (typeof item === 'object' && item !== null) {
      return sanitizeObject(item);
    }
    return item;
  });
};
