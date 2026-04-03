import {
  createOrder,
  verifyPayment,
  getBooking,
  getUserBookings,
  getRenterBookings,
  markPaymentFailed,
} from "../services/paymentService.js";
import { successResponse, errorResponse } from "../utils/helper.js";

export const handleCreateOrder = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { listingId, renterId, startDate, endDate, durationDays, pricePerDay, depositAmount, existingBookingId } = req.body;

    console.log("[Payment Controller] Creating order with data:", {
      userId,
      listingId,
      renterId,
      startDate,
      endDate,
      durationDays,
      pricePerDay,
      depositAmount,
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

export const handleVerifyPayment = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      listingId,
      renterId,
      startDate,
      endDate,
      totalDays,
      pricePerDay,
      depositAmount,
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
    const totalDaysNum = Number(totalDays);
    const rentalAmount = totalDaysNum * pricePerDayNum;
    const totalAmount = rentalAmount + depositAmountNum;

    const booking = await verifyPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      listingId,
      userId,
      renterId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalDays: totalDaysNum,
      deliveryDetails,
      pricePerDay: pricePerDayNum,
      depositAmount: depositAmountNum,
      rentalAmount,
      totalAmount,
    });

    return successResponse(res, { booking }, 200);
  } catch (error) {
    console.error("[Payment Controller] Verify payment error:", error);
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
