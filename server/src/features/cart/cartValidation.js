import { body, param } from 'express-validator';

/**
 * Validators for Cart routes
 */

export const validateAddToCart = [
  body('listingId')
    .isMongoId()
    .withMessage('Invalid listing ID'),
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),
];

export const validateUpdateCartItem = [
  param('cartItemId')
    .isMongoId()
    .withMessage('Invalid cart item ID'),
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),
];

export const validateRemoveFromCart = [
  param('cartItemId')
    .isMongoId()
    .withMessage('Invalid cart item ID'),
];

export const validateCheckout = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.cartItemId')
    .isMongoId()
    .withMessage('Invalid cart item ID'),
  body('shippingAddress')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Shipping address must be between 10 and 500 characters')
    .escape(),
];
