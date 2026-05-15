import express from "express";
import {
  handleCreateOrder,
  handleCreateCartOrder,
  handleVerifyPayment,
  handleVerifyCartPayment,
  handleGetBooking,
  handleGetUserBookings,
  handleGetRenterBookings,
  handleMarkPaymentFailed,
} from "./paymentController.js";
import { verifyFirebaseToken } from "../../middleware/authMiddleware.js";
import { handleValidationErrors } from "../../middleware/validationMiddleware.js";
import { 
  validateCreateOrder, 
  validateVerifyPayment,
  validatePaymentQuery 
} from "./paymentValidation.js";

const router = express.Router();

// Test route to verify Razorpay setup
router.get("/test/razorpay", (req, res) => {
  try {
    const keyId = (process.env.RAZORPAY_KEY_ID || "").trim();
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
    
    console.log("[RazorpayTest] Checking credentials");
    console.log("[RazorpayTest] KEY_ID:", keyId ? `✓ (${keyId.substring(0, 15)}...)` : "✗ Missing");
    console.log("[RazorpayTest] SECRET:", keySecret ? `✓ (length: ${keySecret.length})` : "✗ Missing");
    
    res.json({
      success: true,
      hasKeyId: !!keyId,
      hasSecret: !!keySecret,
      keyIdPreview: keyId.substring(0, 15) + "...",
      secretLength: keySecret.length,
      message: keyId && keySecret ? "✓ Credentials are configured" : "✗ Missing credentials",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Create a new order
router.post("/create-order", verifyFirebaseToken, validateCreateOrder, handleValidationErrors, handleCreateOrder);

// Create a cart order
router.post("/create-cart-order", verifyFirebaseToken, validateCreateOrder, handleValidationErrors, handleCreateCartOrder);

// Verify payment
router.post("/verify-payment", verifyFirebaseToken, validateVerifyPayment, handleValidationErrors, handleVerifyPayment);

// Verify cart payment
router.post("/verify-cart-payment", verifyFirebaseToken, validateVerifyPayment, handleValidationErrors, handleVerifyCartPayment);

// Mark payment as failed (when user dismisses payment modal)
router.post("/mark-failed", verifyFirebaseToken, handleMarkPaymentFailed);

// Get specific booking
router.get("/booking/:bookingId", verifyFirebaseToken, handleGetBooking);

// Get user's bookings (as renter/borrower)
router.get("/my-bookings", verifyFirebaseToken, validatePaymentQuery, handleValidationErrors, handleGetUserBookings);

// Get renter's bookings (as owner/lender)
router.get("/renter-bookings", verifyFirebaseToken, validatePaymentQuery, handleValidationErrors, handleGetRenterBookings);

export default router;
