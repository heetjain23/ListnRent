import Razorpay from "razorpay";
import crypto from "crypto";
import Booking from "../models/Booking.js";
import { getListingById } from "./listingService.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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

    // Get listing details
    const listing = await getListingById(listingId);
    if (!listing) {
      throw new Error("Listing not found");
    }

    // Calculate days and amounts
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (totalDays <= 0) {
      throw new Error("Invalid dates: end date must be after start date");
    }

    const rentalAmount = totalDays * pricePerDay;
    const totalAmount = rentalAmount + depositAmount;

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // Amount in paise
      currency: "INR",
      receipt: `booking_${Date.now()}`,
      notes: {
        listingId,
        userId,
        renterId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalDays,
      },
    });

    // Create booking in database with pending status
    const booking = new Booking({
      listingId,
      userId,
      renterId,
      startDate,
      endDate,
      totalDays,
      pricePerDay,
      rentalAmount,
      depositAmount,
      totalAmount,
      paymentStatus: "pending",
      razorpayOrderId: razorpayOrder.id,
    });

    await booking.save();

    return {
      orderId: razorpayOrder.id,
      bookingId: booking._id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    };
  } catch (error) {
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
    );

    if (!booking) {
      throw new Error("Booking not found");
    }

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
