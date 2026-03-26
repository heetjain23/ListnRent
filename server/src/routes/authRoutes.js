import express from "express";
import {
  sendPhoneOtp,
  verifyPhoneOtp,
  sendEmailOtp,
  verifyEmailOtp,
  googleLogin,
} from "../controllers/authController.js";

const router = express.Router();

// Phone OTP
router.post("/phone/send-otp", sendPhoneOtp);
router.post("/phone/verify-otp", verifyPhoneOtp);

// Email OTP
router.post("/email/send-otp", sendEmailOtp);
router.post("/email/verify-otp", verifyEmailOtp);

// Google Login (mock)
router.post("/google", googleLogin);

export default router;