import {
  generateOtp,
  saveOtp,
  validateOtp,
  generateToken,
  findOrCreateUserByPhone,
  findOrCreateUserByEmail,
  findOrCreateUserByGoogle,
} from "../services/authService.js";

import { successResponse, errorResponse } from "../utils/helper.js";

// ----------------------------
// Phone OTP
// ----------------------------

export const sendPhoneOtp = (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return errorResponse(res, "Phone number is required", 400);
  }

  const otp = generateOtp();
  saveOtp(`phone_${phone}`, otp);

  // In production: send via SMS (Twilio, MSG91, etc.)
  console.log(`[DEV] OTP for ${phone}: ${otp}`);

  return successResponse(res, {
    message: "OTP sent successfully",
    // Remove in production — only for dev/testing
    _devOtp: process.env.NODE_ENV === "development" ? otp : undefined,
  });
};

export const verifyPhoneOtp = async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return errorResponse(res, "Phone and OTP are required", 400);
  }

  const result = validateOtp(`phone_${phone}`, otp);
  if (!result.valid) {
    return errorResponse(res, result.reason, 400);
  }

  const user = await findOrCreateUserByPhone(phone);
  const token = generateToken(user._id);

  return successResponse(res, { token, user });
};

// ----------------------------
// Email OTP
// ----------------------------

export const sendEmailOtp = (req, res) => {
  const { email } = req.body;

  if (!email) {
    return errorResponse(res, "Email is required", 400);
  }

  const otp = generateOtp();
  saveOtp(`email_${email}`, otp);

  // In production: send via email (Nodemailer, SendGrid, etc.)
  console.log(`[DEV] OTP for ${email}: ${otp}`);

  return successResponse(res, {
    message: "OTP sent successfully",
    _devOtp: process.env.NODE_ENV === "development" ? otp : undefined,
  });
};

export const verifyEmailOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return errorResponse(res, "Email and OTP are required", 400);
  }

  const result = validateOtp(`email_${email}`, otp);
  if (!result.valid) {
    return errorResponse(res, result.reason, 400);
  }

  const user = await findOrCreateUserByEmail(email);
  const token = generateToken(user._id);

  return successResponse(res, { token, user });
};

// ----------------------------
// Google Login (Mock)
// ----------------------------

export const googleLogin = async (req, res) => {
  const { email, name, googleId } = req.body;

  if (!googleId) {
    return errorResponse(res, "Google ID is required", 400);
  }

  const user = await findOrCreateUserByGoogle({ email, name, googleId });
  const token = generateToken(user._id);

  return successResponse(res, { token, user });
};