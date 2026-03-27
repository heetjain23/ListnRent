import Razorpay from "razorpay";
import crypto from "crypto";
import Booking from "../models/Booking.js";
import { getListingById, markListingAsRented } from "./listingService.js";

// Initialize Razorpay with error checking
let razorpay;
try {
  const keyId = (process.env.RAZORPAY_KEY_ID || "").trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
  
  if (!keyId || !keySecret) {
    throw new Error(`Missing credentials - ID: ${!!keyId}, SECRET: ${!!keySecret}`);
  }
  
  razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
  console.log("[Razorpay] ✓ Initialized successfully with test credentials");
} catch (err) {
  console.error("[Razorpay] ✗ Initialization error:", err.message);
}

export const createOrder = async (bookingData) => {
  try {
    const {
      listingId,
      userId,
      renterId,
      startDate,
      endDate,
      pricePerDay,
      depositAmount,
    } = bookingData;

    console.log("[PaymentService] createOrder called with:", bookingData);

    // Get listing details
    const listing = await getListingById(listingId);
    if (!listing) {
      throw new Error(`Listing not found with ID: ${listingId}`);
    }
    console.log("[PaymentService] Listing found:", listing.title);

    // Calculate days and amounts
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    console.log("[PaymentService] Rental calculation:", { start, end, totalDays });

    if (totalDays <= 0) {
      throw new Error("Invalid dates: end date must be after start date");
    }

    // Ensure numeric values
    const pricePerDayNum = Number(pricePerDay);
    const depositAmountNum = Number(depositAmount);
    
    if (isNaN(pricePerDayNum) || isNaN(depositAmountNum)) {
      throw new Error("Invalid price or deposit amount - must be numbers");
    }

    const rentalAmount = totalDays * pricePerDayNum;
    const totalAmount = rentalAmount + depositAmountNum;

    console.log("[PaymentService] Amount calculation:", { 
      pricePerDayNum, 
      depositAmountNum,
      rentalAmount, 
      totalAmount,
      amountInPaise: Math.round(totalAmount * 100)
    });

    // Validate amount (Razorpay minimum is typically 1 paise = 0.01 INR)
    const amountInPaise = Math.round(totalAmount * 100);
    if (amountInPaise < 1) {
      throw new Error("Order amount is too small. Minimum is 0.01 INR");
    }

    // Re-initialize Razorpay if needed
    if (!razorpay) {
      console.log("[PaymentService] Razorpay instance missing, re-initializing");
      const keyId = (process.env.RAZORPAY_KEY_ID || "").trim();
      const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
      razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
    }

    // Verify Razorpay credentials
    const keyId = (process.env.RAZORPAY_KEY_ID || "").trim();
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
    
    if (!keyId || !keySecret) {
      throw new Error("Razorpay credentials not configured in environment variables");
    }

    // Create Razorpay order
    let razorpayOrder;
    try {
      console.log("[PaymentService] Creating Razorpay order with amount (paise):", amountInPaise);
      
      const orderPayload = {
        amount: amountInPaise,
        currency: "INR",
        receipt: `booking_${Date.now()}`,
      };
      
      console.log("[PaymentService] Razorpay order payload:", orderPayload);
      
      razorpayOrder = await razorpay.orders.create(orderPayload);
      
      console.log("[PaymentService] Razorpay order created:", razorpayOrder.id);
    } catch (razorpayError) {
      console.error("[PaymentService] Razorpay Error (full):", JSON.stringify(razorpayError, null, 2));
      console.error("[PaymentService] Razorpay Error (type):", typeof razorpayError);
      console.error("[PaymentService] Razorpay Error (keys):", Object.keys(razorpayError || {}));
      console.error("[PaymentService] Razorpay Error (message):", razorpayError?.message);
      console.error("[PaymentService] Razorpay Error (description):", razorpayError?.description);
      console.error("[PaymentService] Razorpay Error (statusCode):", razorpayError?.statusCode);
      
      const errorMessage = razorpayError?.message || 
                          razorpayError?.description || 
                          razorpayError?.error?.description ||
                          razorpayError?.statusCode ||
                          JSON.stringify(razorpayError) || 
                          "Unknown Razorpay error";
      throw new Error(`Razorpay failed: ${errorMessage}`);
    }

    // Create booking in database with pending status
    const booking = new Booking({
      listingId,
      userId,
      renterId,
      startDate,
      endDate,
      totalDays,
      pricePerDay: pricePerDayNum,
      rentalAmount,
      depositAmount: depositAmountNum,
      totalAmount,
      paymentStatus: "pending",
      razorpayOrderId: razorpayOrder.id,
    });

    console.log("[PaymentService] Saving booking to database");
    await booking.save();
    console.log("[PaymentService] Booking saved:", booking._id);

    return {
      orderId: razorpayOrder.id,
      bookingId: booking._id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    };
  } catch (error) {
    console.error("[PaymentService] createOrder error:", error);
    throw new Error(`Failed to create order: ${error.message}`);
  }
};

export const verifyPayment = async (paymentData) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      paymentData;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      throw new Error("Payment signature verification failed");
    }

    // Update booking with payment details
    const booking = await Booking.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        paymentStatus: "completed",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        bookingStatus: "active",
      },
      { new: true }
    ).populate("listingId");

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Mark the listing as rented
    await markListingAsRented(booking.listingId._id, booking, {
      userId: booking.userId,
      email: `user_${booking.userId}@rentfit.com`, // Will be updated with actual user data if needed
      displayName: "Renter",
    });

    return booking;
  } catch (error) {
    throw new Error(`Payment verification failed: ${error.message}`);
  }
};

export const getBooking = async (bookingId) => {
  try {
    const booking = await Booking.findById(bookingId).populate("listingId");
    if (!booking) {
      throw new Error("Booking not found");
    }
    return booking;
  } catch (error) {
    throw new Error(`Failed to get booking: ${error.message}`);
  }
};

export const getUserBookings = async (userId) => {
  try {
    const bookings = await Booking.find({ userId }).populate("listingId").sort({ createdAt: -1 });
    return bookings;
  } catch (error) {
    throw new Error(`Failed to get user bookings: ${error.message}`);
  }
};

export const getRenterBookings = async (renterId) => {
  try {
    const bookings = await Booking.find({ renterId }).populate("listingId").sort({ createdAt: -1 });
    return bookings;
  } catch (error) {
    throw new Error(`Failed to get renter bookings: ${error.message}`);
  }
};
