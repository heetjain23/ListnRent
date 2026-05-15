import { body, query, param } from 'express-validator';

/**
 * Validators for Admin routes
 */

export const validateCreateCategory = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters')
    .escape(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters')
    .escape(),
  body('icon')
    .optional()
    .isURL()
    .withMessage('Icon must be a valid URL'),
];

export const validateUpdateCategory = [
  param('id')
    .isMongoId()
    .withMessage('Invalid category ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters')
    .escape(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters')
    .escape(),
];

export const validateDeleteCategory = [
  param('id')
    .isMongoId()
    .withMessage('Invalid category ID'),
];

export const validateCreateSize = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Size name must be between 1 and 50 characters')
    .escape(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
    .escape(),
  body('minArea')
    .isFloat({ min: 0 })
    .withMessage('Minimum area must be a positive number'),
  body('maxArea')
    .isFloat({ min: 0 })
    .withMessage('Maximum area must be a positive number'),
];

export const validateUpdateSize = [
  param('id')
    .isMongoId()
    .withMessage('Invalid size ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Size name must be between 1 and 50 characters')
    .escape(),
];

export const validateUpdateStats = [
  body('listingsCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Listings count must be a non-negative integer'),
  body('usersCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Users count must be a non-negative integer'),
  body('bookingsCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Bookings count must be a non-negative integer'),
];

export const validateQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term cannot exceed 100 characters'),
];
