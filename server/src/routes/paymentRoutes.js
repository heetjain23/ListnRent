import express from "express";
import {
  handleCreateOrder,
  handleVerifyPayment,
  handleGetBooking,
  handleGetUserBookings,
  handleGetRenterBookings,
} from "../controllers/paymentController.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a new order
router.post("/create-order", verifyFirebaseToken, handleCreateOrder);

// Verify payment
router.post("/verify-payment", verifyFirebaseToken, handleVerifyPayment);

// Get specific booking
router.get("/booking/:bookingId", verifyFirebaseToken, handleGetBooking);

// Get user's bookings (as renter/borrower)
router.get("/my-bookings", verifyFirebaseToken, handleGetUserBookings);

// Get renter's bookings (as owner/lender)
router.get("/renter-bookings", verifyFirebaseToken, handleGetRenterBookings);

export default router;
