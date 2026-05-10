import Razorpay from "razorpay";
import crypto from "crypto";
import Booking from "../bookings/Booking.js";
import User from "../users/User.js";
import { getListingById, markListingAsRented } from "../listings/listingService.js";

const addDays = (dateValue, days) => {
  const date = new Date(dateValue);
  date.setDate(date.getDate() + days);
  return date;
};

const hasDateReached = (dateValue) => {
  if (!dateValue) return false;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;
  date.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() <= today.getTime();
};

const buildTimelineForBooking = (booking) => {
  const data = booking.toObject ? booking.toObject() : booking;
  const milestones = data.milestones || {};

  const hasAdvancePayment = ["partial", "completed"].includes(data.paymentStatus) && Number(data.paidAmount || 0) > 0;
  const restPaymentCompletedAt = milestones.restPaymentCompletedAt || null;
  const isRestPaymentDone = data.paymentStatus === "completed" || !!restPaymentCompletedAt;
  const pickupDate = data.sellerPickupDate || data.deliveryDate || null;
  const returnDate = data.sellerReturnDate || data.customerPickupDate || null;
  const customerDeliveryDate = data.eventDate || data.startDate || data.deliveryDate || null;
  const customerPickupDate = data.customerPickupDate || returnDate || null;

  return {
    customer: [
      {
        key: "booking_confirmed",
        label: "Booking Confirmed",
        completed: true,
        at: data.createdAt,
      },
      {
        key: "advance_payment_done",
        label: "50% Rent Payment Done",
        completed: hasAdvancePayment,
        at: hasAdvancePayment ? data.createdAt : null,
      },
      {
        key: "delivery_date",
        label: "Delivery Date",
        completed: hasAdvancePayment && hasDateReached(customerDeliveryDate),
        at: customerDeliveryDate,
      },
      {
        key: "rest_payment_completed",
        label: "Rest Payment Completed",
        completed: isRestPaymentDone,
        at: restPaymentCompletedAt,
      },
      {
        key: "delivery_completed",
        label: "Delivery Completed",
        completed: !!milestones.buyerDeliveryCompletedAt,
        at: milestones.buyerDeliveryCompletedAt || null,
      },
      {
        key: "pickup_date",
        label: "Pickup Date",
        completed: !!milestones.buyerDeliveryCompletedAt && hasDateReached(customerPickupDate),
        at: customerPickupDate,
      },
      {
        key: "payment_completed",
        label: "Payment Completed",
        completed: !!milestones.buyerPickupCompletedAt,
        at: milestones.buyerPickupCompletedAt || null,
      },
      {
        key: "deposit_returned",
        label: "Deposit Returned",
        completed: !!milestones.depositReturnedAt,
        at: milestones.depositReturnedAt || null,
      },
    ],
    seller: [
      {
        key: "booking_received",
        label: "Booking Received",
        completed: hasAdvancePayment,
        at: hasAdvancePayment ? data.createdAt : null,
      },
      {
        key: "pickup_date",
        label: "Pickup Date",
        completed: hasAdvancePayment && hasDateReached(pickupDate),
        at: pickupDate,
      },
      {
        key: "pickup_completed",
        label: "Pickup Completed",
        completed: !!milestones.sellerPickupCompletedAt,
        at: pickupDate,
      },
      {
        key: "payment_received",
        label: "Payment Received",
        completed: isRestPaymentDone,
        at: restPaymentCompletedAt,
      },
      {
        key: "return_date",
        label: "Return Date",
        completed: isRestPaymentDone && hasDateReached(returnDate),
        at: returnDate,
      },
      {
        key: "return_completed",
        label: "Return Completed",
        completed: !!milestones.sellerReturnCompletedAt,
        at: milestones.sellerReturnCompletedAt || null,
      },
    ],
    logistics: [
      {
        key: "seller_pickup_completed",
        label: "Pickup Completed (Seller Location)",
        completed: !!milestones.sellerPickupCompletedAt,
        at: milestones.sellerPickupCompletedAt || null,
      },
      {
        key: "buyer_delivery_completed",
        label: "Delivery Completed (Buyer Location)",
        completed: !!milestones.buyerDeliveryCompletedAt,
        at: milestones.buyerDeliveryCompletedAt || null,
      },
      {
        key: "buyer_pickup_completed",
        label: "Pickup Done (Buyer Location)",
        completed: !!milestones.buyerPickupCompletedAt,
        at: milestones.buyerPickupCompletedAt || null,
      },
      {
        key: "seller_return_completed",
        label: "Delivery Completed (Seller Location)",
        completed: !!milestones.sellerReturnCompletedAt,
        at: milestones.sellerReturnCompletedAt || null,
      },
    ],
  };
};

