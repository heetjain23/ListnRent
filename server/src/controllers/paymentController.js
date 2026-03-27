import {
  createOrder,
  verifyPayment,
  getBooking,
  getUserBookings,
  getRenterBookings,
} from "../services/paymentService.js";
import { successResponse, errorResponse } from "../utils/helper.js";

export const handleCreateOrder = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { listingId, renterId, startDate, endDate, pricePerDay, depositAmount } = req.body;

    console.log("[Payment Controller] Creating order with data:", {
      userId,
      listingId,
      renterId,
      startDate,
      endDate,
      pricePerDay,
      depositAmount,
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
      pricePerDay: Number(pricePerDay),
      depositAmount: Number(depositAmount),
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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return errorResponse(res, "Missing payment verification data", 400);
    }

    const booking = await verifyPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    return successResponse(res, { booking }, 200);
  } catch (error) {
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
