import {
  generateToken,
  findOrCreateUserByGoogle,
} from "../services/authService.js";

import { successResponse, errorResponse } from "../utils/helper.js";

// ----------------------------
// Google Login
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