const withTimeline = (booking) => {
  const data = booking.toObject ? booking.toObject() : booking;
  return {
    ...data,
    timeline: buildTimelineForBooking(data),
  };
};

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
      eventDate,
      startDate,
      endDate,
      durationDays,
      pricePerDay,
      depositAmount,
      cleaningFee,
      deliveryFee,
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
    const cleaningFeeNum = Number(cleaningFee) || 0;
    const deliveryFeeNum = Number(deliveryFee) || 0;
    
    if (isNaN(pricePerDayNum) || isNaN(depositAmountNum)) {
      throw new Error("Invalid price or deposit amount - must be numbers");
    }

    const rentalAmount = totalDays * pricePerDayNum;
    const feesTotal = cleaningFeeNum + deliveryFeeNum;
    const totalAmount = rentalAmount + depositAmountNum + feesTotal;
    
    // Only charge 50% of rental amount upfront
    const amountToCharge = rentalAmount / 2;

    console.log("[PaymentService] Amount calculation:", { 
      pricePerDayNum, 
      depositAmountNum,
      cleaningFeeNum,
      deliveryFeeNum,
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

export const createCartOrder = async (cartData) => {
  try {
    const { cartItems } = cartData;

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    let rentalAmount = 0;

    for (const item of cartItems) {
      const listing = await getListingById(item.listingId);
      if (!listing) {
        throw new Error(`Listing not found with ID: ${item.listingId}`);
      }

      const totalDays = Number(item.durationDays) || 1;
      const pricePerDay = Number(item.pricePerDay) || Number(listing.pricePerDay) || 0;
      rentalAmount += totalDays * pricePerDay;
    }

    const amountToCharge = rentalAmount / 2;
    const amountInPaise = Math.round(amountToCharge * 100);

    if (amountInPaise < 1) {
      throw new Error("Order amount is too small. Minimum is 0.01 INR");
    }

    if (!razorpay) {
      const keyId = (process.env.RAZORPAY_KEY_ID || "").trim();
      const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
      razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `cart_${Date.now()}`,
    });

    return {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    };
  } catch (error) {
    console.error("[PaymentService] createCartOrder error:", error);
    throw new Error(`Failed to create cart order: ${error.message}`);
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
      eventDate,
      startDate,
      endDate,
      totalDays,
      pricePerDay,
      depositAmount,
      bookingFee,
      cleaningFee,
      deliveryFee,
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
    const cleaningFeeNum = Number(cleaningFee) || 0;
    const deliveryFeeNum = Number(deliveryFee) || 0;
    const paidRentalAmount = rentalAmountNum / 2;
    const pendingRentalAmount = rentalAmountNum / 2;
    
    // Paid amount includes: 50% of rental ONLY
    // Pending amount includes: 50% of rental + full deposit + all fees
    const paidAmount = paidRentalAmount;
    const pendingAmount = pendingRentalAmount + depositAmountNum + cleaningFeeNum + deliveryFeeNum;

    console.log("[PaymentService] Payment split calculated:", {
      rentalAmount: rentalAmountNum,
      paidRentalAmount,
      pendingRentalAmount,
      depositAmount: depositAmountNum,
      cleaningFee: cleaningFeeNum,
      deliveryFee: deliveryFeeNum,
      totalPaidAmount: paidAmount,
      totalPendingAmount: pendingAmount,
    });

    // Start date is pickup date (one day before event) in current booking flow.
    const normalizedEventDate = eventDate || addDays(startDate, 1)

    // Create booking ONLY after payment verification succeeds
    const booking = new Booking({
      listingId,
      userId,
      renterId,
      startDate,
      endDate,
      deliveryDate: startDate,
      eventDate: normalizedEventDate,
      sellerPickupDate: startDate,
      customerPickupDate: addDays(endDate, 1),
      sellerReturnDate: addDays(endDate, 1),
      totalDays,
      pricePerDay: Number(pricePerDay),
      rentalAmount: rentalAmountNum,
      depositAmount: depositAmountNum,
      bookingFee: Number(bookingFee) || 0,
      cleaningFee: cleaningFeeNum,
      deliveryFee: deliveryFeeNum,
      totalAmount: Number(totalAmount),
      paidAmount,
      pendingAmount,
      paymentStatus: "partial",
      bookingStatus: "active",
      deliveryStatus: "unassigned",
      deliveryPartnerId: null,
      deliveryPartnerName: "",
      deliveryPartnerEmail: "",
      deliveryAssignedAt: null,
      milestones: {
        sellerPickupCompletedAt: null,
        buyerDeliveryCompletedAt: null,
        buyerPickupCompletedAt: null,
        sellerReturnCompletedAt: null,
        restPaymentCompletedAt: null,
        depositReturnedAt: null,
      },
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

export const verifyCartPayment = async (paymentData) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      cartItems,
      deliveryDetails,
    } = paymentData;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new Error("Missing payment verification data");
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      throw new Error("Missing cart items for verification");
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      throw new Error("Payment signature verification failed");
    }

    const bookings = [];

    for (const item of cartItems) {
      const listing = await getListingById(item.listingId);
      if (!listing) {
        throw new Error(`Listing not found with ID: ${item.listingId}`);
      }

      const totalDays = Number(item.totalDays) || Number(item.durationDays) || 1;
      const pricePerDay = Number(item.pricePerDay) || Number(listing.pricePerDay) || 0;
      const depositAmount = Number(item.depositAmount) || Number(listing.deposit) || 0;
      const cleaningFee = Number(item.cleaningFee) || 0;
      const deliveryFee = Number(item.deliveryFee) || 0;
      const rentalAmount = totalDays * pricePerDay;
      const paidAmount = rentalAmount / 2;
      const pendingAmount = rentalAmount / 2 + depositAmount + cleaningFee + deliveryFee;
      const startDate = new Date(item.startDate);
      const endDate = new Date(item.endDate);
      const eventDate = item.eventDate ? new Date(item.eventDate) : addDays(startDate, 1);

      const booking = new Booking({
        listingId: listing._id,
        userId: item.userId,
        renterId: item.renterId || listing.userId,
        startDate,
        endDate,
        deliveryDate: startDate,
        eventDate,
        sellerPickupDate: startDate,
        customerPickupDate: addDays(endDate, 1),
        sellerReturnDate: addDays(endDate, 1),
        totalDays,
        pricePerDay,
        rentalAmount,
        depositAmount,
        bookingFee: 0,
        cleaningFee,
        deliveryFee,
        totalAmount: rentalAmount + depositAmount + cleaningFee + deliveryFee,
        paidAmount,
        pendingAmount,
        paymentStatus: "partial",
        bookingStatus: "active",
        deliveryStatus: "unassigned",
        deliveryPartnerId: null,
        deliveryPartnerName: "",
        deliveryPartnerEmail: "",
        deliveryAssignedAt: null,
        milestones: {
          sellerPickupCompletedAt: null,
          buyerDeliveryCompletedAt: null,
          buyerPickupCompletedAt: null,
          sellerReturnCompletedAt: null,
          restPaymentCompletedAt: null,
          depositReturnedAt: null,
        },
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        deliveryDetails: deliveryDetails || {},
        notes: "Reserved from cart",
      });

      await booking.save();
      await booking.populate("listingId");

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
        }
      } catch (userFetchError) {
        console.warn("[PaymentService] Could not fetch renter user data for cart booking:", userFetchError.message);
      }

      await markListingAsRented(booking.listingId._id, booking, renterInfo);
      bookings.push(booking);
    }

    return bookings;
  } catch (error) {
    console.error("[PaymentService] verifyCartPayment error:", error);
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
    
    return withTimeline(booking);
  } catch (error) {
    console.error("[PaymentService] getBooking error:", error);
    throw new Error(`Failed to get booking: ${error.message}`);
  }
};

export const getUserBookings = async (userId) => {
  try {
    const bookings = await Booking.find({ userId }).populate("listingId").sort({ createdAt: -1 });
    
    return bookings.map((booking) => withTimeline(booking));
  } catch (error) {
    throw new Error(`Failed to get user bookings: ${error.message}`);
  }
};

export const getRenterBookings = async (renterId) => {
  try {
    const bookings = await Booking.find({ renterId }).populate("listingId").sort({ createdAt: -1 });
    
    return bookings.map((booking) => withTimeline(booking));
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
    return withTimeline(booking);
  } catch (error) {
    throw new Error(`Failed to mark payment as failed: ${error.message}`);
  }
};
