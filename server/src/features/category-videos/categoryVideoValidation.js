import { body, param } from 'express-validator';

/**
 * Validators for Category Video routes
 */

export const validateCreateCategoryVideo = [
  body('categoryId')
    .isMongoId()
    .withMessage('Invalid category ID'),
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters')
    .escape(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters')
    .escape(),
  body('videoUrl')
    .isURL()
    .withMessage('Invalid video URL'),
  body('thumbnailUrl')
    .optional()
    .isURL()
    .withMessage('Invalid thumbnail URL'),
  body('duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer'),
];

export const validateUpdateCategoryVideo = [
  param('id')
    .isMongoId()
    .withMessage('Invalid video ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters')
    .escape(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters')
    .escape(),
  body('videoUrl')
    .optional()
    .isURL()
    .withMessage('Invalid video URL'),
];

export const validateDeleteCategoryVideo = [
  param('id')
    .isMongoId()
    .withMessage('Invalid video ID'),
];
