import { body, param } from 'express-validator';

/**
 * Validators for Message routes
 */

export const validateSendMessage = [
  body('recipientId')
    .isMongoId()
    .withMessage('Invalid recipient ID'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Message must be between 1 and 5000 characters')
    .escape(),
  body('conversationId')
    .optional()
    .isMongoId()
    .withMessage('Invalid conversation ID'),
];

export const validateGetMessages = [
  param('conversationId')
    .isMongoId()
    .withMessage('Invalid conversation ID'),
  body('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

export const validateMarkAsRead = [
  param('conversationId')
    .isMongoId()
    .withMessage('Invalid conversation ID'),
];
