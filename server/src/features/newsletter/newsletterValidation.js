import { body, param } from 'express-validator';

/**
 * Validators for Newsletter routes
 */

export const validateSubscribeNewsletter = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
];

export const validateUnsubscribeNewsletter = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
];
