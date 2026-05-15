import { body, param, query } from 'express-validator';

/**
 * Validators for Payment routes
 */

export const validateCreateOrder = [
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Amount must be greater than 0'),
  body('listingId')
    .isMongoId()
    .withMessage('Invalid listing ID'),
  body('bookingId')
    .optional()
    .isMongoId()
    .withMessage('Invalid booking ID'),
  body('currency')
    .optional()
    .isIn(['INR', 'USD'])
    .withMessage('Currency must be INR or USD'),
];

export const validateVerifyPayment = [
  body('razorpay_order_id')
    .trim()
    .notEmpty()
    .withMessage('Order ID is required'),
  body('razorpay_payment_id')
    .trim()
    .notEmpty()
    .withMessage('Payment ID is required'),
  body('razorpay_signature')
    .trim()
    .notEmpty()
    .withMessage('Signature is required'),
];

export const validateRefund = [
  body('paymentId')
    .trim()
    .notEmpty()
    .withMessage('Payment ID is required'),
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Amount must be greater than 0'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters')
    .escape(),
];

export const validateGetPaymentStatus = [
  param('paymentId')
    .trim()
    .notEmpty()
    .withMessage('Payment ID is required'),
];

export const validatePaymentQuery = [
  query('status')
    .optional()
    .isIn(['pending', 'completed', 'failed', 'refunded'])
    .withMessage('Invalid payment status'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
];
