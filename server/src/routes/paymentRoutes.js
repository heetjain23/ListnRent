import express from "express";
import {
  handleCreateOrder,
  handleVerifyPayment,
  handleGetBooking,
  handleGetUserBookings,
  handleGetRenterBookings,
  handleMarkPaymentFailed,
} from "../controllers/paymentController.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";

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
router.post("/create-order", verifyFirebaseToken, handleCreateOrder);

// Verify payment
router.post("/verify-payment", verifyFirebaseToken, handleVerifyPayment);

// Mark payment as failed (when user dismisses payment modal)
router.post("/mark-failed", verifyFirebaseToken, handleMarkPaymentFailed);

// Get specific booking
router.get("/booking/:bookingId", verifyFirebaseToken, handleGetBooking);

// Get user's bookings (as renter/borrower)
router.get("/my-bookings", verifyFirebaseToken, handleGetUserBookings);

// Get renter's bookings (as owner/lender)
router.get("/renter-bookings", verifyFirebaseToken, handleGetRenterBookings);

export default router;
