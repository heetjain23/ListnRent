import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ----------------------------
// JWT Generation
// ----------------------------
export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
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