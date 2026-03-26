import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ----------------------------
// In-memory OTP store (MVP)
// Replace with Redis in production
// ----------------------------
const otpStore = new Map();
// Structure: { "phone_or_email": { otp: "123456", expiresAt: Date } }

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

// ----------------------------
// OTP Generation
// ----------------------------
export const generateOtp = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

// ----------------------------
// OTP Store (save)
// ----------------------------
export const saveOtp = (key, otp) => {
  otpStore.set(key, {
    otp,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
  });
};

// ----------------------------
// OTP Validation
// ----------------------------
export const validateOtp = (key, inputOtp) => {
  const record = otpStore.get(key);

  if (!record) {
    return { valid: false, reason: "OTP not found. Please request a new one." };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(key);
    return { valid: false, reason: "OTP expired. Please request a new one." };
  }

  if (record.otp !== String(inputOtp)) {
    return { valid: false, reason: "Invalid OTP." };
  }

  otpStore.delete(key); // one-time use
  return { valid: true };
};

// ----------------------------
// JWT Generation
// ----------------------------
export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// ----------------------------
// Find or Create User by Phone
// ----------------------------
export const findOrCreateUserByPhone = async (phone) => {
  let user = await User.findOne({ phone });
  if (!user) {
    user = await User.create({ phone });
  }
  return user;
};

// ----------------------------
// Find or Create User by Email
// ----------------------------
export const findOrCreateUserByEmail = async (email) => {
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ email });
  }
  return user;
};

// ----------------------------
// Find or Create User by Google
// ----------------------------
export const findOrCreateUserByGoogle = async ({ email, name, googleId }) => {
  let user = await User.findOne({ googleId });

  if (!user && email) {
    user = await User.findOne({ email });
  }

  if (user) {
    // Update googleId if missing
    if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }
    return user;
  }

  user = await User.create({ email, name, googleId });
  return user;
};