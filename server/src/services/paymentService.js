import Razorpay from "razorpay";
import crypto from "crypto";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
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
      durationDays,
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

    // Use actual duration days instead of calculating from dates
    const totalDays = durationDays || 1;

    console.log("[PaymentService] Rental calculation:", { totalDays, durationDays });

    if (totalDays <= 0) {
      throw new Error("Invalid duration: duration must be greater than 0");
    }

    // Ensure numeric values
    const pricePerDayNum = Number(pricePerDay);
    const depositAmountNum = Number(depositAmount);
    
    if (isNaN(pricePerDayNum) || isNaN(depositAmountNum)) {
      throw new Error("Invalid price or deposit amount - must be numbers");
    }

    const rentalAmount = totalDays * pricePerDayNum;
    const totalAmount = rentalAmount + depositAmountNum;
    
    // Only charge 50% of rental amount upfront
    const amountToCharge = rentalAmount / 2;

    console.log("[PaymentService] Amount calculation:", { 
      pricePerDayNum, 
      depositAmountNum,
      rentalAmount,
      totalAmount,
      amountToCharge,
      amountInPaise: Math.round(amountToCharge * 100)
    });

    // Validate amount (Razorpay minimum is typically 1 paise = 0.01 INR)
    const amountInPaise = Math.round(amountToCharge * 100);
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

    // Return only Razorpay order details, NO booking created yet
    return {
      orderId: razorpayOrder.id,
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
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      listingId,
      userId,
      renterId,
      startDate,
      endDate,
      totalDays,
      pricePerDay,
      depositAmount,
      rentalAmount,
      totalAmount,
      deliveryDetails,
    } = paymentData;

    console.log("[PaymentService] verifyPayment - Received deliveryDetails:", deliveryDetails);

    console.log("[PaymentService] verifyPayment called with order:", razorpay_order_id);

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      throw new Error("Payment signature verification failed");
    }

    console.log("[PaymentService] Payment signature verified successfully");

    // Calculate 50% split of rental amount
    const rentalAmountNum = Number(rentalAmount);
    const depositAmountNum = Number(depositAmount);
    const paidRentalAmount = rentalAmountNum / 2;
    const pendingRentalAmount = rentalAmountNum / 2;
    
    // Paid amount includes: 50% of rental ONLY
    // Pending amount includes: 50% of rental + full deposit
    const paidAmount = paidRentalAmount;
    const pendingAmount = pendingRentalAmount + depositAmountNum;

    console.log("[PaymentService] Payment split calculated:", {
      rentalAmount: rentalAmountNum,
      paidRentalAmount,
      pendingRentalAmount,
      depositAmount: depositAmountNum,
      totalPaidAmount: paidAmount,
      totalPendingAmount: pendingAmount,
    });

    // Create booking ONLY after payment verification succeeds
    const booking = new Booking({
      listingId,
      userId,
      renterId,
      startDate,
      endDate,
      totalDays,
      pricePerDay: Number(pricePerDay),
      rentalAmount: rentalAmountNum,
      depositAmount: depositAmountNum,
      totalAmount: Number(totalAmount),
      paidAmount,
      pendingAmount,
      paymentStatus: "partial",
      bookingStatus: "active",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      deliveryDetails: deliveryDetails || {},
    });

    console.log("[PaymentService] Creating booking after payment verification");
    console.log("[PaymentService] Booking deliveryDetails before save:", booking.deliveryDetails);
    await booking.save();
    console.log("[PaymentService] Booking created successfully:", booking._id);
    console.log("[PaymentService] Booking deliveryDetails after save:", booking.deliveryDetails);

    // Populate listing details
    await booking.populate("listingId");

    // Fetch actual renter data from User model
    let renterInfo = {
      userId: booking.userId,
      email: `user_${booking.userId}@listnrent.com`,
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

    return booking;
  } catch (error) {
    console.error("[PaymentService] verifyPayment error:", error);
    throw new Error(`Payment verification failed: ${error.message}`);
  }
};

export const getBooking = async (bookingId) => {
  try {
    console.log("[PaymentService] getBooking called for:", bookingId);
    const booking = await Booking.findById(bookingId).populate("listingId");
    if (!booking) {
      throw new Error("Booking not found");
    }
    
    console.log("[PaymentService] Booking found:", booking._id);
    console.log("[PaymentService] Booking deliveryDetails:", booking.deliveryDetails);
    console.log("[PaymentService] Booking object keys:", Object.keys(booking.toObject()));
    
    return booking;
  } catch (error) {
    console.error("[PaymentService] getBooking error:", error);
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

    console.log("[PaymentService] Marked booking as failed:", bookingId);
    return booking;
  } catch (error) {
    throw new Error(`Failed to mark payment as failed: ${error.message}`);
  }
};
