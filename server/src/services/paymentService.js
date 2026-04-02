import Razorpay from "razorpay";
import crypto from "crypto";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import { getListingById, markListingAsRented } from "./listingService.js";
import { getCache, setCache, deleteCache, CACHE_EXPIRY } from "../utils/redis.js";

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
      existingBookingId,
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

    // Create or update booking in database with pending status
    let booking;
    
    if (existingBookingId) {
      // Update existing booking (retry scenario)
      console.log("[PaymentService] Updating existing booking:", existingBookingId);
      booking = await Booking.findByIdAndUpdate(
        existingBookingId,
        {
          paymentStatus: "pending",
          razorpayOrderId: razorpayOrder.id,
        },
        { new: true }
      );
      
      if (!booking) {
        throw new Error("Existing booking not found");
      }
      console.log("[PaymentService] Booking updated:", booking._id);
    } else {
      // Create new booking
      booking = new Booking({
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
    }

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

    // Fetch actual renter data from User model
    let renterInfo = {
      userId: booking.userId,
      email: `user_${booking.userId}@rentfit.com`,
      displayName: "Renter",
    };

    try {
      const renterUser = await User.findOne({ uid: booking.userId });
      if (renterUser) {
        renterInfo = {
          userId: booking.userId,
          email: renterUser.email || renterInfo.email,
          displayName: renterUser.displayName || renterInfo.displayName,
        };
        console.log("[PaymentService] Fetched renter info from DB:", renterInfo.displayName);
      }
    } catch (userFetchError) {
      console.warn("[PaymentService] Could not fetch renter user data, using defaults:", userFetchError.message);
    }

    // Mark the listing as rented
    await markListingAsRented(booking.listingId._id, booking, renterInfo);

    // Invalidate booking and listing caches on successful payment verification
    try {
      await deleteCache(`booking:${booking._id}`);
      await deleteCache(`listing:${booking.listingId._id}`);
      
      const client = (await import("../config/redis.js")).getRedisClient();
      const bookingKeys = await client.keys("userBookings:*");
      const renterKeys = await client.keys("renterBookings:*");
      const listingKeys = await client.keys("listings:*");
      const allKeys = [...bookingKeys, ...renterKeys, ...listingKeys];
      
      if (allKeys.length > 0) {
        await client.del(allKeys);
        console.log("[PaymentService] Invalidated all caches on payment verification");
      }
    } catch (cacheError) {
      console.error("[PaymentService] Cache invalidation error:", cacheError.message);
    }

    return booking;
  } catch (error) {
    throw new Error(`Payment verification failed: ${error.message}`);
  }
};

export const getBooking = async (bookingId) => {
  try {
    const cacheKey = `booking:${bookingId}`;
    
    // Check cache first
    const cachedBooking = await getCache(cacheKey);
    if (cachedBooking) {
      console.log("[PaymentService] Returning cached booking:", bookingId);
      return cachedBooking;
    }
    
    const booking = await Booking.findById(bookingId).populate("listingId");
    if (!booking) {
      throw new Error("Booking not found");
    }
    
    // Cache for 1 hour
    await setCache(cacheKey, booking, CACHE_EXPIRY.LONG);
    
    return booking;
  } catch (error) {
    throw new Error(`Failed to get booking: ${error.message}`);
  }
};

export const getUserBookings = async (userId) => {
  try {
    const cacheKey = `userBookings:${userId}`;
    
    // Check cache first
    const cachedBookings = await getCache(cacheKey);
    if (cachedBookings) {
      console.log("[PaymentService] Returning cached user bookings:", userId);
      return cachedBookings;
    }
    
    const bookings = await Booking.find({ userId }).populate("listingId").sort({ createdAt: -1 });
    
    // Cache for 30 minutes
    await setCache(cacheKey, bookings, CACHE_EXPIRY.MEDIUM);
    
    return bookings;
  } catch (error) {
    throw new Error(`Failed to get user bookings: ${error.message}`);
  }
};

export const getRenterBookings = async (renterId) => {
  try {
    const cacheKey = `renterBookings:${renterId}`;
    
    // Check cache first
    const cachedBookings = await getCache(cacheKey);
    if (cachedBookings) {
      console.log("[PaymentService] Returning cached renter bookings:", renterId);
      return cachedBookings;
    }
    
    const bookings = await Booking.find({ renterId }).populate("listingId").sort({ createdAt: -1 });
    
    // Cache for 30 minutes
    await setCache(cacheKey, bookings, CACHE_EXPIRY.MEDIUM);
    
    return bookings;
  } catch (error) {
    throw new Error(`Failed to get renter bookings: ${error.message}`);
  }
};

export const markPaymentFailed = async (bookingId, userId) => {
  try {
    // Find and update the booking to mark it as failed
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        paymentStatus: "failed",
      },
      { new: true }
    ).populate("listingId");

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Verify that the booking belongs to the user
    if (booking.userId !== userId) {
      throw new Error("Unauthorized: Booking does not belong to this user");
    }

    // Invalidate caches on payment failure
    try {
      await deleteCache(`booking:${bookingId}`);
      const client = (await import("../config/redis.js")).getRedisClient();
      const bookingKeys = await client.keys("userBookings:*");
      const renterKeys = await client.keys("renterBookings:*");
      const allKeys = [...bookingKeys, ...renterKeys];
      if (allKeys.length > 0) {
        await client.del(allKeys);
        console.log("[PaymentService] Invalidated booking caches on payment failure");
      }
    } catch (cacheError) {
      console.error("[PaymentService] Cache invalidation error:", cacheError.message);
    }

    console.log("[PaymentService] Marked booking as failed:", bookingId);
    return booking;
  } catch (error) {
    throw new Error(`Failed to mark payment as failed: ${error.message}`);
  }
};
