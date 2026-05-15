import { body, param, query } from 'express-validator';

/**
 * Validators for Payment routes
 */

export const validateCreateOrder = [
  body('listingId')
    .isMongoId()
    .withMessage('Invalid listing ID'),
  body('renterId')
    .notEmpty()
    .withMessage('Renter ID is required'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date is required and must be valid'),
  body('endDate')
    .isISO8601()
    .withMessage('End date is required and must be valid'),
  body('pricePerDay')
    .isFloat({ min: 1 })
    .withMessage('Price per day must be greater than 0'),
  body('depositAmount')
    .isFloat({ min: 0 })
    .withMessage('Deposit amount must be 0 or greater'),
  body('durationDays')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration days must be a positive integer'),
  body('cleaningFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cleaning fee must be 0 or greater'),
  body('deliveryFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Delivery fee must be 0 or greater'),
  body('existingBookingId')
    .optional()
    .isMongoId()
    .withMessage('Invalid existing booking ID'),
];

export const validateCreateCartOrder = [
  body('cartItems')
    .isArray({ min: 1 })
    .withMessage('Cart items are required'),
  body('cartItems.*.listingId')
    .isMongoId()
    .withMessage('Invalid listing ID in cart items'),
  body('cartItems.*.renterId')
    .notEmpty()
    .withMessage('Renter ID is required in cart items'),
  body('cartItems.*.startDate')
    .isISO8601()
    .withMessage('Start date is required in cart items'),
  body('cartItems.*.endDate')
    .isISO8601()
    .withMessage('End date is required in cart items'),
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
