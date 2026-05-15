import { body } from 'express-validator';

/**
 * Validators for User routes
 */

export const validateInitializeUser = [
  body('displayName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Display name must be between 2 and 100 characters')
    .escape(),
  body('photoURL')
    .optional()
    .isURL()
    .withMessage('Photo URL must be a valid URL'),
];

export const validateUpdateUser = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .escape(),
  body('phone')
    .optional()
    .matches(/^\d{10}$/)
    .withMessage('Phone must be a 10-digit number'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address cannot exceed 500 characters')
    .escape(),
  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City cannot exceed 100 characters')
    .escape(),
  body('state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State cannot exceed 100 characters')
    .escape(),
  body('pincode')
    .optional()
    .matches(/^\d{6}$/)
    .withMessage('Pincode must be a 6-digit number'),
];

export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];
