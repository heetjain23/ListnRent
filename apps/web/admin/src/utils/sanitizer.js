import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content for safe rendering
 */
export const sanitizeHtml = (html) => {
  if (!html || typeof html !== 'string') return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target'],
    KEEP_CONTENT: true,
  });
};

/**
 * Sanitize plain text (removes all HTML)
 */
export const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') return '';
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
};

/**
 * Sanitize user input before sending to server
 */
export const sanitizeInput = (input) => {
  if (!input || typeof input !== 'string') return input;
  return input
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 5000); // Limit to 5000 characters
};

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate URL
 */
export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Sanitize object data recursively
 */
export const sanitizeFormData = (data) => {
  if (!data || typeof data !== 'object') return data;

  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(v => 
        typeof v === 'string' ? sanitizeInput(v) : v
      );
    } else if (typeof value === 'object' && value !== null && !(value instanceof File)) {
      sanitized[key] = sanitizeFormData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

/**
 * Prevent XSS in user-generated content display
 */
export const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
};

/**
 * Validate category data
 */
export const validateCategoryData = (category) => {
  const errors = {};
  
  if (!category.name || category.name.length < 2) {
    errors.name = 'Category name must be at least 2 characters';
  }
  if (category.name && category.name.length > 100) {
    errors.name = 'Category name cannot exceed 100 characters';
  }
  if (category.description && category.description.length > 1000) {
    errors.description = 'Description cannot exceed 1000 characters';
  }
  
  return errors;
};
