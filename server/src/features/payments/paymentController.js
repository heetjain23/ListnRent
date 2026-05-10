import {
  createOrder,
  createCartOrder,
  verifyPayment,
  verifyCartPayment,
  getBooking,
  getUserBookings,
  getRenterBookings,
  markPaymentFailed,
} from "./paymentService.js";
import { successResponse, errorResponse } from "../../utils/helper.js";

export const handleCreateOrder = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { listingId, renterId, startDate, endDate, durationDays, pricePerDay, depositAmount, cleaningFee, deliveryFee, existingBookingId } = req.body;

    console.log("[Payment Controller] Creating order with data:", {
      userId,
      listingId,
      renterId,
      startDate,
      endDate,
      durationDays,
      pricePerDay,
      depositAmount,
      cleaningFee,
      deliveryFee,
      existingBookingId,
    });

    // Validation
    if (!listingId || !renterId || !startDate || !endDate || !pricePerDay || !depositAmount) {
      return errorResponse(
        res,
        "Missing required fields: listingId, renterId, startDate, endDate, pricePerDay, depositAmount",
        400
      );
    }

    const bookingData = {
      listingId,
      userId,
      renterId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      durationDays: durationDays || 1,
      pricePerDay: Number(pricePerDay),
      depositAmount: Number(depositAmount),
      cleaningFee: Number(cleaningFee) || 0,
      deliveryFee: Number(deliveryFee) || 0,
      existingBookingId,
    };

    console.log("[Payment Controller] Processed booking data:", bookingData);

    const order = await createOrder(bookingData);
    console.log("[Payment Controller] Order created successfully:", order);
    return successResponse(res, order, 201);
  } catch (error) {
    console.error("[Payment Controller] Error creating order:", error);
    return errorResponse(res, error.message || "Failed to create order", 500);
  }
};

export const handleCreateCartOrder = async (req, res) => {
  try {
    const order = await createCartOrder(req.body);
    return successResponse(res, order, 201);
  } catch (error) {
    console.error("[Payment Controller] Error creating cart order:", error);
    return errorResponse(res, error.message || "Failed to create cart order", 500);
  }
};

export const handleVerifyPayment = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      listingId,
      renterId,
      eventDate,
      startDate,
      endDate,
      totalDays,
      pricePerDay,
      depositAmount,
      cleaningFee,
      deliveryFee,
      deliveryDetails,
    } = req.body;

    console.log("[PaymentController] Received deliveryDetails:", deliveryDetails);

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return errorResponse(res, "Missing payment verification data", 400);
    }

    if (!listingId || !renterId || !startDate || !endDate || !totalDays || !pricePerDay || !depositAmount) {
      return errorResponse(res, "Missing booking data for verification", 400);
    }

    // Calculate amounts
    const pricePerDayNum = Number(pricePerDay);
    const depositAmountNum = Number(depositAmount);
    const cleaningFeeNum = Number(cleaningFee) || 0;
    const deliveryFeeNum = Number(deliveryFee) || 0;
    const totalDaysNum = Number(totalDays);
    const rentalAmount = totalDaysNum * pricePerDayNum;
    const feesTotal = cleaningFeeNum + deliveryFeeNum;
    const totalAmount = rentalAmount + depositAmountNum + feesTotal;

    const booking = await verifyPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      listingId,
      userId,
      renterId,
      eventDate: eventDate ? new Date(eventDate) : undefined,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalDays: totalDaysNum,
      deliveryDetails,
      pricePerDay: pricePerDayNum,
      depositAmount: depositAmountNum,
      cleaningFee: cleaningFeeNum,
      deliveryFee: deliveryFeeNum,
      rentalAmount,
      totalAmount,
    });

    return successResponse(res, { booking }, 200);
  } catch (error) {
    console.error("[Payment Controller] Verify payment error:", error);
    return errorResponse(res, error.message || "Payment verification failed", 400);
  }
};

export const handleVerifyCartPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, cartItems, deliveryDetails } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return errorResponse(res, "Missing payment verification data", 400);
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return errorResponse(res, "Missing cart items for verification", 400);
    }

    const bookings = await verifyCartPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      cartItems,
      deliveryDetails,
    });

    return successResponse(res, { bookings }, 200);
  } catch (error) {
    console.error("[Payment Controller] Verify cart payment error:", error);
    return errorResponse(res, error.message || "Payment verification failed", 400);
  }
};

export const handleGetBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await getBooking(bookingId);
    return successResponse(res, { booking });
  } catch (error) {
    return errorResponse(res, error.message || "Failed to get booking", 404);
  }
};

export const handleGetUserBookings = async (req, res) => {
  try {
    const userId = req.user.uid;
    const bookings = await getUserBookings(userId);
    return successResponse(res, { bookings });
  } catch (error) {
    return errorResponse(res, error.message || "Failed to get bookings", 500);
  }
};

export const handleGetRenterBookings = async (req, res) => {
  try {
    const renterId = req.user.uid;
    const bookings = await getRenterBookings(renterId);
    return successResponse(res, { bookings });
  } catch (error) {
    return errorResponse(res, error.message || "Failed to get renter bookings", 500);
  }
};

export const handleMarkPaymentFailed = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { bookingId } = req.body;

    if (!bookingId) {
      return errorResponse(res, "Missing bookingId", 400);
    }

    const booking = await markPaymentFailed(bookingId, userId);
    return successResponse(res, { booking }, 200);
  } catch (error) {
    return errorResponse(res, error.message || "Failed to mark payment as failed", 500);
  }
};
